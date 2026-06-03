//CharacterMovement: Controla el movimiento del personaje en el Hub 3D
//Gestiona input del teclado, animaciones, rotacion y limites del mapa
//Usa interpolacion (lerp) pa movimiento suave y calcula direccion relativa a camara

import { Vector3 } from '@babylonjs/core';
import { PlayerCharacter } from './PlayerCharacter';
import { CameraController } from '../engine/CameraController';
import { KeyboardInput } from '../engine/InputHandler';
import { CollisionSystem } from '../physics/CollisionSystem';
import { CHARACTER_CONFIG } from '../config/PlayerConfig';
import { useGameSettingsStore } from '../config/gameSettingsStore';

// Clase molde pa gestionar el movimiento del personaje
export class PlayerMovement {
	private character: PlayerCharacter;          // referencia al personaje q vamos a mover
	private cameraController: CameraController;    // controlador de camara pa calcular direcciones relativas
	private inputHandler: KeyboardInput;            // sist q detecta q teclas estan presionadas
	private collisionSystem: CollisionSystem;      // sist de colisiones pa detectar obstaculos
	private targetPosition: Vector3;               // pos objetivo a la q el personaje se mueve
	private isMoving: boolean = false;             // flag pa saber si el personaje se esta moviendo
	// boolean -> solo puede ser true o false
	// = false -> empieza quieto (no se mueve al inicio)
	constructor(
		character: PlayerCharacter,
		cameraController: CameraController,
		inputHandler: KeyboardInput,
		collisionSystem: CollisionSystem,
		initialPosition: Vector3 = Vector3.Zero()  // Vector3.Zero() -> (0, 0, 0)
	) {
		this.character = character;                      // guardamos la referencia al personaje
		this.cameraController = cameraController;        // guardamos el controlador de camara
		this.inputHandler = inputHandler;                // guardamos el manejador de input
		this.collisionSystem = collisionSystem;          // guardamos el sistema de colisiones
		this.targetPosition = initialPosition.clone();   // clonamos la pos inicial pa no modificar el original
		// clone() -> crea una copia independiente del vector
	}


	public update(moveSpeed: number = CHARACTER_CONFIG.moveSpeed): boolean {
		const camera = this.cameraController.getCamera();  // obtenemos la camara activa
		let keyPressed = false;                            // flag pa saber si se presiono alguna tecla

		// teclas de movimiento segun preset de controles
		const { controlsPreset } = useGameSettingsStore.getState();
		const kUp    = controlsPreset === 'WASD' ? 'w'         : 'ArrowUp';
		const kDown  = controlsPreset === 'WASD' ? 's'         : 'ArrowDown';
		const kLeft  = controlsPreset === 'WASD' ? 'a'         : 'ArrowLeft';
		const kRight = controlsPreset === 'WASD' ? 'd'         : 'ArrowRight';

		// Mover segun teclas presionadas (relativo a la camara)
		// el movimiento es relativo a donde mira la camara, no absoluto
		if (camera) {
			// Calculamos el vector "adelante" de la camara
			// getTarget() -> punto al q mira la camara
			// position -> pos de la camara
			// subtract() -> resta vectores pa obtener la direccion
			const forward = camera.getTarget().subtract(camera.position).normalize();
			forward.y = 0;           // anulamos el componente Y pa q no suba/baje
			forward.normalize();     // normalizamos pa q tenga longitud 1
			// normalize() -> convierte el vector en unitario (longitud 1)
			// asi la velocidad es constante en todas direcciones

			// Calculamos el vector "derecha" de la camara
			// Cross() -> producto cruzado de vectores (perpendicular a ambos)
			// Vector3.Up() -> vector (0, 1, 0) apuntando hacia arriba
			const right = Vector3.Cross(forward, Vector3.Up()).normalize();

			// Calculamos posicion DESEADA sin aplicarla todavia
			// primero comprobamos colisión, luego decidimos si mover o no
			let desiredPosition = this.targetPosition.clone();

			// arriba -> mover hacia adelante (direccion de la camara)
			if (this.inputHandler.isKeyPressed(kUp)) {
				desiredPosition.addInPlace(forward.scale(moveSpeed));
				keyPressed = true;
			}
			// abajo -> mover hacia atras (opuesto a la direccion de camara)
			if (this.inputHandler.isKeyPressed(kDown)) {
				desiredPosition.addInPlace(forward.scale(-moveSpeed));
				keyPressed = true;
			}
			// izquierda -> mover a la izquierda (perpendicular a camara)
			if (this.inputHandler.isKeyPressed(kLeft)) {
				desiredPosition.addInPlace(right.scale(moveSpeed));
				keyPressed = true;
			}
			// derecha -> mover a la derecha
			if (this.inputHandler.isKeyPressed(kRight)) {
				desiredPosition.addInPlace(right.scale(-moveSpeed));
				keyPressed = true;
			}

			// Solo aplicamos el movimiento si NO hay colision en el camino
			if (keyPressed) {
				const collision = this.collisionSystem.checkMove(this.targetPosition, desiredPosition);
				if (!collision.hasCollision) {
					this.targetPosition = desiredPosition;
				}
				// Si hay colision, targetPosition se queda igual -> personaje se bloquea
			}
		}

		// Limitar a los bordes del suelo (120x120)
		// el mapa es de 120x120, entonces va de -60 a 60 en X y Z
		// pero dejamos margen (-55 a 55) pa q no se salga del borde visual
		this.targetPosition.x = Math.max(CHARACTER_CONFIG.minMapLimit, Math.min(CHARACTER_CONFIG.maxMapLimit, this.targetPosition.x));
		// Math.max() -> devuelve el mayor de dos numeros
		// Math.min() -> devuelve el menor de dos numeros
		// esto "clampea" el valor entre minMapLimit y maxMapLimit
		this.targetPosition.z = Math.max(CHARACTER_CONFIG.minMapLimit, Math.min(CHARACTER_CONFIG.maxMapLimit, this.targetPosition.z));

		const current = this.character.getPosition();  // pos actual del personaje
		const lerpSpeed = CHARACTER_CONFIG.positionSmoothness;  // velocidad de interpolacion (0 a 1)
		// lerp (interpolacion lineal) -> hace q el movimiento sea suave
		// 0.25 significa q cada frame se acerca un 25% a la pos objetivo

		// Actualizar estado de movimiento
		const wasMoving = this.isMoving;  // guardamos el estado anterior
		this.isMoving = keyPressed;       // actualizamos al estado actual
		// esto nos permite detectar cuando EMPIEZA o TERMINA el movimiento

		// Activar/desactivar animacion segun el estado
		if (this.isMoving && !wasMoving) {
			// Si acabamos de empezar a movernos -> iniciar animacion de caminar
			this.character.startWalking();
		} else if (!this.isMoving && wasMoving) {
			// Si acabamos de parar -> detener animacion de caminar
			this.character.stopWalking();
		}

		// Rotar personaje hacia direccion de movimiento
		// el personaje mira hacia donde se mueve
		if (keyPressed && camera) {
			// Recalculamos el forward de la camara
			const forward = camera.getTarget().subtract(camera.position).normalize();
			forward.y = 0;
			forward.normalize();
			// Recalculamos el right de la camara
			const right = Vector3.Cross(forward, Vector3.Up()).normalize();
			// Vector pa acumular la direccion de movimiento
			let moveDir = Vector3.Zero();  // empieza en (0, 0, 0)         
			// Sumamos las direcciones segun las teclas presionadas
			if (this.inputHandler.isKeyPressed(kUp))
				moveDir.addInPlace(forward);
			if (this.inputHandler.isKeyPressed(kDown))
				moveDir.addInPlace(forward.scale(-1));
			if (this.inputHandler.isKeyPressed(kLeft))
				moveDir.addInPlace(right);
			if (this.inputHandler.isKeyPressed(kRight))
				moveDir.addInPlace(right.scale(-1));

			// Si hay direccion de movimiento (no es cero)
			if (moveDir.length() > 0) {
				// length() -> magnitud del vector (distancia desde el origen)
				moveDir.normalize();  // convertimos a vector unitario  
				// Calculamos el angulo de rotacion usando arcotangente
				// atan2() -> calcula el angulo en radianes entre dos componentes
				// -moveDir.x, -moveDir.z -> usamos negativos pa ajustar la orientacion
				const targetAngle = Math.atan2(-moveDir.x, -moveDir.z);

				// Aplicamos la rotacion al personaje
				this.character.setRotation(targetAngle);
			}
		}

		// Lerp de posicion (interpolacion lineal pa movimiento suave)
		// en lugar de saltar directamente a targetPosition, nos acercamos gradualmente
		const newPos = new Vector3(
			// x = posActual + (posObjetivo - posActual) * velocidadLerp
			current.x + (this.targetPosition.x - current.x) * lerpSpeed,
			current.y,  // Y no cambia (siempre en el suelo)
			current.z + (this.targetPosition.z - current.z) * lerpSpeed
		);
		// Aplicamos la nueva pos al personaje
		this.character.setPosition(newPos);

		// Devolvemos si se presiono alguna tecla
		// esto sirve pa q otros sist sepan si el personaje se esta moviendo
		return keyPressed;
	}

	public getTargetPosition(): Vector3 {
		return this.targetPosition;
	}
}
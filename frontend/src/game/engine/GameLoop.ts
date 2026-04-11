// GameLoop — logica del juego que se ejecuta cada frame (en cada frame haz todo esto)
// gestiona input de camara, movimiento del personaje, proximidad y zoom dinamico
// se separa de HomeScene3D pa que el orquestador no tenga logica inline

import { Scene, Vector3 } from '@babylonjs/core';
import type { CameraController } from './CameraController';
import type { KeyboardInput } from './InputHandler';
import type { PlayerMovement } from '../player/PlayerMovement';
import type { HubSceneBuilder } from '../scenes/hub/HubSceneBuilder';
import type { ProximitySystem } from '../physics/ProximitySystem';
import { CHARACTER_CONFIG } from '../config/PlayerConfig';

export class GameLoop {
	private scene: Scene;								// escena donde se registra el bucle
	private inputHandler: KeyboardInput;					// detecta teclas presionadas
	private cameraController: CameraController;			// controla camara (rotacion, zoom, seguimiento)
	private entityManager: HubSceneBuilder;			// acceso al personaje y objetos de la escena
	private proximitySystem: ProximitySystem;			// activa/desactiva highlights por proximidad
	private characterMovement: PlayerMovement | null = null;	// se asigna cuando el personaje termina de cargar

	constructor(
		scene: Scene,
		inputHandler: KeyboardInput,
		cameraController: CameraController,
		entityManager: HubSceneBuilder,
		proximitySystem: ProximitySystem,
	) {
		this.scene = scene;
		this.inputHandler = inputHandler;
		this.cameraController = cameraController;
		this.entityManager = entityManager;
		this.proximitySystem = proximitySystem;
	}

	// asigna el movimiento del personaje — llamar desde el callback de createCharacter
	// hasta q no se llame este metodo, tick() no procesa movimiento (personaje aun cargando)
	public setCharacterMovement(movement: PlayerMovement): void {
		this.characterMovement = movement;
	}

	// arranca el bucle — registrar una sola vez despues de crear todo
	public start(): void {
		this.scene.registerBeforeRender(() => this.updateFrame());
	}

	// logica q se ejecuta CADA FRAME
	private updateFrame(): void {
		const character = this.entityManager?.character;
		if (!character || !this.characterMovement)
			return;	// esperamos a q el personaje cargue

		// rotar camara con A/D
		if (this.inputHandler.isKeyPressed('a'))
			this.cameraController.rotateHorizontal('left');
		if (this.inputHandler.isKeyPressed('d'))
			this.cameraController.rotateHorizontal('right');

		// inclinar camara con W/S
		if (this.inputHandler.isKeyPressed('w'))
			this.cameraController.rotateVertical('down');
		if (this.inputHandler.isKeyPressed('s'))
			this.cameraController.rotateVertical('up');

		// movimiento del personaje
		this.characterMovement.update(CHARACTER_CONFIG.moveSpeed);

		// camara sigue al personaje
		const characterPosition = character.getPosition();
		this.cameraController.followTarget(characterPosition);

		// proximidad -> activa/desactiva highlights y pulso de todos los objetos registrados
		this.proximitySystem.update(characterPosition);

		// zoom dinamico segun el mesh mas cercano al personaje
		let minDistancetoObject = 999;
		for (const mesh of this.scene.meshes) {
			if (
				mesh.name !== 'ground' &&
				mesh.name !== 'stickman' &&
				!mesh.name.includes('__root__') &&
				mesh.name !== ''
			) {
				const distToMesh = Vector3.Distance(characterPosition, mesh.position);
				if (distToMesh < minDistancetoObject && distToMesh > 1)
					minDistancetoObject = distToMesh;
			}
		}
		this.cameraController.adjustZoomDistance(minDistancetoObject);

		// trofeo rota continuamente
		if (this.entityManager?.trophy) {
			this.entityManager.trophy.rotate(CHARACTER_CONFIG.trophyRotationSpeed);
		}
	}
}

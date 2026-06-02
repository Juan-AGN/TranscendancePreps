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
import { useGameSettingsStore, SPEED_MAP, SENSITIVITY_MAP, PLAYER_SIZE_MAP } from '../../shared/store/gameSettingsStore';

export class GameLoop {
	private scene: Scene;								// escena donde se registra el bucle
	private inputHandler: KeyboardInput;					// detecta teclas presionadas
	private cameraController: CameraController;			// controla camara (rotacion, zoom, seguimiento)
	private entityManager: HubSceneBuilder;			// acceso al personaje y objetos de la escena
	private proximitySystem: ProximitySystem;			// activa/desactiva highlights por proximidad
	private characterMovement: PlayerMovement | null = null;	// se asigna cuando el personaje termina de cargar
	private lastAppliedSize: string = '';						// tamaño del personaje aplicado en el ultimo frame

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

		// settings del juego (leidos del store cada frame)
		const { controlsPreset, cameraSensitivity, invertCameraY, moveSpeed: speedPreset, playerSize: sizePreset } = useGameSettingsStore.getState();
		const sensitivity = SENSITIVITY_MAP[cameraSensitivity];

		// tamaño del personaje: solo aplica cuando cambia (evita escalar cada frame)
		if (sizePreset !== this.lastAppliedSize) {
			character.setScale(PLAYER_SIZE_MAP[sizePreset]);
			this.lastAppliedSize = sizePreset;
		}

		// teclas de camara (swap con teclas de movimiento segun preset)
		const camLeft  = controlsPreset === 'WASD' ? 'ArrowLeft'  : 'a';
		const camRight = controlsPreset === 'WASD' ? 'ArrowRight' : 'd';
		const camUp    = controlsPreset === 'WASD' ? 'ArrowUp'    : 'w';
		const camDown  = controlsPreset === 'WASD' ? 'ArrowDown'  : 's';

		if (this.inputHandler.isKeyPressed(camLeft))
			this.cameraController.rotateHorizontal('left', sensitivity);
		if (this.inputHandler.isKeyPressed(camRight))
			this.cameraController.rotateHorizontal('right', sensitivity);
		if (this.inputHandler.isKeyPressed(camUp))
			this.cameraController.rotateVertical(invertCameraY ? 'up' : 'down', sensitivity);
		if (this.inputHandler.isKeyPressed(camDown))
			this.cameraController.rotateVertical(invertCameraY ? 'down' : 'up', sensitivity);

		// movimiento del personaje
		this.characterMovement.update(SPEED_MAP[speedPreset]);

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

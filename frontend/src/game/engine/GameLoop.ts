// ┌────────────────────────────────────────────────────────────┐
// │                GameLoop.ts                                 │
// ├────────────────────────────────────────────────────────────┤
// │ Main game loop - executes logic every frame.               │
// │ Manages camera input, character movement, proximity, zoom. │
// │ Separates from HomeScene3D so orchestrator stays clean.    │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import core Babylon.js types and dependencies
import { Scene, Vector3 } from '@babylonjs/core';
import type { CameraController } from './CameraController';
import type { KeyboardInput } from './InputHandler';
import type { PlayerMovement } from '../player/PlayerMovement';
import type { HubSceneBuilder } from '../scenes/hub/HubSceneBuilder';
import type { ProximitySystem } from '../physics/ProximitySystem';
import { CHARACTER_CONFIG } from '../config/PlayerConfig';
import { useGameSettingsStore, SPEED_MAP, SENSITIVITY_MAP, PLAYER_SIZE_MAP } from '../config/gameSettingsStore';

// STEP 2: Define GameLoop class with all required systems
export class GameLoop {
	private scene: Scene;                                // Scene where the loop registers
	private inputHandler: KeyboardInput;                // Detects pressed keys
	private cameraController: CameraController;        // Controls camera (rotation, zoom, follow)
	private entityManager: HubSceneBuilder;            // Access to character and scene objects
	private proximitySystem: ProximitySystem;          // Activates/deactivates highlights by proximity
	private characterMovement: PlayerMovement | null = null; // Set when character finishes loading
	private lastAppliedSize: string = '';              // Character size applied in last frame

	// STEP 3: Constructor - initialize with all systems
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

	// STEP 4: Set character movement after loading completes
	// Call from character creation callback
	// Until this is called, tick() won't process movement (character still loading)
	public setCharacterMovement(movement: PlayerMovement): void {
		this.characterMovement = movement;
	}

	// STEP 5: Start the loop - register once after creating everything
	public start(): void {
		this.scene.registerBeforeRender(() => this.updateFrame());
	}

	// ════════════════════════════════════════════════════════════════════════════════════════════════════════
	// STEP 6: MAIN FRAME UPDATE - executes EVERY FRAME
	// Frame rate ≈ 60 FPS (1000ms / 60 = ~16.7ms per frame)
	// ════════════════════════════════════════════════════════════════════════════════════════════════════════

	private updateFrame(): void {
		const character = this.entityManager?.character;
		if (!character || !this.characterMovement)
			return; // Wait for character to load

		// STEP 7: Read game settings from store (every frame)
		const { controlsPreset, cameraSensitivity, invertCameraY, moveSpeed: speedPreset, playerSize: sizePreset } = useGameSettingsStore.getState();
		const sensitivity = SENSITIVITY_MAP[cameraSensitivity];

		// STEP 8: Apply character size (only when it changes, not every frame)
		if (sizePreset !== this.lastAppliedSize) {
			character.setScale(PLAYER_SIZE_MAP[sizePreset]);
			this.lastAppliedSize = sizePreset;
		}

		// STEP 9: Map camera control keys based on control preset
		// Swap keys depending on WASD or Arrow controls preference
		const camLeft  = controlsPreset === 'WASD' ? 'ArrowLeft'  : 'a';
		const camRight = controlsPreset === 'WASD' ? 'ArrowRight' : 'd';
		const camUp    = controlsPreset === 'WASD' ? 'ArrowUp'    : 'w';
		const camDown  = controlsPreset === 'WASD' ? 'ArrowDown'  : 's';

		// STEP 10: Handle camera rotation input
		if (this.inputHandler.isKeyPressed(camLeft))
			this.cameraController.rotateHorizontal('left', sensitivity);
		if (this.inputHandler.isKeyPressed(camRight))
			this.cameraController.rotateHorizontal('right', sensitivity);
		if (this.inputHandler.isKeyPressed(camUp))
			this.cameraController.rotateVertical(invertCameraY ? 'up' : 'down', sensitivity);
		if (this.inputHandler.isKeyPressed(camDown))
			this.cameraController.rotateVertical(invertCameraY ? 'down' : 'up', sensitivity);

		// STEP 11: Update character movement
		this.characterMovement.update(SPEED_MAP[speedPreset]);

		// STEP 12: Camera follows character
		const characterPosition = character.getPosition();
		this.cameraController.followTarget(characterPosition);

		// STEP 13: Proximity system - activate/deactivate highlights and pulse
		this.proximitySystem.update(characterPosition);

		// STEP 14: Dynamic zoom based on closest mesh to character
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

		// STEP 15: Continuous rotation of trophy
		if (this.entityManager?.trophy) {
			this.entityManager.trophy.rotate(CHARACTER_CONFIG.trophyRotationSpeed);
		}
	}
}

// ===== MINI DICTIONARY =====
// Frame = single rendered image (~60 per second)
// FPS = Frames Per Second (60 FPS ≈ 16.7ms per frame)
// registerBeforeRender = hook that executes before each frame renders
// Sensitivity = camera rotation speed multiplier
// Smoothness = interpolation factor for gradual changes
// Preset = predefined control configuration (WASD vs Arrows)
// Proximity = closeness/distance detection
// Raycast = invisible ray for distance checking

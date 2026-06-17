// ┌────────────────────────────────────────────────────────────┐
// │                 PlayerMovement.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Handles character movement in the 3D Hub.                │
// │ Processes input, rotation, animations, and map limits.   │
// │ Uses lerp smoothing and camera-relative movement vectors. │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import movement dependencies

import { Vector3 } from '@babylonjs/core';
import { PlayerCharacter } from './PlayerCharacter';
import { CameraController } from '../engine/CameraController';
import { KeyboardInput } from '../engine/InputHandler';
import { CollisionSystem } from '../physics/CollisionSystem';
import { CHARACTER_CONFIG } from '../config/PlayerConfig';
import { useGameSettingsStore } from '../config/gameSettingsStore';

// STEP 2: Define character movement class
export class PlayerMovement {
	private character: PlayerCharacter;          // Character instance to move
	private cameraController: CameraController;    // Camera controller for relative direction vectors
	private inputHandler: KeyboardInput;            // Keyboard input state provider
	private collisionSystem: CollisionSystem;      // Collision system to block movement through obstacles
	private targetPosition: Vector3;               // Movement target position
	private isMoving: boolean = false;             // Movement state flag
	// boolean can only be true/false
	// false means character starts idle

	// STEP 3: Initialize movement dependencies
	constructor(
		character: PlayerCharacter,
		cameraController: CameraController,
		inputHandler: KeyboardInput,
		collisionSystem: CollisionSystem,
		initialPosition: Vector3 = Vector3.Zero()  // Vector3.Zero() = (0, 0, 0)
	) {
		this.character = character;                      // Store character reference
		this.cameraController = cameraController;        // Store camera controller
		this.inputHandler = inputHandler;                // Store input handler
		this.collisionSystem = collisionSystem;          // Store collision system
		this.targetPosition = initialPosition.clone();   // Clone to avoid mutating input reference
		// clone() creates an independent vector copy
	}

	// STEP 4: Per-frame movement update
	public update(moveSpeed: number = CHARACTER_CONFIG.moveSpeed): boolean {
		const camera = this.cameraController.getCamera();  // Get active camera
		let keyPressed = false;                            // Track whether any movement key is pressed

		// STEP 5: Resolve movement keys from selected controls preset
		const { controlsPreset } = useGameSettingsStore.getState();
		const kUp    = controlsPreset === 'WASD' ? 'w'         : 'ArrowUp';
		const kDown  = controlsPreset === 'WASD' ? 's'         : 'ArrowDown';
		const kLeft  = controlsPreset === 'WASD' ? 'a'         : 'ArrowLeft';
		const kRight = controlsPreset === 'WASD' ? 'd'         : 'ArrowRight';

		// STEP 6: Build camera-relative movement vectors
		// Movement is relative to camera facing direction, not world absolute axes
		if (camera) {
			// Compute camera forward vector
			// getTarget() gives camera look-at point
			// subtract() between target and camera position yields facing direction
			const forward = camera.getTarget().subtract(camera.position).normalize();
			forward.y = 0;           // Remove Y to stay on ground plane
			forward.normalize();     // Keep length = 1
			// Unit vectors keep movement speed consistent in all directions

			// Compute camera right vector using cross product
			const right = Vector3.Cross(forward, Vector3.Up()).normalize();

			// Compute desired position first (before applying)
			// Collision is validated before committing movement
			let desiredPosition = this.targetPosition.clone();

			// Up key -> move forward
			if (this.inputHandler.isKeyPressed(kUp)) {
				desiredPosition.addInPlace(forward.scale(moveSpeed));
				keyPressed = true;
			}
			// Down key -> move backward
			if (this.inputHandler.isKeyPressed(kDown)) {
				desiredPosition.addInPlace(forward.scale(-moveSpeed));
				keyPressed = true;
			}
			// Left key -> strafe left
			if (this.inputHandler.isKeyPressed(kLeft)) {
				desiredPosition.addInPlace(right.scale(moveSpeed));
				keyPressed = true;
			}
			// Right key -> strafe right
			if (this.inputHandler.isKeyPressed(kRight)) {
				desiredPosition.addInPlace(right.scale(-moveSpeed));
				keyPressed = true;
			}

			// STEP 7: Commit movement only if collision check passes
			if (keyPressed) {
				const collision = this.collisionSystem.checkMove(this.targetPosition, desiredPosition);
				if (!collision.hasCollision) {
					this.targetPosition = desiredPosition;
				}
				// On collision, keep previous target position
			}
		}

		// STEP 8: Clamp movement to map bounds
		// Leave margin so character does not clip visual edges
		this.targetPosition.x = Math.max(CHARACTER_CONFIG.minMapLimit, Math.min(CHARACTER_CONFIG.maxMapLimit, this.targetPosition.x));
		// Math.max() picks the larger value
		// Math.min() picks the smaller value
		// Combined they clamp values between min and max
		this.targetPosition.z = Math.max(CHARACTER_CONFIG.minMapLimit, Math.min(CHARACTER_CONFIG.maxMapLimit, this.targetPosition.z));

		const current = this.character.getPosition();  // Current character position
		const lerpSpeed = CHARACTER_CONFIG.positionSmoothness;  // Interpolation factor (0..1)
		// Lerp smooths movement instead of instant teleporting

		// STEP 9: Update movement state and animation transitions
		const wasMoving = this.isMoving;  // Previous state
		this.isMoving = keyPressed;       // Current state
		// This detects movement start/stop transitions

		// Trigger animation changes based on transitions
		if (this.isMoving && !wasMoving) {
			// Started moving -> play walk/run animation
			this.character.startWalking();
		} else if (!this.isMoving && wasMoving) {
			// Stopped moving -> return to idle animation
			this.character.stopWalking();
		}

		// STEP 10: Rotate character toward movement direction
		if (keyPressed && camera) {
			// Recompute camera forward
			const forward = camera.getTarget().subtract(camera.position).normalize();
			forward.y = 0;
			forward.normalize();
			// Recompute camera right
			const right = Vector3.Cross(forward, Vector3.Up()).normalize();
			// Accumulator vector for movement direction
			let moveDir = Vector3.Zero();
			// Add directional vectors based on pressed keys
			if (this.inputHandler.isKeyPressed(kUp))
				moveDir.addInPlace(forward);
			if (this.inputHandler.isKeyPressed(kDown))
				moveDir.addInPlace(forward.scale(-1));
			if (this.inputHandler.isKeyPressed(kLeft))
				moveDir.addInPlace(right);
			if (this.inputHandler.isKeyPressed(kRight))
				moveDir.addInPlace(right.scale(-1));

			// If movement direction is non-zero
			if (moveDir.length() > 0) {
				// normalize() turns it into unit direction vector
				// atan2() returns heading angle in radians
				// Negative components align with current model orientation
				moveDir.normalize();
				const targetAngle = Math.atan2(-moveDir.x, -moveDir.z);

				// Apply rotation to character
				this.character.setRotation(targetAngle);
			}
		}

		// STEP 11: Lerp position for smooth movement
		const newPos = new Vector3(
			// x = current + (target - current) * lerpSpeed
			current.x + (this.targetPosition.x - current.x) * lerpSpeed,
			current.y,  // Keep Y fixed (ground plane)
			current.z + (this.targetPosition.z - current.z) * lerpSpeed
		);
		// Apply computed position
		this.character.setPosition(newPos);

		// Return whether any movement key was pressed
		return keyPressed;
	}

	// STEP 12: Expose current target position
	public getTargetPosition(): Vector3 {
		return this.targetPosition;
	}
}

// ===== MINI DICTIONARY =====
// lerp -> linear interpolation for smooth transitions
// clamp -> restrict value between min and max
// forward/right vectors -> camera-relative movement axes
// collision check -> prevents invalid movement into obstacles
// target position -> desired destination before smoothing
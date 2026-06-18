// ┌────────────────────────────────────────────────────────────┐
// │               CollisionSystem.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Collision detection system using raycasts.                 │
// │ Checks if there is a solid object in front of player.      │
// │ Prevents moving character inside world objects.            │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import Babylon.js collision primitives

import { Scene, Vector3, Ray, AbstractMesh } from '@babylonjs/core';

// STEP 2: Define collision check result contract
export interface CollisionResult {
	hasCollision: boolean; // Whether there is a collision
	hitDistance: number; // Distance to hit point
	hitMesh: AbstractMesh | null; // Hit mesh (if any)
}

export class CollisionSystem {

	private scene: Scene; // Scene containing all colliders
	private collisionDistance: number; 
	// lookahead = how far the ray checks forward
	// this is NOT movement step size, it is detection distance

	// STEP 3: Initialize system with scene and default lookahead
	constructor(scene: Scene, collisionDistance: number = 1.5) {
		this.scene = scene;
		this.collisionDistance = collisionDistance;
	}

	// STEP 4: Generic collision check from origin + direction
	public checkCollision(
		origin: Vector3,
		direction: Vector3,
		maxDistance?: number
	): CollisionResult {
		const checkDistance = maxDistance ?? this.collisionDistance; // Use provided distance or fallback to base value
		// If there is no real direction, raycast is meaningless
		if (direction.lengthSquared() === 0) {
			return { hasCollision: false, hitDistance: 0, hitMesh: null };
		}

		// STEP 5: Build ray from character waist height
		const rayOrigin = origin.clone(); // Clone origin to avoid mutating caller vector
		rayOrigin.y += 1; // Raise ray to character waist level
		// If cast from ground level, it can miss depending on collider/ground setup

		const ray = new Ray(
			rayOrigin,
			direction.clone().normalize(),
			checkDistance
		);
		// Ray setup:
		// - origin = where cast starts
		// - normalized direction = direction only, no magnitude noise
		// - length = how far to check

		// STEP 6: Cast ray against scene and filter only collider meshes
		const hit = this.scene.pickWithRay(
			ray,
			(mesh) => !!mesh.metadata?.isCollider,
			true
		);

		// Filter: only meshes with metadata.isCollider = true
		// This ignores ground, decorations, etc.
		// true = fastCheck
		// Babylon stops at first hit, faster for per-frame checks
		// If something is hit inside range => collision
		if (hit?.hit && hit.pickedMesh && hit.distance < checkDistance) {
			return {
				hasCollision: true,
				hitDistance: hit.distance,
				hitMesh: hit.pickedMesh
			};
		}

		// STEP 7: No hit => free path
		return {
			hasCollision: false,
			hitDistance: checkDistance,
			hitMesh: null
		};
	}

	// STEP 8: Movement-specific check between current and intended positions
	public checkMove(currentPos: Vector3, newPos: Vector3): CollisionResult {

		const direction = newPos.subtract(currentPos); // Vector from current position to intended position
		if (direction.length() < 0.01) {
			return { hasCollision: false, hitDistance: 0, hitMesh: null };
		}
		// If movement is minimal, no need to check
		return this.checkCollision(currentPos, direction, this.collisionDistance);
		// IMPORTANT: use fixed lookahead, not raw frame movement
		// Using tiny frame step (~0.3) makes ray too short and misses obstacle anticipation
	}
}

// ===== MINI DICTIONARY =====
// ray -> invisible line used to detect impacts
// raycast -> cast a ray and detect what it hits
// lookahead -> distance checked ahead of movement
// metadata -> extra custom data attached to mesh
// fastCheck -> stop at first hit (faster)
// AbstractMesh -> base 3D object type in Babylon
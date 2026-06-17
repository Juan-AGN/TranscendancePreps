// ┌────────────────────────────────────────────────────────────┐
// │               ColliderBuilder.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Factory for creating invisible collision geometry.         │
// │ Separates collider creation logic for clean architecture.  │
// │ Handles boxes and cylinders with optional debug visuals.   │
// └────────────────────────────────────────────────────────────┘

import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { DEBUG_CONFIG } from '../config/DebugConfig'; // Debug flags (show colliders or not)

export interface BoxDimensions {
	// Dimensions of a collision box
	width: number; // Width on X axis
	height: number; // Height on Y axis
	depth: number; // Depth on Z axis
}


export class ColliderBuilder {
	// Utility class (static) for easy collider creation

	public static createBox(
		scene: Scene,
		id: string,
		dims: BoxDimensions,
		center: Vector3,
		yOffset = 0,
		debugMode = false
	): Mesh {
		// Create a box with the given dimensions
		const collider = MeshBuilder.CreateBox(id, {
			width: dims.width,
			height: dims.height,
			depth: dims.depth,
		}, scene);

		// Position the collider in the scene
		// X and Z come from the center of the object, Y is adjusted separately with yOffset
		collider.position = new Vector3(center.x, yOffset, center.z);

		// Metadata = extra data attached to the mesh
		// Mark this mesh as a collider
		collider.metadata = { isCollider: true };
		// IMPORTANT: Babylon's raycast only detects pickable meshes
		// If this were false → CollisionSystem wouldn't see it
		collider.isPickable = true;

		// ===== DEBUG VISUAL =====
		// If debug is enabled → show in red wireframe
		// Otherwise → invisible
		if (debugMode || DEBUG_CONFIG.showColliders) {
			const mat = new StandardMaterial(`${id}_debug_mat`, scene);
			mat.wireframe = true; // Only show lines (no fill) to see exact shape and size
			mat.emissiveColor = new Color3(1, 0, 0); // Bright red for visibility
			collider.material = mat;
			collider.isVisible = true;
		} else {
			collider.isVisible = false; // Collider invisible in normal gameplay
		}
		return collider;
	}

	public static createCylinder(
		scene: Scene,
		id: string,
		radius: number,
		height: number,
		center: Vector3,
		yOffset = 0,
		debugMode = false
	): Mesh {
		// Create a collision cylinder
		const collider = MeshBuilder.CreateCylinder(id, {
			diameter: radius * 2,
			height,
		}, scene);

		// Position the collider in place
		collider.position = new Vector3(center.x, yOffset, center.z);
		// Mark as collider for system detection
		collider.metadata = { isCollider: true };
		// Make it detectable by raycast
		collider.isPickable = true;
		// ===== DEBUG VISUAL =====
		if (debugMode || DEBUG_CONFIG.showColliders) {
			const mat = new StandardMaterial(`${id}_debug_mat`, scene);
			mat.wireframe = true; // Lines only
			mat.emissiveColor = new Color3(1, 0, 0); // Red debug color
			collider.material = mat;
			collider.isVisible = true;
		} else {
			collider.isVisible = false;
		}
		return collider;
	}
}

// ===== MINI DICTIONARY =====
// collider → invisible shape for collision detection
// metadata → extra data attached to the mesh
// isPickable → allows raycast detection
// raycast → cast an invisible ray to detect what it touches
// wireframe → lines only, no fill
// emissive → self-emitting color
// static → method used without instantiation (new)
// diameter → width of cylinder
// offset → extra displacement
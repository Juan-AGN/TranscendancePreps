// ┌────────────────────────────────────────────────────────────┐
// │                PlayerCharacter.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Playable stickman character controller.                   │
// │ Loads 3D model from GLB and handles Idle/Run animations.  │
// │ Manages character position, rotation, and animation state.│
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import Babylon primitives and player configuration

import { Scene, Vector3, Mesh, SceneLoader, AnimationGroup } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // Import GLTF/GLB loader
import { STICKMAN_GLB_PATH, STICKMAN_SCALE, STICKMAN_MESH_NAME_FILTERS, STICKMAN_ANIM_RUN, STICKMAN_ANIM_IDLE } from '../config/PlayerConfig';

// STEP 2: Define playable character class
export class PlayerCharacter {
	private scene: Scene;                                  // Babylon scene where character exists
	private mesh: Mesh | null = null;                     // Main character mesh (null until loaded)
	private rootMesh: Mesh | null = null;                 // Root mesh (parent of all model meshes)
	private animationGroups: AnimationGroup[] = [];       // Model animation groups (Idle, Run, etc.)
	private initialRotationY: number = 0;                 // Initial model Y rotation (some models are pre-rotated)
	public position: Vector3;                             // Current character world position
	private loadPromise: Promise<void>;                   // Load promise to await async model loading
	// Promise<void> means no payload, only completion signal

	// STEP 3: Store scene/position and start async loading
	constructor(scene: Scene, initialPosition: Vector3 = Vector3.Zero()) {
		this.scene = scene;                           // Store scene reference
		this.position = initialPosition.clone();      // Clone to avoid mutating original vector
		this.loadPromise = this.load();              // Start async model load
		// load() is async and returns the promise stored in loadPromise
	}

	// STEP 4: Public readiness hook for external await
	public ready(): Promise<void> {
		return this.loadPromise;
	}

	// STEP 5: Load GLB meshes and animations
	private async load(): Promise<void> {
		try {
			// ImportMeshAsync loads GLB asynchronously
			// params: mesh name ('' = all), file path, file name, scene
			// await pauses execution until loading completes
			const result = await SceneLoader.ImportMeshAsync('', STICKMAN_GLB_PATH, '', this.scene);

			// If file loaded correctly and contains meshes
			if (result.meshes.length > 0) {
				// meshes[0] is typically the model root mesh
				this.rootMesh = result.meshes[0] as Mesh;
				this.mesh = this.rootMesh;  // Keep main mesh reference

				// Apply initial transform
				this.rootMesh.position = this.position.clone();  // Place at initial position
				this.rootMesh.scaling = new Vector3(STICKMAN_SCALE, STICKMAN_SCALE, STICKMAN_SCALE);

				// Save model initial rotation
				// Some models have baked/predefined rotation
				// We preserve it and add movement rotation on top
				this.initialRotationY = this.rootMesh.rotation.y;

				// Store all model animation groups
				this.animationGroups = result.animationGroups;
				if (this.animationGroups.length > 0) {
					// Start first animation in loop mode
					this.animationGroups[0].play(true);
				}
			}
		} catch (error) {
			void error;
		}
	}

	// STEP 6: Expose main mesh reference
	public getMesh(): Mesh | null {
		return this.mesh;
	}

	// STEP 7: Collect all descendant model meshes
	public getAllMeshes(): Mesh[] {
		if (!this.rootMesh)
			return [];  // No root => return empty array

		// Collect all descendant meshes from root
		const allMeshes: Mesh[] = [];
		// getDescendants() returns children, grandchildren, etc.
		// false includes descendants under the current branch traversal
		this.rootMesh.getDescendants(false).forEach(node => {
			// Keep only Mesh nodes (ignore cameras/lights/etc.)
			if (node instanceof Mesh) {
				allMeshes.push(node);  // Add mesh to output
			}
		});

		return allMeshes;
	}

	// STEP 8: Update character world position
	public setPosition(position: Vector3): void {
		this.position = position.clone();  // Store cloned position
		if (this.mesh) {
			// If mesh exists, apply position to scene mesh
			this.mesh.position = this.position;
		}
	}

	// STEP 9: Read current position from mesh or fallback state
	public getPosition(): Vector3 {
		// If mesh exists, return mesh position
		// Otherwise return stored position state
		return this.mesh ? this.mesh.position.clone() : this.position.clone();
	}

	// STEP 10: Apply Y rotation preserving model base orientation
	public setRotation(y: number): void {
		// Add model initial Y rotation to desired heading
		// Needed for models with baked initial orientation
		const finalRotation = y + this.initialRotationY;

		if (this.rootMesh) {
			// Rotate root mesh
			this.rootMesh.rotation.y = finalRotation;
		}

		// Rotate visible model meshes as well
		// Needed because some GLBs split visuals across separate meshes
		const visibleMeshes = this.scene.meshes.filter(m =>
			STICKMAN_MESH_NAME_FILTERS.some((f: string) => m.name.includes(f))
		);
		// filter() applies a condition over arrays
		// includes() checks substring existence
		// startsWith() checks prefix match

		// Apply final rotation to each visible mesh
		visibleMeshes.forEach(mesh => {
			if (mesh instanceof Mesh && mesh !== this.rootMesh) {
				mesh.rotation.y = finalRotation;
			}
		});
	}

	// STEP 11: Scale character uniformly
	public setScale(scale: number): void {
		if (this.rootMesh) {
			this.rootMesh.scaling = new Vector3(scale, scale, scale);
		}
	}

	// STEP 12: Transition to Run animation
	public startWalking(): void {
		// Find "Run" animation group
		// find() returns first matching element
		// toLowerCase() enables case-insensitive comparison
		const runAnim = this.animationGroups.find(a => a.name.toLowerCase() === STICKMAN_ANIM_RUN);
		if (runAnim) {
			// If Run exists:
			// 1) Stop all current animations
			this.animationGroups.forEach(a => a.stop());
			// 2) Play Run in loop mode
			runAnim.play(true);
		}
	}

	// STEP 13: Transition to Idle animation
	public stopWalking(): void {
		// Find "Idle" animation group
		const idleAnim = this.animationGroups.find(a => a.name.toLowerCase() === STICKMAN_ANIM_IDLE);
		if (idleAnim) {
			// If Idle exists:
			// 1) Stop all animations
			this.animationGroups.forEach(a => a.stop());
			// 2) Play Idle in loop mode
			idleAnim.play(true);
		}
	}

	// STEP 14: Dispose root mesh and attached resources
	public dispose(): void {
		if (this.rootMesh) {
			// dispose(doNotRecurse, disposeMaterialAndTextures)
			// false => recurse into children
			// true => dispose materials and textures
			this.rootMesh.dispose(false, true); // Dispose recursively
		}
	}
}

// ===== MINI DICTIONARY =====
// GLB -> binary glTF 3D model format
// root mesh -> top-level parent mesh in imported hierarchy
// animation group -> named set of animation tracks
// async load -> non-blocking resource loading
// loop -> replay animation continuously
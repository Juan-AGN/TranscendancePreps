// ┌────────────────────────────────────────────────────────────┐
// │                    LaFarola.ts                             │
// ├────────────────────────────────────────────────────────────┤
// │ La Farola landmark model for Hub scene.                   │
// │ Loads GLB, applies transforms, shadows and collider.      │
// │ Extends InteractiveObject for shared runtime behavior.    │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import landmark dependencies

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class LaFarola extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Store desired transform and trigger model loading
	constructor(
		scene: Scene,
		position: Vector3,
		scale = 1,
		shadowGenerator: ShadowGenerator | null = null,
		rotation = 0
	) {
		super(scene, position, shadowGenerator);
		this.targetScale = new Vector3(scale, scale, scale);
		this.targetRotation = rotation;
		this.loadPromise = this.load();
	}

	// STEP 3: Load model and finalize mesh setup
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/lafarola.glb', '', this.scene);
			if (result.meshes.length === 0) {
				return;
			}
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.rotationQuaternion = null;
			this.rootMesh.rotation.y = this.targetRotation;
			this.rootMesh.isPickable = true;
			this.rootMesh.computeWorldMatrix(true);

			this.storeModelMeshes(result.meshes);           // Populate GLB mesh cache for glow/effects
			this.setupShadows(result.meshes);               // Enable shadow behavior across imported meshes
			this.createColliderFromModelMesh(this.rootMesh, 'lafarola_collider');
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// landmark -> recognizable world object in scene
// pickable -> mesh can be selected by pointer raycasts
// transform -> position, rotation and scale settings

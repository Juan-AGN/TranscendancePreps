// ┌────────────────────────────────────────────────────────────┐
// │                   LaRosaleda.ts                            │
// ├────────────────────────────────────────────────────────────┤
// │ La Rosaleda stadium object for the Hub scene.             │
// │ Loads model, applies transform and collider/shadow setup. │
// │ Uses mirrored Z scale to correct source text orientation. │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import stadium dependencies

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class LaRosaleda extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Capture transform config and start loading
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

	// STEP 3: Load model and complete runtime setup
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/NewLaRosaleda_draco.glb', '', this.scene);
			if (result.meshes.length === 0) { return; }
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.scaling.z *= -1; // Mirror Z to fix mirrored text orientation
			this.rootMesh.rotationQuaternion = null;
			this.rootMesh.rotation.y = this.targetRotation;
			this.rootMesh.isVisible = true;
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'larosaleda_collider');
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// mirrored scale -> negative axis scale to flip geometry orientation
// hierarchy bounds -> extents used to auto-generate collider volume

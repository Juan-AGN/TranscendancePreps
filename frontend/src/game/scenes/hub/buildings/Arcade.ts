// ┌────────────────────────────────────────────────────────────┐
// │                     Arcade.ts                              │
// ├────────────────────────────────────────────────────────────┤
// │ Retro arcade machine object for the Hub scene.            │
// │ Loads GLB, applies transform, shadows and collider.       │
// │ Extends InteractiveObject shared behavior.                │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import arcade dependencies

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class Arcade extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Store desired transform and start async load
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

	// STEP 3: Load model and configure runtime mesh behavior
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/arcade.glb', '', this.scene);
			if (result.meshes.length === 0) {
				return; }
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.rotationQuaternion = null;
			this.rootMesh.rotation.y = this.targetRotation;
			this.rootMesh.isVisible = true;
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'arcade_collider');
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// GLB -> binary glTF 3D model format
// collider -> invisible mesh used for collisions/click hits
// shadow caster -> mesh that contributes to dynamic shadows

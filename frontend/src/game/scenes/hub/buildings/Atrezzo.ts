// ┌────────────────────────────────────────────────────────────┐
// │                     Atrezzo.ts                             │
// ├────────────────────────────────────────────────────────────┤
// │ Reusable decorative prop class for Hub scene assets.      │
// │ Loads configurable model path with transform/shadows.     │
// │ Extends InteractiveObject shared utilities.               │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import decorative prop dependencies

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class Atrezzo extends InteractiveObject {
	private readonly modelPath: string;
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Capture model/transform configuration and start load
	constructor(
		scene: Scene,
		position: Vector3,
		modelPath: string,
		scale = 1,
		shadowGenerator: ShadowGenerator | null = null,
		rotation = 0
	) {
		super(scene, position, shadowGenerator);
		this.modelPath = modelPath;
		this.targetScale = new Vector3(scale, scale, scale);
		this.targetRotation = rotation;
		this.loadPromise = this.load();
	}

	// STEP 3: Load model and apply visual/collider setup
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', this.modelPath, '', this.scene);
			if (result.meshes.length === 0) {
				return;
			}

			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.rotationQuaternion = null;
			this.rootMesh.rotation.y = this.targetRotation;
			this.rootMesh.isVisible = true;
			this.rootMesh.isPickable = false;
			this.rootMesh.computeWorldMatrix(true);

			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(
				this.rootMesh,
				`atrezzo_collider_${Math.round(this.position.x)}_${Math.round(this.position.z)}`
			);
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// prop -> decorative scene element
// model path -> source URI used by SceneLoader
// world matrix -> final transform matrix used for rendering/picking
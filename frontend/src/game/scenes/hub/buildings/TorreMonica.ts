// ┌────────────────────────────────────────────────────────────┐
// │                  TorreMonica.ts                            │
// ├────────────────────────────────────────────────────────────┤
// │ Torre Monica landmark object for the Hub scene.           │
// │ Loads GLB and applies configured transform/shadow setup.  │
// │ Extends InteractiveObject base utilities.                 │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import tower dependencies

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class TorreMonica extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Store transform defaults and start loading
	constructor(
		scene: Scene,
		position: Vector3,
		scale = 1,
		rotation = 0,
		shadowGenerator: ShadowGenerator | null = null
	) {
		super(scene, position, shadowGenerator);
		this.targetScale = new Vector3(scale, scale, scale);
		this.targetRotation = rotation;
		this.loadPromise = this.load();
	}

	// STEP 3: Load model and initialize collider/shadow behavior
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/TorreMonica.glb', '', this.scene);
			if (result.meshes.length === 0) {
				return;
			}
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.rotationQuaternion = null;
			this.rootMesh.rotation.y = this.targetRotation;
			this.rootMesh.isVisible = true;
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'torre_monica_collider');
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// landmark -> notable decorative structure in world scene
// root mesh -> top mesh used as transform anchor

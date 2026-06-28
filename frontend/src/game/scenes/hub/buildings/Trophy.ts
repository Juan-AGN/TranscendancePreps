// ┌────────────────────────────────────────────────────────────┐
// │                      Trophy.ts                             │
// ├────────────────────────────────────────────────────────────┤
// │ Trophy interactive object used in the Hub scene.          │
// │ Loads GLB, applies transform and click/collider behavior. │
// │ Extends InteractiveObject shared functionality.           │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import trophy dependencies

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders';
import { InteractiveObject } from './InteractiveObject';

export class Trophy extends InteractiveObject {
	private readonly targetScale: number;

	// STEP 2: Store scale config and begin async loading
	constructor(
		scene: Scene,
		position: Vector3,
		scale = 7,
		shadowGenerator: ShadowGenerator | null = null
	) {
		super(scene, position, shadowGenerator);
		this.targetScale = scale;
		this.loadPromise = this.load();
	}

	// STEP 3: Load model, choose real mesh and configure collider
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/creators.glb', '', this.scene);
			if (result.meshes.length === 0) {
				return;
			}
			// Detach real mesh from utility root (same behavior as original)
			const realMeshes = result.meshes.filter(
				m => m.name !== '__root__' && m.getClassName() === 'Mesh'
			) as Mesh[];
			const target = realMeshes.length > 0 ? realMeshes[0] : result.meshes[0] as Mesh;
			target.parent = null;
			target.position = this.position.clone();
			target.scaling = new Vector3(this.targetScale, this.targetScale, this.targetScale);
			target.isPickable = true;

			this.rootMesh = target;
			this.storeModelMeshes(result.meshes);           // GLB meshes for glow/effects
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(target, 'trophy_collider');
		} catch (error) {
			void error;
		}
	}

	// STEP 4: Called from GameLoop each frame for continuous spin
	public rotate(angle: number): void {
		if (this.rootMesh) {
			this.rootMesh.addRotation(0, angle, 0);
		}
	}
}

// ===== MINI DICTIONARY =====
// continuous rotation -> incremental rotation applied every frame
// angle (radians) -> rotation amount in radian units


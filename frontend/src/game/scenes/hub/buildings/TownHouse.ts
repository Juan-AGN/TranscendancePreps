// ┌────────────────────────────────────────────────────────────┐
// │                    TownHouse.ts                            │
// ├────────────────────────────────────────────────────────────┤
// │ TownHouse interactive building for Hub navigation.        │
// │ Loads GLB, detaches real mesh and applies final transform.│
// │ Extends InteractiveObject (collider, glow, ready flow).   │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import townhouse dependencies

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class TownHouse extends InteractiveObject {
	private readonly targetScale: number;
	private readonly targetRotation: number;

	// STEP 2: Store transform config and start async loading
	constructor(
		scene: Scene,
		position: Vector3,
		scale = 15,
		rotation = Math.PI / 2,
		shadowGenerator: ShadowGenerator | null = null
	) {
		super(scene, position, shadowGenerator);
		this.targetScale = scale;
		this.targetRotation = rotation;
		this.loadPromise = this.load();
	}

	// STEP 3: Load model, detach usable mesh and setup interaction
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync(
				'',
				'/models/',
				'NewPolo_draco.glb',
				 this.scene);
			if (result.meshes.length === 0) {
				return;
			}
			// Detach real mesh from __root__ to avoid inherited baked transforms
			// (matches original behavior: realMesh.parent = null)
			const realMeshes = result.meshes.filter(
				m => m.name !== '__root__' && m.getClassName() === 'Mesh'
			) as Mesh[];
			const target = realMeshes.length > 0 ? realMeshes[0] : result.meshes[0] as Mesh;
			target.parent = null;
			target.position = this.position.clone();
			target.scaling = new Vector3(this.targetScale, this.targetScale, this.targetScale);
			target.addRotation(0, this.targetRotation, 0);
			target.isPickable = true;

			this.rootMesh = target;                                // getRootMesh() y collider
			this.storeModelMeshes(result.meshes);                 // GLB meshes for glow/effects
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(target, 'townhouse_collider');
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// __root__ -> Babylon import root node, often not the visual mesh to interact with
// detach parent -> remove inherited transform chain from utility root
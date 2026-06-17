// ┌────────────────────────────────────────────────────────────┐
// │                 PingPongTable.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Ping pong table object for Hub decorations.               │
// │ Loads GLB and applies diagonal initial orientation.       │
// │ Adds continuous Y-axis rotation animation per frame.      │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import ping pong object dependencies

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class PingPongTable extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Initialize transform defaults and start loading
	constructor(
		scene: Scene,
		position: Vector3,
		scale = 0.45,
		rotation = Math.PI / 4,
		shadowGenerator: ShadowGenerator | null = null
	) {
		super(scene, position, shadowGenerator);
		this.targetScale = new Vector3(scale, scale, scale);
		this.targetRotation = rotation;
		this.loadPromise = this.load();
	}

	// STEP 3: Load model, setup collider and register spin animation
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/table1.glb', '', this.scene);
			if (result.meshes.length === 0) {
				return;
			}
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.rotation.y = this.targetRotation; // Initial diagonal orientation
			this.rootMesh.isVisible = true;
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'pingpong_collider');
			// Continuous Y rotation (0.01 rad/frame)
			const speed = 0.01;
			this.scene.onBeforeRenderObservable.add(() => {
				if (this.rootMesh)
					this.rootMesh.addRotation(0, speed, 0);
			});
		} catch (error) {
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// per frame -> executed on every render tick
// rad/frame -> radians added on each rendered frame
// observable -> Babylon event stream for lifecycle hooks

// PingPongTable — mesa de ping pong con rotacion continua del hub

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class PingPongTable extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

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

	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/table1.glb', '', this.scene);
			if (result.meshes.length === 0) {
				return;
			}
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.rotation.y = this.targetRotation; // angulo inicial en diagonal
			this.rootMesh.isVisible = true;
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'pingpong_collider');
			// rotacion continua en Y, 0.01 rad/frame
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

/**
 * LaFarola modelo glb el faro malaga
 * Carga modelo GLB, aplica transformaciones y configura sombras
 * Extiende InteractiveObject: tiene collider, glow y ready()
 */

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class LaFarola extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

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

			this.storeModelMeshes(result.meshes);           // llena glbMeshes -> glow
			this.setupShadows(result.meshes);               // sombras en todos los meshes
			this.createColliderFromModelMesh(this.rootMesh, 'lafarola_collider');
		} catch (error) {
			void error;
		}
	}
}

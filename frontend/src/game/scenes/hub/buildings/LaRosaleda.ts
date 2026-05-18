// LaRosaleda — estadio de futbol malaga del hub
// invierte Z pa corregir texto espejo del modelo

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class LaRosaleda extends InteractiveObject {
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
			const result = await SceneLoader.ImportMeshAsync('', '/models/larosaleda.glb', '', this.scene);
			if (result.meshes.length === 0) { console.warn('LaRosaleda: no se cargaron meshes'); return; }
			this.rootMesh = result.meshes[0] as Mesh;
			this.rootMesh.position = this.position.clone();
			this.rootMesh.scaling = this.targetScale.clone();
			this.rootMesh.scaling.z *= -1; // invierte Z pa corregir texto espejo
			this.rootMesh.rotationQuaternion = null;
			this.rootMesh.rotation.y = this.targetRotation;
			this.rootMesh.isVisible = true;
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'larosaleda_collider');
		} catch (error) {
			console.error('LaRosaleda error:', error);
		}
	}
}

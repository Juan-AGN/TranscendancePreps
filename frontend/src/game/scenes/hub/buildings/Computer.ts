// Computer — ordenador gaming con materiales PBR del hub
// modelo Draco comprimido (23MB -> 1.5MB)
// -X en la escala corrige el flip horizontal del modelo

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator, Color3, PBRMaterial } from '@babylonjs/core';
import '@babylonjs/loaders';
import { InteractiveObject } from './InteractiveObject';

export class Computer extends InteractiveObject {
	private readonly targetScale: Vector3;

	constructor(
		scene: Scene,
		position: Vector3,
		scale = 2,
		shadowGenerator: ShadowGenerator | null = null
	) {
		super(scene, position, shadowGenerator);
		this.targetScale = new Vector3(scale, scale, scale);
		this.loadPromise = this.load();
	}

	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/', 'pc.glb', this.scene);
			const root = result.meshes[0];
			if (!root) {
				console.error('Computer: no se encontro mesh root');
				return;
			}
			this.rootMesh = root as Mesh;
			this.rootMesh.position = this.position.clone();
			// -X invierte horizontalmente pa corregir orientacion del modelo
			this.rootMesh.scaling = new Vector3(-this.targetScale.x, this.targetScale.y, this.targetScale.z);
			this.rootMesh.addRotation(0, Math.PI / 3.2, 0);
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'computer_collider');
			// ajustes PBR segun tipo de mesh
			this.glbMeshes.forEach(mesh => {
				if (mesh.material instanceof PBRMaterial) {
					const mat = mesh.material as PBRMaterial;
					const name = mesh.name.toLowerCase();
					if (name.includes('screen') || name.includes('display')) {
						mat.metallic = 0.1;
						mat.roughness = 0.2;
						mat.emissiveColor = new Color3(0.1, 0.15, 0.2);
					} else if (name.includes('metal') || name.includes('frame')) {
						mat.metallic = 0.8;
						mat.roughness = 0.3;
					} else {
						mat.metallic = 0.1;
						mat.roughness = 0.5;
					}
					mat.environmentIntensity = 1.2;
					mat.directIntensity = 1.0;
				}
			});
		} catch (error) {
			console.error('Computer error:', error);
		}
	}
}

/**
 * TownHouse modelo glb edificio polo malaga
 * Carga modelo GLB del edificio, aplica transformaciones y lo hace clickable
 * Extiende InteractiveObject: tiene collider, glow y ready()
 */

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { InteractiveObject } from './InteractiveObject';

export class TownHouse extends InteractiveObject {
	constructor(
		scene: Scene,
		position: Vector3,
		onClick: () => void,
		shadowGenerator: ShadowGenerator | null = null
	) {
		super(scene, position, shadowGenerator);
		this.onClick = onClick;
		this.loadPromise = this.load();
	}

	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/polo.glb', '', this.scene);
			if (result.meshes.length === 0) {
				console.warn('TownHouse: no se cargaron meshes');
				return;
			}
			// Desparentamos el mesh real del __root__ pa eliminar transforms bakeados
			// (igual que la version original: realMesh.parent = null)
			const realMeshes = result.meshes.filter(
				m => m.name !== '__root__' && m.getClassName() === 'Mesh'
			) as Mesh[];
			const target = realMeshes.length > 0 ? realMeshes[0] : result.meshes[0] as Mesh;
			target.parent = null;
			target.position = this.position.clone();
			target.scaling = new Vector3(15, 15, 15);
			target.addRotation(0, Math.PI / 2, 0);
			target.isPickable = true;

			this.rootMesh = target;                                // getRootMesh() y collider
			this.storeModelMeshes(result.meshes);                 // glbMeshes -> glow
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(target, 'townhouse_collider');
			console.log('TownHouse cargado - meshes:', result.meshes.length);
		} catch (error) {
			console.error('Error cargando TownHouse:', error);
		}
	}
}
/**
 * Trophy modelo glb trofeo dorado 
 * Carga modelo GLB del trofeo, aplica transformaciones y lo hace clickable
 * Extiende InteractiveObject: tiene collider, glow y ready()
 */

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders';
import { InteractiveObject } from './InteractiveObject';

export class Trophy extends InteractiveObject {
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
			const result = await SceneLoader.ImportMeshAsync('', '/trphy.glb', '', this.scene);
			if (result.meshes.length === 0) {
				console.warn('Trophy: no se cargaron meshes');
				return;
			}
			// Desparentamos el mesh real igual que la version original
			const realMeshes = result.meshes.filter(
				m => m.name !== '__root__' && m.getClassName() === 'Mesh'
			) as Mesh[];
			const target = realMeshes.length > 0 ? realMeshes[0] : result.meshes[0] as Mesh;
			target.parent = null;
			target.position = new Vector3(this.position.x, 0, this.position.z);
			target.scaling = new Vector3(8, 8, 8);
			target.isPickable = true;

			this.rootMesh = target;
			this.storeModelMeshes(result.meshes);           // glbMeshes -> glow
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(target, 'trophy_collider');
			console.log('Trophy cargado - meshes:', result.meshes.length);
		} catch (error) {
			console.error('Error cargando Trophy:', error);
		}
	}

	// GameLoop llama esto cada frame para que el trofeo gire continuamente
	public rotate(angle: number): void {
		if (this.rootMesh) {
			this.rootMesh.addRotation(0, angle, 0);
		}
	}
}


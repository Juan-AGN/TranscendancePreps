// ┌────────────────────────────────────────────────────────────┐
// │                    Computer.ts                             │
// ├────────────────────────────────────────────────────────────┤
// │ Gaming computer object with PBR material tuning.          │
// │ Loads Draco-compressed model and configures surface types.│
// │ Uses mirrored X scale to fix source orientation.          │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import computer model dependencies

import { Scene, Mesh, Vector3, SceneLoader, ShadowGenerator, Color3, PBRMaterial } from '@babylonjs/core';
import '@babylonjs/loaders';
import { InteractiveObject } from './InteractiveObject';

export class Computer extends InteractiveObject {
	private readonly targetScale: Vector3;
	private readonly targetRotation: number;

	// STEP 2: Store desired transform and start async load
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

	// STEP 3: Load mesh and configure PBR materials per mesh role
	protected async load(): Promise<void> {
		try {
			const result = await SceneLoader.ImportMeshAsync('', '/models/', 'NewComputer.glb', this.scene);
			const root = result.meshes[0];
			if (!root) {
				return;
			}
			this.rootMesh = root as Mesh;
			this.rootMesh.position = this.position.clone();
			// Negative X mirrors model to correct source orientation
			this.rootMesh.scaling = new Vector3(-this.targetScale.x, this.targetScale.y, this.targetScale.z);
			this.rootMesh.addRotation(0, this.targetRotation, 0);
			this.rootMesh.computeWorldMatrix(true);
			this.storeModelMeshes(result.meshes);
			this.setupShadows(result.meshes);
			this.createColliderFromModelMesh(this.rootMesh, 'computer_collider');
			// PBR tuning by mesh semantic (screen/frame/body)
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
			void error;
		}
	}
}

// ===== MINI DICTIONARY =====
// PBR -> physically based rendering material model
// metallic/roughness -> key PBR parameters for reflective response
// emissive -> self-illuminated color contribution

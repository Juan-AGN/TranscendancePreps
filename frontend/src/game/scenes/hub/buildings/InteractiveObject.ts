// ┌────────────────────────────────────────────────────────────┐
// │                InteractiveObject.ts                        │
// ├────────────────────────────────────────────────────────────┤
// │ Base class for all Hub interactive/building objects.      │
// │ Centralizes mesh storage, collider, shadow and lifecycle. │
// │ Concrete subclasses implement only their own load() logic.│
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import base object dependencies

import { Scene, Mesh, Vector3, ShadowGenerator } from '@babylonjs/core';
import { ColliderBuilder } from '../../../effects/ColliderBuilder'; // Utility to create colliders easily

export abstract class InteractiveObject {

	// STEP 2: Shared base state
	protected scene: Scene; // Scene where object exists
	protected rootMesh: Mesh | null = null; // Main/root model mesh (null while loading)
	protected glbMeshes: Mesh[] = []; // Real GLB meshes used for glow/shadow control
	protected shadowGenerator: ShadowGenerator | null = null; // Shadow system (optional)
	public position: Vector3; // Object world position
	public onClick: (() => void) | null = null; // Optional click callback
	protected loadPromise: Promise<void> = Promise.resolve();
	// Promise resolved when object loading completes (subclasses override)
	protected colliderMesh: Mesh | null = null; // Stored collider used by click handler matching

	constructor(
		scene: Scene,
		position: Vector3,
		shadowGenerator: ShadowGenerator | null = null
	) {
		this.scene = scene;
		this.position = position.clone(); // Clone to avoid shared-reference mutation bugs
		this.shadowGenerator = shadowGenerator;
	}

	// STEP 3: Abstract loader contract for concrete subclasses
	protected abstract load(): Promise<void>; // Each child class implements GLB load + collider setup

	// STEP 4: Store only valid model meshes
	protected storeModelMeshes(importedMeshes: readonly any[]): void {

		// Keep only real mesh nodes
		this.glbMeshes = importedMeshes.filter(
			m => m.getClassName() === 'Mesh' && m.name !== '__root__'
		) as Mesh[];
		// __root__ is a utility parent node and should not be used for glow/collider logic
	}

	// STEP 5: Register shadow behavior for imported meshes
	protected setupShadows(importedMeshes: readonly any[]): void {

		importedMeshes.forEach(mesh => {
			mesh.receiveShadows = true; // Mesh receives shadows
			if (this.shadowGenerator) {
				this.shadowGenerator.addShadowCaster(mesh); // Mesh also casts shadows
			}
		});
	}

	// STEP 6: Create manual box collider helper
	protected createBoxCollider(
		id: string,
		width: number,
		height: number,
		depth: number,
		yOffset = 0
	): Mesh {
		return ColliderBuilder.createBox(
			this.scene,
			id,
			{ width, height, depth },
			this.position,
			yOffset
		);
		// Create simple box collider (manual dimensions)
	}

	// STEP 7: Auto-create collider from root mesh hierarchy bounds
	protected createColliderFromModelMesh(rootMesh: Mesh, id: string): Mesh {

		rootMesh.computeWorldMatrix(true); // Update transforms before measuring bounds
		const boundsCenter = rootMesh.getHierarchyBoundingVectors(true); // Full hierarchy bounds
		const size = boundsCenter.max.subtract(boundsCenter.min); // Real size in X/Y/Z
		const center = boundsCenter.min.add(size.scale(0.5)); // Real center point

		const collider = ColliderBuilder.createBox(
			this.scene,
			id,
			{ width: size.x, height: size.y, depth: size.z },
			center,
			center.y
		);
		// Store collider reference so click handler can map invisible hit meshes to owner object
		this.colliderMesh = collider;
		return collider;

		// Automatic collider generation avoids manual size tuning
	}

	// STEP 8: Loading state accessors
	public ready(): Promise<void> {
		return this.loadPromise; // Other systems await this for readiness
	}

	public getRootMesh(): Mesh | null {
		return this.rootMesh; // Main/root mesh
	}

	public getColliderMesh(): Mesh | null {
		// Exposed for HubObjectClickHandler to match invisible collider picks
		return this.colliderMesh;
	}

	public getModelMeshes(): Mesh[] {
		return this.glbMeshes; // Real GLB meshes
	}

	// STEP 9: Dispose owned root mesh hierarchy and materials
	public dispose(): void {

		if (this.rootMesh) {
			this.rootMesh.dispose(false, true); // Dispose root + descendants + materials/textures
		}
	}
}

// ===== MINI DICTIONARY =====
// abstract -> base class that cannot be instantiated directly
// root mesh -> top-level mesh used as object anchor
// GLB meshes -> actual imported model meshes
// collider -> invisible shape for collision/picking
// bounds -> min/max spatial limits of object geometry
// promise -> async completion value resolved in the future
// inheritance -> class extension mechanism
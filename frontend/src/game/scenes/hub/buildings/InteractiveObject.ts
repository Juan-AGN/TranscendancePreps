// INTERACTIVE OBJECT -- clase base pa todos los objetos interactivos del hub
// esto es el "molde" que comparten todos (townhouse, trophy, etc)
// aqui centralizo TODO lo comun: meshes, posicion, collider, click, sombras
// IDEA CLAVE:  cada objeto concreto SOLO implementa load()
// todo lo demas ya viene hecho aqui (menos codigo repetido → mas limpio)

import { Scene, Mesh, Vector3, ShadowGenerator } from '@babylonjs/core';
import { ColliderBuilder } from '../../../effects/ColliderBuilder'; // util pa crear colliders facilmente

export abstract class InteractiveObject {

	// ─── ESTADO BASE
	protected scene: Scene; // escena donde vive el objeto
	protected rootMesh: Mesh | null = null; // mesh principal del modelo (el "padre"// puede ser null mientras carga
	protected glbMeshes: Mesh[] = []; // meshes reales del GLB (los hijos)// los uso pa glow, sombras, etc
	protected shadowGenerator: ShadowGenerator | null = null;// sistema de sombras (puede no existir)
	public position: Vector3;// posicion del objeto en el mundo
	public onClick: (() => void) | null = null;// callback cuando el usuario hace click// ej: navegar a otra pagina
	protected loadPromise: Promise<void> = Promise.resolve();
	// promesa que indica cuando el objeto ha terminado de cargar cada subclase la sobrescribe
	protected colliderMesh: Mesh | null = null; // guardamos el collider pa q el click handler sepa q este mesh invisible pertenece a este objeto

	constructor(
		scene: Scene,
		position: Vector3,
		shadowGenerator: ShadowGenerator | null = null
	) {
		this.scene = scene;
		this.position = position.clone(); // IMPORTANTE:clone pa no modificar el vector originalsi no → bugs raros de referencia compartida
		this.shadowGenerator = shadowGenerator;
	}

	// ─── METODO ABSTRACTO
	protected abstract load(): Promise<void>; // cada objeto HIJO debe implementar estoaqui es donde carga su GLB y crea su collider

	// ─── MESHES DEL MODELO 
	protected storeModelMeshes(importedMeshes: readonly any[]): void {

		// filtro solo meshes reales
		this.glbMeshes = importedMeshes.filter(
			m => m.getClassName() === 'Mesh' && m.name !== '__root__'
		) as Mesh[];
		// IMPORTANTE: // __root__ es un nodo vacio de Babylonsi no lo filtro → rompe highlight/collider
	}

	// ─── SOMBRAS
	protected setupShadows(importedMeshes: readonly any[]): void {

		importedMeshes.forEach(mesh => {
			mesh.receiveShadows = true;// el mesh recibe sombras (queda mas realista)
			if (this.shadowGenerator) {
				this.shadowGenerator.addShadowCaster(mesh);// el mesh tambien genera sombra
			}
		});
	}

	// ─── COLLIDERS 
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
		// creo un collider simple tipo caja // util cuando quiero control manual
	}

	protected createColliderFromModelMesh(rootMesh: Mesh, id: string): Mesh {

		rootMesh.computeWorldMatrix(true); // actualizo transformaciones antes de medir
		const boundsCenter = rootMesh.getHierarchyBoundingVectors(true); // saco limites del modelo completo (incluye hijos)
		const size = boundsCenter.max.subtract(boundsCenter.min); // tamaño real en X,Y,Z
		const center = boundsCenter.min.add(size.scale(0.5)); // centro real del modelo

		const collider = ColliderBuilder.createBox(
			this.scene,
			id,
			{ width: size.x, height: size.y, depth: size.z },
			center,
			center.y
		);
		// guardamos referencia al collider pa que el click handler pueda identificarlo
		// sin esto, al clickar el edificio se detecta 'townhouse_collider' y no hay match
		this.colliderMesh = collider;
		return collider;

		// creo collider automatico basado en el modelo
		// IMPORTANTE: esto evita tener que calcular tamaños a mano
	}

	// ─── ESTADO DE CARGA 
	public ready(): Promise<void> {
		return this.loadPromise; // otras clases esperan aqui pa saber si ya esta listo
	}

	public getRootMesh(): Mesh | null {
		return this.rootMesh; // mesh principal
	}

	public getColliderMesh(): Mesh | null {
		// expuesto pa que HubObjectClickHandler detecte clicks en el collider invisible
		// el collider tapa al GLB, sin esto los clicks nunca llegan al mesh del edificio
		return this.colliderMesh;
	}

	public getModelMeshes(): Mesh[] {
		return this.glbMeshes; // meshes reales
	}

	public dispose(): void {

		if (this.rootMesh) {
			this.rootMesh.dispose(false, true); // libero el mesh y todos sus hijos
			// IMPORTANTISIMO: si no libero → memory leak GPU
		}
	}
}

// ===== MINI DICCIONARIO =====

// abstract -> clase base que no se puede instanciar directamente
// rootMesh -> mesh principal del modelo
// glbMeshes -> meshes reales del modelo GLB
// collider -> forma invisible pa detectar colisiones
// bounds -> limites del objeto
// shadowCaster -> objeto que proyecta sombra
// promise -> valor que llega en el futuro (async)
// clone -> copia independiente de un objeto
// inheritance -> herencia entre clases
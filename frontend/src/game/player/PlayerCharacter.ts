//StickmanCharacter: Personaje jugable tipo stickman
//Carga modelo 3D desde archivo GLB y maneja animaciones (Idle, Run)
//Si falla la carga, crea un personaje procedural como respaldo
//Gestiona posicion, rotacion y animaciones del personaje

import { Scene, Vector3, Mesh, SceneLoader, AnimationGroup } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB
import { STICKMAN_GLB_PATH, STICKMAN_SCALE, STICKMAN_MESH_NAME_FILTERS, STICKMAN_ANIM_RUN, STICKMAN_ANIM_IDLE } from '../config/PlayerConfig';

// Clase molde pa crear el personaje jugable
export class PlayerCharacter {
	private scene: Scene;                                  // escena de babylon donde vive el personaje
	private mesh: Mesh | null = null;                     // mesh principal del personaje (puede ser null si no cargo aun)
	private rootMesh: Mesh | null = null;                 // mesh raiz (padre de todos los meshes del modelo)
	private animationGroups: AnimationGroup[] = [];       // array con todas las animaciones del modelo (Idle, Run, etc)
	private initialRotationY: number = 0;                 // rotacion inicial del modelo (algunos modelos vienen rotados)
	public position: Vector3;                             // pos actual del personaje en el mundo 3D
	private loadPromise: Promise<void>;                   // promesa de carga pa esperar a q el modelo cargue
	// Promise<void> -> es una promesa q no devuelve nada util, solo avisa cuando termina

	constructor(scene: Scene, initialPosition: Vector3 = Vector3.Zero()) {
		this.scene = scene;                           // guardamos la escena
		this.position = initialPosition.clone();      // clonamos la pos pa no modificar el original
		this.loadPromise = this.load();              // iniciamos la carga del modelo de forma asincrona
		// load() es async, devuelve una promesa q se guarda en loadPromise
	}

	public ready(): Promise<void> {
		return this.loadPromise;
	}

	private async load(): Promise<void> {
		try {
			console.log('🔄 Cargando stickman desde Sketchfab...');

			// ImportMeshAsync -> carga un archivo GLB de forma asincrona
			// parametros: nombre del mesh ('' pa cargar todos), ruta del archivo, nombre del archivo, escena
			// await -> esperamos a q termine de cargar antes de continuar
			const result = await SceneLoader.ImportMeshAsync('', STICKMAN_GLB_PATH, '', this.scene);

			// Si el archivo cargo correctamente y tiene meshes
			if (result.meshes.length > 0) {
				// meshes[0] -> el primer mesh es siempre el root (raiz del modelo)
				this.rootMesh = result.meshes[0] as Mesh;
				this.mesh = this.rootMesh;  // guardamos tambien como mesh principal

				// Posicion y escala del modelo
				this.rootMesh.position = this.position.clone();  // colocamos en la pos inicial
				this.rootMesh.scaling = new Vector3(STICKMAN_SCALE, STICKMAN_SCALE, STICKMAN_SCALE);

				// Guardamos rotacion inicial del modelo
				// algunos modelos vienen con una rotacion preestablecida
				// la guardamos pa poder sumarla despues cuando el personaje se mueva
				this.initialRotationY = this.rootMesh.rotation.y;

				// Guardamos todas las animaciones q trae el modelo
				this.animationGroups = result.animationGroups;
				if (this.animationGroups.length > 0) {
					// Mostramos en consola cuantas animaciones tiene y sus nombres
					console.log(`🎬 ${this.animationGroups.length} animaciones: ${this.animationGroups.map(a => a.name).join(', ')}`);
					// map() -> transforma cada animacion en su nombre
					// join(', ') -> une todos los nombres con comas

					// Reproducimos la primera animacion en bucle (true = loop infinito)
					this.animationGroups[0].play(true);
				}

				console.log('✅ Stickman cargado con color original');
			}
		} catch (error) {
			console.error('❌ Error cargando stickman:', error);
		}
	}

	public getMesh(): Mesh | null {
		return this.mesh;
	}

	public getAllMeshes(): Mesh[] {
		if (!this.rootMesh) return [];  // si no hay root, devolvemos array vacio

		// Obtenemos TODOS los meshes descendientes del root
		const allMeshes: Mesh[] = [];
		// getDescendants() -> devuelve todos los hijos, nietos, etc del root
		// false -> incluye solo los hijos directos y sus descendientes
		this.rootMesh.getDescendants(false).forEach(node => {
			// Comprobamos q el nodo sea un Mesh (no una camara, luz, etc)
			if (node instanceof Mesh) {
				allMeshes.push(node);  // lo añadimos al array
			}
		});

		return allMeshes;
	}

	public setPosition(position: Vector3): void {
		this.position = position.clone();  // guardamos una copia de la pos
		if (this.mesh) {
			// Si el mesh ya existe, actualizamos su pos en la escena
			this.mesh.position = this.position;
		}
	}

	public getPosition(): Vector3 {
		// Si el mesh existe, devolvemos su pos actual
		// si no, devolvemos la pos guardada en la variable
		return this.mesh ? this.mesh.position.clone() : this.position.clone();
	}

	public setRotation(y: number): void {
		// Sumamos la rotacion inicial del modelo a la rotacion deseada
		// esto es necesario xq algunos modelos vienen con rotacion preestablecida
		const finalRotation = y + this.initialRotationY;

		if (this.rootMesh) {
			// Rotamos el mesh raiz
			this.rootMesh.rotation.y = finalRotation;
		}

		// Rotamos todos los meshes visibles del modelo
		// esto es necesario xq algunos modelos GLB tienen meshes separados
		const visibleMeshes = this.scene.meshes.filter(m =>
			STICKMAN_MESH_NAME_FILTERS.some((f: string) => m.name.includes(f))
		);
		// filter() -> filtra el array segun una condicion
		// includes() -> comprueba si un string contiene otro
		// startsWith() -> comprueba si un string empieza con otro

		// Aplicamos la rotacion a cada mesh visible
		visibleMeshes.forEach(mesh => {
			if (mesh instanceof Mesh && mesh !== this.rootMesh) {
				mesh.rotation.y = finalRotation;
			}
		});
	}

	public startWalking(): void {
		// Buscamos la animacion "Run" en el array de animaciones
		// find() -> devuelve el primer elemento q cumple la condicion
		// toLowerCase() -> convierte a minusculas pa comparar sin importar mayusculas
		const runAnim = this.animationGroups.find(a => a.name.toLowerCase() === STICKMAN_ANIM_RUN);
		if (runAnim) {
			// Si existe la animacion Run:
			// 1. Detenemos todas las animaciones
			this.animationGroups.forEach(a => a.stop());
			// 2. Reproducimos solo la animacion Run en bucle (true = loop)
			runAnim.play(true);
		}
	}

	public stopWalking(): void {
		// Buscamos la animacion "Idle" en el array
		const idleAnim = this.animationGroups.find(a => a.name.toLowerCase() === STICKMAN_ANIM_IDLE);
		if (idleAnim) {
			// Si existe la animacion Idle:
			// 1. Detenemos todas las animaciones
			this.animationGroups.forEach(a => a.stop());
			// 2. Reproducimos solo la animacion Idle en bucle
			idleAnim.play(true);
		}
	}

	public dispose(): void {
		if (this.rootMesh) {
			// dispose(doNotRecurse, disposeMaterialAndTextures)
			// false -> SI recursar (borrar hijos tambien)
			// true -> borrar materiales y texturas
			this.rootMesh.dispose(false, true); // Dispose recursively
		}
	}
}
/**
 * StickmanCharacter: Personaje jugable tipo stickman
 * Carga modelo 3D desde archivo GLB y maneja animaciones (Idle, Run)
 * Si falla la carga, crea un personaje procedural como respaldo
 * Gestiona posicion, rotacion y animaciones del personaje
 */

import { Scene, Vector3, Mesh, MeshBuilder, StandardMaterial, Color3, SceneLoader, AnimationGroup } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB

// Clase molde pa crear el personaje jugable
export class StickmanCharacter {
    private scene: Scene;                                  // escena de babylon donde vive el personaje
    private mesh: Mesh | null = null;                     // mesh principal del personaje (puede ser null si no cargo aun)
    private rootMesh: Mesh | null = null;                 // mesh raiz (padre de todos los meshes del modelo)
    private animationGroups: AnimationGroup[] = [];       // array con todas las animaciones del modelo (Idle, Run, etc)
    private initialRotationY: number = 0;                 // rotacion inicial del modelo (algunos modelos vienen rotados)
    public position: Vector3;                             // pos actual del personaje en el mundo 3D
    private loadPromise: Promise<void>;                   // promesa de carga pa esperar a q el modelo cargue
    // Promise<void> -> es una promesa q no devuelve nada util, solo avisa cuando termina

    /**
     * Constructor: inicializa el personaje y empieza la carga del modelo
     * @param scene -> escena de babylon donde se creara el personaje
     * @param initialPosition -> pos inicial (x defecto es el origen 0,0,0)
     */
    constructor(scene: Scene, initialPosition: Vector3 = Vector3.Zero()) {
        this.scene = scene;                           // guardamos la escena
        this.position = initialPosition.clone();      // clonamos la pos pa no modificar el original
        this.loadPromise = this.load();              // iniciamos la carga del modelo de forma asincrona
        // load() es async, devuelve una promesa q se guarda en loadPromise
    }

    /**
     * Devuelve la promesa de carga del personaje
     * otros sist pueden esperar a esta promesa pa saber cuando el personaje esta listo
     * se usa en el loading screen pa actualizar el progreso
     */
    public ready(): Promise<void> {
        return this.loadPromise;
    }

    /**
     * Carga el modelo 3D del personaje desde archivo GLB
     * este metodo es PRIVADO y async (tarda tiempo en cargar el archivo)
     * si la carga falla, crea un personaje procedural como respaldo
     */
    private async load(): Promise<void> {
        try {
            console.log('🔄 Cargando stickman desde Sketchfab...');
            
            // ImportMeshAsync -> carga un archivo GLB de forma asincrona
            // parametros: nombre del mesh ('' pa cargar todos), ruta del archivo, nombre del archivo, escena
            // await -> esperamos a q termine de cargar antes de continuar
            const result = await SceneLoader.ImportMeshAsync('', '/stickman.glb', '', this.scene);

            // Si el archivo cargo correctamente y tiene meshes
            if (result.meshes.length > 0) {
                // meshes[0] -> el primer mesh es siempre el root (raiz del modelo)
                this.rootMesh = result.meshes[0] as Mesh;
                this.mesh = this.rootMesh;  // guardamos tambien como mesh principal
                
                // Posicion y escala del modelo
                this.rootMesh.position = this.position.clone();  // colocamos en la pos inicial
                this.rootMesh.scaling = new Vector3(3, 3, 3);    // escalamos 3x en todas direcciones (el modelo es muy peque\u00f1o)
                
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
            // Si algo falla (archivo no existe, formato incorrecto, etc)
            console.error('❌ Error:', error);
            // Creamos un personaje procedural como plan B
            this.createFallback();
        }
    }

    /**
     * Crea un personaje procedural (hecho con primitivas) como respaldo
     * este metodo es PRIVADO, solo se llama si falla la carga del GLB
     * el personaje esta hecho con cilindros y esferas (geometria basica)
     */
    private createFallback(): void {
        console.log('🎨 Creando personaje procedural de respaldo');
        
        // Creamos un mesh raiz invisible pa agrupar todas las partes del personaje
        // CreateBox -> crea un cubo (lo usamos como contenedor invisible)
        const root = MeshBuilder.CreateBox('stickmanRoot', { size: 0.1 }, this.scene);
        root.position = this.position.clone();  // lo colocamos en la pos inicial
        root.isVisible = false; // Invisible, solo pa agrupar las partes
        
        // Cuerpo (cilindro vertical)
        // CreateCylinder -> crea un cilindro con altura y diametro especificos
        const body = MeshBuilder.CreateCylinder('body', {
            height: 1.5,      // alto del cuerpo
            diameter: 0.6     // ancho del cuerpo
        }, this.scene);
        body.position.y = 1;   // elevamos el cuerpo pa q este sobre las piernas
        body.parent = root;    // lo hacemos hijo del root pa q rote con el
        
        // Cabeza (esfera)
        // CreateSphere -> crea una esfera
        const head = MeshBuilder.CreateSphere('head', { diameter: 0.5 }, this.scene);
        head.position.y = 2;   // colocamos la cabeza arriba del cuerpo
        head.parent = root;    // hijo del root
        
        // Pierna izquierda
        const leftLeg = MeshBuilder.CreateCylinder('leftLeg', {
            height: 0.8,
            diameter: 0.25
        }, this.scene);
        leftLeg.position.set(-0.2, 0.4, 0);  // set() -> establece x, y, z de una vez
        // -0.2 en X -> movemos a la izquierda
        leftLeg.parent = root;
        
        // Pierna derecha
        const rightLeg = MeshBuilder.CreateCylinder('rightLeg', {
            height: 0.8,
            diameter: 0.25
        }, this.scene);
        rightLeg.position.set(0.2, 0.4, 0);  // 0.2 en X -> movemos a la derecha
        rightLeg.parent = root;
        
        // Brazo izquierdo
        const leftArm = MeshBuilder.CreateCylinder('leftArm', {
            height: 0.7,
            diameter: 0.2
        }, this.scene);
        leftArm.position.set(-0.4, 1.3, 0);  // lo colocamos al lado del cuerpo
        leftArm.rotation.z = Math.PI / 6;     // lo rotamos un poco pa q parezca natural
        // Math.PI / 6 -> 30 grados en radianes
        leftArm.parent = root;
        
        // Brazo derecho
        const rightArm = MeshBuilder.CreateCylinder('rightArm', {
            height: 0.7,
            diameter: 0.2
        }, this.scene);
        rightArm.position.set(0.4, 1.3, 0);
        rightArm.rotation.z = -Math.PI / 6;   // rotacion negativa pa el otro lado
        rightArm.parent = root;
        
        // 👉 INDICADOR VISUAL DE DIRECCION (frente)
        // creamos una nariz/cono pa saber hacia donde mira el personaje
        const nose = MeshBuilder.CreateCylinder('nose', {
            height: 0.3,
            diameterTop: 0,      // 0 en la punta -> forma de cono
            diameterBottom: 0.15 // base del cono
        }, this.scene);
        nose.rotation.x = Math.PI / 2;  // rotamos 90 grados pa q apunte al frente
        nose.position.set(0, 2, 0.25);  // lo colocamos en la cara, apuntando al frente (Z positivo)
        nose.parent = root;
        
        // Material blanco pa el cuerpo
        const mat = new StandardMaterial('stickmanMat', this.scene);
        mat.diffuseColor = new Color3(1, 1, 1);      // color blanco (RGB: 1, 1, 1)
        mat.specularColor = new Color3(0.3, 0.3, 0.3); // brillo sutil
        
        // Material naranja pa la nariz (indicador de direccion)
        const noseMat = new StandardMaterial('noseMat', this.scene);
        noseMat.diffuseColor = new Color3(1, 0.5, 0); // naranja (RGB: 1, 0.5, 0)
        noseMat.emissiveColor = new Color3(0.3, 0.1, 0); // brillo naranja sutil
        
        // Aplicamos los materiales a cada parte
        body.material = mat;
        head.material = mat;
        leftLeg.material = mat;
        rightLeg.material = mat;
        leftArm.material = mat;
        rightArm.material = mat;
        nose.material = noseMat;  // la nariz es naranja pa destacar

        // Guardamos el root como mesh principal
        this.rootMesh = root;
        this.mesh = root;
        
        console.log('✅ Personaje procedural creado con nariz naranja indicando el frente');
    }

    /**
     * Devuelve el mesh principal del personaje
     * util pa otros sist q necesiten referenciar el personaje
     * @returns Mesh del personaje o null si aun no cargo
     */
    public getMesh(): Mesh | null {
        return this.mesh;
    }

    /**
     * Devuelve TODOS los meshes del personaje (incluyendo hijos)
     * util pa aplicar sombras o efectos a todas las partes del modelo
     * @returns array con todos los meshes descendientes del root
     */
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

    /**
     * Establece la pos del personaje en el mundo 3D
     * @param position -> nueva pos del personaje
     */
    public setPosition(position: Vector3): void {
        this.position = position.clone();  // guardamos una copia de la pos
        if (this.mesh) {
            // Si el mesh ya existe, actualizamos su pos en la escena
            this.mesh.position = this.position;
        }
    }

    /**
     * Devuelve la pos actual del personaje
     * @returns Vector3 con la pos (copia pa no modificar el original)
     */
    public getPosition(): Vector3 {
        // Si el mesh existe, devolvemos su pos actual
        // si no, devolvemos la pos guardada en la variable
        return this.mesh ? this.mesh.position.clone() : this.position.clone();
    }

    /**
     * Establece la rotacion del personaje en el eje Y (horizontal)
     * suma la rotacion inicial del modelo pa q rote correctamente
     * @param y -> angulo de rotacion en radianes
     */
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
            m.name.includes('Simple') ||      // meshes con "Simple" en el nombre
            m.name.includes('Object_') ||     // meshes con "Object_" en el nombre
            m.name.startsWith('primitive')    // meshes q empiezan con "primitive"
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
    
    /**
     * Activa la animacion de caminar (Run)
     * detiene todas las demas animaciones y reproduce solo Run en loop
     */
    public startWalking(): void {
        // Buscamos la animacion "Run" en el array de animaciones
        // find() -> devuelve el primer elemento q cumple la condicion
        // toLowerCase() -> convierte a minusculas pa comparar sin importar mayusculas
        const runAnim = this.animationGroups.find(a => a.name.toLowerCase() === 'run');
        if (runAnim) {
            // Si existe la animacion Run:
            // 1. Detenemos todas las animaciones
            this.animationGroups.forEach(a => a.stop());
            // 2. Reproducimos solo la animacion Run en bucle (true = loop)
            runAnim.play(true);
        }
    }
    
    /**
     * Activa la animacion de estar quieto (Idle)
     * detiene todas las demas animaciones y reproduce solo Idle en loop
     */
    public stopWalking(): void {
        // Buscamos la animacion "Idle" en el array
        const idleAnim = this.animationGroups.find(a => a.name.toLowerCase() === 'idle');
        if (idleAnim) {
            // Si existe la animacion Idle:
            // 1. Detenemos todas las animaciones
            this.animationGroups.forEach(a => a.stop());
            // 2. Reproducimos solo la animacion Idle en bucle
            idleAnim.play(true);
        }
    }

    /**
     * Elimina el personaje de la escena y libera memoria
     * dispose -> borra el mesh y todos sus descendientes
     */
    public dispose(): void {
        if (this.rootMesh) {
            // dispose(doNotRecurse, disposeMaterialAndTextures)
            // false -> SI recursar (borrar hijos tambien)
            // true -> borrar materiales y texturas
            this.rootMesh.dispose(false, true); // Dispose recursively
        }
    }
}
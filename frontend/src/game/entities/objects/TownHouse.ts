/**
 * TownHouse modelo glb edificio polo malaga
 * Carga modelo GLB del edificio, aplica transformaciones y lo hace clickable
 * Es un obj INTERACTIVO, ejecuta un callback onClick cuando se clickea
 * Se usa como boton del menu 3D pa navegar a otras secciones
 */

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB

// Clase molde pa crear el edificio TownHouse {edificio interactivo}
export class TownHouse {
    private scene: Scene;                           // referencia a la escena de babylon donde aparece 
    private mesh: Mesh | null = null;              // mesh principal del edificio (el q clickeamos)
    private shadow: ShadowGenerator | null = null;  // sist de sombras (puede ser null)
    public position: Vector3;                      // pos del edificio en el mundo 3D
    public onClick: () => void;                    // callback q se ejecuta al hacer click (navegacion a pagina)

    constructor(scene: Scene, position: Vector3, onClick: () => void, shadow: ShadowGenerator | null = null) {
        this.scene = scene;                // guardamos la escena
        this.position = position.clone();  // clonamos la pos
        this.onClick = onClick;            // guardamos el callback de click
        this.shadow = shadow;              // guardamos el sist de sombras
        this.load();                       // iniciamos la carga del modelo
    }

    /** Carga el model GLB d TownHouse d forma asincrona ste metodo es PRIVADO, se ejecuta automatic
      en el constructor * aplica transformaciones (pos, escala, rotacion) y lo hace clickable */
    private async load(): Promise<void> {
        // private: solo se puede llamar desde dentro de TownHouse(lo llama el constructor)
        // async: dentro vamos a usar await(espera una promesa)
        // promise void: la func devuelve una promesa q no devuelve nada(solo termina o falla)

        // hacemos un try catch
        try {
            // ImportMeshAsync -> carga el archivo GLB de forma asincrona
            // cargamos 'polo.glb' (el modelo del edificio)
            const result = await SceneLoader.ImportMeshAsync(
                '',           // nombre del mesh ('' pa cargar todos)
                '/polo.glb',  // ruta y nombre del archivo
                '',           // path adicional (vacio)
                this.scene    // escena donde se carga
            );

            // Si el archivo cargo correctamente y tiene meshes
            if (result.meshes.length > 0) {
                // Filtramos pa encontrar el mesh REAL (no el root vacio)
                // algunos GLB tienen un __root__ vacio q solo agrupa los meshes
                // filter() -> filtra el array segun una condicion
                const realMeshes = result.meshes.filter(m => 
                    m.name !== "__root__" &&           // excluimos el root vacio
                    m.getClassName() === "Mesh"        // solo queremos objetos tipo Mesh
                );
                
                // Si encontramos meshes reales
                if (realMeshes.length > 0) {
                    // Usamos el primer mesh real y lo desparentamos
                    const realMesh = realMeshes[0] as Mesh;
                    realMesh.parent = null;  // lo desparentamos del root (queda independiente)
                    // esto es importante pa q las transformaciones se apliquen correctamente
                    this.mesh = realMesh;    // guardamos como mesh principal
                } else {
                    // Si no hay meshes reales, usamos el primero (probablemente el root)
                    this.mesh = result.meshes[0] as Mesh;
                }
                
                // Aplicamos transformaciones al mesh
                this.mesh.position = this.position.clone();   // posicionamos el edificio
                this.mesh.scaling = new Vector3(15, 15, 15); // escalamos 15x (el modelo es muy pequeño)
                
                // ROTACION DEL EDIFICIO - Diagonal (45 grados)
                // addRotation -> añade rotacion en espacio world
                // Math.PI / 2 -> 90 grados en radianes (rota pa q quede diagonal)
                this.mesh.addRotation(0, Math.PI / 2, 0);  // rotamos solo en eje Y

                // Hacemos el edificio clickeable
                // isPickable -> permite q el mesh sea detectado x el raycast de clicks
                this.mesh.isPickable = true;

                // Configuramos sombras en todos los meshes del modelo
                // forEach -> recorremos cada mesh uno x uno
                result.meshes.forEach(mesh => {
                    mesh.receiveShadows = true;  // permitimos q reciba sombras
                    
                    // Proyectar sombras
                    // si tenemos un shadowGenerator, añadimos este mesh como proyector
                    if (this.shadow) {
                        this.shadow.addShadowCaster(mesh);
                    }
                });
                //debug para ver cuantos elem carga babylon
                console.log('TownHouse cargado - meshes:', result.meshes.length);
            }
        } catch (error) {
            // Si algo falla durante la carga, mostramos el error
            console.error('Error cargando TownHouse:', error);
        }
    }

    /** Devuelve el mesh principal del edificio, util pa otros sist q necesiten referenciar el edificio
      returns Mesh del edificio o null si aun no cargo */
    public getMesh(): Mesh | null {
        return this.mesh;
    }

    /* Elimina el edificio de la escena y libera memoria, dispose -> borra el mesh de babylon */
    public dispose(): void {
        if (this.mesh) {
            this.mesh.dispose();  // eliminamos el mesh de la escena
        }
    }
}
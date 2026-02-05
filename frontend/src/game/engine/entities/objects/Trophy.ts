/**
 * Trophy modelo glb trofeo dorado 
 * Carga modelo GLB del trofeo, aplica transformaciones y lo hace clickable
 * Obj INTERACTIVO q navega a la seccion Trophy al clickear
 * Tiene material PBR metalico pa q brille como oro con HDRI
 * Puede ejecutar callback opcional al cargar (pa crear placas HoF)
 */

import { Scene, Vector3, Mesh, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders';  // importamos loaders de archivos 3D

// Clase molde pa crear el trofeo {obj interactivo con material dorado}
export class Trophy {
    private scene: Scene;                          // referencia a la escena de babylon donde aparece
    private mesh: Mesh | null = null;             // mesh principal del trofeo (el q clickeamos)
    private allMeshes: Mesh[] = [];               // array con todos los meshes del modelo(pa rotarlos)
    private shadow: ShadowGenerator | null = null;  // sist de sombras (puede ser null)
    public position: Vector3;                     // pos del trofeo en el mundo 3D
    public onClick: () => void;                   // callback q se ejecuta al hacer click (navegacion)
    private onLoadCallback?: () => void;          // callback opcional q se ejecuta al cargar(pa placas HoF)

    constructor(scene: Scene, position: Vector3, onClick: () => void, shadow: ShadowGenerator | null = null, onLoadCallback?: () => void) {
        this.scene = scene;                // guardamos la escena
        this.position = position.clone();  // clonamos la pos
        this.onClick = onClick;            // guardamos el callback de click
        this.shadow = shadow;              // guardamos el sist de sombras
        this.onLoadCallback = onLoadCallback;  // guardamos el callback de carga
        this.load();                       // iniciamos la carga del modelo
    }

    /** Carga el model GLB d Trophy d forma asincrona ste metodo es PRIVADO, se ejecuta automatic
      en el constructor * aplica transformaciones (pos, escala) y configura material PBR dorado */
    private async load(): Promise<void> {
        // private: solo se puede llamar desde dentro de Trophy(lo llama el constructor)
        // async: dentro vamos a usar await(espera una promesa)
        // promise void: la func devuelve una promesa q no devuelve nada(solo termina o falla)

        // hacemos un try catch
        try {
            // ImportMeshAsync -> carga el archivo GLB de forma asincrona
            // cargamos 'trphy.glb' (el modelo del trofeo)
            const result = await SceneLoader.ImportMeshAsync('', '/trphy.glb', '', this.scene);
            
            // Si el archivo cargo correctamente y tiene meshes
            if (result.meshes.length > 0) {
                // Usamos el root mesh pa posicion y escala inicialmente
                this.mesh = result.meshes[0] as Mesh;
                
                // Si no se encontro mesh, mostramos error y salimos
                if (!this.mesh) {
                    console.error('No se encontro mesh en Trophy');
                    return;
                }
                
                // Guardamos todos los meshes VISIBLES pa rotarlos despues
                // filter() -> filtra el array segun una condicion
                this.allMeshes = result.meshes.filter(m => 
                    m.name !== "__root__" &&           // excluimos el root vacio
                    m.getClassName() === "Mesh"        // solo queremos objetos tipo Mesh
                ) as Mesh[];
                
                // SOLUCION: desparentamos el mesh hijo y aplicamos transformacion directamente
                // esto evita problemas con las transformaciones bakeadas del GLB
                if (this.allMeshes.length > 0) {
                    const realMesh = this.allMeshes[0];  // obtenemos el primer mesh real
                    realMesh.parent = null;  // lo desparentamos del root (queda independiente)
                    // posicionamos el trofeo (y=0 pa q este en el suelo)
                    realMesh.position = new Vector3(this.position.x, 0, this.position.z);
                    realMesh.scaling = new Vector3(8, 8, 8);  // escalamos 8x (el modelo es muy pequeño)
                    realMesh.isPickable = true;  // lo hacemos clickeable
                    
                    // Usamos el mesh real como this.mesh (no el root)
                    this.mesh = realMesh;
                }
                
                // Hacemos visibles todos los meshes del modelo
                result.meshes.forEach(m => m.isVisible = true);
                //debug para ver cuantos elem carga babylon
                console.log('Trophy root:', this.mesh.name);
                console.log('Trophy meshes hijos:', this.allMeshes.length);
                
                // DEBUG COMPLETO DE LA ESTRUCTURA DEL GLB
                // esto nos ayuda a entender como esta organizado el modelo
                console.log('ESTRUCTURA COMPLETA DEL GLB:');
                result.meshes.forEach((m, i) => {
                    // Mostramos info detallada de cada mesh
                    console.log(`  [${i}] "${m.name}"`);
                    console.log(`      class: ${m.getClassName()}`);
                    console.log(`      parent: ${m.parent ? m.parent.name : 'null'}`);
                    console.log(`      isVisible: ${m.isVisible}`);
                    console.log(`      position: ${m.position.toString()}`);
                    console.log(`      rotation: ${m.rotation.toString()}`);
                    console.log(`      scaling: ${m.scaling.toString()}`);
                });

                // Configuramos sombras y material PBR pa oro brillante
                // forEach -> recorremos cada mesh uno x uno
                result.meshes.forEach(mesh => {
                    mesh.receiveShadows = true;  // permitimos q reciba sombras
                    
                    // Proyectamos sombras
                    // si tenemos un shadowGenerator, añadimos este mesh como proyector
                    if (this.shadow) {
                        this.shadow.addShadowCaster(mesh);
                    }
                    
                    // Ajustamos material PBR pa oro con HDRI
                    // algunos modelos GLB traen materiales PBR (physically based rendering)
                    // comprobamos si el material tiene propiedades metalicas
                    if (mesh.material && (mesh.material as any).metallic !== undefined) {
                        const mat = mesh.material as any;  // casteamos a any pa acceder a propiedades
                        mat.metallic = 1;           // 100% metalico (brilla como metal)
                        mat.roughness = 0.15;       // poco rugoso (casi como espejo)
                        mat.environmentIntensity = 1.5;  // intensidad del reflejo del entorno (HDRI)
                        // esto hace q el trofeo brille como oro real
                    }
                });

                console.log('Trophy loaded successfully - real mesh found');
                
                // Ejecutamos callback si existe (pa crear placas HoF)
                // este callback se usa pa crear el circulo y placa alrededor del trofeo
                if (this.onLoadCallback) {
                    this.onLoadCallback();
                }
            }
        } catch (error) {
            // Si algo falla durante la carga, mostramos el error
            console.error('Error loading Trophy GLB:', error);
        }
    }

    /** Devuelve el mesh principal del trofeo, util pa otros sist q necesiten referenciar el trofeo
      returns Mesh del trofeo o null si aun no cargo */
    public getMesh(): Mesh | null {
        return this.mesh;
    }

    /* Rota el trofeo en el eje Y (horizontal)
      usa addRotation pa rotar en espacio world (funciona con transforms bakeados) */
    public rotate(angle: number): void {
        // addRotation -> añade rotacion en espacio world
        // esto funciona mejor con modelos GLB q tienen transformaciones bakeadas
        if (this.mesh) {
            this.mesh.addRotation(0, angle, 0);  // rotamos solo en eje Y
        }
    }

    /* Elimina el trofeo de la escena y libera memoria, dispose -> borra el mesh y todos sus descendientes */
    public dispose(): void {
        if (this.mesh) {
            // dispose(doNotRecurse, disposeMaterialAndTextures)
            // false -> SI recursar (borrar hijos tambien)
            // true -> borrar materiales y texturas
            this.mesh.dispose(false, true);
        }
    }
}
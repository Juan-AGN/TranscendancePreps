/**
 * TorreMonica modelo glb torre malaga
 * Carga modelo GLB, aplica transformaciones y configura sombras
 * Es un obj decorativo visual pa el escenario
 */

import { Scene, Mesh, Vector3, TransformNode, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB

// Clase molde pa crear la torre monica en el escenario {obj decorativo icono malaga}
export class TorreMonica {
    private scene: Scene;                                  // referencia a la escena de babylon donde aparece
    private root: TransformNode | null = null;            // nodo raiz del modelo GLB (nodo padre)
    private meshes: Mesh[] = [];                          // array con todos los meshes del modelo(sombras,acciones etc..)
    private shadowGenerator: ShadowGenerator | null;      // sist de sombras (puede ser null)
    private readonly targetPosition: Vector3;             // pos objetivo de la torre
    private readonly targetScale: Vector3;                // escala objetivo

    constructor(scene: Scene, position: Vector3, scale = 1, shadowGenerator: ShadowGenerator | null = null) {
        this.scene = scene;                                      // guardamos la escena
        this.targetPosition = position.clone();                  // clonamos la pos
        this.targetScale = new Vector3(scale, scale, scale);    // creamos vector de escala uniforme
        this.shadowGenerator = shadowGenerator;                  // guardamos el sist de sombras
        this.load();                                             // iniciamos la carga del modelo
    }

    /** Carga el model GLB d TorreMonica d forma asincrona ste metodo es PRIVADO, se ejecuta automatic
      en el constructor * aplica transformaciones (pos, escala) y configura sombras */
    private async load(): Promise<void> {
        // private: solo se puede llamar desde dentro de TorreMonica(lo llama el constructor)
        // async: dentro vamos a usar await(espera una promesa)
        // promise void: la func devuelve una promesa q no devuelve nada(solo termina o falla)

        // hacemos un try catch
        try {
            // ImportMeshAsync -> carga el archivo GLB de forma asincrona
            const result = await SceneLoader.ImportMeshAsync('', '/TorreMonica.glb', '', this.scene);
            
            // Si no se cargo ningun mesh, mostramos warning y salimos
            if (result.meshes.length === 0) {
                console.warn('TorreMonica: no se cargaron meshes');
                return;
            }
            //debug para ver cuantos elem carga babylon
            console.log(`TorreMonica: ${result.meshes.length} meshes totales`);

            // Usamos el root mesh del modelo (el primer mesh es siempre el raiz)
            const rootMesh = result.meshes[0];
            this.root = rootMesh as any;  // guardamos como TransformNode

            // Posicionar y escalar el ROOT (esto afecta a todos sus hijos)
            rootMesh.position = this.targetPosition.clone();  // aplicamos la pos
            rootMesh.scaling = this.targetScale.clone();      // aplicamos la escala
            rootMesh.rotation.y = 0;                          // rotacion en 0 (sin rotar)
            rootMesh.isVisible = true;                        // lo hacemos visible

            console.log('Root posicionado:', rootMesh.position.toString());
            console.log('Root escalado:', rootMesh.scaling.toString());

            // Hacer visibles todos los meshes y configurar sombras
            // forEach -> recorremos cada mesh del modelo uno x uno
            result.meshes.forEach((mesh, i) => {
                mesh.isVisible = true;    // hacemos visible el mesh
                mesh.isPickable = true;   // permitimos q sea clickable
                
                // Si el mesh es de tipo Mesh (no TransformNode) y no es el root
                if (mesh instanceof Mesh && mesh.name !== '__root__') {
                    this.meshes.push(mesh);  // lo añadimos al array de meshes
                    mesh.receiveShadows = true;  // permitimos q reciba sombras
                    
                    // Si tiene material, desactivamos backFaceCulling
                    // esto hace q el mesh se vea x ambos lados (evita q desaparezca)
                    if (mesh.material) {
                        mesh.material.backFaceCulling = false;
                    }
                    
                    // Añadimos el mesh como proyector de sombras
                    // el ? es optional chaining (solo ejecuta si shadowGenerator existe)
                    this.shadowGenerator?.addShadowCaster(mesh);
                }
                //debug detallado de cada mesh
                console.log(`  ${i}: ${mesh.name} - visible: ${mesh.isVisible}`);
            });

            console.log(`TorreMonica: ${this.meshes.length} meshes configurados`);
        } catch (error) {
            // Si algo falla durante la carga, mostramos el error
            console.error('TorreMonica error:', error);
        }
    }

    /** Devuelve todos los meshes del modelo, util pa aplicar efectos o sombras a todas las partes
      returns array con todos los meshes*/
    public getMeshes(): Mesh[] {
        return this.meshes;
    }

    /** Devuelve el nodo raiz del modelo,returns TransformNode raiz o null si no cargo */
    public getRoot(): TransformNode | null {
        return this.root;
    }
}
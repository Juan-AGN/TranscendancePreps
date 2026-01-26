/**
 * PingPongTable modelo glb mesa de pingpong
 * Carga modelo GLB, aplica transformaciones y configura sombras
 * Es un obj decorativo visual con rotacion continua animada
 */

import { Scene, Mesh, Vector3, TransformNode, SceneLoader, ShadowGenerator } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB

// Clase molde pa crear la mesa de pingpong en el escenario {obj decorativo con animacion}
export class PingPongTable {
    private scene: Scene;                                  // referencia a la escena de babylon donde aparece
    private root: TransformNode | null = null;            // nodo raiz del modelo GLB (nodo padre)
    private rootMesh: any = null;                         // mesh root pa la animacion de rotacion
    private meshes: Mesh[] = [];                          // array con todos los meshes del modelo(sombras,acciones etc..)
    private shadowGenerator: ShadowGenerator | null;      // sist de sombras (puede ser null)
    private readonly targetPosition: Vector3;             // pos objetivo de la mesa
    private readonly targetScale: Vector3;                // escala objetivo
    private loadPromise: Promise<void>;                   // promesa de carga pa esperar

    constructor(scene: Scene, position: Vector3, scale = 0.45, shadowGenerator: ShadowGenerator | null = null) {
        this.scene = scene;                                      // guardamos la escena
        this.targetPosition = position.clone();                  // clonamos la pos
        this.targetScale = new Vector3(scale, scale, scale);    // creamos vector de escala uniforme
        this.shadowGenerator = shadowGenerator;                  // guardamos el sist de sombras
        this.loadPromise = this.load();                         // iniciamos la carga del modelo
    }

    /** Devuelve la promesa de carga, otros sist pueden esperar a esta promesa pa saber cuando esta listo */
    public ready(): Promise<void> {
        return this.loadPromise;
    }

    /** Carga el model GLB d PingPongTable d forma asincrona ste metodo es PRIVADO, se ejecuta automatic
      en el constructor * aplica transformaciones (pos, escala, rotacion) configura sombras y animacion */
    private async load(): Promise<void> {
        // private: solo se puede llamar desde dentro de PingPongTable(lo llama el constructor)
        // async: dentro vamos a usar await(espera una promesa)
        // promise void: la func devuelve una promesa q no devuelve nada(solo termina o falla)

        // hacemos un try catch
        try {
            // ImportMeshAsync -> carga el archivo GLB de forma asincrona
            const result = await SceneLoader.ImportMeshAsync('', '/table1.glb', '', this.scene);
            
            // Si no se cargo ningun mesh, mostramos warning y salimos
            if (result.meshes.length === 0) {
                console.warn('PingPongTable: no se cargaron meshes');
                return;
            }
            //debug para ver cuantos elem carga babylon
            console.log(`PingPongTable: ${result.meshes.length} meshes totales`);

            // Usamos el root mesh del modelo (el primer mesh es siempre el raiz)
            this.rootMesh = result.meshes[0];
            this.root = this.rootMesh as any;  // guardamos como TransformNode

            // Posicionar y escalar el ROOT primero
            this.rootMesh.position = this.targetPosition.clone();  // aplicamos la pos
            this.rootMesh.scaling = this.targetScale.clone();      // aplicamos la escala
            this.rootMesh.rotation.y = Math.PI / 4; // Rotamos 45 grados (diagonal)
            this.rootMesh.isVisible = true;                        // lo hacemos visible

            console.log('Root posicionado:', this.rootMesh.position.toString());
            console.log('Root escalado:', this.rootMesh.scaling.toString());

            // Hacer visibles TODOS los meshes y configurar sombras
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
                console.log(`  ${i}: ${mesh.name} - visible: ${mesh.isVisible}, pos: ${mesh.position.toString()}`);
            });

            console.log(`PingPongTable: ${this.meshes.length} meshes configurados`);
            console.log('Iniciando rotacion...');
            
            // Rotacion continua usando addRotation
            // esto hace q la mesa gire constantemente en el eje Y
            const rotationSpeed = 0.01;  // velocidad de rotacion (radianes x frame)
            // onBeforeRenderObservable -> observable q se ejecuta antes de cada render
            this.scene.onBeforeRenderObservable.add(() => {
                // si el rootMesh existe y tiene rotacion
                if (this.rootMesh && this.rootMesh.rotation) {
                    // addRotation -> añade rotacion incremental
                    this.rootMesh.addRotation(0, rotationSpeed, 0);  // solo rota en Y
                }
            });
        } catch (error) {
            // Si algo falla durante la carga, mostramos el error
            console.error('PingPongTable error:', error);
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
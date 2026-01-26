/**
 * Computer modelo glb ordenador gaming
 * Modelo optimizado con Draco (23MB → 1.5MB)
 * Posicionado entre trofeo y mesa de ping pong
 * Tiene material PBR pa pantalla emisiva y metal reflectante
 */

import { Scene, SceneLoader, Vector3, Color3, PBRMaterial } from "@babylonjs/core";
import "@babylonjs/loaders";  // importamos loaders de archivos 3D

// Clase molde pa crear el ordenador en el escenario {obj decorativo con material PBR}
export class Computer {
    private scene: Scene;  // referencia a la escena de babylon donde aparece

    constructor(
        scene: Scene,
        position: Vector3 = new Vector3(0, 0, 0),
        scale: number = 2,
        shadowGenerator?: any
    ) {
        this.scene = scene;  // guardamos la escena
        this.loadModel(position, scale, shadowGenerator);  // iniciamos la carga del modelo
    }

    /** Carga el model GLB d Computer d forma asincrona ste metodo es PRIVADO
      * aplica transformaciones (pos, escala, rotacion) y configura materiales PBR mejorados */
    private async loadModel(
        position: Vector3,
        scale: number,
        shadowGenerator?: any
    ): Promise<void> {
        // private: solo se puede llamar desde dentro de Computer(lo llama el constructor)
        // async: dentro vamos a usar await(espera una promesa)
        // promise void: la func devuelve una promesa q no devuelve nada(solo termina o falla)

        // hacemos un try catch
        try {
            // ImportMeshAsync -> carga el archivo GLB de forma asincrona
            const result = await SceneLoader.ImportMeshAsync(
                "",           // nombre del mesh ('' pa cargar todos)
                "/",          // ruta base
                "pc.glb",     // nombre del archivo
                this.scene    // escena donde se carga
            );

            const rootMesh = result.meshes[0];
            if (!rootMesh) {
                console.error("Computer: no se encontro mesh root");
                return;
            }

            // Posicion y escala (flip en X pa corregir mirror)
            rootMesh.position = position;
            rootMesh.scaling = new Vector3(-scale, scale, scale); // -X invierte horizontalmente
            
            // Rotacion inicial usando addRotation pa modelos con transforms baked
            rootMesh.addRotation(0, Math.PI / 3.2, 0); // rotacion pa q las letras esten al frente

            // Configurar materiales y sombras mejorados
            // forEach -> recorremos cada mesh uno x uno
            result.meshes.forEach((mesh, index) => {
                if (index === 0) return; // Skip root (saltamos el root)

                // Sombras
                if (shadowGenerator && mesh.getTotalVertices() > 0) {
                    shadowGenerator.addShadowCaster(mesh);  // proyectar sombras
                }
                mesh.receiveShadows = true;  // recibir sombras

                // Mejorar materiales PBR pa mejor visualizacion
                // comprobamos si el material es PBR (physically based rendering)
                if (mesh.material && mesh.material instanceof PBRMaterial) {
                    const mat = mesh.material as PBRMaterial;
                    
                    // Ajustamos propiedades segun el tipo de superficie
                    if (mesh.name.toLowerCase().includes('screen') || 
                        mesh.name.toLowerCase().includes('display')) {
                        // Pantalla: mas emisiva y menos rugosa (brilla)
                        mat.metallic = 0.1;
                        mat.roughness = 0.2;
                        mat.emissiveColor = new Color3(0.1, 0.15, 0.2); // Glow azulado
                    } else if (mesh.name.toLowerCase().includes('metal') || 
                               mesh.name.toLowerCase().includes('frame')) {
                        // Marco metalico: mas reflectante
                        mat.metallic = 0.8;
                        mat.roughness = 0.3;
                    } else {
                        // Plastico/carcasa: menos reflectante
                        mat.metallic = 0.1;
                        mat.roughness = 0.5;
                    }
                    
                    // Mejoramos respuesta al HDRI (entorno)
                    mat.environmentIntensity = 1.2;
                    mat.directIntensity = 1.0;
                }
            });
            //debug para ver cuantos elem carga babylon
            console.log(`Computer cargado - meshes: ${result.meshes.length - 1}`);
        } catch (error) {
            // Si algo falla durante la carga, mostramos el error
            console.error("Error cargando pc.glb:", error);
        }
    }

    /* Rotacion opcional (si quieres animarlo), registra animacion continua en el render loop */
    public addRotation(mesh: any, speed: number = 0.005): void {
        // registerBeforeRender -> registra func q se ejecuta cada frame
        this.scene.registerBeforeRender(() => {
            mesh.rotation.y += speed;  // incrementamos rotacion Y cada frame
        });
    }
}

// Este archivo gestiona el entorno basico de la escena:
// suelo, materiales y entorno HDR para reflejos e iluminacion global

import { Scene, MeshBuilder, StandardMaterial, Color3, CubeTexture } from '@babylonjs/core';
// MeshBuilder... crea geometria basica (suelo, cajas, etc)
// StandardMaterial... material clasico de Babylon
// Color3... color RGB sin alpha
// CubeTexture... textura en cubo (HDRI / environment)

// exportamos la clase para centralizar entorno (suelo + entorno HDR)
export class EnvironmentSetup {
    private scene: Scene;          // Guarda la scena donde se aplicara el entorno

    constructor(scene: Scene) {
        this.scene = scene;
    }
    // EnvironmentSetup no crea la Scene, la recibe ya creada
    // Asi el hub y el juego pueden tener entornos distintos si hace falta
    // mantiene el codigo modular y sin dependencias globales

    public setupGround(): void {
        // Creamos el suelo base del hub/juego
        // Es grande para que no se vea el limite al moverse por el entorno
        const ground = MeshBuilder.CreateGround(
            'ground',                      // nombre interno
            { width: 200, height: 200 },   // tamaño amplio del suelo
            this.scene                     // escena donde se crea
        );

        // Material del suelo
        // Color casi blanco para reflejar bien la luz y el HDRI
        const groundMat = new StandardMaterial(
            'groundMat',                   // nombre del material
            this.scene
        );
        groundMat.diffuseColor = new Color3(0.98, 0.98, 0.98); 
        // color base del suelo (blanco suave)
        groundMat.specularColor = new Color3(0.05, 0.05, 0.05); 
        // poco brillo para que no parezca plastico
        groundMat.specularPower = 10;      
        // controla como de concentrado es el brillo

        ground.material = groundMat;       
        // asignamos el material al suelo
        ground.receiveShadows = true;      
        // el suelo recibe las sombras de los modelos GLB
    }

    public setupHDRI(): void {
        // HDRI para iluminacion global y reflejos
        // NO se usa skybox para mejorar rendimiento
        const hdrTexture = CubeTexture.CreateFromPrefilteredData(
            '/environment/environment.dds', // archivo HDRI optimizado
            this.scene
        );

        this.scene.environmentTexture = hdrTexture; 
        // asignamos el HDRI a la escena
        this.scene.environmentIntensity = 0.6;      
        // intensidad moderada para no sobreiluminar

        // NO crear skybox para mejor rendimiento
        // menos draw calls y mas FPS en el hub
    }
}

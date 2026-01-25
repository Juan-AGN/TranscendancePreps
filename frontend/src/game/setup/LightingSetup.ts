// Gestiona la iluminacion de la escena (ambiental y direccional)
// Centraliza la creacion de luces y sombras para todo el Hub
// Evita duplicar configuraciones de iluminacion en otros archivos

import { Scene, HemisphericLight, DirectionalLight, ShadowGenerator, Vector3, Color3 } from '@babylonjs/core';
// Hemis... simila la luz del cielo
// Directional... proyecta sombras(da realismo)
// Shadow... sistema q Calcula sombras
// Vector3 Vec matematico para babilon // Color3 color RGB sin alpha


//exportamos para hacer la clase (centralizar la ilum)
export class LightingSetup {
    private scene : Scene;                               	//Guarda la scena dnde se aplicaran luces
    public shadowGenerator : ShadowGenerator | null = null;	
	// publica pq que otros objs necesitan acc a ella | null pq puede estar empty al principio

	constructor(scene: Scene) {
		this.scene = scene;
	}
	// LightingSetup no crea la Scene: la recibe ya creada. Ej: el hub y el juego pueden tener escenas distintas pero misma iluminación.
	// Esto mantiene el code modular y evita errores por escenas globales.
	// guaradamos la scena dentro de este objeto

	public setupLights(): void {
		// Simula la luz del cielo y evita zonas completamente negras
    	// Se usa como base para que los modelos GLB no se vean planos
		const ambientLight = new HemisphericLight(
			'ambient',					// name interno de la luz
			new Vector3(0, 1, 0),		// direccion dsde arriba
			this.scene					// escena donde se aplica
		);
        ambientLight.intensity = 0.4;	// intensidad suave para no quemar colores
        ambientLight.groundColor = new Color3(0.9, 0.9, 0.9);
		// color de rebote del suelo, hace sombras mas realistas

        // Luz direccional (the sun) // Es la luz principal del hub/juego y la que genera sombras
        const directionalLight = new DirectionalLight(
			'sun',
			new Vector3(-1, -2, -1),
			this.scene
		);
        directionalLight.position = new Vector3(20, 40, 20); // posicion usada para calcular correctamente las sombras
        directionalLight.intensity = 0.8; 					// mas fuerte que la ambiental para marcar volumen

        // Generador de sombras
        this.shadowGenerator = new ShadowGenerator(
			512,											// resolucion del mapa de sombras (equilibrio calidad/rendimiento)
			directionalLight								// luz que genera las sombras
		); 
        this.shadowGenerator.useBlurExponentialShadowMap = true;	// suaviza los bordes de las sombras (menos pixelado)			
        this.shadowGenerator.blurKernel = 16;						// nivel de desenfoque de la sombra (mas alto = mas suave)											
        this.shadowGenerator.darkness = 0.4;						// intensidad de la sombra, evita sombras demasiado negras
    }

    public getShadowGenerator(): ShadowGenerator | null {
		// Devuelve el ShadowGenerator creado en setupLights
    	// otros sistemas (carga de modelos, suelo, props) lo usan para asignar sombras
    	// puede ser null si las luces aun no se han inicializado
        return this.shadowGenerator;
    }
	//Este getter expone el ShadowGenerator d forma controlada
	// pra q otros sistemas puedan asignar sombras a los meshes una vez cargados,
	// sin acoplar la logica de ilum con la de carga de modelos.
}



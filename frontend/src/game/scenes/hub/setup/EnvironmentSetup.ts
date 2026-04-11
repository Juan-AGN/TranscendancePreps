// EnviormenSetupEste archivo gestiona el entorno basico de la escena:
// suelo, materiales y entorno HDR para reflejos e iluminacion global

import { Scene, MeshBuilder, StandardMaterial, Color3, CubeTexture } from '@babylonjs/core';
import { ENVIRONMENT_CONFIG } from '../../../config/EnvironmentConfig';
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
			'ground',
			{ width: ENVIRONMENT_CONFIG.ground.size, height: ENVIRONMENT_CONFIG.ground.size },
			this.scene
		);

		const groundMat = new StandardMaterial(
			'groundMat',
			this.scene
		);
		groundMat.diffuseColor = new Color3(...ENVIRONMENT_CONFIG.ground.baseColor);
		groundMat.specularColor = new Color3(...ENVIRONMENT_CONFIG.ground.reflectionColor);
		groundMat.specularPower = ENVIRONMENT_CONFIG.ground.reflectionSharpness;

		ground.material = groundMat;
		// asignamos el material al suelo
		ground.receiveShadows = true;
		// el suelo recibe las sombras de los modelos GLB
	}

	public setupHDRI(): void {
		// HDRI pa iluminacion global y reflejos (formato .env compatible con Babylon)
		const hdrTexture = CubeTexture.CreateFromPrefilteredData(
			ENVIRONMENT_CONFIG.hdri.texturePath,
			this.scene
		);
		this.scene.environmentTexture = hdrTexture;
		this.scene.environmentIntensity = ENVIRONMENT_CONFIG.hdri.lightIntensity;
	}
}

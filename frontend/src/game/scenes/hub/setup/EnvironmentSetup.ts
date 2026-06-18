// ┌────────────────────────────────────────────────────────────┐
// │               EnvironmentSetup.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Configures core scene environment resources.              │
// │ Creates ground/material and HDR environment lighting.     │
// │ Centralizes visual setup for reflections and ambience.    │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import environment dependencies

import { Scene, MeshBuilder, StandardMaterial, Color3, CubeTexture } from '@babylonjs/core';
import { ENVIRONMENT_CONFIG } from '../../../config/EnvironmentConfig';
// MeshBuilder creates basic geometry (ground, boxes, etc.)
// StandardMaterial is Babylon's classic material
// Color3 is RGB color without alpha
// CubeTexture is cubemap texture (HDRI / environment)

// STEP 2: Define environment setup class
export class EnvironmentSetup {
	private scene: Scene;          // Scene where environment is applied

	// STEP 3: Receive scene dependency
	constructor(scene: Scene) {
		this.scene = scene;
	}
	// EnvironmentSetup does not create the scene; it receives it
	// This allows hub/game scenes to share logic with different instances
	// Keeps code modular and avoids global dependencies

	// STEP 4: Create and configure scene ground
	public setupGround(): void {
		// Create the base ground for hub/game
		// Large enough so scene borders are not visible during movement
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
		// Assign material to ground
		ground.receiveShadows = true;
		// Ground receives shadows cast by GLB models
	}

	// STEP 5: Configure HDR environment texture and intensity
	public setupHDRI(): void {
		// HDRI for global lighting and reflections (.env format for Babylon)
		const hdrTexture = CubeTexture.CreateFromPrefilteredData(
			ENVIRONMENT_CONFIG.hdri.texturePath,
			this.scene
		);
		this.scene.environmentTexture = hdrTexture;
		this.scene.environmentIntensity = ENVIRONMENT_CONFIG.hdri.lightIntensity;
	}
}

// ===== MINI DICTIONARY =====
// HDRI -> High Dynamic Range environment image for realistic lighting
// cubemap -> texture projected on six faces around scene
// specular -> reflective light response on a material
// environment intensity -> multiplier for environment lighting strength

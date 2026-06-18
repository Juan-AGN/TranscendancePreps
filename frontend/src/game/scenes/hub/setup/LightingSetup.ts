// ┌────────────────────────────────────────────────────────────┐
// │                LightingSetup.ts                            │
// ├────────────────────────────────────────────────────────────┤
// │ Configures scene lighting (ambient + directional).        │
// │ Centralizes light and shadow creation for the Hub.        │
// │ Avoids duplicated lighting configuration in other files.  │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import Babylon lighting dependencies

import { Scene, HemisphericLight, DirectionalLight, ShadowGenerator, Vector3, Color3 } from '@babylonjs/core';
// HemisphericLight simulates sky/ambient light
// DirectionalLight projects main scene shadows
// ShadowGenerator computes dynamic shadow maps
// Vector3 is Babylon's 3D vector type; Color3 is RGB without alpha


// STEP 2: Define lighting setup class
export class LightingSetup {
    private scene : Scene;                               	// Scene where lights will be applied
    public shadowGenerator : ShadowGenerator | null = null;	
	// Public because other systems need access; null before initialization

	// STEP 3: Receive scene dependency
	constructor(scene: Scene) {
		this.scene = scene;
	}
	// LightingSetup does not create the scene; it receives an existing one.
	// This keeps code modular and avoids global-scene coupling issues.

	// STEP 4: Create ambient + directional lights and shadow generator
	public setupLights(): void {
		// Simulate sky light and avoid fully black areas
    	// Serves as base lighting so GLB models do not look flat
		const ambientLight = new HemisphericLight(
			'ambient',					// Internal light name
			new Vector3(0, 1, 0),		// Light direction from above
			this.scene					// Target scene
		);
        ambientLight.intensity = 0.5;	// Medium intensity with HDRI enabled
        ambientLight.groundColor = new Color3(0.9, 0.9, 0.9);
		// Ground bounce tint for more natural shadow response

        // Main directional light (sun-like) for volume and shadow casting
        const directionalLight = new DirectionalLight(
			'sun',
			new Vector3(-1, -2, -1),
			this.scene
		);
        directionalLight.position = new Vector3(20, 40, 20); // Position used for shadow projection
        directionalLight.intensity = 0.9;					// Stronger than ambient to define shape volume

        // Create shadow generator
        this.shadowGenerator = new ShadowGenerator(
			512,											// Shadow map resolution (quality/performance balance)
			directionalLight								// Light source producing shadows
		); 
        this.shadowGenerator.useBlurExponentialShadowMap = true;	// Smooth shadow edges (less pixelation)			
        this.shadowGenerator.blurKernel = 16;						// Shadow blur amount (higher = softer)
        this.shadowGenerator.darkness = 0.4;						// Shadow darkness, avoids overly black shadows
    }

    // STEP 5: Expose shadow generator for external systems
    public getShadowGenerator(): ShadowGenerator | null {
		// Returns ShadowGenerator created in setupLights
    	// Other systems (model loading, props, ground) use this to register casters/receivers
    	// Can be null if lighting was not initialized yet
        return this.shadowGenerator;
    }
	// This getter exposes ShadowGenerator in a controlled way
	// so other systems can assign shadows after meshes load,
	// without coupling lighting setup to model loading logic.
}

// ===== MINI DICTIONARY =====
// ambient light -> global base light filling dark areas
// directional light -> parallel light rays, sun-like source
// shadow map -> texture used to determine shadowed pixels
// blur kernel -> softness factor for shadow edges



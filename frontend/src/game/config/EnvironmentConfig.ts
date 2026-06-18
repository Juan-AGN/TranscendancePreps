// ┌────────────────────────────────────────────────────────────┐
// │                 EnvironmentConfig.ts                       │
// ├────────────────────────────────────────────────────────────┤
// │ Defines base environment settings for the 3D Hub scene.    │
// │ Controls ground size, ground material and HDRI lighting.   │
// │ It does NOT create meshes or apply materials directly.     │
// └────────────────────────────────────────────────────────────┘
// STEP 1: Define the base visual environment for the 3D world.
// These values are consumed later by the environment setup files.
export const ENVIRONMENT_CONFIG = {
	// STEP 2: Define ground material and size settings.
	ground: {
		size: 200,										// Ground width and height in scene units.
		baseColor: [0.98, 0.98, 0.98] as [number, number, number],
		reflectionColor: [0.05, 0.05, 0.05] as [number, number, number],
		reflectionSharpness: 10, 
	},
	// STEP 3: Define HDRI environment lighting settings.
	hdri: {
		texturePath: '/environment/studio.env', 			// Environment texture used for global lighting and reflections.
		lightIntensity: 0.8, 
	},

} as const;
// STEP 4: Small terminology notes.
// HDRI: environment texture used to provide realistic lighting and reflections.
// sharpness: how defined or blurred a reflection appears.
// intensity: strength of the emitted or reflected light.
// RGB: red, green and blue color components.
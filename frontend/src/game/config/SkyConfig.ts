// ┌────────────────────────────────────────────────────────────┐
// │                     SkyConfig.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Defines the visual gradient settings for the 3D Hub skybox.│
// │ Controls skybox size, top/middle/bottom colors and zones.  │
// │ It does NOT create the skybox mesh or material directly.   │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Define skybox gradient settings.
// These values are consumed by the sky setup system.
export const SKY_CONFIG = {
	skybox: {
		size: 500,

		// STEP 2: Define the upper sky color.
		// This is the color at the top of the sky, also called the zenith.
		topColor: [0.0, 0.10, 0.35] as [number, number, number],

		// STEP 3: Define the horizon color.
		// This is the color around eye level, between the top and bottom colors.
		middleColor: [0.4, 0.7, 1.0] as [number, number, number],

		// STEP 4: Define the lower sky color.
		// This creates a bright transition near the ground.
		bottomColor: [1.0, 1.0, 1.0] as [number, number, number],

		// STEP 5: Define gradient transition zones.
		// whiteZoneEnd controls where the bright lower area starts fading.
		// bottomEnd controls the lower gradient boundary.
		whiteZoneEnd: 0.50,
		bottomEnd: 0.60,
	},
};
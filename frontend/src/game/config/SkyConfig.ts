export const SKY_CONFIG = {
	skybox: {
		size: 500,

		// topColor: color at the top of the sky (zenith). Darker blue gives a deeper sky.
		topColor: [0.0, 0.10, 0.35] as [number, number, number],
		// middleColor: color at the horizon. This is the color you see at eye level, usually a light blue or white for a bright horizon.
		middleColor: [0.4, 0.7, 1.0] as [number, number, number],
		// bottomColor: color at the bottom of the skybox (near the ground). White gives a bright effect near the ground.
		bottomColor: [1.0, 1.0, 1.0] as [number, number, number],

		whiteZoneEnd: 0.50,
		bottomEnd: 0.60,

	},
};
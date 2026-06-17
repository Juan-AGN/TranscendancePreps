// ┌────────────────────────────────────────────────────────────┐
// │                    CameraConfig.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Defines base camera limits, initial position and dynamics. │
// │ Controls zoom range, vertical angles, follow and wheel use.│
// │ It does NOT move the camera directly or read user input.   │
// └────────────────────────────────────────────────────────────┘
// STEP 1: Define static camera limits and initial position.
// These values describe how the camera starts and the safe limits it must respect.
export const CAMERA_CONFIG = {
	minZoomDistance: 15,						// Minimum zoom distance from the player.
	maxZoomDistance: 80, 						// Maximum zoom distance from the player.

	minVerticalAngle: Math.PI / 6,				// Lowest vertical angle allowed.
	maxVerticalAngle: Math.PI / 2.1,			// Highest vertical angle allowed.

	initialHorizontalAngle: -Math.PI / 2, 		// Initial horizontal camera direction.
	initialVerticalAngle: Math.PI / 3,  		// Initial vertical camera inclination.
	initialDistance: 35,               			// Initial distance from the player.
} as const;

// STEP 2: Define runtime camera behavior.
// These values are used by the camera controller while the scene is running.
export const CAMERA_DYNAMICS = {
	// STEP 3: Manual keyboard rotation speeds.
	horizontalSpeed: 0.03,						// Left/right camera rotation speed.
	verticalSpeed: 0.03,   						// Up/down camera rotation speed.
	// STEP 4: Dynamic zoom behavior.
	// The camera can adapt its distance depending on nearby obstacles or free space.
	zoom: {
		defaultDistance: 35,   					// Normal distance when no special condition is active.
		closeDistance: 30,    					// Distance used when the camera needs to move closer. 
		farDistance: 40, 						// Distance used when there is enough space behind the player.
		zoomInDistance: 15,						// Distance threshold for stronger zoom-in behavior.
		zoomMinDistance: 25, 					// Intermediate distance used to smooth transitions.
		zoomOutDistance: 30, 					// Distance threshold for zoom-out behavior.
		zoomSmoothness: 0.05,					// Smoothness used when changing zoom distance.
	},

	// STEP 5: Mouse wheel zoom behavior.
	// Manual wheel input temporarily overrides automatic zoom behavior.
	wheel: {
		zoomSpeed: 2,       
		wheelSensitivity: 0.01, 
		autoResumeDelayMs: 2500, 
		autoReturnSmoothness: 0.02,
		minDistance: 15,    
		maxDistance: 80,
	},
} as const;
// STEP 7: Small terminology notes.
// lerp: smooth interpolation between two values.
// deltaY: wheel event value that represents scroll direction and intensity.
// as const: tells TypeScript these config values are readonly literal values.
// ┌────────────────────────────────────────────────────────────┐
// │            CameraController.ts                             │
// ├────────────────────────────────────────────────────────────┤
// │ Manages camera behavior (rotation, follow, zoom, input).   │
// │ Handles all runtime camera logic (not configuration).      │
// │ Uses ArcRotateCamera for third-person orbital view.        │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import Babylon.js camera and core tools
// ArcRotateCamera = orbital camera for third-person view
// Scene = the "universe" container where all meshes, lights, textures, and cameras exist
// Vector3 = 3D position/direction calculations
import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";
import { CAMERA_CONFIG, CAMERA_DYNAMICS } from "../config/CameraConfig";

// Scene explanation:
// The "Universe" of the game. Comes from Babylon.js (@babylonjs/core).
// It's a container object (like a giant struct).
// Contains: Arrays of all active meshes, lights, textures, and cameras.
// Reason: Camera must "register" in these arrays to exist and be rendered.

// STEP 2: Define camera controller class
export class CameraController {
	private camera: ArcRotateCamera;
	private scene: Scene;
	// private = only functions in this class {} can modify these variables
	// Protects the graphics engine from external interference

	// STEP 3: Constructor - initialization method
	// Executed automatically each time: new CameraController()
	constructor(scene: Scene, targetPosition: Vector3 = Vector3.Zero()) {
		// Pass what the class needs via parameters
		// If no position given, default to origin (0, 0, 0)
		this.scene = scene;
		// Link the received scene to our class property for global use

		// STEP 4: Create and store camera reference
		// Orbital camera: rotates around a central point
		// If we didn't assign to 'this.camera', it would be created but lost (scope)
		this.camera = new ArcRotateCamera(
			`camera`,                      // Internal camera name
			CAMERA_CONFIG.initialHorizontalAngle,
			CAMERA_CONFIG.initialVerticalAngle,
			CAMERA_CONFIG.initialDistance,
			targetPosition,                 // Target: central point we look at
			this.scene                     // Scene: where camera should appear
		);

		// STEP 5: Disconnect default controls
		// Babylon's default lets mouse/keyboard move camera automatically
		// Without this, pressing keys for CHARACTER movement would also move camera
		// Creating a conflict
		this.camera.inputs.clear();

		// STEP 6: Set physical limits (CLAMPING)
		// Babylon automatically restricts these values (like: if > max then = max)
		// ZOOM (RADIUS)
		this.camera.lowerRadiusLimit = CAMERA_CONFIG.minZoomDistance;
		this.camera.upperRadiusLimit = CAMERA_CONFIG.maxZoomDistance;
		this.camera.lowerBetaLimit = CAMERA_CONFIG.minVerticalAngle;
		this.camera.upperBetaLimit = CAMERA_CONFIG.maxVerticalAngle;
	}

	// ─── PUBLIC API (like a .h file)
	// These are functions other files are allowed to call from outside

	// STEP 7: Getter for camera reference
	// Necessary because 'this.camera' is private (protected)
	public getCamera(): ArcRotateCamera {
		return this.camera;
	}

	// STEP 8: Attach mouse controls
	// canvas = the black rectangle on the webpage
	// HTMLCanvasElement type = tells compiler this is a valid <canvas>
	// Tells camera: Listen for clicks ONLY within this rectangle
	public enableMouseControl(canvas: HTMLCanvasElement): void {
		// Babylon.js uses this internally to start reading mouse input
		this.camera.attachControl(canvas, true);
	}

	// STEP 9: Detach mouse controls
	// Used for UI. If you open a menu, cut the connection here
	// so mouse stops moving camera and only moves cursor
	public disableMouseControl(): void {
		this.camera.detachControl();
	}

	// ─── MOVEMENT LOGIC (MANUAL)

	// STEP 10: Rotate camera horizontally (Alpha)
	// direction: TypeScript forces us to use 'left' or 'right' (strict Enum)
	public rotateHorizontal(direction: 'left' | 'right', speed: number = CAMERA_DYNAMICS.horizontalSpeed): void {
		if (direction === 'left') {
			this.camera.alpha += speed;
		} else {
			this.camera.alpha -= speed;
		}
	}

	// STEP 11: Rotate camera vertically (Beta) + clamping
	public rotateVertical(direction: 'up' | 'down', speed: number = CAMERA_DYNAMICS.verticalSpeed): void {
		if (direction === 'up') {
			this.camera.beta -= speed; // Rotate up
		} else {
			this.camera.beta += speed; // Rotate down
		}

		// MANUAL CLAMP (safety brake)
		// Force with math (min/max) so value never leaves range
		// Redundant with constructor but prevents bugs if forced manually
		this.camera.beta = Math.max(
			this.camera.lowerBetaLimit || 0.1,
			Math.min(this.camera.upperBetaLimit || Math.PI / 2, this.camera.beta)
		);
	}

	// ─── PHYSICS (SMOOTHING)

	// STEP 12: Follow target (LERP smoothing)
	// Called 60 times per second
	// Instead of teleporting camera (=), calculate distance
	// and move only 12% (smoothness). Creates spring effect
	public followTarget(targetPos: Vector3, smoothness: number = CAMERA_DYNAMICS.followSmoothness): void {
		this.camera.target.x += (targetPos.x - this.camera.target.x) * smoothness;
		this.camera.target.y = 0; // Fixed height
		this.camera.target.z += (targetPos.z - this.camera.target.z) * smoothness;
	}

	// STEP 13: Smart zoom (gameplay logic with raycast)
	// If raycast says wall is close (<15), auto zoom in
	public adjustZoomDistance(minDistanceToObjects: number): void {
		// Zoom values based on proximity to objects
		const { zoom } = CAMERA_DYNAMICS;

		let targetDistance: number = zoom.defaultDistance;

		if (minDistanceToObjects < zoom.zoomInDistance) {
			targetDistance = zoom.closeDistance;
		} else if (minDistanceToObjects < zoom.zoomMinDistance) {
			const t = (minDistanceToObjects - zoom.zoomInDistance) / (zoom.zoomMinDistance - zoom.zoomInDistance);
			targetDistance = zoom.closeDistance + ((zoom.defaultDistance - zoom.closeDistance) * t);
		} else if (minDistanceToObjects > zoom.zoomOutDistance) {
			targetDistance = zoom.farDistance;
		}
		// Smoothly interpolate to target distance
		this.camera.radius += (targetDistance - this.camera.radius) * zoom.zoomSmoothness;
	}
}

// ===== MINI DICTIONARY =====
// LERP = Linear Interpolation = mathematical smoothing technique
// Instead of snapping camera to player position (teleport),
// calculate distance difference and move only a percentage each frame.
// VISUAL EFFECT: Camera chases player as if tied with rubber band.
// Starts fast when far, slows smoothly when close. Prevents motion sickness.
// ArcRotateCamera = orbital camera rotating around a target point
// Alpha = horizontal rotation angle
// Beta = vertical rotation angle
// Radius = distance from target
// Raycast = invisible ray to detect what it touches
// Clamping = restricting values between min/max limits
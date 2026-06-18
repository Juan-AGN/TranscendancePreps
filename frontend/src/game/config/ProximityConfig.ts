// ┌────────────────────────────────────────────────────────────┐
// │                    PlayerConfig.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Defines player model, animation and movement configuration.│
// │ Controls stickman path, scale, mesh filters and map limits.│
// │ It does NOT load the model or move the player directly.    │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Define the player model path and base scale.
// The GLB file is served from the public/models folder.
export const STICKMAN_GLB_PATH = '/models/stickman.glb';
export const STICKMAN_SCALE = 3;

// STEP 2: Define mesh name filters used to detect stickman mesh parts.
// These filters help apply logic only to the correct meshes inside the GLB.
export const STICKMAN_MESH_NAME_FILTERS = [
	'Simple',
	'Object_',
	'primitive',
] as const;

// STEP 3: Define animation names used by the player character.
export const STICKMAN_ANIM_RUN = 'run';
export const STICKMAN_ANIM_IDLE = 'idle';

// STEP 4: Define player movement and map boundary settings.
export const CHARACTER_CONFIG = {
	moveSpeed: 0.3,
	positionSmoothness: 0.25,
	minMapLimit: -90,
	maxMapLimit: 90,
	trophyRotationSpeed: 0.005,
} as const;

// STEP 5: Small terminology notes.
// idle: animation/state used when the character is not moving.
// lerp: smooth interpolation between two positions.
// frame: one render update tick, usually around 60 times per second.
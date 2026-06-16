// ┌────────────────────────────────────────────────────────────┐
// │                     2dGameConfig.ts                        │
// ├────────────────────────────────────────────────────────────┤
// │ Global configuration constants for the 2D Pong game engine.│
// └────────────────────────────────────────────────────────────┘
// STEP 1: Define the internal canvas coordinate system.
// Physics, collisions and rendering are calculated using this fixed size.
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 380;

// STEP 2: Define paddle size and movement speed.
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 5;

// STEP 3: Define ball size, initial speed and acceleration per bounce
export const BALL_RADIUS = 9;
export const BALL_INITIAL_SPEED = 5;
export const BALL_SPEED_INCREMENT = 0.5;

// STEP 4: Define game rules and serve delays.
// Delays are expressed in frames.
export const MAX_SCORE = 5;
export const SERVE_DELAY_START = 60;
export const SERVE_DELAY_SCORE = 40;

// STEP 5: Define render loop timing.
export const FPS = 60;
export const FRAME_DURATION = 1000 / FPS;

// STEP 6: Define the visual color palette used by the 2D renderer.
export const COLORS = {
	background: '#020000',
	foreground: '#70ee31',
	net: '#5aa932',
	text: '#fffcfc',	
} as const;

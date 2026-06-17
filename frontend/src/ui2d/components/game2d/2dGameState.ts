// ┌────────────────────────────────────────────────────────────┐
// │                     2dGameState.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Shared TypeScript types used by the 2D Pong game engine,   │
// │ canvas component, physics, input and render systems.        │
// └────────────────────────────────────────────────────────────┘

// ════════ TYPE: Paddle: Represents one player paddle in the 2D game. ════════

export interface Paddle {
	x: number;					//x position in the game
	y: number;					//y position in the game
	width: number;				//paddle width
	height: number;				//paddle height
	speed: number;				//velocity
	score: number;				//player score
}

// ════════ TYPE: Ball: Represents the ball state used by the physics engine. ════════
export interface Ball {
	x: number;
	y:	number;
	radius: number;
	velocityX: number;
	velocityY: number;
	speed: number;
}

// ════════ TYPE: Game2dState: Represents the React UI state of the match. ════════
export interface Game2dState {
	isPlaying: boolean;
	isPaused: boolean;
	winner: string | null;
}

// ════════ TYPE: Keys: Represents the current keyboard input state. ════════
export interface Keys {
	w: boolean;
	s: boolean;
	ArrowUp : boolean;
	ArrowDown: boolean;
}

// ════════ TYPE: Game2DMode: Defines all supported 2D game modes. ════════
export type  Game2DMode = "1v1" | "1vIA" | "spectator";

// ════════ TYPE: Game2dCanvasProps: Props accepted by the 2D canvas component. ════════
export interface Game2dCanvasProps {
	gameMode?: Game2DMode;
	maxScore?: number;
	onGameEnd?: (winner: string, player1Score: number, player2Score: number) => void;
	onScoreChange?: (player1Score: number, player2Score: number) => void;
}
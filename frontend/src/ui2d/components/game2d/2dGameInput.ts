// ┌────────────────────────────────────────────────────────────┐
// │                       2dGameInput.ts                       │
// ├────────────────────────────────────────────────────────────┤
// │ Handles keyboard input for the local 2D game.              │
// │ It updates movement flags and game state shortcuts only.   │
// │ Paddle movement is calculated later by the physics layer.  │
// └────────────────────────────────────────────────────────────┘
import type { Keys, Game2dState } from './2dGameState';

// This file listens to keyboard events.
// It does NOT move paddles directly; physics reads the key flags later.
// It only updates input flags and notifies state changes such as start/pause.

// ════════ FCT CLASS: GameInput: Convert keyboard events into game actions. ════════
export class GameInput {
	private keys: Keys;												// Shared key flags used by the game loop.
	private currentState: Game2dState;								// Callback used to notify the UI/controller about state changes.
	private onStateChange: (newState: Partial<Game2dState>) => void;// Internal copy of the current game state.
	// Stores external references instead of creating new ones.
	constructor(
		keys: Keys,
		currentState: Game2dState,
		onStateChange: (newState: Partial<Game2dState>) => void
	) {
		this.keys = keys;
		this.currentState = currentState;
		this.onStateChange = onStateChange;
	}

	// STEP 1: Activate movement flags and handle control shortcuts.
	handleKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'w' || event.key === 'W') {
			this.keys.w = true;
		}

		if (event.key === 's' || event.key === 'S') {
			this.keys.s = true;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			this.keys.ArrowUp = true;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.keys.ArrowDown = true;
		}

		if (event.key === ' ' || event.key === 'Spacebar') {
			event.preventDefault();
			this.handleSpaceKey();
		}

		if (event.key === 'Escape') {
			this.handleEscapeKey();
		}
	};

	// STEP 2: Disable movement flags when the user releases movement keys.
	handleKeyUp = (event: KeyboardEvent): void => {
		if (event.key === 'w' || event.key === 'W') {
			this.keys.w = false;
		}

		if (event.key === 's' || event.key === 'S') {
			this.keys.s = false;
		}

		if (event.key === 'ArrowUp') {
			this.keys.ArrowUp = false;
		}

		if (event.key === 'ArrowDown') {
			this.keys.ArrowDown = false;
		}
	};

	// STEP 3: Start the match or toggle pause with the space key.
	private handleSpaceKey(): void {
		if (!this.currentState.isPlaying && !this.currentState.winner) {
			this.onStateChange({
				isPlaying: true,
				isPaused: false,
			});
		} else if (this.currentState.isPlaying) {
			this.onStateChange({
				isPaused: !this.currentState.isPaused,
			});
		}
	}

	// STEP 4: Pause the match directly with Escape.
	private handleEscapeKey(): void {
		if (this.currentState.isPlaying) {
			this.onStateChange({
				isPaused: true,
			});
		}
	}

	// STEP 5: Keep this controller synchronized with the latest React game state.
	updateState(newState: Game2dState): void {
		this.currentState = newState;
	}
}
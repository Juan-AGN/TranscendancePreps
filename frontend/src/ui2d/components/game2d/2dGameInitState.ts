// ┌────────────────────────────────────────────────────────────┐
// │                    2dGameInitState.ts                      │
// ├────────────────────────────────────────────────────────────┤
// │ Factory class that creates the initial 2D game entities.   │
// └────────────────────────────────────────────────────────────┘
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED } from './2dGameConfig';
import { use2dGameSettingsStore, PADDLE_SIZE_MAP, BALL_SPEED_MAP } from '../../../shared/store/game2dSettingsStore';
// use2dGameSettingsStore -> Zustand store with the player's settings (saved in sessionStorage)
// PADDLE_SIZE_MAP        -> converts 'small' | 'medium' | 'large' into real paddle height pixels
// BALL_SPEED_MAP         -> converts 'slow' | 'normal' | 'fast' into a real speed number
// .getState()            -> way to read a Zustand store OUTSIDE a React component (without a hook)
import { useDisplay2dStore, BALL_SIZE_MAP } from '../../../shared/store/display2dSettingsStore';
import type { Paddle, Ball, Keys } from './2dGameState';

// ════════ FCT CLASS: Game2dInitState: Create fresh game entities from current settings. ════════
// Export the Game2dInitState class.
// Static methods are used because this class does not need internal memory.
// It does not store anything and does not need to be instantiated.
// It only returns ready-to-use objects.
// In JavaScript, return with {} returns an object.

export class Game2dInitState {
	// STEP 1: Create the left paddle using the selected paddle size.

	static createPlayer1(): Paddle {
		const { paddleSize } = use2dGameSettingsStore.getState();
		const height = PADDLE_SIZE_MAP[paddleSize as keyof typeof PADDLE_SIZE_MAP];
		// 'as keyof typeof PADDLE_SIZE_MAP' tells TypeScript that the string is a valid key of the map.
		return {
			x: 20,
			y: CANVAS_HEIGHT / 2 - height / 2,
			width: PADDLE_WIDTH,
			height,								// Dynamic -> depends on the player's setting.
			speed: PADDLE_SPEED,
			score: 0,
		};
	}
	// STEP 2: Create the right paddle using the selected paddle size.
	static createPlayer2(): Paddle {
		const { paddleSize } = use2dGameSettingsStore.getState();
		const height = PADDLE_SIZE_MAP[paddleSize as keyof typeof PADDLE_SIZE_MAP];
		return {
			x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
			y: CANVAS_HEIGHT / 2 - height / 2,
			width: PADDLE_WIDTH,
			height,
			speed: PADDLE_SPEED,
			score: 0,
		};
	}
	// STEP 3: Create the ball using the selected speed and visual size.
	static createBall(): Ball {
		const { ballSpeed } = use2dGameSettingsStore.getState();
		const speed = BALL_SPEED_MAP[ballSpeed as keyof typeof BALL_SPEED_MAP];
		const { ballSize } = useDisplay2dStore.getState();
		const radius = BALL_SIZE_MAP[ballSize];
		return {
			x: CANVAS_WIDTH / 2,
			y: CANVAS_HEIGHT / 2,
			radius,
			velocityX: speed,
			velocityY: speed,
			speed,
		};
	}
	// STEP 4: Create the initial keyboard state with no active key.
	static createKeys(): Keys {
		return {
			// false means that no key is being pressed when the game starts.
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false,
		};
	}
}






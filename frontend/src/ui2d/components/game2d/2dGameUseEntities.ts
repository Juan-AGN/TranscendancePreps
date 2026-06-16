// ┌────────────────────────────────────────────────────────────┐
// │                    2dGameUseEntities.ts                    │
// ├────────────────────────────────────────────────────────────┤
// │ Custom hook that stores the mutable 2D game entities.      │
// └────────────────────────────────────────────────────────────┘

// Custom React hook used to centralize the 2D game entities.
// Here we store player1, player2, ball and keys inside useRef.
// We use useRef because we do NOT want every frame to trigger a re-render.
// These refs are used inside the game loop (requestAnimationFrame).

import { useRef } from 'react';
import { Game2dInitState } from './2dGameInitState';	// Import the factory that creates the initial state (players, ball, keys).
import type { Paddle, Ball, Keys } from './2dGameState';

// ════════ HOOK: useGameEntities: Store mutable game entities without re-rendering. ════════
export function useGameEntities() {
	// STEP 1: Create mutable references for both paddles, the ball and the keyboard state.
	// REFS: MUTABLE STATE WITHOUT RE-RENDERING
	// Game2dInitState.createPlayer1() runs once when the component is mounted.
	const player1Ref = useRef<Paddle>(Game2dInitState.createPlayer1());
	const player2Ref = useRef<Paddle>(Game2dInitState.createPlayer2());
	const ballRef = useRef<Ball>(Game2dInitState.createBall());
	const keysRef = useRef<Keys>(Game2dInitState.createKeys());
	// STEP 2: Reset the match score and restore the entities to their initial state.
	const resetGame = () => {
		// Reset the score.
		player1Ref.current.score = 0;
		player2Ref.current.score = 0;
		// Reset the paddles' Y positions.
		// We use the factory again to get the initial position.
		player1Ref.current.y = Game2dInitState.createPlayer1().y;
		player2Ref.current.y = Game2dInitState.createPlayer2().y;
		// Fully reset the ball.
		// Here we DO replace the whole object.
		// ballRef.current now points to a new Ball object.
		ballRef.current = Game2dInitState.createBall();
	};
	// STEP 3: Expose the refs used by the canvas, input system and game loop.
	// Return the refs so GameCanvas can use them.
	// Example: player1Ref.current.x, ballRef.current.velocityX, etc.
	return {
		player1Ref,
		player2Ref,
		ballRef,
		keysRef,
		resetGame,
	};
}

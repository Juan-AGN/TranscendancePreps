// ┌────────────────────────────────────────────────────────────┐
// │                     Game2DCanvas.tsx                       │
// ├────────────────────────────────────────────────────────────┤
// │ React bridge between the 2D Pong canvas and the internal   │
// │ game engine loop.                                          │
// └────────────────────────────────────────────────────────────┘

import { useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
// useRef: creates mutable refs that the engine can change without triggering a re-render
// useState: stores UI state (pause/winner) that does trigger a re-render
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_SCORE } from './game2d/2dGameConfig';
import type { Game2dState, Game2dCanvasProps } from './game2d/2dGameState';
import { GamePhysics } from './game2d/2dGamePhysics';
import { useGameEntities } from './game2d/2dGameUseEntities';
import { use2dGameLoop } from './game2d/2dUseGameLoop';
import { use2dGameSettingsStore } from '../../shared/store/game2dSettingsStore';
// React brain that connects the game engine with the UI
// - It does NOT contain game logic (physics/input/rendering), that belongs in hooks
// - It manages React state (score/pause/winner) → this updates the UI
// - It keeps mutable refs (paddles/ball/keys) → the engine modifies them at 60fps
// Responsibilities: 1) Mount the canvas in the DOM
// 2) Create refs for the game entities (player1/player2/ball/keys)
// 3) Manage UI state (isPlaying/isPaused/winner)
// 4) Receive callbacks from the engine → React (score/restart/stateChange)
// 5) Pass everything to the engine (use2dGameLoop) so the game can start

// ════════ COMPONENT: Game2DCanvas: Render and control the 2D Pong canvas. ════════
export function Game2DCanvas({
	gameMode = '1v1',
	maxScore = MAX_SCORE,
	onGameEnd, onScoreChange
}: Game2dCanvasProps) {
	const { t } = useTranslation();
	// STEP 1: Store the real canvas DOM element.
	// The game engine needs this ref to get the 2D drawing context.
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// STEP 2: Store only UI-level game state in React.
	// Fast-moving entities like paddles and ball are refs, not React state, to avoid 60fps re-renders.
	const [gameState, setGameState] = useState<Game2dState>({
		isPlaying: false,
		isPaused: false,
		winner: null,
	});
	// STEP 3: Create mutable game entities used directly by the game loop.
	// These refs can be updated every frame without forcing React to re-render.
	const { player1Ref, player2Ref, ballRef, keysRef, resetGame } = useGameEntities();
	// STEP 4: Handle score updates coming from the physics engine.
	// This updates the internal score refs, notifies the parent HUD and ends the match if needed.
	const handleScore = (player: 1 | 2) => {
		const player1 = player1Ref.current;
		const player2 = player2Ref.current;
		const scorer = player === 1 ? player1 : player2;
		const winnerName = player === 1 ? 'Player 1' : 'Player 2';

		scorer.score++; // muta directamente el ref (no re-render) mutate directly to ref(no re-render)

		onScoreChange?.(player1.score, player2.score);// Notify the parent page so the external arcade HUD stays in sync.
		// Read the latest score limit from the store.
		// This avoids stale values if settings are changed while the game system is mounted.
		const { scoreLimit } = use2dGameSettingsStore.getState();

		if (scorer.score >= scoreLimit) {
			setGameState({ isPlaying: false, isPaused: false, winner: winnerName });
			onGameEnd?.(winnerName, player1.score, player2.score);
		} else {
			// Serve the ball toward the player who lost the point.
			GamePhysics.resetBall(ballRef.current, player === 1 ? -1 : 1);
		}
	};
	// STEP 5: Receive game state changes from the input/game loop layer.
	// Partial<Game2dState> allows the engine to update only the fields that changed.
	const handleStateChange = (newState: Partial<Game2dState>) => {
		setGameState(prev => {
			const updated = { ...prev, ...newState };
			return updated;
		});
	};

	// STEP 6: Reset game entities and UI state when the engine requests a restart.
	const handleRestart = () => {
		resetGame(); // hook useGameEntities → reinicia player1/player2/ball/keys
		setGameState({ isPlaying: false, isPaused: false, winner: null });
		onScoreChange?.(0, 0);
	};
	// use2dGameLoop: hook that:
	// - mounts the canvas and gets the rendering context
	// - creates GameRenderer (drawing) and GameInput (keyboard handling)
	// - starts the game loop (RAF at ~60fps)
	// - runs physics (updatePaddles/updateBall) and renders every frame
	// - calls callbacks (onScore/onStateChange/onRestart) when events happen
	//
	// We pass to it:
	// - DOM refs and game entity refs
	// - current UI state (the hook uses gameStateRef to avoid stale closures)
	// - configuration (gameMode/maxScore)
	// - callbacks to communicate engine → React
	use2dGameLoop({ canvasRef, player1Ref, player2Ref, ballRef,
		keysRef, gameState, gameMode, maxScore, t,
		onScore: handleScore,
		onStateChange: handleStateChange,
		onRestart: handleRestart,
	});

	return (
		<div className="flex flex-col items-center justify-center w-full h-full">
			{/* STEP 8: Render the canvas where the engine draws the full game. */}
			<canvas
				ref={canvasRef}
				width={CANVAS_WIDTH}
				height={CANVAS_HEIGHT}
				className="border-2 border-black shadow-lg rounded-2xl"
				style={{ width: '100%', height: '100%', imageRendering: 'crisp-edges' }}
			/>
		</div>
	);
}

// ctx: the canvas 2D context, the "brush" used to draw
// gameState: UI state (isPlaying/isPaused/winner) stored in React
// gameStateRef: bridge between React state and the engine, avoiding stale closures
// imageRendering: CSS property that controls how pixels are scaled
// 'crisp-edges': sharp pixels without blur, useful for pixel-art games
// Partial<T>: TypeScript type that makes all properties optional
// ?.: optional chaining, calls/accesses something only if it exists
// JSX: syntax that mixes HTML with JavaScript, compiled by React
// Functional component: function that returns JSX for React to render
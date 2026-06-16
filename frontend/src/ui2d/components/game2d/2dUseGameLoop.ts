// ┌────────────────────────────────────────────────────────────┐
// │                       2dUseGameLoop.ts                     │
// ├────────────────────────────────────────────────────────────┤
// │ Main hook that connects React with the 2D Pong engine.     │
// └────────────────────────────────────────────────────────────┘
// We avoid using React state for positions (would cause re-renders at 60fps, hurting performance and smoothness).
// 2D ENGINE ARCHITECTURE — This hook separates two worlds:
// 1) React world  (UI, state, props, callbacks)
// 2) Engine world (imperative loop, physics, manual render)
// React manages:  - gameState  - props  - callbacks
// Engine manages: - continuous loop (requestAnimationFrame)  - physics (GamePhysics)  - rendering (Game2dRenderer)  - input (GameInput)
// Both worlds are kept in sync via:
// - refs (mutable internal state)
// - useEffect with dependencies

import { useEffect, useRef } from "react";
// useEffect -> React function that runs code when the component mounts (appears on screen), when dependencies change, or when it unmounts.
//              Used here to: start the loop, register keyboard events, and clean up.
// useRef    -> React tool to store values that change without triggering a re-render.
//              Creates a persistent box holding a mutable value: const x = useRef(0) → x.current is the real value.
//              Used to store: animation frame id, previous timestamp (deltaTime), and class instances (input, renderer, game state).
import type { MutableRefObject, RefObject } from "react";
import type { TFunction } from 'i18next';
// MutableRefObject -> A ref whose .current we mutate ourselves (e.g. paddle positions, score at 60fps). Normally not null.
// RefObject        -> A persistent box that survives re-renders without causing them (silent mutation — React does not watch .current).
//                    Used with useRef instead of useState: changing .current does not trigger a re-render.
//                    RefObject<T> returns an object shaped { current: T }.
//                    Use for: DOM elements, timers, ids, class instances, persistent values, game engine state. Can be null.
import { GamePhysics } from "./2dGamePhysics";
import { Game2dRenderer } from "./2dGameRender";
import { GameInput } from "./2dGameInput";
import { FRAME_DURATION, SERVE_DELAY_START, SERVE_DELAY_SCORE } from "./2dGameConfig";
import type { Paddle, Ball, Keys, Game2dState, Game2DMode } from "./2dGameState";

// Defines the contract that the hook must satisfy.
interface Use2dGameLoopProps {
	canvasRef: RefObject<HTMLCanvasElement | null>;	// Ref to the canvas. React renders the canvas and assigns the element to canvasRef.current.
	// React does not give direct DOM access; the canvas is created after the render, so the hook cannot access the DOM on its own.
	player1Ref: MutableRefObject<Paddle>;			// Ref to player 1 state. Mutable because .current is constantly updated by the engine. <Paddle> is the paddle interface.
	player2Ref: MutableRefObject<Paddle>;			// Same as above — positions and score are mutated at 60fps.
	ballRef: MutableRefObject<Ball>;				// Ref to the ball state.
	keysRef: MutableRefObject<Keys>;				// Ref to the current keyboard input state — mutated on every keydown/keyup event.
	gameState: Game2dState;							// Not a ref — comes from React (useState/Zustand). Represents game flow state (changes rarely).
	// When it changes, we want the engine to update accordingly.
	gameMode: Game2DMode;							// Changes based on the selected mode string.
	maxScore: number;
	onScore: (player: 1 | 2) => void;				// Callback fired when a goal is detected. Accepts player 1 or 2, returns nothing. Updates game state.
	onStateChange: (newState: Partial<Game2dState>) => void; // Handles state changes (pause/winner/isPlaying etc.).
	// Partial<T>: helper type — object that may only contain some properties of Game2dState.
	onRestart: () => void;							// Callback to restart the game (R key or after winner).
	t: TFunction;
}

// Hook — destructured from props: const canvasRef = props.canvasRef;
export function use2dGameLoop({
	canvasRef, player1Ref, player2Ref, ballRef, keysRef,
	gameState, gameMode, maxScore: _maxScore, t, onScore, onStateChange, onRestart }: Use2dGameLoopProps) { // :Use2dGameLoopProps — all listed properties are required.
	// The const refs always point to the same ref object, but ref.current changes when the instance is created.
	const animationFrameRef = useRef<number | undefined>(undefined); // Controls the loop. Stores the frame id so it can be cancelled. .current is a number or undefined (no frame scheduled yet).
	const lastTimeRef = useRef<number>(0);							 // Controls timing. Stores the timestamp of the last processed frame. Initialized to 0.
	const rendererRef = useRef<Game2dRenderer | null>(null);		 // Controls rendering. Holds one instance of Game2dRenderer (clears canvas, draws paddles, ball and text). .current is null until initialized.
	const inputHandlerRef = useRef<GameInput | null>(null);
	const gameStateRef = useRef<Game2dState>(gameState);
	const tRef = useRef<TFunction>(t);
	const serveCountdownRef = useRef<number>(0); // Frames to wait before the ball moves after a serve.

	useEffect(() => {
		const canvas = canvasRef.current;	// Extract the real DOM element from the ref. canvasRef.current = <HTMLCanvasElement>.
		if (!canvas)
			return;

		const ctx = canvas.getContext("2d"); // getContext is a native HTMLCanvasElement method ("2d" = classic 2D mode).
		if (!ctx)							 // Returns a CanvasRenderingContext2D object (browser API: fillRect, arc, fill, etc.).
			return;							 // Allocates a pixel buffer → sets up coordinate system → creates the context object.

		rendererRef.current = new Game2dRenderer(ctx);	// Creates a new renderer, passing the 2D context. Runs constructor, assigns this.ctx = ctx.
		inputHandlerRef.current = new GameInput(keysRef.current, gameState, onStateChange); // Creates a new GameInput instance.
														// Connects it to React and the engine: 1) keys, 2) game state, 3) permission to change state.
		const handleRestartKey = (event: KeyboardEvent) => {	// Keyboard listener for the restart key.
			if ((event.key === "r" || event.key === "R") && gameStateRef.current.winner) {	// event = KeyboardEvent object.
				onRestart();
			}
		};

		// Heart of the engine — function that receives currentTime (a timestamp number provided by the browser).
		// Internal frame flow: 1) Time control (deltaTime + FRAME_DURATION)
		//                      2) Update (only if isPlaying && !isPaused)
		//                      3) Render (always)
		// INPUT → UPDATE → RENDER  (classic game engine pattern)

		// IMPORTANT: We use refs instead of useState because:
		// - useState would trigger a re-render 60 times per second.
		// - Refs allow silent mutation (.current) without causing a component re-render.
		const gameLoop = (currentTime: number) => {
			animationFrameRef.current = requestAnimationFrame(gameLoop); // requestAnimationFrame is a browser API.
			// Stores the frame id in the ref so it can be cancelled.
			// When the frame finishes, gameLoop is called again with the next timestamp.

			// currentTime    -> sent automatically by the browser on each gameLoop call.
			//                    Represents the current time in milliseconds since the page started.
			// lastTimeRef.current -> timestamp of the last frame we actually processed.
			//                        Stored so we can compare against the current time.
			// deltaTime      -> difference between now and the last valid frame.
			//                    Tells us how much REAL time has passed.
			const deltaTime = currentTime - lastTimeRef.current;

			// FRAME_DURATION -> the ideal duration of a single frame.
			// Example: for 60fps → 1000ms / 60 ≈ 16.67ms.
			// If not enough time has elapsed for a full frame, skip physics and rendering.
			// This prevents the game from running faster on 120hz or 144hz monitors.
			if (deltaTime < FRAME_DURATION)
				return; // Skip this frame (the next one is already scheduled).

			lastTimeRef.current = currentTime - (deltaTime % FRAME_DURATION);
			// Update the time base for the next calculation.
			// deltaTime % FRAME_DURATION -> leftover milliseconds that didn't fill a complete frame.
			// Example: deltaTime = 18ms, FRAME_DURATION = 16ms → 2ms leftover.
			// Without subtracting the remainder, those milliseconds would be lost and the game would drift over time.

			const currentGameState = gameStateRef.current; // Read the CURRENT game state from the ref.
			// gameStateRef.current always holds the most recent state.
			// Stored in a local variable to avoid writing .current everywhere.

			// Only update physics if: the game is playing AND is not paused.
			if (currentGameState.isPlaying && !currentGameState.isPaused) {

				// Update paddles.
				// player1Ref.current -> Paddle object for player 1 (position, velocity, score).
				// player2Ref.current -> Paddle object for player 2.
				// keysRef.current    -> Current keyboard state (which keys are pressed).
				// ballRef.current    -> Ball object (passed in because it can influence AI).
				// gameMode          -> Defines whether it is 1v1, 1vAI or spectator (physics differ per mode).
				GamePhysics.updatePaddles(player1Ref.current, player2Ref.current, keysRef.current,
					ballRef.current, gameMode);

				// Same for the ball — only if the serve countdown has finished.
				if (serveCountdownRef.current > 0) {
					serveCountdownRef.current--;
				} else {
					GamePhysics.updateBall(ballRef.current, player1Ref.current, player2Ref.current,
						(player) => { serveCountdownRef.current = SERVE_DELAY_SCORE; onScore(player); });
				}
			}

			// Always render the current frame, even when paused or when there is a winner,
			// because we still need to draw the visual state (scoreboard, winner screen, pause overlay, etc.).
			if (rendererRef.current) {
				// render() draws everything on the canvas. Receives:
				// - player1, player2, ball
				// - currentGameState (to know whether to show the winner screen or pause overlay)
				rendererRef.current.render(player1Ref.current, player2Ref.current, ballRef.current,
					currentGameState, tRef.current);
			}
		};

		// Start the main game loop.
		// requestAnimationFrame tells the browser to call gameLoop on the next frame.
		// Returns a numeric ID that identifies the scheduled frame, stored so it can be cancelled later.
		animationFrameRef.current = requestAnimationFrame(gameLoop);

		// Register keyboard listeners. They update keysRef.current on every keydown/keyup.
		window.addEventListener("keydown", inputHandlerRef.current.handleKeyDown);
		window.addEventListener("keyup", inputHandlerRef.current.handleKeyUp);
		window.addEventListener("keydown", handleRestartKey);

		// Returning a function from useEffect registers it as a cleanup.
		// React runs this automatically when the component unmounts, to shut down the engine cleanly and prevent memory leaks.
		return () => {
			if (animationFrameRef.current) { // If a frame is currently scheduled:
				cancelAnimationFrame(animationFrameRef.current);
				// animationFrameRef.current -> ID of the last requestAnimationFrame.
				// cancelAnimationFrame()    -> stops the game loop.
				// Without this the loop would keep running in the background.
			}

			if (inputHandlerRef.current) { // If the input handler (GameInput) exists, remove keyboard listeners.
				window.removeEventListener("keydown", inputHandlerRef.current.handleKeyDown);
				window.removeEventListener("keyup", inputHandlerRef.current.handleKeyUp);
			}
			// Also remove the restart key listener (R key).
			// Without this it would remain active even after the game unmounts.
			window.removeEventListener("keydown", handleRestartKey);
		};
	}, []); // Runs only once — on mount.

	// IMPORTANT: The gameLoop is created only once (useEffect with []).
	// That means if we used gameState directly inside the loop, it would be frozen at its initial value (stale closure).
	// That is why we use gameStateRef: we sync React → Engine every time the state changes.
	// [gameState] dependency: React runs this block whenever gameState changes.
	useEffect(() => {
		const wasPlaying = gameStateRef.current.isPlaying;
		gameStateRef.current = gameState; // Update the internal ref with the latest state.

		// When the match starts for the first time (SPACE) → start the serve countdown.
		if (!wasPlaying && gameState.isPlaying) {
			serveCountdownRef.current = SERVE_DELAY_START;
		}

		// If the input handler (GameInput) already exists, pass it the new game state.
		// This lets the input layer adapt to changes such as: pause, start, winner.
		if (inputHandlerRef.current) {
			inputHandlerRef.current.updateState(gameState);
		}
	}, [gameState]); // Re-runs every time gameState changes (dependency array).

	useEffect(() => {
		tRef.current = t;
	}, [t]);
}

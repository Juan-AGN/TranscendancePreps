// Game2DCanvas.tsx -- COMPONENTE PRINCIPAL DEL JUEGO 2D PONG
// cerebro de React que conecta el motor con la UI
// - NO tiene logica de juego (física/input/render), eso en hooks
// - tiene estado React (score/pause/winner) → esto actualiza la UI
// - Stiene refs mutables (paddles/ball/keys) → el motor los modifica a 60fps
// Respons..: 	// 1) montar el canvas en el DOM
				// 2) crear refs para entidades (player1/player2/ball/keys)
				// 3) gestionar estado de UI (isPlaying/isPaused/winner)
				// 4) callbacks desde el motor → React (score/restart/stateChange)
				// 5) pasar todo al motor (use2dGameLoop) para que arranque
import { useRef, useState } from "react";
// useRef: crea refs mutables que el motor puede cambiar sin re-render
// useState: guarda estado UI (pausa/ganador) que sí provoca re-render
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_SCORE } from './game2d/2dGameConfig';// constantes: tamaño canvas y puntos maximos
import type { Game2dState, Game2dCanvasProps } from './game2d/2dGameState'; // tipos TypeScript: estructura del estado y props del componente
import { GamePhysics } from './game2d/2dGamePhysics'; // fsica: necesitamos resetBall cuando alguien anota
import { useGameEntities } from './game2d/2dGameUseEntities';// hook que crea y gestiona refs de entidades (paddles/ball/keys/reset)
import { use2dGameLoop } from './game2d/2dUseGameLoop'; // hook motor: arranca el loop, input, física, render

// PROPS DEL COMPONENTE
// gameMode: '1v1' (dos jugadores) o '1vIA' (contra IA)
// maxScore: puntos para ganar (por defecto MAX_SCORE del config)
// onGameEnd: callback opcional cuando termina partida (para stats/modal/navegación)
export function Game2DCanvas({ gameMode = '1v1', maxScore = MAX_SCORE, onGameEnd, onScoreChange }: Game2dCanvasProps) {
	// REF AL CANVAS DEL DOM
	// React rellena canvasRef.current cuando monta el <canvas> en el DOM
	// el motor (use2dGameLoop) usa esto para conseguir el ctx (pincel)
	// RefObject<HTMLCanvasElement>solo lectura, React lo gestiona
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [gameState, setGameState] = useState<Game2dState>({
		isPlaying: false,
		isPaused: false,
		winner: null,
	});

	// ENTIDADES DEL JUEGO (refs mutables) // hook useGameEntities crea y devuelve:
				// - player1Ref: { x, y, width, height, speed, score }
				// - player2Ref: igual
				// - ballRef: { x, y, radius, velocityX, velocityY, speed }
				// - keysRef: { w, s, ArrowUp, ArrowDown } (booleanos)
				// - resetGame: func. para reiniciar todas las entidades a estado inicial
				// MutableRefObject → el motor modify .current a 60fps sin re-render
	const { player1Ref, player2Ref, ballRef, keysRef, resetGame } = useGameEntities();

			// CALLBACK: CUANDO ALGUIEN MARCA UN PUNT el motor (GamePhysics.updateBall) llama a esto con player: 1 o 2
				// 1) suma el punto al jugador correspondiente
				// 2) si llega a maxScore → termina partida (winner + callback onGameEnd)
				// 3) si no → resetea la bola en dirección contraria (hacia quien perdió el punto)
	const handleScore = (player: 1 | 2) => {
		const player1 = player1Ref.current;
		const player2 = player2Ref.current;
		const scorer = player === 1 ? player1 : player2;
		const winnerName = player === 1 ? 'Player 1' : 'Player 2';

		scorer.score++; // muta directamente el ref (no re-render)

		// Avisar al padre (HUD externo) cada vez que cambia el marcador
		onScoreChange?.(player1.score, player2.score);

		// check si alguien gano
		if (scorer.score >= maxScore) {
			// terminar partida
			setGameState({ isPlaying: false, isPaused: false, winner: winnerName });
			// avisar al componente padre (opcional, para stats/modal)
			onGameEnd?.(winnerName, player1.score, player2.score);
		} else {
			// resetear bola hacia quien lost (para darle ventaja)
			// player 1 anpota → bola hacia player 2 (direction -1)
			// player 2 anota → bola hacia player 1 (direction 1)
			GamePhysics.resetBall(ballRef.current, player === 1 ? -1 : 1);
		}
	};

	// CALLBACK: CAMBIOS DE ESTADO DESDE EL MOTOR
	// el motor (GameInput) llama a esto cuando: - SPACE → start/pause - ESC → pause
	// recibe un objeto parcial con los campos a cambiar y usa setGameState pra provocar re-render y actualizar UI
	const handleStateChange = (newState: Partial<Game2dState>) => {
		setGameState(prev => {
			const updated = { ...prev, ...newState };
			return updated;
		});
	};

	// CALLBACK: REINICIAR PARTIDA
	// el motor llama a esto cuando pulsas R (con ganador) 1) resetea entidades (posiciones + scores a 0) 2) resetea estado UI (volver a pantalla inicial)
	const handleRestart = () => {
		resetGame(); // hook useGameEntities → reinicia player1/player2/ball/keys
		setGameState({ isPlaying: false, isPaused: false, winner: null });
		onScoreChange?.(0, 0);
	};

	// use2dGameLoop el hook q: // -monta canvas y consigue ctx
								// - crea GameRenderer (pintar) y GameInput (teclado)
								// - arranca el game loop (RAF a 60fps)
								// - ejecuta physica (updatePaddles/updateBall) y render cada frame
								// - llama a los callbacks (onScore/onStateChange/onRestart) cuando ocurren eventos
	// le pasamos: 	- refs del DOM y entidades - estado UI actual (el hook usa gameStateRef para evitar stale closures)
					//- configuración (gameMode/maxScore) - callbacks para comunicar motor → React
	use2dGameLoop({
		canvasRef,
		player1Ref,
		player2Ref,
		ballRef,
		keysRef,
		gameState,
		gameMode,
		maxScore,
		onScore: handleScore,
		onStateChange: handleStateChange,
		onRestart: handleRestart,
	});

	// RENDER (JSX)
	// canvas: elemento donde el motor pinta (ctx.fillRect/arc/fillText)
					// ref={canvasRef}: React rellena esto al montar
					// width/height: tamaño del canvas (importante: en atributos, NO en CSS)
					// border/shadow: estilo visual
					// imageRendering: 'crisp-edges'(down glosario*) → pixeles nItidos (no blur)
					// controles: texto informativo para el jugador (q teclas usar)
	return (
		<div className="flex flex-col items-center justify-center w-full h-full">		
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


// ctx -> contexto 2D del canvas, el "pincel" para dibujar
// gameState -> estado UI (isPlaying/isPaused/winner) que vive en React
// gameStateRef -> puente entre React state y motor (evita stale closures)
// imageRendering -> CSS property para controlar como se escalan píxeles
// 'crisp-edges' -> pX ntidos sin blur (bueno para juegos pixel art)
// Partial<T> -> tipo TypeScript que hace todas las propiedades opcionales
// ?. -> optional chaining (llama la función solo si existe)
// JSX -> sintaxis que mezcla HTML con JavaScript (React lo compila)
// Componente funcional -> func q devuelve JSX (React lo renderiza)
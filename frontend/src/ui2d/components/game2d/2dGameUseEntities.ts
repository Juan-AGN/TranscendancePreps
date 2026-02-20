// CUSTOM HOOK: GAME ENTITIES
// //custom hook de react para centralizar las entidades del juego 2d
// //aqui guardamos player1, player2, ball y keys en useRef
// //useRef pq NO queremos que cada frame dispare un re-render
// //estas refs se usan dentro del game loop (requestAnimationFrame)
import { useRef } from 'react';
//importamos la factory que crea el estado inicial (jugadores, bola, teclas)
import { Game2dInitState } from './2dGameInitState';
//importamos solo los tipos TS
import type { Paddle, Ball, Keys } from './2dGameState';
//exportamos el custom hook
//esto es una funcion normal, pero empieza por "use" => regla de hooks
export function useGameEntities() {
	// REFS (ESTADO MUTABLE SIN RE-RENDER)
	//player1Ref.current contiene el objeto Paddle del jugador1
	//GameFactory.createPlayer1() se ejecuta UNA sola vez al montar el componente
	const player1Ref = useRef<Paddle>(Game2dInitState.createPlayer1());

	//player2 igual
	const player2Ref = useRef<Paddle>(Game2dInitState.createPlayer2());

	//ballRef guarda la pelota
	const ballRef = useRef<Ball>(Game2dInitState.createBall());

	//keysRef guarda las flags de teclado (w, s, ArrowUp, ArrowDown)
	const keysRef = useRef<Keys>(Game2dInitState.createKeys());

	// RESET GAME
	//funcion para reiniciar partida completa (marcador + posiciones + bola)
	const resetGame = () => {

		//reseteamos marcador
		player1Ref.current.score = 0;
		player2Ref.current.score = 0;

		//reseteamos posicion Y de las palas
		//volvemos a usar la factory para obtener la posicion inicial
		player1Ref.current.y = Game2dInitState.createPlayer1().y;
		player2Ref.current.y = Game2dInitState.createPlayer2().y;

		//reseteamos la bola completamente
		//aqui SI reasignamos el objeto entero
		//ballRef.current apunta ahora a un nuevo objeto Ball
		ballRef.current = Game2dInitState.createBall();
	};

	// RETURN DEL HOOK
	//devolvemos las refs para que el GameCanvas pueda usarlas
	//ej: player1Ref.current.x, ballRef.current.velocityX, etc.
	return {
		player1Ref,
		player2Ref,
		ballRef,
		keysRef,
		resetGame,
	};
}

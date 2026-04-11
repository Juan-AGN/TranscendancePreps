//file para centralizar la creacion del estado inical del juego2d //creamos los objetos cuando start de partida

//importamos las constantes de config del juego2d
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	PADDLE_WIDTH,
	PADDLE_HEIGHT,
	PADDLE_SPEED,
	BALL_RADIUS,
	BALL_INITIAL_SPEED,
} from './2dGameConfig';

//importamos solo los tipos(TS) desde gamestate //import type : eso no se convierte JS en runtime, solo dirve pa q TS check que el objeto q devolvemos tiene al forma correcta
import type { Paddle, Ball, Keys } from './2dGameState';

//exportamos la calse 2dGAMEINITSTATE
//statics porque estas clases no necesitasn memoria interna, no guarda nada/no se construyen, solo delvulve los objetos
// return con {} en JS devuelve objeto.... no ejecuta algo()
export class Game2dInitState {
	static createPlayer1(): Paddle {
		return {
			x: 20,
			y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
			width: PADDLE_WIDTH,
			height: PADDLE_HEIGHT,
			speed: PADDLE_SPEED,
			score: 0,
		};
	}
	static createPlayer2() : Paddle {
		return {
			x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
			y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
			width: PADDLE_WIDTH,
			height: PADDLE_HEIGHT,
			speed: PADDLE_SPEED,
			score: 0,
		};
	}
	static createBall(): Ball {
		return {
			x: CANVAS_WIDTH / 2,
			y: CANVAS_HEIGHT / 2,
			radius: BALL_RADIUS,
			velocityX: BALL_INITIAL_SPEED,
			velocityY: BALL_INITIAL_SPEED,
			speed: BALL_INITIAL_SPEED,
		};
	}
	static createKeys(): Keys {
		return {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false,
		};
		//false al empezar no estamos pulsando niguna tecla
	}
}






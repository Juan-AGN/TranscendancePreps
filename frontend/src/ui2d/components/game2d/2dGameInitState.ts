//file para centralizar la creacion del estado inical del juego2d //creamos los objetos cuando start de partida

//importamos las constantes de config del juego2d
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	PADDLE_WIDTH,
	PADDLE_SPEED,
} from './2dGameConfig';

// use2dGameSettingsStore  -> store de Zustand con los ajustes del jugador (guardados en sessionStorage)
// PADDLE_SIZE_MAP         -> convierte 'small' | 'medium' | 'large' en pixeles reales de altura
// BALL_SPEED_MAP          -> convierte 'slow' | 'normal' | 'fast' en un numero de velocidad real
// .getState() -> forma de leer un store Zustand FUERA de un componente React (sin hook)
import { use2dGameSettingsStore, PADDLE_SIZE_MAP, BALL_SPEED_MAP } from '../../../shared/store/game2dSettingsStore';
import { useDisplay2dStore, BALL_SIZE_MAP } from '../../../shared/store/display2dSettingsStore';
//BALL_SIZE_MAP -> convierte 'small' | 'normal' | 'large' en radio de pixeles

//importamos solo los tipos(TS) desde gamestate //import type : eso no se convierte JS en runtime, solo dirve pa q TS check que el objeto q devolvemos tiene al forma correcta
import type { Paddle, Ball, Keys } from './2dGameState';

//exportamos la calse 2dGAMEINITSTATE
//statics porque estas clases no necesitasn memoria interna, no guarda nada/no se construyen, solo delvulve los objetos
// return con {} en JS devuelve objeto.... no ejecuta algo()
export class Game2dInitState {
	static createPlayer1(): Paddle {
		//leemos el tamaño de pala elegido en ajustes justo cuando empieza la partida
		//'as keyof typeof PADDLE_SIZE_MAP' le dice a TS q el string es una clave valida del mapa
		const { paddleSize } = use2dGameSettingsStore.getState();
		const height = PADDLE_SIZE_MAP[paddleSize as keyof typeof PADDLE_SIZE_MAP];
		return {
			x: 20,
			y: CANVAS_HEIGHT / 2 - height / 2,
			width: PADDLE_WIDTH,
			height,          //dinamico -> depende del ajuste del jugador
			speed: PADDLE_SPEED,
			score: 0,
		};
	}
	static createPlayer2() : Paddle {
		//igual q player1 -> los dos usan el mismo ajuste de tamaño de pala
		const { paddleSize } = use2dGameSettingsStore.getState();
		const height = PADDLE_SIZE_MAP[paddleSize as keyof typeof PADDLE_SIZE_MAP];
		return {
			x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
			y: CANVAS_HEIGHT / 2 - height / 2,
			width: PADDLE_WIDTH,
			height,          //dinamico -> depende del ajuste del jugador
			speed: PADDLE_SPEED,
			score: 0,
		};
	}
	static createBall(): Ball {
		//leemos la velocidad de pelota elegida en ajustes justo cuando empieza la partida
		const { ballSpeed } = use2dGameSettingsStore.getState();
		const speed = BALL_SPEED_MAP[ballSpeed as keyof typeof BALL_SPEED_MAP];
		//leemos el tamaño de bola del store de display
		const { ballSize } = useDisplay2dStore.getState();
		const radius = BALL_SIZE_MAP[ballSize];
		return {
			x: CANVAS_WIDTH / 2,
			y: CANVAS_HEIGHT / 2,
			radius,             //dinamico -> depende del ajuste visual del jugador
			velocityX: speed,  //dinamico -> depende del ajuste del jugador
			velocityY: speed,
			speed,
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






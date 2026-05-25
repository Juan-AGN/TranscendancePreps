// GAME PHYSICS & LOGIC
//file pa centralizar la fisica y la logica del pong 2d
//aqui NO dibujamos nada (eso es renderer), aqui solo movemos y calculamos colisiones, rebotes y puntos
//la idea es pasar el estado (ball + paddles + keys + mode) y esto lo actualiza (mutando los objetos) //importamos solo los tipos(TS) del estado del juego
import type { Ball, Paddle, Keys, Game2DMode } from './2dGameState';
//importamos constantes del config del juego2d (tamaños, velocidades, etc.)
import { CANVAS_WIDTH, CANVAS_HEIGHT, BALL_SPEED_INCREMENT } from './2dGameConfig';
// use2dGameSettingsStore -> leemos la velocidad de bola elegida fuera de React con .getState()
// BALL_SPEED_MAP         -> convierte 'slow' | 'normal' | 'fast' en un numero real
import { use2dGameSettingsStore, BALL_SPEED_MAP } from '../../../shared/store/game2dSettingsStore';
//exportamos la clase GamePhysics
//static pq esta clase no necesita memoria interna, no guarda nada, solo hace calculos sobre objetos q le pasas
export class GamePhysics {
	//resetea la pelota al centro y le da una direccion inicial
	// //direction: 1 o -1 (1 -> hacia la derecha, -1 -> hacia la izquierda) //por defecto = 1, asi cuando empiezas normalmente sale a la derecha
	static resetBall(ball: Ball, direction: 1 | -1 = 1): void {
		//la ponemos en el centro del canvas
		ball.x = CANVAS_WIDTH / 2;
		ball.y = CANVAS_HEIGHT / 2;
		//reseteamos la speed al valor del ajuste elegido por el jugador (no una constante hardcodeada)
		//se ejecuta cada vez q alguien anota, asi la velocidad siempre es la correcta durante la partida
		const { ballSpeed } = use2dGameSettingsStore.getState();
		ball.speed = BALL_SPEED_MAP[ballSpeed as keyof typeof BALL_SPEED_MAP];

		//le damos un angulo random pequeño pa q no sea siempre recta y aburrida
		// //Math.random() -> [0..1) //(Math.random() - 0.5) -> [-0.5..0.5) //* (Math.PI / 4) -> rango final [-PI/8 .. PI/8] (pequeña inclinación)
		const randomAngle = (Math.random() - 0.5) * Math.PI / 4;
		ball.velocityX = direction * ball.speed * Math.cos(randomAngle);	//velocityX y velocityY son los “pasos” por frame (o por tick) que va a sumar la pelota
		ball.velocityY = ball.speed * Math.sin(randomAngle);				//cos controla X, sin controla Y, y direction decide si sale a derecha o izquierda
	}

	// COLLISION CHECK //check si el circulo(ball) se solapa con el rectang(paddle)//esto es un AABB simple:si el bounding box de la ball toca el de la pala=>colision
	static checkCollision(ball: Ball, paddle: Paddle): boolean {
		return (
			ball.x - ball.radius < paddle.x + paddle.width &&		//lado izq de la pelota < lado der de la pala
			ball.x + ball.radius > paddle.x &&						//lado der de la pelota > lado izq de la pala
			ball.y - ball.radius < paddle.y + paddle.height &&		//arriba de la pelota < abajo de la pala
			ball.y + ball.radius > paddle.y							//abajo de la pelota > arriba de la pala
		);
	}

	// BALL UPDATE (MOVE + BOUNCE + SCORE)
	//actualiza la pelota: se mueve, rebota en paredes, rebota en palas y detecta puntos
	static updateBall(ball: Ball, player1: Paddle, player2: Paddle, onScore: (player: 1 | 2) => void): void {
		//onScore: callback que llama cuando la pelota sale por un lado (marca un jugador)

		//1) mover la pelota (sumamos las velocidades a la posicion) //esto es el “motor” basico de movimiento del juego
		ball.x += ball.velocityX;
		ball.y += ball.velocityY;

		//2) colision con paredes arriba/abajo //si toca el techo o el suelo, invertimos velocityY (rebote vertical)
		if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= CANVAS_HEIGHT) {
			ball.velocityY *= -1;
		}

		//3) colision con pala jugador 1 (izquierda)
		if (this.checkCollision(ball, player1)) {

			//collidePoint: cuanto de lejos del centro de la pala golpea la pelota
			//si pega arriba -> negativo, si pega abajo -> positivo
			const collidePoint = ball.y - (player1.y + player1.height / 2);

			//normalizamos a rango [-1..1]
			//dividimos entre la mitad de la pala
			const normalizedCollidePoint = collidePoint / (player1.height / 2);

			//bounceAngle maximo = PI/4 (45º) para que nunca salga disparada vertical 100%
			//si normalized = -1 => -45º, si 0 => 0º (sale recta), si 1 => 45º
			const bounceAngle = normalizedCollidePoint * (Math.PI / 4);

			//actualizamos velocidades en base al angulo y a la speed actual
			//para el player1, X debe salir positiva (hacia la derecha)
			ball.velocityX = ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);

			//aumentamos un pelin la speed en cada golpe (+ tensión, + arcade)
			ball.speed += BALL_SPEED_INCREMENT;

			//empujamos la pelota fuera de la pala para evitar “doble colision” en el mismo frame
			ball.x = player1.x + player1.width + ball.radius;
		}

		//4) colision con pala jugador 2 (derecha)
		if (this.checkCollision(ball, player2)) {

			//mismo calculo, pro ahora el rebote debe ir hacia la izquierda (X negativa)
			const collidePoint = ball.y - (player2.y + player2.height / 2);
			const normalizedCollidePoint = collidePoint / (player2.height / 2);
			const bounceAngle = normalizedCollidePoint * (Math.PI / 4);

			//X negativa pa que vuelva hacia player1
			ball.velocityX = -ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);

			ball.speed += BALL_SPEED_INCREMENT;

			//sacamos la pelota fuera de la pala derecha
			ball.x = player2.x - ball.radius;
		}

		//5) detectar punto
		//si la pelota se va por la izquierda => punto player2
		if (ball.x - ball.radius <= 0) {
			onScore(2);
		}

		//si la pelota se va por la derecha => punto player1
		if (ball.x + ball.radius >= CANVAS_WIDTH) {
			onScore(1);
		}
	}

	// PADDLES UPDATE (INPUT / IA)
	//actualiza palas: player1 siempre con W/S
	//player2 depende del modo: 1vIA -> sigue la pelota, 1v1 -> ArrowUp/ArrowDown
	static updatePaddles(player1: Paddle, player2: Paddle, keys: Keys, ball: Ball, gameMode: Game2DMode): void {
		// --- PLAYER 1 ---
		if (gameMode === 'spectator') {
			// Modo espectador: Player 1 también es IA
			const paddleCenter = player1.y + player1.height / 2;
			const ballCenter = ball.y;

			if (paddleCenter < ballCenter - 35) {
				player1.y += player1.speed * 0.65;
			} else if (paddleCenter > ballCenter + 35) {
				player1.y -= player1.speed * 0.65;
			}

			if (player1.y < 0)
				player1.y = 0;
			if (player1.y > CANVAS_HEIGHT - player1.height) {
				player1.y = CANVAS_HEIGHT - player1.height;
			}
		} else {
			// Modos normales: Player 1 con W/S
			if (keys.w && player1.y > 0) {
				player1.y -= player1.speed;
			}
			if (keys.s && player1.y < CANVAS_HEIGHT - player1.height) {
				player1.y += player1.speed;
			}
		}

		// --- PLAYER 2 o IA ---
		if (gameMode === '1vIA' || gameMode === 'spectator') {
			//IA simple: intenta poner el centro de la pala donde esta la pelota
			const paddleCenter = player2.y + player2.height / 2;		//paddleCenter: centro de la pala (y + altura/2)
			const ballCenter = ball.y;									//ballCenter: y de la pelota (ya es su “centro”)

			//zona muerta (deadzone) +/- 35
			//asi no vibra todo el rato por un pixel arriba/abajo
			if (paddleCenter < ballCenter - 35) {
				//0.7 para que sea un poco mas lenta y humana (y se le pueda ganar)
				player2.y += player2.speed * 0.7;
			} else if (paddleCenter > ballCenter + 35) {
				player2.y -= player2.speed * 0.7;
			}

			//limites de la IA (muy importante)
			if (player2.y < 0)
				player2.y = 0;
			if (player2.y > CANVAS_HEIGHT - player2.height) {
				player2.y = CANVAS_HEIGHT - player2.height;
			}

		} else {
			//modo 1v1: player2 con flechas
			if (keys.ArrowUp && player2.y > 0) {
				player2.y -= player2.speed;
			}
			if (keys.ArrowDown && player2.y < CANVAS_HEIGHT - player2.height) {
				player2.y += player2.speed;
			}
		}
	}
}

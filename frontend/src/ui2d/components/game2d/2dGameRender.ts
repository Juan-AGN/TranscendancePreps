//file que dibujea todo loq vemos //lee los estados de player1 ballm gamestade etc.. y lo pintamos.

import type { Ball, Paddle, Game2dState, Game2DMode } from './2dGameState';
//importamos solo los tipos
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './2dGameConfig';
//importamos constantes del juego(sizes and colores)

export class Game2dRenderer {
	//ctx = context of CanvasRenderingContext2d(pincel)
	//provate comoc en c++ solo se usa dentro de l clase
	// // contiene todas las funciones para dibujar (fillRect, arc, fillText...)
	private ctx: CanvasRenderingContext2D; 
	//CRC2D  es parte de la canvas API(clase interna del navegador)
	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	// x, y → posición
	// w, h → tamaño
	// color → color de relleno... // lo usan palas fondo red etc..
	private drawRec(x:number, y: number, w:number, h: number, color:string): void {
		this.ctx.fillStyle = color;			//fillstyle = color actual del pincel
		this.ctx.fillRect(x, y, w, h);		//fillrect pinta un rec en el canvas
	}

	//r radio.
	private drawCircle(x: number, y: number, r: number, color: string): void {
		this.ctx.fillStyle = color;				//color actual
		this.ctx.beginPath();					//empezamos un cmaino nuevo para no mezclar
		this.ctx.arc(x, y, r, 0, Math.PI * 2);	//pintamos un circulo 0 a 2pi circulo completo
		this.ctx.fill();						//rellena la forma que hemos definido
	}

	//size por defecto 50 // textalgin por defecto centro
	private drawText(text: string, x: number, y: number, color: string = COLORS.foreground,
			size: number = 40, align: CanvasTextAlign = 'center') : void {
		this.ctx.fillStyle = color;
		this.ctx.font = `${size}px monospace`;
		this.ctx.textAlign = align;
		this.ctx.fillText(text, x,y);
	}

	// recorremos todo el alto del canvas// i es la posición vertical
	private drawNet(): void {
		for (let i = 0; i < CANVAS_HEIGHT; i += 2) {
			this.drawRec(CANVAS_WIDTH / 2 - 2,	// po horizontal centro
				i,								// pos vertical
				4,								// ancho
				10,								// alto
				COLORS.net);					// color de la red
		}
	}


	//renderizamos el juego //metodo que pinta un frame(render(fotograma))
	render (player1: Paddle, player2: Paddle, ball: Ball, gameState: Game2dState, gameMode: Game2DMode): void {

		this.drawRec(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background);
		//para borrar el frame anterior y evitar rstros

		this.drawNet();		//dibuja elemnos fijos(red)

		this.drawRec(player1.x, player1.y, player1.width, player1.height, COLORS.foreground);
		this.drawRec(player2.x, player2.y, player2.width, player2.height, COLORS.foreground);

		this.drawCircle(ball.x, ball.y, ball.radius, COLORS.foreground);

		// Dibujar controles en la parte inferior
		this.ctx.font = '14px monospace';
		
		// Lado izquierdo (Player 1 o IA)
		if (gameMode === 'spectator') {
			this.drawText('IA', 60, CANVAS_HEIGHT - 20, COLORS.text, 14, 'left');
		} else {
			this.drawText('W/S', 60, CANVAS_HEIGHT + 2, COLORS.text, 14, 'left');
		}
		
		// Lado derecho (Player 2 o IA)
		if (gameMode === '1v1') {
			this.drawText('↑/↓', CANVAS_WIDTH - 0, CANVAS_HEIGHT - 20, COLORS.text, 14, 'right');
		} else {
			this.drawText('IA', CANVAS_WIDTH - 60, CANVAS_HEIGHT - 20, COLORS.text, 14, 'right');
		}

		// Mensajes de estado
		if (!gameState.isPlaying && !gameState.winner) {
			this.drawText(
				'PRESS SPACE TO START', 
				CANVAS_WIDTH / 2, 
				CANVAS_HEIGHT / 2, 
				COLORS.text, 
				24
			);
		}

		if (gameState.isPaused) {
			this.drawText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, COLORS.foreground, 48);
			this.drawText(
				'Press SPACE to resume',
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2 + 40,
				COLORS.text,
				20
			);
		}
		
		if (gameState.winner) {
			this.drawText(
				`${gameState.winner} WINS!`,
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2,
				COLORS.foreground,
				48
			);
			this.drawText(
				'Press R to restart',
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2 + 50,
				COLORS.text,
				20
			);
		}
	}
}
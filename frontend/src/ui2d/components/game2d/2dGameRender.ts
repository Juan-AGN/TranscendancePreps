// ┌────────────────────────────────────────────────────────────┐
// │                       2dGameRender.ts                      │
// ├────────────────────────────────────────────────────────────┤
// │ Draws every visual element of the local 2D game canvas.    │
// │ It renders the background, net, paddles, ball, trail and   │
// │ state messages. Physics and input are handled elsewhere.   │
// └────────────────────────────────────────────────────────────┘

import type { Ball, Paddle, Game2dState } from './2dGameState';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './2dGameConfig';
import { useDisplay2dStore } from '../../../shared/store/display2dSettingsStore';
import type { TFunction } from 'i18next';

// This file renders everything we see on the canvas.
// It reads the current state of the paddles, ball and game state, then paints the corresponding frame.

// ════════ FCT CLASS: Game2dRenderer: Paint the current 2D game frame on canvas. ════════
export class Game2dRenderer {

	private ctx: CanvasRenderingContext2D;			// ctx = CanvasRenderingContext2D, the "brush" used to draw on the canvas.
	// Stores the last ball positions to draw the trail effect.
	private trailPositions: { x: number; y: number }[] = [];
	// CanvasRenderingContext2D is part of the browser Canvas API.
	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	// STEP 1: Draw a filled rectangle.
	// Draws a rectangle. // x, y -> position // w, h -> size // color -> fill color
	private drawRec(x:number, y: number, w:number, h: number, color:string): void {
		this.ctx.fillStyle = color;	
		this.ctx.fillRect(x, y, w, h);
	}

	// STEP 2: Draw a filled circle. // r -> radius
	private drawCircle(x: number, y: number, r: number, color: string): void {
		this.ctx.fillStyle = color;				
		this.ctx.beginPath();					
		this.ctx.arc(x, y, r, 0, Math.PI * 2);
		this.ctx.fill();						
	}

	// STEP 3: Draw text with a shared canvas text style. // Default size is 40px and default alignment is center.
	private drawText(text: string, x: number, y: number, color: string = COLORS.foreground,
			size: number = 40, align: CanvasTextAlign = 'center') : void {
		this.ctx.fillStyle = color;
		this.ctx.font = `${size}px monospace`;
		this.ctx.textAlign = align;
		this.ctx.fillText(text, x,y);
	}

	// STEP 4: Draw the dashed center net.
	private drawNet(): void {
		for (let i = 0; i < CANVAS_HEIGHT; i += 2) {
			this.drawRec(CANVAS_WIDTH / 2 - 2,
				i,								
				4,								
				10,								
				COLORS.net);				
		}
	}

	// STEP 5: Render one complete frame of the game.
	render( player1: Paddle, player2: Paddle, ball: Ball, gameState: Game2dState, t: TFunction): void {
		// Read visual settings from the store.
		// Outside React components, Zustand stores are read with .getState().
		const { ballColor, paddleColor, ballTrail } = useDisplay2dStore.getState();
		// Clear the previous frame by drawing the background again.
		this.drawRec(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, COLORS.background);
		// Draw fixed elements.
		this.drawNet();	
		// Ball trail effect. // Stores recent ball positions and draws them with decreasing opacity.
		if (ballTrail) {
			this.trailPositions.push({ x: ball.x, y: ball.y });
			if (this.trailPositions.length > 8) this.trailPositions.shift();
			this.trailPositions.forEach((pos, i) => {
				const alpha = (i + 1) / this.trailPositions.length * 0.4;
				this.ctx.globalAlpha = alpha;
				this.drawCircle(pos.x, pos.y, ball.radius * 0.7, ballColor);
			});
			this.ctx.globalAlpha = 1;
		} else {
			this.trailPositions = [];
		}
		// Draw paddles.
		this.drawRec(player1.x, player1.y, player1.width, player1.height, paddleColor);
		this.drawRec(player2.x, player2.y, player2.width, player2.height, paddleColor);
		// Draw ball.
		this.drawCircle(ball.x, ball.y, ball.radius, ballColor);


		this.ctx.font = '14px monospace';
		
		// Draw state messages.
		if (!gameState.isPlaying && !gameState.winner) {
			this.drawText(
				t('arcade2d.canvas.pressSpaceToStart'),
				CANVAS_WIDTH / 2, 
				CANVAS_HEIGHT / 2, 
				COLORS.text, 
				24
			);
		}

		if (gameState.isPaused) {
			this.drawText(t('arcade2d.canvas.paused'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, COLORS.foreground, 48);
			this.drawText(
				t('arcade2d.canvas.pressSpaceToResume'),
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2 + 40,
				COLORS.text,
				20
			);
		}
		
		if (gameState.winner) {
			this.drawText(
				t('arcade2d.canvas.playerWins', { player: gameState.winner }),
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2,
				COLORS.foreground,
				48
			);
			this.drawText(
				t('arcade2d.canvas.pressRToRestart'),
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2 + 50,
				COLORS.text,
				20
			);
		}
	}
}
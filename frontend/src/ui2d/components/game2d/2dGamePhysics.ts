// ┌────────────────────────────────────────────────────────────┐
// │                       2dGamePhysics.ts                     │
// ├────────────────────────────────────────────────────────────┤
// │ Updates the 2D game physics and gameplay logic.            │
// │ It moves paddles and ball, detects collisions, bounces     │
// │ and score events. Rendering is handled by another layer.   │
// └────────────────────────────────────────────────────────────┘
import type { Ball, Paddle, Keys, Game2DMode } from './2dGameState';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BALL_SPEED_INCREMENT } from './2dGameConfig';
import { use2dGameSettingsStore, BALL_SPEED_MAP } from '../../../shared/store/game2dSettingsStore';
import { useDisplay2dStore, BALL_SIZE_MAP } from '../../../shared/store/display2dSettingsStore';

// Centralizes the physics and logic of the 2D Pong game.
// It only moves entities, checks collisions, handles rebounds and detects points.
// The game loop passes ball, paddles, keys and mode, and this class mutates them.

// ════════ FCT CLASS: GamePhysics: Calculate movement, collisions and scoring. ════════
export class GamePhysics {
	// STEP 1: Reset the ball to the center and apply the selected speed/settings.
	static resetBall(ball: Ball, direction: 1 | -1 = 1): void {
		// Place the ball in the center of the canvas.
		ball.x = CANVAS_WIDTH / 2;
		ball.y = CANVAS_HEIGHT / 2;
		// Reset the speed using the current player setting.
		const { ballSpeed } = use2dGameSettingsStore.getState();
		ball.speed = BALL_SPEED_MAP[ballSpeed as keyof typeof BALL_SPEED_MAP];
		// Update the radius in case the player changed the ball size setting.
		const { ballSize } = useDisplay2dStore.getState();
		ball.radius = BALL_SIZE_MAP[ballSize];
		// Add a small random angle so the ball does not always move straight.
		// Math.random() gives [0..1), so this creates a range around 0.
		const randomAngle = (Math.random() - 0.5) * Math.PI / 4;
		// velocityX and velocityY are the movement steps applied every frame.
		// cos controls X, sin controls Y, and direction chooses left or right.
		ball.velocityX = direction * ball.speed * Math.cos(randomAngle);
		ball.velocityY = ball.speed * Math.sin(randomAngle);
	}
	// STEP 2: Check if the circular ball overlaps a rectangular paddle.
	static checkCollision(ball: Ball, paddle: Paddle): boolean {
		return (
			ball.x - ball.radius < paddle.x + paddle.width &&		
			ball.x + ball.radius > paddle.x &&						
			ball.y - ball.radius < paddle.y + paddle.height &&		
			ball.y + ball.radius > paddle.y							
		);
	}
	// STEP 3: Move the ball, resolve wall/paddle collisions and detect scoring.
	static updateBall(ball: Ball, player1: Paddle, player2: Paddle, onScore: (player: 1 | 2) => void): void {
		// Move the ball by adding its velocity to its position.
		ball.x += ball.velocityX;
		ball.y += ball.velocityY;
		// Top wall collision.
		// Clamp the position to avoid the ball getting stuck inside the wall.
		if (ball.y - ball.radius <= 0) {
			ball.y = ball.radius;						
			ball.velocityY = Math.abs(ball.velocityY);
		}
		// Bottom wall collision.
		if (ball.y + ball.radius >= CANVAS_HEIGHT) {
			ball.y = CANVAS_HEIGHT - ball.radius;	
			ball.velocityY = -Math.abs(ball.velocityY);
		}

		// Player 1 paddle collision.
		if (this.checkCollision(ball, player1)) {
			// Distance between the hit point and the paddle center.
			const collidePoint = ball.y - (player1.y + player1.height / 2);
			// Normalize the hit point into the range [-1..1].
			const normalizedCollidePoint = collidePoint / (player1.height / 2);
			// Maximum bounce angle is 45 degrees.
			const bounceAngle = normalizedCollidePoint * (Math.PI / 4);
			// Player 1 is on the left, so the ball must go to the right.
			ball.velocityX = ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);
			// Slightly increase speed after each paddle hit.
			ball.speed += BALL_SPEED_INCREMENT;
			// Push the ball outside the paddle to avoid double collision.
			ball.x = player1.x + player1.width + ball.radius;
		}
		// Player 2 paddle collision.
		if (this.checkCollision(ball, player2)) {

			const collidePoint = ball.y - (player2.y + player2.height / 2);
			const normalizedCollidePoint = collidePoint / (player2.height / 2);
			const bounceAngle = normalizedCollidePoint * (Math.PI / 4);

			ball.velocityX = -ball.speed * Math.cos(bounceAngle);
			ball.velocityY = ball.speed * Math.sin(bounceAngle);
			ball.speed += BALL_SPEED_INCREMENT;
			ball.x = player2.x - ball.radius;
		}

		// Score detection: left side means point for player 2.
		if (ball.x - ball.radius <= 0) {
			onScore(2);
		}
		// Score detection: right side means point for player 1.
		if (ball.x + ball.radius >= CANVAS_WIDTH) {
			onScore(1);
		}
	}

	// STEP 4: Move paddles according to keyboard input, AI or spectator mode.
	static updatePaddles(player1: Paddle, player2: Paddle, keys: Keys, ball: Ball, gameMode: Game2DMode): void {
		// PLAYER 1
		if (gameMode === 'spectator') {
			// Spectator mode: player 1 is also controlled by AI/pc
			const paddleCenter = player1.y + player1.height / 2;
			const ballCenter = ball.y;

			if (paddleCenter < ballCenter - 35) {
				player1.y += player1.speed * 0.65;
			} else if (paddleCenter > ballCenter + 35) {
				player1.y -= player1.speed * 0.65;
			}
			// Keep player 1 inside the canvas.
			if (player1.y < 0)
				player1.y = 0;
			if (player1.y > CANVAS_HEIGHT - player1.height) {
				player1.y = CANVAS_HEIGHT - player1.height;
			}
		} else {
			// Normal modes: player 1 uses W/S.
			if (keys.w && player1.y > 0) {
				player1.y -= player1.speed;
			}
			if (keys.s && player1.y < CANVAS_HEIGHT - player1.height) {
				player1.y += player1.speed;
			}
		}

		// PLAYER 2 / AIPC
		if (gameMode === '1vIA' || gameMode === 'spectator') {
			// Simple AIPC: tries to align the paddle center with the ball.
			const paddleCenter = player2.y + player2.height / 2;
			const ballCenter = ball.y;					
			// Deadzone prevents the AIPC from vibrating for tiny differences.
			if (paddleCenter < ballCenter - 35) {
				player2.y += player2.speed * 0.7;
			} else if (paddleCenter > ballCenter + 35) {
				player2.y -= player2.speed * 0.7;
			}

			// Keep player 2 inside the canvas.
			if (player2.y < 0)
				player2.y = 0;
			if (player2.y > CANVAS_HEIGHT - player2.height) {
				player2.y = CANVAS_HEIGHT - player2.height;
			}

		} else {
			// 1v1 mode: player 2 uses arrow keys.
			if (keys.ArrowUp && player2.y > 0) {
				player2.y -= player2.speed;
			}
			if (keys.ArrowDown && player2.y < CANVAS_HEIGHT - player2.height) {
				player2.y += player2.speed;
			}
		}
	}
}

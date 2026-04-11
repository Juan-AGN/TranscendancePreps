//file para definir la estruct de datos del juego 2d... tipado TS

export interface Paddle {
    x: number;					//posx en el juego
    y: number;					//posy en el juego
    width: number;				//ancho pala
    height: number;				//alto pala
    speed: number;				//velocity
    score: number;				//punt player
}

export interface Ball {
	x: number;
	y:	number;
	radius: number;
	velocityX: number;
	velocityY: number;
	speed: number;
}

export interface Game2dState {
	isPlaying: boolean;
	isPaused: boolean;
	winner: string | null;
}

export interface Keys {
	w: boolean;
	s: boolean;
	ArrowUp : boolean;
	ArrowDown: boolean;
}

export type  Game2DMode = '1v1' | '1vIA' | 'spectator';

export interface Game2dCanvasProps {
	gameMode?: Game2DMode;
	maxScore?: number;
	onGameEnd?: (winner: string, player1Score: number, player2Score: number) => void;
	onScoreChange?: (player1Score: number, player2Score: number) => void;
}
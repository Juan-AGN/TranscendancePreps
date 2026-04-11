//game2d configuracion // este archivo tiene la configuracion de las constantes globlaes del juego2d
//podemos ajustad difficultad sin tocar la logica.

//sys de coordenadas internas, todas las colisiones se calculan sobre 800x600 de momento 4:3 clasico arcade
export const CANVAS_WIDTH = 500
export const CANVAS_HEIGHT = 380

//palas
export const PADDLE_WIDTH = 10				//ancho horizontal de la pala..afecta area de colision y apariencia visual
export const PADDLE_HEIGHT = 100			//altura d ela pala
export const PADDLE_SPEED = 5				// velocidad de la pala

//pelota
export const BALL_RADIUS = 9			//dibjar circulo, calcular colisiones y rebotes contra paredes
export const BALL_INITIAL_SPEED = 5		//velocidad inicial de la peltoa
export const BALL_SPEED_INCREMENT = 0.5		//Inc velocidad de la pelota tras cada rebote

//game reglas
export const MAX_SCORE = 5					//puntuacino

//render loop config
export const FPS = 60						//frames x seg
export const FRAME_DURATION = 1000 / FPS	//duracion de cada frame 1000 = 1seg. 100/60 = 16.66 ms

//Visual Tema(colores)
export const COLORS = {
	background: '#020000',					//color del canvas
	foreground: '#70ee31',					//color palas and ball
	net: '#5aa932',						//color red
	text: '#fffcfc',						//color tesxto				
} as const;									//as const-> valores inmutables. tipos son literales exactos(no simplemente strings)

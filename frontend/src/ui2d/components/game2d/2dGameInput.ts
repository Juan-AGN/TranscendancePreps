// INPUT HANDLING //file que gestiona las teclas del jugador (input de teclado)
//aqui NO movemos nada directamente (eso lo hace physics) solo cambiamos flags (keys) y estado del juego (isPlaying, isPaused, etc.)
//the idea: escuchamos eventos del teclado y mutamos el objeto keys y cuando hay cambios de estado (start/pause) usamos el callback onStateChange
//importamos solo tipos TS (no genera JS en runtime)
import type { Keys, Game2dState } from './2dGameState';
//exportamos clase GameInput //a diferencia de Physics, aqui SI necesitamos memoria interna
//porque guardamos referencia a keys y al estado actual
export class GameInput {
	//objeto keys compartido con el game loop (flags true/false)
	private keys: Keys;

	//callback para avisar a quien controla el estado (ej: React)
	//Partial<GameState> => podemos cambiar solo una parte del estado
	private onStateChange: (newState: Partial<Game2dState>) => void;

	//estado actual del juego (isPlaying, isPaused, winner...)
	private currentState: Game2dState;

	//constructor: recibe referencias externas
	//NO creamos keys aqui, solo usamos el que ya existe
	constructor(
		keys: Keys,
		currentState: Game2dState,
		onStateChange: (newState: Partial<Game2dState>) => void
	) {
		this.keys = keys;						//referencia al objeto keys
		this.currentState = currentState;		//estado actual
		this.onStateChange = onStateChange;		//funcion para notificar cambios
	}

	// KEY DOWN
	//se ejecuta cuando una tecla se PRESIONA //ej: window.addEventListener('keydown', handleKeyDown)
	handleKeyDown = (e: KeyboardEvent): void => {
		// -------- MOVIMIENTO PALAS --------
		//si pulsamos W o w => subir pala jugador1
		if (e.key === 'w' || e.key === 'W')
			this.keys.w = true;

		//si pulsamos S o s => bajar pala jugador1
		if (e.key === 's' || e.key === 'S')
			this.keys.s = true;

		//ArrowUp => subir pala jugador2
		//preventDefault para que no haga scroll la pagina
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			this.keys.ArrowUp = true;
		}

		//ArrowDown => bajar pala jugador2
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			this.keys.ArrowDown = true;
		}

		// -------- CONTROL DEL JUEGO (SPACE) --------
		//barra espaciadora sirve para: //- empezar partida //- pausar //- reanudar
		if (e.key === ' ' || e.key === 'Spacebar') {

			e.preventDefault(); //evitamos scroll o comportamiento raro

		//si no esta jugando y no hay ganador => empezar partida
		if (!this.currentState.isPlaying && !this.currentState.winner) {
			this.onStateChange({
				isPlaying: true,
				isPaused: false
			});
		}
		//si ya esta jugando => toggle pause
		else if (this.currentState.isPlaying) {
			this.onStateChange({
				isPaused: !this.currentState.isPaused
			});
		}
	}

	// -------- ESCAPE PARA PAUSAR --------
	//si esta jugando y pulsas ESC => pausa directa
	if (e.key === 'Escape') {
		if (this.currentState.isPlaying) {
			this.onStateChange({
				isPaused: true
			});
		}
	}
};

	// KEY UP
	//se ejecuta cuando soltamos la tecla
	//importante: si no hacemos esto, la pala seguiria moviendose forever
	handleKeyUp = (e: KeyboardEvent): void => {

		//cuando soltamos W => dejamos de subir
		if (e.key === 'w' || e.key === 'W') this.keys.w = false;

		//cuando soltamos S => dejamos de bajar
		if (e.key === 's' || e.key === 'S') this.keys.s = false;

		//cuando soltamos flecha arriba
		if (e.key === 'ArrowUp') this.keys.ArrowUp = false;

		//cuando soltamos flecha abajo
		if (e.key === 'ArrowDown') this.keys.ArrowDown = false;
	};

	// UPDATE STATE
	//cuando el estado cambia fuera (ej: en React) //necesitamos actualizar la copia interna
	updateState(newState: Game2dState): void {
		this.currentState = newState;
	}
}

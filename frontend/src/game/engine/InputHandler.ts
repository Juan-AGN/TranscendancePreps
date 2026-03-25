// MANEJADOR DE INPUT DEL TECLADO
// Esta clase escucha y guarda q teclas estan siendo presionadas en tiempo real. 
// Es como un "estado global" del teclado del jugador.
// Otras clases pueden preguntarle "esta W presionada?" y responde true/false.
export class KeyboardInput {
	// Diccionario q guarda el estado de cada tecla: true = presionada, false = soltada
	// Lo usamos como objeto pq es mas rapido buscar keys['w'] q recorrer un array
	private keyStates: { [key: string]: boolean } = {};

	// Guardamos las referencias a las funciones de eventos pa poder eliminarlas despues
	// Si no las guardamos, no podriamos hacer removeEventListener() correctamente en dispose()
	private onKeyDown: (e: KeyboardEvent) => void;
	private onKeyUp: (e: KeyboardEvent) => void;

	// Constructor: se ejecuta auto al hacer new InputHandler()
	// Aqui inicializamos todo lo necesario pa empezar a escuchar el teclado
	constructor() {
		// bind(this) es crucial: hace q dentro de handleKeyDown, 'this' siga siendo InputHandler
		// Si no lo hacemos, 'this' seria window y no podriamos acceder a this.keys
		this.onKeyDown = this.handleKeyDown.bind(this);
		this.onKeyUp = this.handleKeyUp.bind(this);

		// Activamos los listeners del teclado
		this.setupKeyboardListeners();
	}

	// Config inicial de los listeners de eventos del teclado
	// window.addEventListener escucha TODOS los eventos de teclado en toda la ventana
	// (no solo en el canvas, sino en TODO el navegador mientras esta pestaña este activa)
	private setupKeyboardListeners(): void {
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}

	// Se ejecuta cada vez q el user PRESIONA una tecla
	// e.key contiene el nombre de la tecla: "w", "ArrowUp", etc.
	private handleKeyDown(e: KeyboardEvent): void {
		// Solo procesamos las teclas q nos interesan pa el juego
		// WASD pa movimiento alternativo + Flechas pa movimiento clasico
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
			e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' ||
			e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {

			// preventDefault() evita el comportamiento por defecto del navegador
			// Sin esto, las flechas harian scroll en la pagina (muy molesto durante el juego)
			e.preventDefault();

			// Normalizams la tecla a un formato consistente:
			// - Si es flecha, dejamos "ArrowUp", "ArrowLeft", etc. tal cual
			// - Si es letra, la convertimos a minuscula: "W" → "w", "A" → "a"
			// Esto evita tener q comprobar mayusculas y minusculas por separado
			const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();

			// Marcamos la tecla como presionada (true)
			this.keyStates[key] = true;
		}
	}

	// Se ejecuta cada vez q el user SUELTA una tecla
	// Es simetrico a handleKeyDown pero marca la tecla como false (no presionada)
	private handleKeyUp(e: KeyboardEvent): void {
		// Mismas teclas q en keydown: WASD + flechas
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
			e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' ||
			e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {

			// Prevenimos comportamiento por defecto (scroll con flechas)
			e.preventDefault();

			// Normalizamos igual q en keydown
			const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();

			// Marcamos la tecla como NO presionada (false)
			this.keyStates[key] = false;
		}
	}

	// LIMPIEZA Y DESTRUCCION (muy importante pa evitar memory leaks)
	// Este metodo se debe llamar cuando ya no necesitemos el InputHandler
	// (por ejemplo, al salir del juego o cambiar de escena)
	public dispose(): void {
		// Eliminamos los listeners del window
		// Si no hacemos esto, seguirian escuchando PA SIEMPRE incluso si destruimos el objeto
		// Esto causaria fugas de memoria y comportamientos raros
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);

		// Vaciamos el diccionario de teclas pa liberar memoria
		this.keyStates = {};
	}

	// Metodo PUBLICO pa q otras clases consulten si una tecla esta presionada
	// Ejemplo de uso: inputHandler.isKeyPressed('w') → true si W esta siendo presionada
	public isKeyPressed(key: string): boolean {
		// Devolvemos el estado de la tecla, o false si no existe en el diccionario
		// El || false evita q devolvamos undefined (mas seguro)
		return this.keyStates[key] || false;
	}

	// Metodo PUBLICO q devuelve TODO el diccionario de teclas
	// Util pa debugging o pa sistemas q quieran leer multiples teclas a la vez
	// Ejemplo: const allKeys = inputHandler.getKeys(); console.log(allKeys);
	public getKeyStates(): { [key: string]: boolean } {
		return this.keyStates;
	}
}
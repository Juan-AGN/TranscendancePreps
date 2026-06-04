// CAMERA CONFIG -- config base de la camara (limites + posicion inicial)
// aqui solo definimos COMO empieza y hasta donde puede ir
// NO hay movimiento aqui, solo valores base

export const CAMERA_CONFIG = {
	minZoomDistance: 15,				// zoom minimo → camara pegada al personae
	maxZoomDistance: 80,				// zoom maximo → camara super lejos (modo dron)

	minVerticalAngle: Math.PI / 6,	// limite abajo → no puede mirar demasiado al suelo
	maxVerticalAngle: Math.PI / 2.1,	// limite arriba → no puede mirar al cielo del todo

	initialHorizontalAngle: -Math.PI / 2, // hacia donde mira al empezar (giro inicial)
	initialVerticalAngle: Math.PI / 3,    // inclinacion inicial (ni muy arriba ni muy abajo)
	initialDistance: 35,                 // distancia inicial al personaje (valor equilibrado)
} as const;

// CAMERA DYNAMICS -- comportamiento en tiempo real
// aqui ya va la shisha: movimiento, follow, zoom automatico y scroll

export const CAMERA_DYNAMICS = {

	// ===== CONTROL MANUAL (teclado) =====
	// que tan rapido gira o inclina la camara con WASD
	horizontalSpeed: 0.03,   // velocidad al girar izquierda/derecha (A/D)
	verticalSpeed: 0.03,     // velocidad al mirar arriba/abajo (W/S)


	// ===== FOLLOW =====
	// lo suave que sigue al personaje (tipo lerp)
	// bajo = suave pero lento, alto = rapido pero brusco
	followSmoothness: 0.12,  // valor equilibrado

	// ===== ZOOM DINAMICO =====
	// la camara se adapta sola segun lo cerca que haya cosas
	zoom: {

		defaultDistance: 35,    // distancia normal cuando no pasa nada raro

		closeDistance: 30,      // se acerca si hay cosas cerca (pa ver mejor)
		farDistance: 40,        // se aleja si hay espacio (pa ver mas mapa)

		zoomInDistance: 15,     // si estas MUY cerca → empieza a acercarse fuerte
		zoomMinDistance: 25,    // zona intermedia → suaviza transicion
		zoomOutDistance: 30,    // empieza a alejarse cuando hay sitio

		zoomSmoothness: 0.05,   // suavizado del zoom (bajo = mantequilla, alto = brusco)
	},


	// ===== RUEDA DEL RATON =====
	// control manual con scroll (override del automatico)
	wheel: {

		zoomSpeed: 2,            // cuanto cambia la distancia por scroll
		wheelSensitivity: 0.01,  // sensibilidad del scroll (deltaY → zoom)
		autoResumeDelayMs: 2500, // tiempo de espera antes de devolver control al zoom automatico
		autoReturnSmoothness: 0.02, // que tan suave vuelve tras usar la rueda

		minDistance: 15,         // limite minimo (no atravesar al personaje)
		maxDistance: 80,         // limite maximo (dont go a Marte)
	},
} as const;


// ===== MINI DICCIONARIO =====

// lerp -> interpolacion suave entre valores (movimiento progresivo)
// deltaY -> valor que da el scroll (cuanto has girado la rueda)
// as const -> bloquea los valores (TypeScript no deja modificarlos)
// dynamic -> cosas que cambian en tiempo real

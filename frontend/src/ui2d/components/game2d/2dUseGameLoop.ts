//Este file es el mini motor del Pong2D, director de orquesta*un custom hook que monta y mantiene vivo el bucle(loop(conecta input-fisca-render))
// evistamos usar React State para posiciones(freidura viva) (haria re-render(aporta rendiminto y fluidez))
// ARQUITECTURA DEL MOTOR 2D // Este hook separa 
		// 1) Mundo React (UI, estados, props, callbacks)
		// 2) Mundo Motor (loop imperativo, física, render manual)
// React solo gestiona: - gameState - props - callbacks
// El motor gestiona:
// - loop continuo (requestAnimationFrame) - física (GamePhysics) - render (Game2dRenderer) - input (GameInput)
// Ambos mundos se sincronizan mediante:
// - refs (estado interno mutable)
// - useEffect con dependencias

import { useEffect, useRef } from "react";
//aqui Effec->	React Funct.. q ejecuta el codigo cuando el componente se motna(aparece en pantalla),cuando cambia(gameState) o desmonta(listeners)
				// para arrancar el loop, registrar eventos y limpiar
//aqui Ref->	Tool React para guardar valores q cambia sin provocar rerender
				//creamos una cajito q save un valor mutable, xonst x = UseRef(0)-> x.current es el valor real( asi no rerendizamos)
				//guardameos la id del animation frame/tiempo anterior(deltatime)/instancias(inputs,renderer/estado act del game)
import type { MutableRefObject, RefObject } from "react";
// Mutable..->	Referencia q apunta al elemento real del DOM
				//nos permite acceder al canvas real del navegador par apoder dibujar usando el contecto 2d
				//sin esto no podriamos obtner el context 2d no podriamos renderizar el juego manualmente
//RefOb..->		Un ref es una cja persistente q vive entre renderers y no provoca rerenderes cuando cambia /mutacion silenciosa->React no monitoriza cambios en .current
				// al usar Useref en vez de Usestate cambia .current y react no re-renderiza
				// RefObject<T>  delvuelve:(es un obj con forma {current : T})
//dif-> RefObject se usa para DOM-timers-id,instancia clases,persis values,gamemotor/modifica:react/puede ser null -- 
		//MUtable->estado interno mutable/modificable por mi mismo/ normalmente no es null.
import { GamePhysics } from "./2dGamePhysics";
import { Game2dRenderer } from "./2dGameRender";
import { GameInput } from "./2dGameInput";
import { FRAME_DURATION } from "./2dGameConfig";
import type { Paddle, Ball, Keys, Game2dState, Game2DMode } from "./2dGameState";

//definimos el contrato que debe tener el hook..
interface Use2dGameLoopProps {
	canvasRef: RefObject<HTMLCanvasElement | null>;	//Ref al canvas.React renderiza el canvas->asig el elemento a canvasRef.current
													//react no da acceso directo al DOM, el canvas se crea despues del render/el hook no puede acc al DOM x si solo
	player1Ref: MutableRefObject<Paddle>;			//Ref al state del player1/Mutable pq .current lo modifico yo constantenmente/<Paddle> interface de la pala
	player2Ref: MutableRefObject<Paddle>;			//ref igual/ vamos a mutar posiciones,socre a 60fps
	ballRef: MutableRefObject<Ball>;				//ref igual/ inputs de teclas mutables
	keysRef: MutableRefObject<Keys>;
	gameState: Game2dState;							//NoRef->game2dstate viene de React(states,Zustand,useSate)/ es el estado del flujo del juego(cambia pocas veces)
													//y cuando cambia we want q se actulize el motor
	gameMode: Game2DMode;							//igual cambia segun el string q tenemos.
	maxScore: number;
	onScore: (player: 1 | 2) => void;				//funcioncallback(cuando se detect gol, call esta func.) (1 o 2 players),no devuelve nada-- cambia el estado del juego
	onStateChange: (newState: Partial<Game2dState>) => void;//estado(pause,winner,isplaying.etc..)/partial(helper type-> obj q solo puede tener alguna propiedades de Gane2dState
	onRestart: () => void;							//Ccallback para reiniciar(r key o winner)
}

//hook//desestrucutamos=> const canvasRef= props.canvasRef;
export function use2dGameLoop({
	canvasRef, player1Ref, player2Ref, ballRef, keysRef,
	gameState,gameMode, onScore, onStateChange, onRestart }: Use2dGameLoopProps) { //:Use2dGameLoopProps (tiene q cumplir el tipado(debe tenerlos si o si))
		//definimos el mundoReact(ui,estados,props,callback) y mundo motor(loops,fisica,render,input)
		//las ref const seran siempre el mismo ref. pero ...ref.current cambia al crear la instancia
		const animationFrameRef = useRef<number | undefined>(undefined);//controla loop//guardamos el id//crea con useRef la cja persistente(current)//id para poden cancel//
																		//.current puede ser numero o undefined(no hay Animationframe aun)
		const lastTimeRef = useRef<number>(0);					//controla timing//guardamos el tiempo del frame anterior//useRef sera numero//inicial a 0
		const rendererRef = useRef<Game2dRenderer | null>(null);//controla render//guard.. 1 instancia de la clase game2drenderer// esta clase se encarga de
																//limpiar canvas, dibujar palasm bola, y texto// .current puede ser null al principio
		const inputHandlerRef = useRef<GameInput | null>(null);
		const gameStateRef = useRef<Game2dState>(gameState);

		//hook q ejecuta el codigo cuando el componente ya esta montado en el DOM/cuando cambien dependencias o se desmonta.// end con []->una vez
		useEffect(() => {
			const canvas = canvasRef.current;	//sacamos el elemento real del DOM del ref.//canvasRef.current = <HTMLCanvasElement>
			if (!canvas)
				return;

			const ctx = canvas.getContext("2d"); //getContext es 1 metodo propio de HTMLCanvaElement("2d" tipo 2d clasico)
			if (!ctx)				//este devuelve un objeto tipo CanvasrenderingContext2d(API navegador q tiene metodos como fillRec,arc,fill etc..)
				return;				//reserva un buffer interno de pixel->asocia system coordenandas->crear obj(CanvasRenderingContext2d)->lo devuelve cada vez que llamos ctx.fillRec().

			rendererRef.current = new Game2dRenderer(ctx);	//creamos un new object pasandole el contexto de 2d canvas guardado dentro de un ref
															//reserva memoria--ejecuta el constructor-asigan this.ctx=ctx// el hook tiene el ctx
			inputHandlerRef.current = new GameInput(keysRef.current, gameState, onStateChange); //creamos un new object a partir de Gameinput
															//lo conectamos con react y el motor/Da acceso= 1.teclas.2.estadodeljuego.3.permiso pra cambiar estado.y la save en un ref
			const handleRestartKey = (event: KeyboardEvent) => {								//creamos la variable para el restart.
				if ((event.key === "r" || event.key === "R") && gameStateRef.current.winner) {		//creamos(event) como parametro(objeto evento)
					onRestart();
				}
			};
			
			//heart del motor //funcion (recibe como parametro currenttime(lo crea el navegador el timestamp(numero)))
			// Flujo interno de cada frame: // 1) Control del tiempo (deltaTime + FRAME_DURATION)
											// 2) Update (solo si isPlaying && !isPaused)
											// 3) Render (siempre)
											// // INPUT → UPDATE → RENDER (classic patron d cualquier motor de videojuego.

			// IMPORTANTE: Usamos refs en vez de useState porque:
			// - useState provocaría re-render 60 veces por segundo
			// // Las refs permiten 1 mutasion silenciosa (.current) sin provocar re-render del componente.			
			const gameLoop = (currentTime: number) => {
				animationFrameRef.current = requestAnimationFrame(gameLoop); //requestAni... forma parte del navegador(API)
														//guardamos el id en el ref animation current//
														//cada vez que termina un frame se vuelve a llmar(gameloop(timestamp))
				
				// currentTime -> lo manda el navegador automatic cada vez que ejecuta gameLoop
				// representa el tiempo actual (en milisegundos) desde que la ppage empezo
				// lastTimeRef.current -> es el tiempo del last frame que SI procesamos
				// lo guardamos para poder comparar con el tiempo actual
				// deltaTime -> diferencia entre ahora y el ultimo frame valido
				// esto nos dice cuanto tiempo REAL ha pasado
				const deltaTime = currentTime - lastTimeRef.current;
				
				// FRAME_DURATION -> es el tiempo ideal que queremos que dure cada frame
				// ejemplo: si queremos 60fps → 1000ms / 60 ≈ 16.67ms
				// si aun no ha pasado suficiente tiempo para un frame completo,no actualizamos física ni renderizamos
				// esto evita que el juego vaya más rápido en monitores de 120hz o 144hz
				if (deltaTime < FRAME_DURATION)
					return; // salimos de este frame (pero el siguiente ya esta programado)
				
				
				lastTimeRef.current = currentTime - (deltaTime % FRAME_DURATION);
				// aqui se actualiz el tiempo base para el siguiente calculo
				// deltaTime % FRAME_DURATION -> resto de milisegundos que sobran
				// ejemplo: si deltaTime = 18ms y FRAME_DURATION = 16ms → sobra 2ms
				// si no restaramos el sobrante, perderíamos esos milisegundos y el juego se desincronizaria con el time
				// por eso ajustamos el ultimo tiempo procesado restando el sobrante
				
				const currentGameState = gameStateRef.current; // obtenemos el estado ACTUAL del juego desde el ref
													// gameStateRef.current -> siempre contiene la versión más reciente del estado
													// lo guardamos en una variable local para no escribir .current todo el tiempo
				
				// solo actualizamos la logica(physics) si: el juego esta en modo playing y NO esta pausado							
				if (currentGameState.isPlaying && !currentGameState.isPaused) {

					// actualizamos las palas
					// player1Ref.current-> obj Paddle del jugador 1 (pos, veloci, score)
					// player2Ref.current-> obj Paddle del jugador 2
					// keysRef.current ->estado actual del teclado (q teclas estn pulsadas)
					// ballRef.current ->obj bola (se pasa porque puede influir en IA)
					// gameMode -> define si es 1v1, 1vIA, spectator (la phisic cambia segun modo)
					GamePhysics.updatePaddles(player1Ref.current, player2Ref.current, keysRef.current,
						ballRef.current, gameMode);
					
					//lomismo con la bola
					GamePhysics.updateBall(ballRef.current, player1Ref.current, player2Ref.current, onScore);
				}
				
				// siempre renderizamos el frame act.. aunq el juego este pause o haya winner
				// porque necesitamos dibujar el estado visual (marcador, winner, pausa, etc.)
				if (rendererRef.current) {
					// render(...) -> dibuja TODO en el canvas,recibe: 
					// - player1-player2-ball- currentGameState(pra saber si mostrar winner o pausa)
					// - gameMode (puede afectar UI)
					rendererRef.current.render(player1Ref.current, player2Ref.current,
						ballRef.current, currentGameState, gameMode);
				}
			};
			
			//arrancamos el bucle princiapl del juego
			//requestAnimationFrame-> l dice al nave. que ejecute gameLoop en el siguiente frame
			//devuelve un ID(number) q identifica ese frame programado y lo save en animationFrameRef.current pra poder cancelarlo desp.		
			animationFrameRef.current = requestAnimationFrame(gameLoop);
			
			//listeners de teclado..// actualizmos los keysRef.current
			window.addEventListener("keydown", inputHandlerRef.current.handleKeyDown);
			window.addEventListener("keyup", inputHandlerRef.current.handleKeyUp);
			window.addEventListener("keydown", handleRestartKey);
			
			// return dentro de useEffect = func de limpieza(cleanup)
			// React ejecuta esto automatci cuando el componente se desmonta, para apagar el motor correct y evitar memory leaks
			return () => {
				if (animationFrameRef.current) { //si existe un frame programado
					cancelAnimationFrame(animationFrameRef.current);
					// animationFrameRef.current -> ID del último requestAnimationFrame
					// cancelAnimationFrame(...) -> detiene el bucle del juego
					// sin this el loop seguiria ejecutandose en segundo plano
				}

				if (inputHandlerRef.current) { //si existe el manejador de input(GameInput)//quitamos los listeners de teclado
					window.removeEventListener("keydown", inputHandlerRef.current.handleKeyDown);
					window.removeEventListener("keyup", inputHandlerRef.current.handleKeyUp);
				}
				// quitamos tb el listener especificc de reinicio (tecla R)
				// si no lo quitamos, seguiri activo aunque el juego ya no este montado
				window.removeEventListener("keydown", handleRestartKey);
			};
		}, []); // solo se ejec una vez
		
		// IMPORTANTE// El gameLoop se crea una sola vez (useEffect con [])
		// Eso signif. q si usaramos directamente gameState dentro del loop, se quedaria congelado en su valor inicial.
		// Por eso usamos gameStateRef: // sincronizamos React → Motor cada vez que cambia el estado.
		// [gameState] -> dependencia: si el estado cambia, React ejecuta este bloqu		
		useEffect(() => {
			gameStateRef.current = gameState;//actualiz el ref interno con el estado + reciente
			
			// si ya existe el manejador de input (GameInput) le pasamos el nuevo estado del juego
			// esto permite que el input se adapte a cambios como:- pausa- start- winner
			if (inputHandlerRef.current) {
				inputHandlerRef.current.updateState(gameState);
			}
		}, [gameState]); // ejecuatamos este effec cada vez q cambie el gamestate(array d dependencias)
}

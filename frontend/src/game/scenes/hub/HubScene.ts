//  HubScene orchestrator principal de la escena 3D del Hub
//  Coordina Engine, Scene, Controllers, Setup, Managers e Interactions
//  Es el cerebro q conecta todas las partes del juego 3D

import { Engine, Scene, Color3, DracoCompression, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB
// Configuracion Draco (compresion de modelos 3D pa reducir tamaño)
DracoCompression.Configuration.decoder = {
	wasmUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js',
	wasmBinaryUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm',
	fallbackUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js'
};

// Core (sistemas basicos)
import { CameraController } from '../../engine/CameraController';
import { KeyboardInput } from '../../engine/InputHandler';
// Setup (configuracion inicial del entorno)
import { LightingSetup } from './setup/LightingSetup';
import { EnvironmentSetup } from './setup/EnvironmentSetup';
// Interaction (sistemas de interaccion)
import { HubObjectClickHandler } from '../../engine/HubObjectClickHandler';
import { PlayerMovement } from '../../player/PlayerMovement';
import { CollisionSystem } from '../../physics/CollisionSystem';
// Effects y sistemas de proximidad
import { GlowEffectManager } from '../../effects/HighlightEffect';
import { ProximitySystem } from '../../physics/ProximitySystem';
import { GameLoop } from '../../engine/GameLoop';
// Managers (gestores de entidades)
import { HubSceneBuilder } from './HubSceneBuilder';
import { HologramController } from '../../effects/HologramController';

// Clase molde pa crear la escena 3D del Hub {cerebro del juego}
export class HubScene {
	private canvas: HTMLCanvasElement;  // canvas HTML donde se dibuja el 3D
	private engine: Engine;             // motor grafico de babylon
	private scene: Scene;               // escena 3D donde viven los objetos

	// Controllers (controladores de camara e input)
	private cameraController!: CameraController;    // controla la camara (pos, rotacion, zoom)
	private inputHandler!: KeyboardInput;            // detecta teclas presionadas
	private clickHandler!: HubObjectClickHandler;        // gestiona clicks en objetos 3D
	private playerMovement!: PlayerMovement;         // controla movimiento del personaje
	private collisionSystem!: CollisionSystem;       // detecta colisiones con obstaculos
	private glowEffect!: GlowEffectManager;          // gestiona el aura/brillo de objetos
	private proximitySystem!: ProximitySystem;       // detecta proximidad y activa efectos
	private gameLoop!: GameLoop;                     // logica del juego por frame (input, movimiento, zoom)

	// Setup (sistemas de configuracion)
	private lightingSetup!: LightingSetup;           // luces y sombras
	private environmentSetup!: EnvironmentSetup;     // suelo y HDRI

	// Scene Builder (gestor de todas las entidades)
	private sceneBuilder!: HubSceneBuilder;          // crea y gestiona todos los objetos 3D

	// Progress tracking (seguimiento de carga)
	private onProgress?: (loaded: number, total: number) => void;  // callback pa actualizar barra de carga
	private onWindowResize?: () => void;             // callback pa resize de ventana
	private onPanelOpen?: (panelId: string) => void; // callback pa abrir panel react


	private hologramManager: HologramController = new HologramController();

	constructor(canvasId: string, onProgress?: (loaded: number, total: number) => void, onPanelOpen?: (panelId: string) => void) {
		this.onProgress = onProgress;   // guardamos el callback de progreso de carga
		this.onPanelOpen = onPanelOpen; // guardamos el callback pa notificar a React q abra un panel
		// Buscamos el canvas en el DOM x su id
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;

		// Si no existe el canvas, lanzamos error
		if (!this.canvas) {
			throw new Error(`Canvas con id "${canvasId}" no encontrado`);
		}

		// Creamos el motor grafico de babylon
		// true -> antialiasing activado (suaviza bordes)
		this.engine = new Engine(this.canvas, true);
		// Creamos la escena 3D
		this.scene = new Scene(this.engine);

		// Fondo gris claro pa reflejos (clearColor es el color del cielo)
		this.scene.clearColor = new Color3(0.95, 0.95, 0.95).toColor4();

		// Inicializacion sincrona (setup basico)
		this.initialize();
	}

	 //Inicializa todos los sist del juego en orden correcto
	 //  1.Entorno 2.Controles 3.Menu 4.Entities 5.GameLoop 6.RenderLoop 
	private async initialize(): Promise<void> {
		// private: solo se puede llamar desde dentro de HomeScene3D
		// async: es asincrono (puede usar await)

		// 1. Setup basico del entorno (luces, sombras, suelo, HDRI)
		this.setupEnvironment();

		// 2. Setup de controles de input y camara
		this.setupControls();

		// 3. Setup de interacciones de menu
		// le pasamos la escena y una funcion pa navegar entre rutas
		this.clickHandler = new HubObjectClickHandler(this.scene, (route) => this.redirectTo(route));

		// 4. Inicializamos scene builder (gestor de entidades)
		this.sceneBuilder = new HubSceneBuilder(
			this.scene,                                      // escena donde crear objetos
			this.lightingSetup.getShadowGenerator(),        // sist de sombras
			this.clickHandler                               // sist de menu
		);

		// 5. Creamos personaje
		// le pasamos un callback q se ejecuta cuando el personaje carga
		this.collisionSystem = new CollisionSystem(this.scene, 1.5);

		// efectos de proximidad: GlowEffectManager crea la layer, ProximitySystem gestiona distancias
		this.glowEffect = new GlowEffectManager(this.scene);
		this.proximitySystem = new ProximitySystem(this.glowEffect);

		// el game loop se crea aqui pero el movimiento se asigna despues (cuando carga el personaje)
		this.gameLoop = new GameLoop(
			this.scene,
			this.inputHandler,
			this.cameraController,
			this.sceneBuilder,
			this.proximitySystem
		);

		this.sceneBuilder.createCharacter((character) => {
			// Creamos el sist de movimiento del personaje
			this.playerMovement = new PlayerMovement(
				character,                  // personaje a mover
				this.cameraController,      // camara pa calcular direcciones
				this.inputHandler,          // input pa detectar teclas
				this.collisionSystem,       // sist de colisiones
				Vector3.Zero()             // pos inicial (0,0,0)
			);
			// avisamos al game loop q el personaje ya existe y puede moverse
			this.gameLoop.setCharacterMovement(this.playerMovement);

			// Añadimos el personaje como proyector de sombras
			const mesh = character.getMesh();
			if (mesh) {
				this.lightingSetup.getShadowGenerator()?.addShadowCaster(mesh);
			}
		});

		// 6. Creamos objetos del menu (prepara tareas pero no carga aun)
		// objetos interactivos (townhouse, trophy, etc)
		this.sceneBuilder.createNavigationObjects((route) => this.redirectTo(route));
		// objetos decorativos (pingpong, torre, etc)
		this.sceneBuilder.createDecorationObjects();

		this.gameLoop.start();         // logica del juego (cada frame)
		this.startRendering();         // dibujado (cada frame)
	}

	// Configura los controles de input y camara 
	private setupControls(): void {
		this.inputHandler = new KeyboardInput();  // crea el detector de teclas
		this.cameraController = new CameraController(this.scene);  // crea el controlador de camara
		this.cameraController.enableMouseControl(this.canvas);  // conecta la camara al canvas
		this.cameraController.setupWheelZoom(this.canvas);  // activa zoom con rueda del raton
	}

	// Configura el entorno (luces, sombras, suelo, HDRI) 
	private setupEnvironment(): void {
		// Luces y sombras
		this.lightingSetup = new LightingSetup(this.scene);  // crea el sist de iluminacion
		this.lightingSetup.setupLights();  // configura las luces de la escena

		// Suelo y HDRI (imagen 360 del entorno)
		this.environmentSetup = new EnvironmentSetup(this.scene);  // crea el sist de entorno
		this.environmentSetup.setupGround();  // crea el suelo
		this.environmentSetup.setupHDRI();    // carga la imagen HDRI pa reflejos
	}

	// Redirige a una ruta o abre un panel react segun el prefijo
	// rutas con 'panel:' (ej: 'panel:settings') → disparan onPanelOpen en React (overlay encima del 3D)
	// rutas normales (ej: '/game') → navegacion dura con window.location.href
	private redirectTo(route: string): void {
		if (route.startsWith('panel:')) {
			// 'panel:settings' → slice(6) → 'settings' → React abre el panel correcto
			this.onPanelOpen?.(route.slice('panel:'.length));
		} else {
			// ruta normal → navegacion al estilo SPA
			window.location.href = route;
		}
	}

	// Inicia el render loop (dibujado continuo de la escena) 
	private startRendering(): void {
		// runRenderLoop -> ejecuta la func cada frame (60fps aprox)
		this.engine.runRenderLoop(() => {
			this.scene.render();  // dibuja la escena
		});

		// Listener de resize (pa q el canvas se adapte al tamaño de ventana)
		this.onWindowResize = () => this.engine.resize();  // redimensiona el motor
		window.addEventListener('resize', this.onWindowResize);  // escucha cambios de tamaño
	}

	// Ejecuta todas las tareas de carga y reporta progreso
	// Debe ser llamado DESPUES de initialize() 
	public async loadAssets(): Promise<void> {
		await this.sceneBuilder.executeLoadTasks(this.onProgress);
		this.hologramManager.setup(this.scene, this.sceneBuilder, this.proximitySystem);
	}

	// Limpia todos los recursos y listeners (pa evitar memory leaks) 
	public dispose(): void {
		// Limpiamos listener de resize
		if (this.onWindowResize) {
			window.removeEventListener('resize', this.onWindowResize);
		}
		// Detach controles de camara (desconecta del canvas)
		if (this.cameraController) {
			this.cameraController.disableMouseControl();
		}
		// Limpiamos input handler (quita listeners de teclado)
		if (this.inputHandler) {
			this.inputHandler.dispose();
		}
		// Dispose hologramas
		this.hologramManager.dispose();
		// Dispose scene y engine (libera memoria)
		this.scene.dispose();   // destruye la escena
		this.engine.dispose();  // destruye el motor
	}
}
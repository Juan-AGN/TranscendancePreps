/**
 * HomeScene3D orchestrator principal de la escena 3D del Hub
 * Coordina Engine, Scene, Controllers, Setup, Managers e Interactions
 * Es el cerebro q conecta todas las partes del juego 3D
 */

import { Engine, Scene, Color3, DracoCompression, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // importamos el loader de archivos glTF/GLB

// Configuracion Draco (compresion de modelos 3D pa reducir tamaño)
DracoCompression.Configuration.decoder = {
    wasmUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js',
    wasmBinaryUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm',
    fallbackUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js'
};

// Core (sistemas basicos)
import { CameraController } from '../core/CameraController';
import { InputHandler } from '../core/InputHandler';

// Setup (configuracion inicial del entorno)
import { LightingSetup } from '../setup/LightingSetup';
import { EnvironmentSetup } from '../setup/EnvironmentSetup';

// Interaction (sistemas de interaccion)
import { MenuInteraction } from '../interaction/MenuInteraction';
import { CharacterMovement } from '../interaction/CharacterMovement';

// Managers (gestores de entidades)
import { SceneEntityManager } from '../managers/SceneEntityManager';

// Clase molde pa crear la escena 3D del Hub {cerebro del juego}
export class HomeScene3D {
    private canvas: HTMLCanvasElement;  // canvas HTML donde se dibuja el 3D
    private engine: Engine;             // motor grafico de babylon
    private scene: Scene;               // escena 3D donde viven los objetos
    
    // Controllers (controladores de camara e input)
    private cameraController!: CameraController;    // controla la camara (pos, rotacion, zoom)
    private inputHandler!: InputHandler;            // detecta teclas presionadas
    private menuInteraction!: MenuInteraction;      // gestiona clicks en objetos 3D
    private characterMovement!: CharacterMovement;  // controla movimiento del personaje
    // ! -> assertion de TS q dice "confiamos en q esto se inicializa antes de usarse"
    
    // Setup (sistemas de configuracion)
    private lightingSetup!: LightingSetup;          // luces y sombras
    private environmentSetup!: EnvironmentSetup;    // suelo y HDRI
    
    // Entity Manager (gestor de todas las entidades)
    private entityManager!: SceneEntityManager;     // crea y gestiona todos los objetos 3D
    
    // Progress tracking (seguimiento de carga)
    private onProgress?: (loaded: number, total: number) => void;  // callback pa actualizar barra de carga
    private _onResize?: () => void;  // callback pa resize de ventana

    constructor(canvasId: string, onProgress?: (loaded: number, total: number) => void) {
        this.onProgress = onProgress;  // guardamos el callback de progreso
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

    /** Inicializa todos los sist del juego en orden correcto
      * 1.Entorno 2.Controles 3.Menu 4.Entities 5.GameLoop 6.RenderLoop */
    private async initialize(): Promise<void> {
        // private: solo se puede llamar desde dentro de HomeScene3D
        // async: es asincrono (puede usar await)
        
        // 1. Setup basico del entorno (luces, sombras, suelo, HDRI)
        this.setupEnvironment();
        
        // 2. Setup de controles de input y camara
        this.setupControls();
        
        // 3. Setup de interacciones de menu
        // le pasamos la escena y una funcion pa navegar entre rutas
        this.menuInteraction = new MenuInteraction(this.scene, (route) => this.navigate(route));
        
        // 4. Inicializamos entity manager (gestor de entidades)
        this.entityManager = new SceneEntityManager(
            this.scene,                                      // escena donde crear objetos
            this.lightingSetup.getShadowGenerator(),        // sist de sombras
            this.menuInteraction                            // sist de menu
        );
        
        // 5. Creamos personaje
        // le pasamos un callback q se ejecuta cuando el personaje carga
        this.entityManager.createCharacter((character) => {
            // Creamos el sist de movimiento del personaje
            this.characterMovement = new CharacterMovement(
                character,                  // personaje a mover
                this.cameraController,      // camara pa calcular direcciones
                this.inputHandler,          // input pa detectar teclas
                Vector3.Zero()             // pos inicial (0,0,0)
            );
            
            // Añadimos el personaje como proyector de sombras
            const mesh = character.getMesh();
            if (mesh) {
                this.lightingSetup.getShadowGenerator()?.addShadowCaster(mesh);
            }
        });
        
        // 6. Creamos objetos del menu (prepara tareas pero no carga aun)
        // objetos interactivos (townhouse, trophy, etc)
        this.entityManager.createNavigationObjects((route) => this.navigate(route));
        // objetos decorativos (pingpong, torre, etc)
        this.entityManager.createDecorationObjects();
        
        // 7. Iniciamos game loop y render loop
        this.startGameLoop();      // logica del juego (cada frame)
        this.startRenderLoop();    // dibujado (cada frame)
    }
    
    /** Configura los controles de input y camara */
    private setupControls(): void {
        this.inputHandler = new InputHandler();  // crea el detector de teclas
        this.cameraController = new CameraController(this.scene);  // crea el controlador de camara
        this.cameraController.attachControl(this.canvas);  // conecta la camara al canvas
        this.cameraController.setupWheelZoom(this.canvas);  // activa zoom con rueda del raton
    }

    /** Configura el entorno (luces, sombras, suelo, HDRI) */
    private setupEnvironment(): void {
        // Luces y sombras
        this.lightingSetup = new LightingSetup(this.scene);  // crea el sist de iluminacion
        this.lightingSetup.setupLights();  // configura las luces de la escena
        
        // Suelo y HDRI (imagen 360 del entorno)
        this.environmentSetup = new EnvironmentSetup(this.scene);  // crea el sist de entorno
        this.environmentSetup.setupGround();  // crea el suelo
        this.environmentSetup.setupHDRI();    // carga la imagen HDRI pa reflejos
    }

    /** Inicia el game loop (logica del juego q se ejecuta cada frame) */
    private startGameLoop(): void {
        // registerBeforeRender -> registra func q se ejecuta antes de cada render
        this.scene.registerBeforeRender(() => {
            // Obtenemos el personaje y el sist de movimiento
            const character = this.entityManager?.character;
            if (!character || !this.characterMovement) return;  // si no existen, salimos

            // Rotar camara con A/D
            if (this.inputHandler.isKeyPressed('a')) {
                this.cameraController.rotate('left');  // rota camara a la izquierda
            }
            if (this.inputHandler.isKeyPressed('d')) {
                this.cameraController.rotate('right');  // rota camara a la derecha
            }

            // Inclinar camara con W/S
            if (this.inputHandler.isKeyPressed('w')) {
                this.cameraController.tilt('down'); // W = mirar mas arriba
            }
            if (this.inputHandler.isKeyPressed('s')) {
                this.cameraController.tilt('up'); // S = mirar mas abajo
            }

            // Actualizamos movimiento del personaje (velocidad 0.3)
            this.characterMovement.update(0.3);

            // Camara sigue al personaje
            const characterPos = character.getPosition();
            this.cameraController.followTarget(characterPos);

            // Zoom dinamico segun proximidad a objetos
            // Calculamos la distancia a TODOS los meshes de la escena (no solo menu)
            let minDistance = 999;  // distancia inicial muy grande
            
            // Recorremos todos los meshes de la escena
            for (const mesh of this.scene.meshes) {
                // Ignoramos el suelo, el personaje mismo, y meshes sin nombre
                if (mesh.name !== 'ground' && 
                    mesh.name !== 'stickman' && 
                    !mesh.name.includes('__root__') &&
                    mesh.name !== '') {
                    // Calculamos distancia entre personaje y este objeto
                    const distance = Vector3.Distance(characterPos, mesh.position);
                    if (distance < minDistance && distance > 1) {  // > 1 para ignorar partes del propio personaje
                        minDistance = distance;
                        // Log solo cuando cambia significativamente
                        if (Math.abs(distance - minDistance) > 5) {
                            console.log('🎯 Objeto cercano:', mesh.name, 'distancia:', distance.toFixed(1));
                        }
                    }
                }
            }
            
            // aplicamos zoom segun distancia al objeto mas cercano
            this.cameraController.dynamicZoom(minDistance);

            // Rotamos trofeo continuamente
            if (this.entityManager?.trophy) {
                this.entityManager.trophy.rotate(0.01);  // 0.01 radianes x frame
            }
        });
    }

    /** Navega a una ruta usando window.location */
    private navigate(route: string): void {
        // En React Router DOM 7, usamos window.location pa navegacion
        window.location.href = route;
    }

    /** Inicia el render loop (dibujado continuo de la escena) */
    private startRenderLoop(): void {
        // runRenderLoop -> ejecuta la func cada frame (60fps aprox)
        this.engine.runRenderLoop(() => {
            this.scene.render();  // dibuja la escena
        });

        // Listener de resize (pa q el canvas se adapte al tamaño de ventana)
        this._onResize = () => this.engine.resize();  // redimensiona el motor
        window.addEventListener('resize', this._onResize);  // escucha cambios de tamaño
    }

    /** Ejecuta todas las tareas de carga y reporta progreso
      * Debe ser llamado DESPUES de initialize() */
    public async loadAssets(): Promise<void> {
        // ejecutamos todas las tareas de carga del entityManager
        // le pasamos el callback de progreso pa actualizar la barra
        await this.entityManager.executeLoadTasks(this.onProgress);
    }

    /** Limpia todos los recursos y listeners (pa evitar memory leaks) */
    public dispose(): void {
        // Limpiamos listener de resize
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
        }
        
        // Detach controles de camara (desconecta del canvas)
        if (this.cameraController) {
            this.cameraController.detachControl();
        }
        
        // Limpiamos input handler (quita listeners de teclado)
        if (this.inputHandler) {
            this.inputHandler.dispose();
        }
        
        // Dispose scene y engine (libera memoria)
        this.scene.dispose();   // destruye la escena
        this.engine.dispose();  // destruye el motor
    }
}
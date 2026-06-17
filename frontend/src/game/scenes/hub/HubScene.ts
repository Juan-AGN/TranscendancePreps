// ┌────────────────────────────────────────────────────────────┐
// │                    HubScene.ts                             │
// ├────────────────────────────────────────────────────────────┤
// │ Main orchestrator for the Hub 3D scene lifecycle.         │
// │ Coordinates engine, scene, systems, setup and interactions│
// │ Connects all core gameplay subsystems together.           │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import Babylon core and scene systems
import { Engine, Scene, Color3, DracoCompression, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';  // GLTF/GLB loader
// Draco configuration (compressed 3D model decoding)
// Important: models compressed with Draco need these decoder files.
// Future improvement: move these files to /public/draco to avoid external network dependency.
DracoCompression.Configuration.decoder = {
	wasmUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js',
	wasmBinaryUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm',
	fallbackUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js'};
// Core systems
import { CameraController } from '../../engine/CameraController';
import { KeyboardInput } from '../../engine/InputHandler';
// Setup systems
import { LightingSetup } from './setup/LightingSetup';
import { EnvironmentSetup } from './setup/EnvironmentSetup';
// Interaction systems
import { HubObjectClickHandler } from '../../engine/HubObjectClickHandler';
import { PlayerMovement } from '../../player/PlayerMovement';
import { CollisionSystem } from '../../physics/CollisionSystem';
// Effects and proximity systems
import { GlowEffectManager } from '../../effects/HighlightEffect';
import { ProximitySystem } from '../../physics/ProximitySystem';
import { GameLoop } from '../../engine/GameLoop';
// Entity managers
import { HubSceneBuilder } from './HubSceneBuilder';
import { HologramController } from '../../effects/HologramController';

import { SkySetup } from '../../config/SkySetup';
import { GroundSetup } from '../../config/GroundSetup';

const ENABLE_HDRI = false; // false to control firefox warnigns glb

// STEP 2: Define Hub scene orchestrator class
export class HubScene {
	private canvas: HTMLCanvasElement;  // HTML canvas where 3D is rendered
	private engine: Engine;             // Babylon render engine
	private scene: Scene;               // Scene where 3D objects exist
	// Controllers and runtime systems
	private cameraController!: CameraController;    // Camera behavior (position, rotation, zoom)
	private inputHandler!: KeyboardInput;            // Keyboard input state manager
	private clickHandler!: HubObjectClickHandler;        // 3D clickable object handler
	private playerMovement!: PlayerMovement;         // Character movement controller
	private collisionSystem!: CollisionSystem;       // Collision checks against obstacles
	private glowEffect!: GlowEffectManager;          // Object glow/aura manager
	private proximitySystem!: ProximitySystem;       // Proximity detection and activation
	private gameLoop!: GameLoop;                     // Per-frame gameplay logic
	// Setup systems
	private lightingSetup!: LightingSetup;           // Lights and shadows
	private environmentSetup!: EnvironmentSetup;     // Ground and HDRI
	private skySetup!: SkySetup; // Sky setup
	private groundSetup!: GroundSetup;
	// Scene builder (all scene entities)
	private sceneBuilder!: HubSceneBuilder;          // Creates and manages 3D objects
	// Progress and external callbacks
	private onProgress?: (loaded: number, total: number, label: string) => void;  // Loading progress callback
	private onWindowResize?: () => void;             // Window resize callback
	private onPanelOpen?: (panelId: string) => void; // React panel open callback
	private hologramManager: HologramController = new HologramController();
	// STEP 3: Build engine/scene and run base initialization
	constructor(canvasId: string, onProgress?: (loaded: number, total: number, label: string) => void, onPanelOpen?: (panelId: string) => void) {
		this.onProgress = onProgress;   // Store loading progress callback
		this.onPanelOpen = onPanelOpen; // Store callback to notify React panel opening
		// Resolve canvas element by id
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		// Throw if canvas is missing
		if (!this.canvas) {
			throw new Error(`Canvas id "${canvasId}" not founded`);
		}
		// Create Babylon engine
		// true => antialiasing enabled
		this.engine = new Engine(this.canvas, true);
		// Create scene
		this.scene = new Scene(this.engine);
		// Set scene clear color (background)
		this.scene.clearColor = new Color3(1, 0, 0).toColor4();
		// Run base setup initialization
		this.initialize();
	}

	// STEP 4: Initialize all systems in dependency-safe order
	// 1) Environment 2) Controls 3) Menu 4) Entities 5) GameLoop 6) RenderLoop
	private async initialize(): Promise<void> {
		// private => internal-only call // async => allows await-based setup

		// 1) Basic environment setup (lights, shadows, ground, HDRI)
		this.setupEnvironment();
		// 2) Input and camera controls setup
		this.setupControls();
		// 3) Menu interaction setup
		// Pass scene plus route redirection callback
		this.clickHandler = new HubObjectClickHandler(this.scene, (route) => this.redirectTo(route));
		// 4) Initialize scene builder (entity manager)
		this.sceneBuilder = new HubSceneBuilder(
			this.scene,                                      // Target scene
			this.lightingSetup.getShadowGenerator(),        // Shadow system
			this.clickHandler                               // Menu interaction system
		);
		// 5) Create character and runtime systems
		this.collisionSystem = new CollisionSystem(this.scene, 1.5);
		// Proximity effects: GlowEffectManager creates layer, ProximitySystem manages ranges
		this.glowEffect = new GlowEffectManager(this.scene);
		this.proximitySystem = new ProximitySystem(this.glowEffect);
		// Game loop is created now, character movement is assigned after character load
		this.gameLoop = new GameLoop(
			this.scene,
			this.inputHandler,
			this.cameraController,
			this.sceneBuilder,
			this.proximitySystem
		);
		this.sceneBuilder.createCharacter((character) => {
			// Create character movement system
			this.playerMovement = new PlayerMovement(
				character,                  // Character to move
				this.cameraController,      // Camera-relative direction source
				this.inputHandler,          // Input source
				this.collisionSystem,       // Collision checks
				Vector3.Zero()             // Initial position (0,0,0)
			);
			// Notify game loop that character now exists and can move
			this.gameLoop.setCharacterMovement(this.playerMovement);
			// Register character as shadow caster
			const mesh = character.getMesh();
			if (mesh) {
				this.lightingSetup.getShadowGenerator()?.addShadowCaster(mesh);
			}
		});
		// 6) Create menu/world objects (queue tasks, do not load yet)
		// Interactive objects (townhouse, trophy, etc.)
		this.sceneBuilder.createNavigationObjects();
		// Decorative objects (pingpong, tower, etc.)
		this.sceneBuilder.createDecorationObjects();
		this.gameLoop.start();         // Per-frame gameplay logic
		this.startRendering();         // Per-frame rendering
	}
	// STEP 5: Configure input and camera control systems
	private setupControls(): void {
		this.inputHandler = new KeyboardInput();  // Keyboard listener setup
		this.cameraController = new CameraController(this.scene);  // Camera controller setup
		this.cameraController.enableMouseControl(this.canvas);  // Bind camera controls to canvas
	}
	// STEP 6: Configure environment (lights, shadows, ground, HDRI)
	private setupEnvironment(): void {
		// Lights and shadows
		this.lightingSetup = new LightingSetup(this.scene);  // Create lighting system
		this.lightingSetup.setupLights();  // Configure scene lights
		// Ground and HDRI
		this.environmentSetup = new EnvironmentSetup(this.scene);  // Create environment system
		//this.environmentSetup.setupGround();  // Create ground (disabled here)
		if (ENABLE_HDRI) {
			this.environmentSetup.setupHDRI();    // Load HDRI reflections/ambient light
		}
		this.skySetup = new SkySetup(this.scene);
		this.skySetup.setupSkybox();
		this.groundSetup = new GroundSetup(this.scene);
		this.groundSetup.create();
	}
	// STEP 7: Route interaction requests to React panels or URL navigation
	// Routes with prefix 'panel:' trigger React overlay opening
	// Standard routes trigger direct location navigation
	private redirectTo(route: string): void {
		if (route.startsWith('panel:')) {
			// 'panel:settings' -> 'settings' panel id
			this.onPanelOpen?.(route.slice('panel:'.length));
		} else {
			// Standard route navigation
			window.location.href = route;
		}
	}
	// STEP 8: Start render loop and subscribe resize behavior
	private startRendering(): void {
		// runRenderLoop executes callback every frame (~60 FPS)
		this.engine.runRenderLoop(() => {
			this.scene.render();  // Render scene frame
		});
		// Resize listener keeps engine viewport synced with window
		this.onWindowResize = () => this.engine.resize();  // Resize engine
		window.addEventListener('resize', this.onWindowResize);  // Listen for size changes
	}
	// STEP 9: Execute queued asset loads and initialize holograms
	// Must be called after initialize()
	public async loadAssets(): Promise<void> {
		await this.sceneBuilder.executeLoadTasks(this.onProgress);
		this.hologramManager.setup(this.scene, this.sceneBuilder, this.proximitySystem);
	}
	// STEP 10: Dispose resources and listeners to prevent leaks
	public dispose(): void {
		// Remove resize listener
		if (this.onWindowResize) {
			window.removeEventListener('resize', this.onWindowResize);
		}
		// Detach camera controls from canvas
		if (this.cameraController) {
			this.cameraController.disableMouseControl();
		}
		// Dispose input handler (removes keyboard listeners)
		if (this.inputHandler) {
			this.inputHandler.dispose();
		}
		if (this.skySetup) {
			this.skySetup.dispose();
		}
		// Dispose holograms
		this.hologramManager.dispose();		
		// Dispose scene and engine
		this.scene.dispose();   // Destroy scene
		this.engine.dispose();  // Destroy engine
	}
}
// ===== MINI DICTIONARY =====
// orchestrator -> class coordinating multiple subsystems
// render loop -> per-frame draw/update cycle
// callback -> function passed to be invoked later
// dispose -> explicit resource cleanup
// HDRI -> environment-based lighting/reflection source
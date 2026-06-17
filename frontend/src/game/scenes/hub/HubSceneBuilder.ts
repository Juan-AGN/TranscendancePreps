// ┌────────────────────────────────────────────────────────────┐
// │                HubSceneBuilder.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Central builder for all Hub 3D entities.                 │
// │ Queues async loading tasks through LoadingProgress.       │
// │ Builds both interactive and decorative scene objects.     │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import scene builders and runtime dependencies

import { Scene, ShadowGenerator } from '@babylonjs/core';
import { SCENE_CONFIG } from '../../config/HubConfig';
import { PlayerCharacter } from '../../player/PlayerCharacter';
import { TownHouse } from './buildings/TownHouse';
import { Trophy } from './buildings/Trophy';
import { LaFarola } from './buildings/LaFarola';
import { HubObjectsBuilder } from './builders/HubObjectsBuilder';
import { DecorativeObjectsBuilder } from './builders/DecorativeObjectsBuilder';
import type { DecorObjects } from './builders/DecorativeObjectsBuilder';
import { LoadingProgress } from './setup/LoadingProgress';
import { Arcade } from './buildings/Arcade';
import { PingPongTable } from './buildings/PingPongTable';
import { TorreMonica } from './buildings/TorreMonica';
import { LaRosaleda } from './buildings/LaRosaleda';
import { Computer } from './buildings/Computer';
import { HubObjectClickHandler } from '../../engine/HubObjectClickHandler';
import { Atrezzo } from './buildings/Atrezzo';

export class HubSceneBuilder {
	private scene: Scene;							// Babylon scene reference
	private shadowGenerator: ShadowGenerator | null;	// Shadow generation system
	private menuInteraction: HubObjectClickHandler;			// Registers clickable objects
	private loadingQueue: LoadingProgress = new LoadingProgress();	// Loading task queue

	public character: PlayerCharacter | null = null;
	public townhouse: TownHouse | null = null;	// Exposed for ProximitySystem
	public trophy: Trophy | null = null;		// Exposed for ProximitySystem
	public lafarola: LaFarola | null = null;	// Exposed for ProximitySystem
	public arcade: Arcade | null = null;		// Exposed for ProximitySystem
	public pingpong: PingPongTable | null = null;	// Exposed for ProximitySystem
	public torre: TorreMonica | null = null;	// Exposed for ProximitySystem
	public rosaleda: LaRosaleda | null = null;	// Exposed for ProximitySystem
	public computer: Computer | null = null;	// Exposed for ProximitySystem
	public pedestalPc: Atrezzo | null = null;	// Proximity reference for computer
	public pedestalArcade: Atrezzo | null = null;	// Proximity reference for arcade
	public pedestalPingpong: Atrezzo | null = null;	// Proximity reference for pingpong
	public pedestalTrophy: Atrezzo | null = null;	// Proximity reference for trophy

	// STEP 2: Store scene-level dependencies
	constructor(scene: Scene, shadowGenerator: ShadowGenerator | null, menuInteraction: HubObjectClickHandler) {
		this.scene = scene;
		this.shadowGenerator = shadowGenerator;
		this.menuInteraction = menuInteraction;
	}

	// STEP 3: Create character and queue load completion callback
	// onShadowCaster receives character once it is loaded
	public createCharacter(onShadowCaster?: (character: PlayerCharacter) => void): void {
		this.character = new PlayerCharacter(this.scene, SCENE_CONFIG.character.pos);
		this.loadingQueue.add('Loading player character', async () => {
			await this.character!.ready();
			if (this.character && onShadowCaster) {
				onShadowCaster(this.character);
			}
		});
	}

	// STEP 4: Build interactive navigation objects and connect menu interactions
	public createNavigationObjects(): void {
		const objects = HubObjectsBuilder.build(this.scene, this.shadowGenerator, this.loadingQueue, this.menuInteraction);
		this.townhouse = objects.townhouse;
		this.trophy = objects.trophy;
		this.lafarola = objects.lafarola;
		this.computer = objects.computer;
	}


	// STEP 5: Build decorative scene objects and keep references
	public createDecorationObjects(): void {
		const decor: DecorObjects = DecorativeObjectsBuilder.build(this.scene, this.shadowGenerator, this.loadingQueue);
		this.arcade = decor.arcade;
		this.pingpong = decor.pingpong;
		this.torre = decor.torre;
		this.rosaleda = decor.rosaleda;
		this.pedestalPc = decor.pedestalPc;
		this.pedestalArcade = decor.pedestalArcade;
		this.pedestalPingpong = decor.pedestalPingpong;
		this.pedestalTrophy = decor.pedestalTrophy;

		// Arcade must also behave as a clickable navigation object
		this.loadingQueue.add('Preparing arcade interaction', async () => {
			await decor.arcade.ready();
			const mesh = decor.arcade.getRootMesh();
			const route = SCENE_CONFIG.arcade.route;
			if (mesh && route) {
				this.menuInteraction.registerClickableObject(route, mesh, decor.arcade);
			}
		});

		// La Rosaleda must also trigger navigation on click
		this.loadingQueue.add('Preparing La Rosaleda interaction', async () => {
			await decor.rosaleda.ready();
			const mesh = decor.rosaleda.getRootMesh();
			const route = SCENE_CONFIG.rosaleda.route;
			if (mesh && route) {
				this.menuInteraction.registerClickableObject(route, mesh, decor.rosaleda);
			}
		});
	}

	// STEP 6: Add dynamic shadows to key buildings after load
	public addShadowsToBuildings(): void {
		this.scene.meshes.forEach((mesh) => {
			if (mesh.name.includes('TownHouse') || mesh.name.includes('Trophy')) {
				this.shadowGenerator?.addShadowCaster(mesh);
			}
		});
	}

	// STEP 7: Execute loading queue and report progress to UI
	public async executeLoadTasks(onProgress?: (loaded: number, total: number, label: string) => void): Promise<void> {
		await this.loadingQueue.execute(onProgress);
		this.addShadowsToBuildings();
	}
}

// ===== MINI DICTIONARY =====
// builder -> class dedicated to constructing scene objects
// loading queue -> ordered async tasks with progress reporting
// clickable object -> mesh linked to route/panel interaction
// shadow caster -> mesh that contributes to shadow map generation


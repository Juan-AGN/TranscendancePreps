// HubsceneBuilder — centraliza creacion y gestion de todas las entidades 3D del Hub
// usa LoadingProgress pa controlar la barra de carga
// usa MenuObjectsBuilder pa crear objetos navegables
// usa DecorObjectsBuilder pa crear objetos decorativos

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
	private scene: Scene;							// escena de babylon
	private shadowGenerator: ShadowGenerator | null;	// sistema de sombras
	private menuInteraction: HubObjectClickHandler;			// registra objetos clickables
	private loadingQueue: LoadingProgress = new LoadingProgress();	// cola de tareas de carga

	public character: PlayerCharacter | null = null;
	public townhouse: TownHouse | null = null;	// expuesto pa ProximitySystem
	public trophy: Trophy | null = null;		// expuesto pa ProximitySystem
	public lafarola: LaFarola | null = null;	// expuesto pa ProximitySystem
	public arcade: Arcade | null = null;		// expuesto pa ProximitySystem
	public pingpong: PingPongTable | null = null;	// expuesto pa ProximitySystem
	public torre: TorreMonica | null = null;	// expuesto pa ProximitySystem
	public rosaleda: LaRosaleda | null = null;	// expuesto pa ProximitySystem
	public computer: Computer | null = null;	// expuesto pa ProximitySystem
	public pedestalPc: Atrezzo | null = null;	// referencia de proximidad para computer
	public pedestalArcade: Atrezzo | null = null;	// referencia de proximidad para arcade
	public pedestalPingpong: Atrezzo | null = null;	// referencia de proximidad para pingpong
	public pedestalTrophy: Atrezzo | null = null;	// referencia de proximidad para trophy

	constructor(scene: Scene, shadowGenerator: ShadowGenerator | null, menuInteraction: HubObjectClickHandler) {
		this.scene = scene;
		this.shadowGenerator = shadowGenerator;
		this.menuInteraction = menuInteraction;
	}

	// crea el personaje y registra su carga en la cola
	// onShadowCaster -> callback pa añadir el personaje al sist de sombras cuando cargue
	public createCharacter(onShadowCaster?: (character: PlayerCharacter) => void): void {
		this.character = new PlayerCharacter(this.scene, SCENE_CONFIG.character.pos);
		this.loadingQueue.add(async () => {
			// esperamos a q el personaje cargue su GLB antes de usarlo
			await this.character!.ready();
			if (this.character && onShadowCaster) {
				onShadowCaster(this.character);
			}
		});
	}

	// crea los objetos navegables del hub y los conecta con el menu
	public createNavigationObjects(): void {
		const objects = HubObjectsBuilder.build(this.scene, this.shadowGenerator, this.loadingQueue, this.menuInteraction);
		this.townhouse = objects.townhouse;
		this.trophy    = objects.trophy;
		this.lafarola  = objects.lafarola;
		this.computer  = objects.computer;
	}

	
	// crea todos los objetos decorativos del escenario y guarda sus referencias
	public createDecorationObjects(): void {
		const decor: DecorObjects = DecorativeObjectsBuilder.build(this.scene, this.shadowGenerator, this.loadingQueue);
		this.arcade    = decor.arcade;
		this.pingpong  = decor.pingpong;
		this.torre     = decor.torre;
		this.rosaleda  = decor.rosaleda;
		this.pedestalPc = decor.pedestalPc;
		this.pedestalArcade = decor.pedestalArcade;
		this.pedestalPingpong = decor.pedestalPingpong;
		this.pedestalTrophy = decor.pedestalTrophy;
	}

	// añade sombras dinamicas a los edificios principales al terminar la carga
	public addShadowsToBuildings(): void {
		this.scene.meshes.forEach((mesh) => {
			if (mesh.name.includes('TownHouse') || mesh.name.includes('Trophy')) {
				this.shadowGenerator?.addShadowCaster(mesh);
			}
		});
	}

	// ejecuta todas las tareas de carga en orden y reporta progreso a la UI
	public async executeLoadTasks(onProgress?: (loaded: number, total: number) => void): Promise<void> {
		await this.loadingQueue.execute(onProgress);
		this.addShadowsToBuildings();
	}
}


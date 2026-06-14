// DecorObjectsBuilder — crea los objetos decorativos del hub (pingpong, torre, estadio, etc)
// estos objetos son solo visuales, no tienen interaccion de menu
// separa la construccion de decorados del SceneEntityManager pa que sea mas corto

import { Scene, ShadowGenerator } from '@babylonjs/core';
import { SCENE_CONFIG } from '../../../config/HubConfig';
import { PingPongTable } from '../buildings/PingPongTable';
import { TorreMonica } from '../buildings/TorreMonica';
import { LaRosaleda } from '../buildings/LaRosaleda';
import { Arcade } from '../buildings/Arcade';
import { Totems } from '../buildings/Totems';
import { Atrezzo } from '../buildings/Atrezzo';
import type { LoadingProgress } from '../setup/LoadingProgress';

export interface DecorObjects {
	arcade: Arcade;
	pingpong: PingPongTable;
	torre: TorreMonica;
	rosaleda: LaRosaleda;
	totemIsra: Totems;
	totemCarlos: Totems;
	totemDani: Totems;
	totemJuan: Totems;
	pedestalPc: Atrezzo;
	pedestalArcade: Atrezzo;
	pedestalPingpong: Atrezzo;
	pedestalTrophy: Atrezzo;
	streetLamps: Atrezzo[];
	palms: Atrezzo[];
	torches: Atrezzo[];
	columns: Atrezzo[];
}

export class DecorativeObjectsBuilder {
	// crea todos los decorados y registra su carga en la cola de progreso
	// retorna referencias pa que SceneEntityManager las exponga al ProximitySystem
	// queue -> LoadingProgress pa añadir cada objeto al sistema de loading
	public static build(
		scene: Scene,
		shadow: ShadowGenerator | null,
		loadingQueue: LoadingProgress
	): DecorObjects {
		// mesa de ping pong
		const pingpong = new PingPongTable(scene, SCENE_CONFIG.pingpong.pos, SCENE_CONFIG.pingpong.scale, SCENE_CONFIG.pingpong.rotation, shadow);
		loadingQueue.add('Loading ping pong table', () => pingpong.ready());

		// torre monica
		const torre = new TorreMonica(scene, SCENE_CONFIG.torre.pos, SCENE_CONFIG.torre.scale, SCENE_CONFIG.torre.rotation, shadow);
		loadingQueue.add('Loading Torre Monica', () => torre.ready());
		// estadio la rosaleda
		const rosaleda = new LaRosaleda(scene, SCENE_CONFIG.rosaleda.pos, SCENE_CONFIG.rosaleda.scale, shadow, SCENE_CONFIG.rosaleda.rotation);
		loadingQueue.add('Loading Stadium', () => rosaleda.ready());

		// arcade
		const arcade = new Arcade(scene, SCENE_CONFIG.arcade.pos, SCENE_CONFIG.arcade.scale, shadow, SCENE_CONFIG.arcade.rotation);
		loadingQueue.add('Loading Arcade 3D', () => arcade.ready());

		const totemIsra = new Totems(
			scene,
			SCENE_CONFIG.totemIsra.pos,
			SCENE_CONFIG.totemIsra.model,
			SCENE_CONFIG.totemIsra.scale,
			shadow,
			SCENE_CONFIG.totemIsra.rotation
		);
		loadingQueue.add('Loading TotemIsra',() => totemIsra.ready());

		const totemCarlos = new Totems(
			scene,
			SCENE_CONFIG.totemCarlos.pos,
			SCENE_CONFIG.totemCarlos.model,
			SCENE_CONFIG.totemCarlos.scale,
			shadow,
			SCENE_CONFIG.totemCarlos.rotation
		);
		loadingQueue.add('Loading TotemCarlos',() => totemCarlos.ready());

		const totemDani = new Totems(
			scene,
			SCENE_CONFIG.totemDani.pos,
			SCENE_CONFIG.totemDani.model,
			SCENE_CONFIG.totemDani.scale,
			shadow,
			SCENE_CONFIG.totemDani.rotation
		);
		loadingQueue.add('Loading TotemDani',() => totemDani.ready());

		const totemJuan = new Totems(
			scene,
			SCENE_CONFIG.totemJuan.pos,
			SCENE_CONFIG.totemJuan.model,
			SCENE_CONFIG.totemJuan.scale,
			shadow,
			SCENE_CONFIG.totemJuan.rotation
		);
		loadingQueue.add('Loading TotemJuan',() => totemJuan.ready());

		const pedestalPc = new Atrezzo(
			scene,
			SCENE_CONFIG.pedestalPc.pos,
			SCENE_CONFIG.pedestalPc.model,
			SCENE_CONFIG.pedestalPc.scale,
			shadow,
			SCENE_CONFIG.pedestalPc.rotation
		);
		loadingQueue.add('Loading Computer Login',() => pedestalPc.ready());

		const pedestalArcade = new Atrezzo(
			scene,
			SCENE_CONFIG.pedestalArcade.pos,
			SCENE_CONFIG.pedestalArcade.model,
			SCENE_CONFIG.pedestalArcade.scale,
			shadow,
			SCENE_CONFIG.pedestalArcade.rotation
		);
		loadingQueue.add('Loading Pedestal',() => pedestalArcade.ready());

		const pedestalPingpong = new Atrezzo(
			scene,
			SCENE_CONFIG.pedestalPingpong.pos,
			SCENE_CONFIG.pedestalPingpong.model,
			SCENE_CONFIG.pedestalPingpong.scale,
			shadow,
			SCENE_CONFIG.pedestalPingpong.rotation
		);
		loadingQueue.add('Loading Pedestal',() => pedestalPingpong.ready());

		const pedestalTrophy = new Atrezzo(
			scene,
			SCENE_CONFIG.pedestalTrophy.pos,
			SCENE_CONFIG.pedestalTrophy.model,
			SCENE_CONFIG.pedestalTrophy.scale,
			shadow,
			SCENE_CONFIG.pedestalTrophy.rotation
		);
		loadingQueue.add('Loading Pedestal',() => pedestalTrophy.ready());

		const streetLamps: Atrezzo[] = SCENE_CONFIG.streetLamps.items.map((item) => {
			const streetLamp = new Atrezzo(
				scene,
				item.pos,
				SCENE_CONFIG.streetLamps.model,
				SCENE_CONFIG.streetLamps.scale,
				shadow,
				item.rotation
			);

			loadingQueue.add('Loading Street Lamps',() => streetLamp.ready());
			return streetLamp;
		});

		const palms: Atrezzo[] = SCENE_CONFIG.palms.items.map((item) => {
			const palm = new Atrezzo(
				scene,
				item.pos,
				item.model,
				item.scale,
				shadow,
				item.rotation
			);

			loadingQueue.add('Loading Palms',() => palm.ready());
			return palm;
		});

		const torches: Atrezzo[] = SCENE_CONFIG.torches.items.map((item) => {
			const torch = new Atrezzo(
				scene,
				item.pos,
				SCENE_CONFIG.torches.model,
				SCENE_CONFIG.torches.scale,
				shadow,
				item.rotation
			);

			loadingQueue.add('Loading Torchs',() => torch.ready());
			return torch;
		});

		const columns: Atrezzo[] = SCENE_CONFIG.columns.items.map((item) => {
			const column = new Atrezzo(
				scene,
				item.pos,
				SCENE_CONFIG.columns.model,
				SCENE_CONFIG.columns.scale,
				shadow,
				item.rotation
			);

			loadingQueue.add('Loading Columns',() => column.ready());
			return column;
		});
		return {
			arcade,
			pingpong,
			torre,
			rosaleda,
			totemIsra,
			totemCarlos,
			totemDani,
			totemJuan,
			pedestalPc,
			pedestalArcade,
			pedestalPingpong,
			pedestalTrophy,
			streetLamps,
			palms,
			torches,
			columns,
		};
	}
}

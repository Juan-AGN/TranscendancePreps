// DecorObjectsBuilder — crea los objetos decorativos del hub (pingpong, torre, estadio, etc)
// estos objetos son solo visuales, no tienen interaccion de menu
// separa la construccion de decorados del SceneEntityManager pa que sea mas corto

import { Scene, ShadowGenerator } from '@babylonjs/core';
import { SCENE_CONFIG } from '../../../config/HubConfig';
import { PingPongTable } from '../buildings/PingPongTable';
import { TorreMonica } from '../buildings/TorreMonica';
import { Computer } from '../buildings/Computer';
import { LaRosaleda } from '../buildings/LaRosaleda';
import { Arcade } from '../buildings/Arcade';
import type { LoadingProgress } from '../setup/LoadingProgress';

export interface DecorObjects {
	arcade: Arcade;
	pingpong: PingPongTable;
	torre: TorreMonica;
	rosaleda: LaRosaleda;
	computer: Computer;
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
		const pingpong = new PingPongTable(scene, SCENE_CONFIG.pingpong.pos, SCENE_CONFIG.pingpong.scale, shadow);
		loadingQueue.add(() => pingpong.ready());

		// torre monica
		const torre = new TorreMonica(scene, SCENE_CONFIG.torre.pos, SCENE_CONFIG.torre.scale, shadow);
		loadingQueue.add(() => torre.ready());

		// computadora
		const computer = new Computer(scene, SCENE_CONFIG.computer.pos, SCENE_CONFIG.computer.scale, shadow);
		loadingQueue.add(() => computer.ready());

		// estadio la rosaleda
		const rosaleda = new LaRosaleda(scene, SCENE_CONFIG.rosaleda.pos, SCENE_CONFIG.rosaleda.scale, shadow, SCENE_CONFIG.rosaleda.rotation);
		loadingQueue.add(() => rosaleda.ready());

		// arcade
		const arcade = new Arcade(scene, SCENE_CONFIG.arcade.pos, SCENE_CONFIG.arcade.scale, shadow, SCENE_CONFIG.arcade.rotation);
		loadingQueue.add(() => arcade.ready());

		return { arcade, pingpong, torre, rosaleda, computer };
	}
}

// HubObjectsBuilder — crea y registra todos los objetos interactivos del hub
// para añadir un nuevo objeto clickable: crear clase + 1 linea en el array 'interactives'

import { Scene, ShadowGenerator } from '@babylonjs/core';
import { SCENE_CONFIG } from '../../../config/HubConfig';
import { TownHouse } from '../buildings/TownHouse';
import { Trophy } from '../buildings/Trophy';
import { LaFarola } from '../buildings/LaFarola';
import { Computer } from '../buildings/Computer';
import type { LoadingProgress } from '../setup/LoadingProgress';
import { HubObjectClickHandler } from '../../../engine/HubObjectClickHandler';

export interface NavigationObjects {
	townhouse: TownHouse;
	trophy: Trophy;
	lafarola: LaFarola;
	computer: Computer;
}

export class HubObjectsBuilder {
	public static build(
		scene: Scene,
		shadow: ShadowGenerator | null,
		loadingQueue: LoadingProgress,
		menuInteraction: HubObjectClickHandler
	): NavigationObjects {
		const townhouse = new TownHouse(
			scene,
			SCENE_CONFIG.townhouse.pos,
			SCENE_CONFIG.townhouse.scale,
			SCENE_CONFIG.townhouse.rotation,
			shadow
		);
		const trophy    = new Trophy(scene, SCENE_CONFIG.trophy.pos, SCENE_CONFIG.trophy.scale, shadow);
		const lafarola  = new LaFarola(scene, SCENE_CONFIG.lafarola.pos, SCENE_CONFIG.lafarola.scale, shadow, SCENE_CONFIG.lafarola.rotation);
		const computer  = new Computer(scene, SCENE_CONFIG.computer.pos, SCENE_CONFIG.computer.scale, SCENE_CONFIG.computer.rotation, shadow);

		// para añadir un objeto clickable nuevo: solo añadir 1 entrada aqui
		const interactives = [
			{ obj: townhouse, route: SCENE_CONFIG.townhouse.route },
			{ obj: trophy,    route: SCENE_CONFIG.trophy.route },
			{ obj: lafarola,  route: SCENE_CONFIG.lafarola.route },
			{ obj: computer,  route: SCENE_CONFIG.computer.route },
		];

		interactives.forEach(({ obj, route }) => {
			loadingQueue.add(async () => {
				await obj.ready();
				const mesh = obj.getRootMesh();
				if (mesh)
					menuInteraction.registerClickableObject(route, mesh, obj);
			});
		});

		return { townhouse, trophy, lafarola, computer };
	}
}

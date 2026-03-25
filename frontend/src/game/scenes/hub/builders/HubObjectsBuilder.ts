// HubObjectsBuilder — crea los objetos navegables del hub (townhouse, trophy, lafarola)
// cada objeto se conecta con su ruta de react router pa navegar al clickar
// separa la construccion de objetos del SceneEntityManager pa que sea mas corto

import { Scene, ShadowGenerator } from '@babylonjs/core';
import { SCENE_CONFIG } from '../../../config/HubConfig';
import { TownHouse } from '../buildings/TownHouse';
import { Trophy } from '../buildings/Trophy';
import { LaFarola } from '../buildings/LaFarola';

// objetos que devuelve el builder pa que SceneEntityManager guarde las referencias
export interface NavigationObjects {
	townhouse: TownHouse;
	trophy: Trophy;
	lafarola: LaFarola;
}

export class HubObjectsBuilder {
	// crea y devuelve los tres objetos navegables del hub
	// navigate -> funcion de react router pa cambiar de pagina al clickar en un objeto
	public static build(
		scene: Scene,
		shadow: ShadowGenerator | null,
		navigate: (route: string) => void
	): NavigationObjects {
		const townhouse = new TownHouse(
			scene,
			SCENE_CONFIG.townhouse.pos,
			() => navigate(SCENE_CONFIG.townhouse.route),
			shadow
		);

		const trophy = new Trophy(
			scene,
			SCENE_CONFIG.trophy.pos,
			() => navigate(SCENE_CONFIG.trophy.route),
			shadow
		);

		const lafarola = new LaFarola(
			scene,
			SCENE_CONFIG.lafarola.pos,
			SCENE_CONFIG.lafarola.scale,
			shadow,
			SCENE_CONFIG.lafarola.rotation,
			() => navigate(SCENE_CONFIG.lafarola.route)
		);

		return { townhouse, trophy, lafarola };
	}
}

// ┌────────────────────────────────────────────────────────────┐
// │               HubObjectsBuilder.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Builds and registers all interactive Hub objects.          │
// │ Connects load queue completion with click registration.    │
// │ New clickable objects are added via one interactives entry.│
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import interactive object builders and registration dependencies

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
	// STEP 2: Create interactive objects and register them in loading queue
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
		const trophy = new Trophy(scene, SCENE_CONFIG.trophy.pos, SCENE_CONFIG.trophy.scale, shadow);
		const lafarola = new LaFarola(scene, SCENE_CONFIG.lafarola.pos, SCENE_CONFIG.lafarola.scale, shadow, SCENE_CONFIG.lafarola.rotation);
		const computer = new Computer(scene, SCENE_CONFIG.computer.pos, SCENE_CONFIG.computer.scale, SCENE_CONFIG.computer.rotation, shadow);

		// STEP 3: Central list for clickable route/object pairs
		// To add a new clickable object, add one entry here
		const interactives = [
			{ obj: townhouse, route: SCENE_CONFIG.townhouse.route },
			{ obj: trophy, route: SCENE_CONFIG.trophy.route },
			{ obj: lafarola, route: SCENE_CONFIG.lafarola.route },
			{ obj: computer, route: SCENE_CONFIG.computer.route },
		];

		// STEP 4: Wait each object load and register clickable root mesh
		interactives.forEach(({ obj, route }) => {
			loadingQueue.add(`Loading ${route}`, async () => {
				await obj.ready();
				const mesh = obj.getRootMesh();
				if (mesh)
					menuInteraction.registerClickableObject(route, mesh, obj);
			});
		});
		// STEP 5: Return navigation object references
		return { townhouse, trophy, lafarola, computer };
	}
}

// ===== MINI DICTIONARY =====
// interactive object -> object that can trigger route/panel actions
// clickable registration -> mapping mesh clicks to navigation behavior
// root mesh -> top-level mesh used as interaction anchor

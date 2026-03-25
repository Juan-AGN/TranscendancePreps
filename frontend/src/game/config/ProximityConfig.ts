// PROXIMITY CONFIG -- tabla de proximidad de objetos del hub (los q NO tienen hologram)
// aqui decido que objetos detectan cercania, a que distancia y con que glow
// si quiero añadir/quitar algo → solo toco este archivo

import { ProximitySystem } from '../physics/ProximitySystem'; // sistema que detecta cercania
import { HubSceneBuilder } from '../scenes/hub/HubSceneBuilder'; // donde viven los objetos del hub
import { DEFAULT_HIGHLIGHT, GREEN_HIGHLIGHT } from './HighlightConfig'; // colores del aura
import type { GlowEffectConfig } from './HighlightConfig'; // tipo del glow

// tipo de cada entrada de la tabla
interface ProximityEntry {
	key: keyof HubSceneBuilder; // nombre del objeto dentro del builder
	distance: number;           // a que distancia se activa el aura
	config: GlowEffectConfig;   // como se ve el glow
}

// objetos decorativos (sin hologram)
// los de hologram los gestiona otro sistema (HologramManager)
const DECORATIVE_ENTRIES: ProximityEntry[] = [
	{ key: 'pingpong', distance: 12, config: DEFAULT_HIGHLIGHT }, // mesa pingpong
	{ key: 'torre',    distance: 20, config: GREEN_HIGHLIGHT   }, // torre
];


export class ProximityConfig {

	// registro todos los decorativos en el sistema de proximidad
	static registerDecoratives(
		proximitySystem: ProximitySystem,
		entityManager: HubSceneBuilder,
	): void {

		for (const entry of DECORATIVE_ENTRIES) { // recorro la tabla
			const obj = entityManager[entry.key] as any; // saco el objeto real desde el builder
			if (obj) proximitySystem.registerObject(obj, entry.distance, entry.config); // si existe lo registro
		}
	}
}

// ===== MINI DICCIONARIO =====
// proximity -> detectar cuando estoy cerca de algo
// entry -> una fila de datos
// key -> nombre del objeto en el builder
// register -> registrar en el sistema
// glow -> aura visual
// decorative -> objeto decorativo (sin interaccion avanzada)
// system -> clase que gestiona algo (logica)
// builder -> clase que crea/guarda objetos
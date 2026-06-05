// HOLOGRAM CONTROLLER -- crea hologramas y los conecta con proximidad
// este archivo es el puente entre:
//   - config (HologramConfig)
//   - objetos reales (HubSceneBuilder)
//   - sistema de proximidad (ProximitySystem)
// RESPONSABILIDAD:
// leer la tabla HUB_OBJECTS → crear hologramas → enganchar show/hide
// aqui NO hay render ni fisica → solo orquestasssion
import { Scene } from '@babylonjs/core';
import { SkyTextHologram } from './SkyTextHologram'; // clase que crea el texto 3D
import { ProximitySystem } from '../physics/ProximitySystem'; // sistema que detecta cercania
import { HubSceneBuilder } from '../scenes/hub/HubSceneBuilder'; // donde viven los objetos del hub
import { HUB_OBJECTS } from '../config/HologramConfig';

export class HologramController {

	private holograms: Map<string, SkyTextHologram> = new Map();
	// guardo todos los hologramas creados  key = label (ej: SETTINGS) esto me sirve pa limpiarlos luego (dispose)

	// ─── SETUP 
	// crea hologramas + los registra en proximidad
	// IMPORTANTE:  esto hay que llamarlo DESPUES de cargar los meshes (executeLoadTasks)
	// si no → obj.getRootMesh() devuelve null y no funciona
	setup(
		scene: Scene,
		entityManager: HubSceneBuilder,
		proximitySystem: ProximitySystem,
	): void {
		for (const def of HUB_OBJECTS) {// recorro la tabla central (HUB_OBJECTS)
			const obj = (entityManager as any)[def.key];// saco el objeto real usando la key (ej: 'townhouse')
			const proximityRef = def.proximityKey ? (entityManager as any)[def.proximityKey] : undefined;
			if (!obj)
				continue; // si no existe → paso (puede que no haya cargado)
			// ─── CASO CON HOLOGRAMA
			if (def.hologram) {
				const { label, color, position } = def.hologram;
				const hologram = new SkyTextHologram(scene, label, color, position);
				this.holograms.set(label, hologram); // lo guardo pa poder limpiarlo luego
				proximitySystem.registerObject(// registro el objeto en proximidad
					obj,
					def.activeDistance,
					def.glowConfig,
					() => hologram.show(), // cuando entro → aparece texto
					() => hologram.hide(), // cuando salgo → desaparece
					proximityRef,
				);
				// CLAVE: aqui conecto logica → visual proximity detecta → hologram reacciona
			}
			// ─── CASO SIN HOLOGRAMA 
			else {
				// solo aura (sin texto)
				proximitySystem.registerObject(
					obj,
					def.activeDistance,
					def.glowConfig,
					undefined,
					undefined,
					proximityRef,
				);
				// estos objetos solo brillan, no tienen texto
			}
		}
	}

	dispose(): void {
		this.holograms.forEach(h => h.cleanUp());
		// IMPORTANTISIMO: cada holograma tiene meshes → si no libero → memory leak GPU
		this.holograms.clear();// limpio el mapa (referencias fuera)	
	}
}

// ===== MINI DICCIONARIO =====
// map -> estructura key → value (rapido pa buscar)
// callback -> funcion que se ejecuta cuando pasa algo
// rootMesh -> mesh principal del objeto
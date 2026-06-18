// ┌────────────────────────────────────────────────────────────┐
// │           HologramController.ts                            │
// ├────────────────────────────────────────────────────────────┤
// │ Orchestrates hologram creation and proximity system.       │
// │ Bridges config, scene objects, and proximity detection.    │
// │ Handles show/hide callbacks based on player proximity.     │
// └────────────────────────────────────────────────────────────┘

import { Scene } from '@babylonjs/core';
import { SkyTextHologram } from './SkyTextHologram'; // Class that creates 3D text
import { ProximitySystem } from '../physics/ProximitySystem'; // System that detects proximity
import { HubSceneBuilder } from '../scenes/hub/HubSceneBuilder'; // Where hub objects live
import { HUB_OBJECTS } from '../config/HologramConfig';

export class HologramController {

	private holograms: Map<string, SkyTextHologram> = new Map();
	// Store all created holograms
	// key = label (e.g., SETTINGS)
	// Used for cleanup (dispose) later

	// ─── SETUP
	// Create holograms + register them in proximity system
	// IMPORTANT: Call this AFTER loading meshes (executeLoadTasks)
	// Otherwise obj.getRootMesh() returns null
	setup(
		scene: Scene,
		entityManager: HubSceneBuilder,
		proximitySystem: ProximitySystem,
	): void {
		for (const def of HUB_OBJECTS) {
			// Iterate through the central table (HUB_OBJECTS)
			const obj = (entityManager as any)[def.key]; // Get real object using key (e.g., 'townhouse')
			const proximityRef = def.proximityKey ? (entityManager as any)[def.proximityKey] : undefined;
			if (!obj)
				continue; // If doesn't exist → skip (may not have loaded yet)
			// ─── CASE WITH HOLOGRAM
			if (def.hologram) {
				const { label, color, position } = def.hologram;
				const hologram = new SkyTextHologram(scene, label, color, position);
				this.holograms.set(label, hologram); // Store for later cleanup
				proximitySystem.registerObject(
					// Register object in proximity
					obj,
					def.activeDistance,
					def.glowConfig,
					() => hologram.show(), // On entry → text appears
					() => hologram.hide(), // On exit → text disappears
					proximityRef,
				);
				// KEY: Logic → Visual connection
				// Proximity detects → Hologram reacts
			}
			// ─── CASE WITHOUT HOLOGRAM
			else {
				// Only aura (no text)
				proximitySystem.registerObject(
					obj,
					def.activeDistance,
					def.glowConfig,
					undefined,
					undefined,
					proximityRef,
				);
				// These objects only glow, no text
			}
		}
	}

	dispose(): void {
		this.holograms.forEach(h => h.cleanUp());
		// CRITICAL: Each hologram has meshes → if not freed → GPU memory leak
		this.holograms.clear(); // Clear map references
	}
}

// ===== MINI DICTIONARY =====
// map → key → value structure (fast lookup)
// callback → function executed when something happens
// rootMesh → main mesh of the object
// ┌────────────────────────────────────────────────────────────┐
// │               ProximitySystem.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Detects whether player is near interactive objects.        │
// │ Toggles glow and callbacks on enter/exit range.            │
// │ Centralizes proximity logic for all registered targets.    │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import proximity dependencies

import { Vector3 } from '@babylonjs/core';
import { InteractiveObject } from '../scenes/hub/buildings/InteractiveObject';
import { GlowEffectManager } from '../effects/HighlightEffect';
import { DEFAULT_HIGHLIGHT } from '../config/HighlightConfig';
import type { GlowEffectConfig } from '../config/HighlightConfig';

// STEP 2: Define tracked data for each proximity target
export interface ProximityTarget {
	interactiveObject: InteractiveObject; // Real 3D object being tracked
	distanceReferenceObject?: InteractiveObject; // Optional distance anchor object (e.g., pedestal)
	activationDistance: number; // Distance threshold to enable glow
	glowConfig: GlowEffectConfig; // Glow color + pulse speed + blur size
	isHighlighted: boolean; // Current state (prevents toggling every frame)
	onEnterRange?: () => void; // Optional callback when entering range
	onExitRange?: () => void; // Optional callback when exiting range
}

export class ProximitySystem {
	private glowManager: GlowEffectManager; // Shared glow manager for all objects
	private proximityTargets: ProximityTarget[] = []; // Registered targets list

	// STEP 3: Initialize with shared glow manager
	constructor(glowManager: GlowEffectManager) {
		this.glowManager = glowManager; // Store glow system reference
	}

	// STEP 4: Register an object for per-frame proximity checks
	// activationDistance = distance where aura starts
	// glowConfig = visual style of aura
	// onEnterRange / onExitRange = optional extras (e.g., hologram show/hide)
	public registerObject(
		interactiveObject: InteractiveObject,
		activationDistance: number,
		glowConfig: GlowEffectConfig = DEFAULT_HIGHLIGHT,
		onEnterRange?: () => void,
		onExitRange?: () => void,
		distanceReferenceObject?: InteractiveObject,
	): void {
		this.proximityTargets.push({
			interactiveObject,
			distanceReferenceObject,
			activationDistance,
			glowConfig,
			isHighlighted: false,
			onEnterRange,
			onExitRange,
		});
		// Stored in list and checked every frame from now on
	}

	// STEP 5: Per-frame update called from game loop
	// Receives player position and checks all registered targets
	public update(playerPosition: Vector3): void {
		// STEP 6: Evaluate each target distance and desired state
		for (const target of this.proximityTargets) {
			const referencePosition = target.distanceReferenceObject?.position ?? target.interactiveObject.position;
			const distanceToObject = Vector3.Distance(
				playerPosition,
				referencePosition
			);
			// Compute real distance from player to target reference
			const shouldActivateGlow = distanceToObject < target.activationDistance; // If closer than threshold => should be active
			
			// Only act on state transitions. IMPORTANT:
			// Otherwise enable/disable would run every frame (wasted work + visual glitches)
			if (shouldActivateGlow !== target.isHighlighted) {
				if (shouldActivateGlow) { // Case: just entered range
					// STEP 7: Activate glow + enter callback
					const objectMeshes = target.interactiveObject.getModelMeshes(); // Fetch real object meshes
					// If GLB is not loaded yet, cannot apply glow now. Retry next frame.
					if (objectMeshes.length === 0)
						continue;
					target.isHighlighted = true; // Update internal state to avoid duplicate activations
					this.glowManager.enableGlow(objectMeshes, target.glowConfig); // Enable glow with target config
					target.onEnterRange?.(); // Trigger optional callback (e.g., show hologram)
				} else { // Case: just exited range
					// STEP 8: Deactivate glow + exit callback
					target.isHighlighted = false; // Update state first
					this.glowManager.disableGlow(target.interactiveObject.getModelMeshes()); // Disable object glow
					target.onExitRange?.(); // Optional callback on exit
				}
			}

			// STEP 9: Animate pulse while target remains active
			if (target.isHighlighted) {
				this.glowManager.updatePulse(target.glowConfig);
			}
		}
	}

	public isObjectInRange(interactiveObject: InteractiveObject): boolean {
		for (const target of this.proximityTargets) {
			if (target.interactiveObject === interactiveObject) {
				return target.isHighlighted;
			}
		}
		return false;
	}

	// STEP 10: Force disable all active highlights (cleanup/pause/scene switch)
	public deactivateAll(): void {
		for (const target of this.proximityTargets) {
			if (target.isHighlighted) {
				this.glowManager.disableGlow(target.interactiveObject.getModelMeshes());
				target.isHighlighted = false;
			}
		}
	}
}

// ===== MINI DICTIONARY =====
// callback -> function executed when an event happens
// frame -> one render loop iteration
// state change -> transition between inactive and active
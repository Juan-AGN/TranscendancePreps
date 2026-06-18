// ┌────────────────────────────────────────────────────────────┐
// │            HighlightEffect.ts                              │
// ├────────────────────────────────────────────────────────────┤
// │ Manages glow/aura visual effects for 3D objects.           │
// │ Handles rendering only, not activation logic.             │
// │ Supports pulsing animations and debug modes.              │
// └────────────────────────────────────────────────────────────┘

import { Scene, HighlightLayer, Mesh } from '@babylonjs/core';
import { DEFAULT_HIGHLIGHT, type GlowEffectConfig } from '../config/HighlightConfig';
export type { GlowEffectConfig } from '../config/HighlightConfig';
export { DEFAULT_HIGHLIGHT, GOLD_HIGHLIGHT, GREEN_HIGHLIGHT } from '../config/HighlightConfig';

export class GlowEffectManager {

	private GlowLayer: HighlightLayer;
	// HighlightLayer = Babylon's internal system for rendering glow on meshes

	constructor(scene: Scene) {
		// Create the glow layer
		this.GlowLayer = new HighlightLayer('highlightLayer', scene, {
			mainTextureRatio: 0.5,
			// Internal resolution of the effect
			// 1 = high quality (expensive) 0.5 = more blur + better performance (preferred for glow)
			blurHorizontalSize: 3.0,
			blurVerticalSize: 3.0, // Base blur size (controls glow thickness)
			alphaBlendingMode: 2,
			// Additive mode: colors are summed → more neon brightness
			// Without this → glow looks dull
		});

		// Enable both inner and outer glow
		this.GlowLayer.innerGlow = true;
		this.GlowLayer.outerGlow = true;
		// Without this → only partial glow (cheap looking)
	}

	// ─── ENABLE GLOW

	public enableGlow(
		meshes: Mesh[],
		glowConfig: GlowEffectConfig = DEFAULT_HIGHLIGHT
	): void {

		if (meshes.length === 0)
			return; // Nothing to do

		// addMesh applies glow to each mesh
		meshes.forEach(mesh =>
			this.GlowLayer.addMesh(mesh, glowConfig.color, false)
		);

		// IMPORTANT: false = ignores original material's emissive
		// → glow ALWAYS visible
		// If true → would depend on material (can fail)
	}

	// ─── DISABLE GLOW
	public disableGlow(meshes: Mesh[]): void {
		meshes.forEach(mesh =>
			this.GlowLayer.removeMesh(mesh)
		);
		// Clean glow from meshes
		// If not done → they keep glowing forever
	}

	// ─── PULSE ANIMATION
	public updatePulse(config: GlowEffectConfig = DEFAULT_HIGHLIGHT): void {
		// Date.now() → current time in milliseconds
		// Multiply by speed → controls pulse speed
		const animatedTime = Date.now() * config.animationSpeed;
		const middleValue = (config.maxBlurSize + config.minBlurSize) / 2; // Get middle of blur range
		const amplitude = (config.maxBlurSize - config.minBlurSize) / 2; // Get amplitude (oscillation amount)
		const currentBlur = middleValue + Math.sin(animatedTime) * amplitude; // Use sin() for smooth cycle (-1 → 1)

		// Apply animated blur
		this.GlowLayer.blurHorizontalSize = currentBlur;
		this.GlowLayer.blurVerticalSize = currentBlur;
		// RESULT:
		// The glow "breathes" (expands and contracts)
		// Without this → static glow (less lively)
	}

	public getGlowLayer(): HighlightLayer {
		return this.GlowLayer; // Direct access in case advanced tweaking is needed
	}

	public cleanUp(): void {
		this.GlowLayer.dispose();
		// CRITICAL:
		// Free GPU resources or risk memory leaks + performance degradation over time
	}
}

// ===== MINI DICTIONARY =====
// highlightLayer → Babylon's glow system
// glow → brightness/aura around object
// blur → glow diffusion
// emissive → self-emitting color
// additive → blending by adding light (more brightness)
// pulse → breathing animation (expand/contract)
// sin() → oscillating function (ideal for animations)
// dispose → free GPU memory
// render → draw on screen
// shader → graphics logic (low level)
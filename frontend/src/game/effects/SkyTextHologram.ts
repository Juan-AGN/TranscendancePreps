// ┌────────────────────────────────────────────────────────────┐
// │            SkyTextHologram.ts                              │
// ├────────────────────────────────────────────────────────────┤
// │ Creates flat 3D text holograms that emerge from ground.    │
// │ Handles font loading, mesh creation, and animations.       │
// │ Supports show/hide with smooth emergence effects.          │
// └────────────────────────────────────────────────────────────┘

// Text orientation: rotation.x = +PI/2 → text face points UP (readable from above)
// Animation: letters rise smoothly from below ground to level 0
// No background panel → only neon letters

import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3, Animation, EasingFunction, SineEase } from '@babylonjs/core';
import earcut from 'earcut';
(globalThis as any).earcut = earcut;

import {
	HOLOGRAM_FONT_URL,
	HOLOGRAM_ANIM_FPS,
	HOLOGRAM_GLYPH_RESOLUTION,
	HOLOGRAM_TEXT_SIZE,
	HOLOGRAM_TEXT_DEPTH,
	HOLOGRAM_OUTLINE_WIDTH,
	HOLOGRAM_EMERGE_FROMSKY,
	HOLOGRAM_FRAMES_UP,
	HOLOGRAM_FRAMES_DOWN,
} from '../config/HologramConfig';

export class SkyTextHologram {
	// Class responsible for creating, showing, hiding, and destroying text holograms

	private scene: Scene; // Stores the Babylon scene where the hologram exists
	private label: string; // Stores the text to display, e.g. "PONG" or "SETTINGS"
	private glowColor: Color3; // Stores the bright/emissive color of the hologram
	private textMesh: Mesh | null = null; // Stores the 3D text mesh once created; starts null (slow to load)
	private groundY: number = 0; // Stores the final Y height where text should rest (usually ground level)
	private isVisible: boolean = false; // Tracks if hologram is logically visible
	private waitingToShow: boolean = false; // Remember if show() was called before text finished loading

	constructor(
		scene: Scene,
		label: string,
		emissiveColor: Color3,
		position: Vector3,
	) {
		this.scene = scene;
		this.label = label;
		this.glowColor = emissiveColor;
		this.loadFontAndCreateTextMesh(position);
	}

	private async loadFontAndCreateTextMesh(position: Vector3): Promise<void> {
		try {
			const fontData = await (await fetch(HOLOGRAM_FONT_URL)).json();

			const mesh = MeshBuilder.CreateText(
				`hologram3d_${this.label}`,
				this.label,
				fontData,
				{ size: HOLOGRAM_TEXT_SIZE, resolution: HOLOGRAM_GLYPH_RESOLUTION, depth: HOLOGRAM_TEXT_DEPTH },
				this.scene,
			) as Mesh;

			if (!mesh) {
				// Check if Babylon returned null or invalid when creating text
				//console.warn(`[Hologram3D] CreateText returned null for "${this.label}"`); // Show warning to debug
				return; // Exit since no mesh to continue with
			}

			// Thick black outline
			mesh.renderOutline = false;
			mesh.outlineColor = new Color3(0, 0, 0);
			mesh.outlineWidth = HOLOGRAM_OUTLINE_WIDTH;

			this.groundY = position.y;
			mesh.position = new Vector3(position.x, this.groundY + HOLOGRAM_EMERGE_FROMSKY, position.z);
			mesh.rotation.x = 0;

			mesh.billboardMode = Mesh.BILLBOARDMODE_Y; // Always rotate on Y axis to face player
			mesh.isVisible = false; // Keep hidden until someone calls show()
			mesh.isPickable = false; // Prevent text from intercepting clicks/raycasts so building stays clickable

			// Solid material with visible relief:
			// - Front face nearly white (diffuse) → scene lighting creates shadow relief
			// - Bright specular → edges catch light
			// - Subtle emissive with object color → identity tint without flattening relief
			const mat = new StandardMaterial(`hologram3d_mat_${this.label}`, this.scene);
			const g = this.glowColor;
			mat.diffuseColor = new Color3(
				0.85 + g.r * 0.15,
				0.85 + g.g * 0.15,
				0.85 + g.b * 0.15,
			); // Nearly white with slight color tint
			mat.specularColor = new Color3(g.r * 0.8, g.g * 0.8, g.b * 0.8);
			mat.specularPower = 64; // Concentrated reflection on edges → glossy/lacquered effect
			mat.emissiveColor = new Color3(g.r * 0.08, g.g * 0.08, g.b * 0.08); // Subtle identity tint
			mesh.material = mat;

			this.textMesh = mesh; // Store reference to created text

			if (this.waitingToShow) {
				this.waitingToShow = false;
				mesh.isVisible = true;
				this.animateEmerge(this.groundY, HOLOGRAM_FRAMES_DOWN);
			}

		} catch (err) {
			// Catch any error from fetch, json(), or CreateText
			//console.error(`[Hologram3D] Error creating text "${this.label}":`, err); // Show full error for debugging
		}
	}

	private animateEmerge(targetY: number, frames: number, onEnd?: () => void): void {
		if (!this.textMesh)
			return;
		// SineEase OUT → starts VERY slow (weight/gravity feel) and accelerates
		const ease = new SineEase();
		ease.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

		Animation.CreateAndStartAnimation(
			`hologram3d_emerge_${this.label}`,
			this.textMesh,
			'position.y',
			HOLOGRAM_ANIM_FPS,
			frames,
			this.textMesh.position.y,
			targetY,
			Animation.ANIMATIONLOOPMODE_CONSTANT,
			ease,
			onEnd,
		);
	}

	public show(): void {
		// Public method to show the hologram
		if (this.isVisible)
			return; // Already visible, avoid repeating animation

		this.isVisible = true; // Mark as visible

		if (!this.textMesh) {
			// Check if text hasn't created yet (font still loading)
			this.waitingToShow = true; // Remember to show after loading completes
			return; // Can't show yet
		}
		this.textMesh.position.y = this.groundY + HOLOGRAM_EMERGE_FROMSKY;
		this.textMesh.isVisible = true;
		this.animateEmerge(this.groundY, HOLOGRAM_FRAMES_DOWN);
	}

	public hide(): void {
		// Public method to hide the hologram
		if (!this.isVisible)
			return; // Already hidden, nothing to do
		this.isVisible = false; // Mark as hidden
		this.waitingToShow = false; // Cancel any pending show
		if (!this.textMesh)
			return; // Nothing to hide if mesh doesn't exist
		this.animateEmerge(this.groundY + HOLOGRAM_EMERGE_FROMSKY, HOLOGRAM_FRAMES_UP, () => {
			if (this.textMesh)
				this.textMesh.isVisible = false;
		});
	}

	public cleanUp(): void {
		this.textMesh?.dispose();
		this.textMesh = null;
	}
}
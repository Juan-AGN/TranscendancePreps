// ┌────────────────────────────────────────────────────────────┐
// │                  HologramConfig.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Defines interactive Hub objects and hologram text settings.│
// │ Controls proximity distance, glow config and 3D text data. │
// │ It does NOT apply highlights or animate holograms directly.│
// └────────────────────────────────────────────────────────────┘

import { Color3, Vector3 } from '@babylonjs/core';
import type { GlowEffectConfig } from './HighlightConfig';
import { DEFAULT_HIGHLIGHT } from './HighlightConfig';

// STEP 1: Define 3D hologram text constants.
// These values control font, animation timing, text size and outline.
export const HOLOGRAM_FONT_URL         = 'https://assets.babylonjs.com/fonts/Droid%20Sans_Bold.json';
//export const HOLOGRAM_FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';
//export const HOLOGRAM_FONT_URL = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json';
export const HOLOGRAM_ANIM_FPS         = 60;    		
export const HOLOGRAM_GLYPH_RESOLUTION = 64;
export const HOLOGRAM_TEXT_SIZE        = 1.5;  
export const HOLOGRAM_TEXT_DEPTH       = 0.30; 
export const HOLOGRAM_OUTLINE_WIDTH    = 0.32;  
export const HOLOGRAM_EMERGE_FROMSKY     = 15.0;	
export const HOLOGRAM_FRAMES_DOWN    = 60;  
export const HOLOGRAM_FRAMES_UP      = 55;
// ════════ TYPE: HubObjectConfig: Interactive Hub object configuration. ════════
// Each object can have proximity detection, glow configuration and optional 3D text.
export interface HubObjectConfig {
	key: string;             
	proximityKey?: string;    
	activeDistance: number; 
	glowConfig: GlowEffectConfig; 

	hologram?: {
		label: string;   
		color: Color3;    
		position: Vector3; 
	};
}
// STEP 2: Define all interactive Hub objects.
// key: main object identifier used by the Hub systems.
// proximityKey: optional helper object used for distance checks.
// activeDistance: distance where proximity/highlight behavior becomes active.
// glowConfig: visual glow preset used by the object.
// hologram: optional floating 3D text shown near the object.
export const HUB_OBJECTS: HubObjectConfig[] = [
	// STEP 3: Objects with hologram text.
	{
		key: 'townhouse',
		activeDistance: 15,
		glowConfig: DEFAULT_HIGHLIGHT,
		hologram: {
			label: 'SETTINGS',
			color: new Color3(0, 0.9, 1),
			position: new Vector3(0, 8, 50),
		},
	},
	{
		key: 'trophy',
		proximityKey: 'pedestalTrophy',
		activeDistance: 12,
		glowConfig: DEFAULT_HIGHLIGHT,
		hologram: {
			label: 'TROPHY',
			color: new Color3(1, 0.6, 0),
			position: new Vector3(-30, 9, -28),
		},
	},
	{
		key: 'lafarola',
		activeDistance: 15,
		glowConfig: DEFAULT_HIGHLIGHT,
		hologram: {
			label: 'CHAT',
			color: new Color3(0, 1, 0.5),
			position: new Vector3(35, 7.5, 0),
		},
	},
	{
		key: 'arcade',
		proximityKey: 'pedestalArcade',
		activeDistance: 10,
		glowConfig: DEFAULT_HIGHLIGHT,
		hologram: {
			label: 'ARCADE',
			color: new Color3(0, 1, 0.5),
			position: new Vector3(30, 9, -28),
		},
	},
	{
		key: 'rosaleda',
		activeDistance: 17,
		glowConfig: DEFAULT_HIGHLIGHT,
		hologram: {
			label: 'TOURNAMENT',
			color: new Color3(0, 1, 0.5),
			position: new Vector3(0, 7, -50),
		},
	},
	{
		key: 'computer',
		proximityKey: 'pedestalPc',
		activeDistance: 12,
		glowConfig: DEFAULT_HIGHLIGHT,
		hologram: {
			label: 'LOGIN',
			color: new Color3(0, 1, 0.5),
			position: new Vector3(-30, 8, 29),
		},
	},
	// STEP 4: Objects with proximity/highlight only, without hologram text.
	{
		key: 'pingpong',
		proximityKey: 'pedestalPingpong',
		activeDistance: 12,
		glowConfig: DEFAULT_HIGHLIGHT,
	},
	{
		key: 'torre',
		activeDistance: 14,
		glowConfig: DEFAULT_HIGHLIGHT,
	},
];
// STEP 5: Small terminology notes.
// hologram: floating 3D text shown near an object.
// offset: manual position adjustment.
// bounds: invisible box used to describe object limits.
// dot product: vector calculation used to compare directions.
// normalize: converts a vector to length 1 while keeping its direction.
// mesh: 3D object inside the scene.
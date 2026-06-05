// HOLOGRAM CONFIG -- tabla central de objetos del hub (proximity + hologram)
// aqui decides TODO: que objeto existe, a que distancia se activa y si tiene texto 3D
// es el "panel de control" del hub, sin tocar logica del motor

import { Color3, Vector3 } from '@babylonjs/core';
import type { GlowEffectConfig } from './HighlightConfig';
import { DEFAULT_HIGHLIGHT, GOLD_HIGHLIGHT, GREEN_HIGHLIGHT } from './HighlightConfig';

// ===== CONSTANTES TEXTO 3D =====
export const HOLOGRAM_FONT_URL         = 'https://assets.babylonjs.com/fonts/Droid%20Sans_Bold.json';
//export const HOLOGRAM_FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';
//export const HOLOGRAM_FONT_URL = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json';
export const HOLOGRAM_ANIM_FPS         = 60;    // fps de animacion
export const HOLOGRAM_GLYPH_RESOLUTION = 64;    // calidad de curvas de las letras
export const HOLOGRAM_TEXT_SIZE        = 1.5;   // tamaño de las letras
export const HOLOGRAM_TEXT_DEPTH       = 0.30;   // grosor del relieve 3D
export const HOLOGRAM_OUTLINE_WIDTH    = 0.32;  // contorno negro gordo
export const HOLOGRAM_EMERGE_FROMSKY     = 15.0;   // cuanto bajan bajo el suelo cuando estan ocultas
export const HOLOGRAM_FRAMES_DOWN    = 60;   // frames pa subir (~1.8s) — empieza lento
export const HOLOGRAM_FRAMES_UP      = 55;    // frames pa bajar

export interface HubObjectConfig {
	key: string;               // nombre del objeto en escena
	proximityKey?: string;     // objeto opcional usado para calcular distancia de proximidad
	activeDistance: number;   // distancia de activacion del aura/proximity
	glowConfig: GlowEffectConfig; // config del glow

	hologram?: {
		label: string;      // texto del holograma
		color: Color3;      // color neon del texto
		position: Vector3;  // posicion exacta en el mundo (X, Y=0 suelo, Z)
	};
}

export const HUB_OBJECTS: HubObjectConfig[] = [
// ===== CON HOLOGRAMA =====
// Ajusta position: new Vector3(X, 0, Z) para colocar cada texto donde quieras
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

	// ===== SOLO PROXIMITY (sin texto) =====
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


// ===== MINI DICCIONARIO =====
// hologram -> texto 3D flotante
// offset -> ajuste manual de posicion
// bounds -> limites del objeto (caja invisible)
// dot product -> calculo pa saber hacia donde apunta algo
// normalize -> convertir vector a longitud 1
// mesh -> objeto 3D en escena
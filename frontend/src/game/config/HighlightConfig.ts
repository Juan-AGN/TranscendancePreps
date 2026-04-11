// HIGHLIGHT CONFIG -- config del aura/brillo de objetos del hub
// aqui solo definimos COMO se ve el glow (color, velocidad, tamaño)
// no se aplica nada aqui, solo datos pa que el sistema lo use

import { Color3 } from '@babylonjs/core'; // Color3 = RGB de Babylon (0-1)

// forma del config del glow (plantilla pa todos)
export interface GlowEffectConfig {
	color: Color3;          // color del aura
	animationSpeed: number; // velocidad del pulso (mas alto = mas nervioso)
	minBlurSize: number;    // tamaño minimo del aura (cuando se contrae)
	maxBlurSize: number;    // tamaño maximo del aura (cuando se expande)
}


// ===== DEFAULT (cian) =====
// pa objetos interactivos normales (townhouse, pingpong, etc)

export const DEFAULT_HIGHLIGHT: GlowEffectConfig = {
	color: new Color3(0.0, 0.9, 1.0), // 42 azul
	animationSpeed: 0.0014,             // pulso medio (ni lento ni loco)
	minBlurSize: 0.5,                  // minimo del aura
	maxBlurSize: 4.5,                  // maximo (bastante visible)
};


// ===== GOLD (trofeo) =====
// pa cosas importantes (premios, highlights top)

export const GOLD_HIGHLIGHT: GlowEffectConfig = {
	color: new Color3(1.0, 0.75, 0.1), // dorado elegante
	animationSpeed: 0.003,             // mas rapido (llama mas la atencion)
	minBlurSize: 1.0,                  // mas compacto al minimo
	maxBlurSize: 3.5,                  // expansion moderada
};


// ===== GREEN =====
// pa settings, arcade, rosaleda, computer (cosas activables)

export const GREEN_HIGHLIGHT: GlowEffectConfig = {
	color: new Color3(0.2, 1.0, 0.4), // verde lima brillante
	animationSpeed: 0.0015,           // mas calmado (relajado)
	minBlurSize: 1.0,                 // minimo
	maxBlurSize: 3.0,                 // maximo contenido
};


// ===== MINI DICCIONARIO =====
// glow -> brillo/aura alrededor del objeto
// blur -> difuminado del aura
// animationSpeed -> velocidad del pulso del glow
// highlight -> resaltar algo visualmente
// Color3 -> color en formato RGB (0 a 1)

// ┌────────────────────────────────────────────────────────────┐
// │                  HighlightConfig.ts                        │
// ├────────────────────────────────────────────────────────────┤
// │ Defines glow/highlight presets for interactive Hub objects.│
// │ Controls glow color, pulse speed and blur size range.      │
// │ It does NOT apply the effect directly to scene meshes.     │
// └────────────────────────────────────────────────────────────┘
import { Color3 } from '@babylonjs/core'; // Color3 = RGB de Babylon (0-1)

// ════════ TYPE: GlowEffectConfig: Shape of a glow/highlight preset. ════════
// Each preset defines how the glow effect should look and animate.
export interface GlowEffectConfig {
	color: Color3;
	animationSpeed: number;
	minBlurSize: number;   
	maxBlurSize: number;   
}
// STEP 1: Define the default cyan highlight.
// Used for normal interactive Hub objects.
export const DEFAULT_HIGHLIGHT: GlowEffectConfig = {
	color: new Color3(0.0, 0.9, 1.0),
	animationSpeed: 0.0014,
	minBlurSize: 0.5,
	maxBlurSize: 4.5,
};
// STEP 2: Define the gold highlight.
// Used for important or reward-like objects.
export const GOLD_HIGHLIGHT: GlowEffectConfig = {
	color: new Color3(1.0, 0.75, 0.1),
	animationSpeed: 0.003,            
	minBlurSize: 1.0,             
	maxBlurSize: 3.5,                
};

// STEP 3: Define the green highlight.
// Used for activable objects such as settings, arcade or navigation props.
export const GREEN_HIGHLIGHT: GlowEffectConfig = {
	color: new Color3(0.2, 1.0, 0.4),
	animationSpeed: 0.0015,
	minBlurSize: 1.0,
	maxBlurSize: 3.0, 
};
// STEP 4: Small terminology notes.
// glow: visible light aura around an object.
// blur: softness or spread of the glow.
// animationSpeed: speed of the glow pulse animation.
// highlight: visual effect used to draw attention to an object.
// Color3: Babylon RGB color format using values from 0 to 1.
// HIGHLIGHT EFFECT -- gestor del aura/brillo (Glow) de objetos 3D
// este archivo SOLO se encarga de como se ve el glow (render), no de cuando se activa
// separo esto porque:
// - los objetos no deben saber nada de shaders/efectos
// - si cambio el sistema de glow → solo toco aqui (clean architecture)

import { Scene, HighlightLayer, Mesh } from '@babylonjs/core';
import { DEFAULT_HIGHLIGHT, type GlowEffectConfig } from '../config/HighlightConfig';
export type { GlowEffectConfig } from '../config/HighlightConfig';
export { DEFAULT_HIGHLIGHT, GOLD_HIGHLIGHT, GREEN_HIGHLIGHT } from '../config/HighlightConfig';

export class GlowEffectManager {

	private GlowLayer: HighlightLayer; 
	// HighlightLayer = sistema interno de Babylon que dibuja glow sobre meshes

	constructor(scene: Scene) {

		// creo la capa de glow
		this.GlowLayer = new HighlightLayer('highlightLayer', scene, {

			mainTextureRatio: 0.5,
			// resolucion interna del efecto
			// 1 = calidad alta (mas caro)  0.5 = mas blur + mejor rendimiento (lo prefiero pa glow)
			blurHorizontalSize: 3.0,
			blurVerticalSize: 3.0, // tamaño base del blur (lo gordo del aura)
			alphaBlendingMode: 2,
			// modo aditivo: los colores se suman → mas brillo tipo neon sin esto → glow apagado
		});

		// activo glow interior y exterior
		this.GlowLayer.innerGlow = true;
		this.GlowLayer.outerGlow = true;
		// sin esto → solo tendria glow parcial (cutre)
	}

	// ─── ACTIVAR GLOW 

	public enableGlow(
		meshes: Mesh[],
		glowConfig: GlowEffectConfig = DEFAULT_HIGHLIGHT
	): void {

		if (meshes.length === 0)
			return; // no hay nada → no hago nada

		// addMesh aplica glow a cada mesh
		meshes.forEach(mesh =>
			this.GlowLayer.addMesh(mesh, glowConfig.color, false)
		);

		// IMPORTANTE: false = ignora emissive del material original  → glow SIEMPRE visible
		// si fuera true → dependeria del material (puede fallar)
	}

	// ─── DESACTIVAR GLOW 
	public disableGlow(meshes: Mesh[]): void {

		meshes.forEach(mesh =>
			this.GlowLayer.removeMesh(mesh)
		);
		// limpio glow del meshsi no hago esto → se queda brillando para siempre
	}

	// ─── ANIMACION DEL PULSO 
	public updatePulse(config: GlowEffectConfig = DEFAULT_HIGHLIGHT): void {

		// Date.now() → tiempo actual en ms
		// lo multiplico por speed → controlo velocidad del pulso
		const animatedTime = Date.now() * config.animationSpeed;
		const middleValue = (config.maxBlurSize + config.minBlurSize) / 2;// saco el rango medio del blur
		const amplitude = (config.maxBlurSize - config.minBlurSize) / 2;// saco amplitud (cuanto oscila)
		const currentBlur = middleValue + Math.sin(animatedTime) * amplitude;// uso sin() pa hacer un ciclo suave (-1 → 1)

		// aplico el blur animado
		this.GlowLayer.blurHorizontalSize = currentBlur;
		this.GlowLayer.blurVerticalSize = currentBlur;
		// RESULTADO:
		// el glow "respira" (se expande y contrae)
		// sin esto → glow estatico (menos vida)
	}

	public getGlowLayer(): HighlightLayer {
		return this.GlowLayer; // acceso directo por si quiero tocar cosas avanzadas
	}

	public cleanUp(): void {

		this.GlowLayer.dispose();
		// IMPORTANTISIMO:
		// libero recursos GPU si no → memory leaks + bajada de rendimiento con el tiempo
	}
}

// ===== MINI DICCIONARIO =====
// highlightLayer -> sistema de Babylon pa glow
// glow -> brillo/aura alrededor del objeto
// blur -> difuminado del glow
// emissive -> color que emite luz
// additive -> mezcla sumando luz (mas brillo)
// pulse -> animacion de latido (expandir/contraer)
// sin() -> funcion que oscila (ideal pa animaciones)
// dispose -> liberar memoria GPU
// render -> dibujar en pantalla
// shader -> logica grafica (nivel bajo)
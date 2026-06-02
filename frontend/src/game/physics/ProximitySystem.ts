// PROXIMITY SYSTEM -- detecta si el player esta cerca de objetos interactivos
// este sistema solo sabe una cosa:
// "esta el jugador lo bastante cerca como pa activar algo o no?"
// si entra en rango -> enciendo glow / callbacks  si sale -> apago glow / callbacks

import { Vector3 } from '@babylonjs/core';
import { InteractiveObject } from '../scenes/hub/buildings/InteractiveObject';
import { GlowEffectManager } from '../effects/HighlightEffect';
import { DEFAULT_HIGHLIGHT } from '../config/HighlightConfig';
import type { GlowEffectConfig } from '../config/HighlightConfig';

// datos de cada objeto que vigilo en proximidad
export interface ProximityTarget {
	interactiveObject: InteractiveObject; // objeto 3D real que estoy vigilando
	distanceReferenceObject?: InteractiveObject; // objeto opcional para medir distancia (ej: pedestal)
	activationDistance: number; // distancia a la que activo el glow
	glowConfig: GlowEffectConfig; // color + velocidad + tamaño del pulso
	isHighlighted: boolean; // estado actual (asi no activo/desactivo cada frame como un loco)
	onEnterRange?: () => void; // callback opcional al entrar en rango
	onExitRange?: () => void; // callback opcional al salir de rango
}

export class ProximitySystem {
	private glowManager: GlowEffectManager; // gestor comun del glow para todos los objetos
	private proximityTargets: ProximityTarget[] = []; // lista de objetos registrados

	constructor(glowManager: GlowEffectManager) {
		this.glowManager = glowManager; // guardo el sistema de glow
	}

	// registro un objeto pa que el sistema lo vigile en cada frame
	// activationDistance = cuando se enciende el aura
	// glowConfig = como se ve ese aura
	// onEnterRange / onExitRange = extras tipo holograma show/hide
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
		// lo meto en la lista y ya queda fichado pa revisarlo siempre
	}

	// esto lo llamo cada frame desde el game loop le paso la posicion del jugador y reviso todos los objetos
	public update(playerPosition: Vector3): void {
		for (const target of this.proximityTargets) {
			const referencePosition = target.distanceReferenceObject?.position ?? target.interactiveObject.position;
			const distanceToObject = Vector3.Distance(
				playerPosition,
				referencePosition
			);
			// calculo la distancia real player -> objeto
			const shouldActivateGlow = distanceToObject < target.activationDistance;// si estoy mas cerca que el limite -> deberia estar encendido
			
			// solo actuo si hay cambio de estado ... esto es IMPORTANTE:
			// si no, estaria llamando enable/disable cada frame sin parar y eso seria gasto tonto + posibles bugs visuales
			if (shouldActivateGlow !== target.isHighlighted) {
				if (shouldActivateGlow) {// caso: acabo de entrar en rango
					const objectMeshes = target.interactiveObject.getModelMeshes();// saco los meshes reales del objeto
					//si el GLB aun no ha cargado, no puedo meter glow todavia, mejor esperar al siguiente frame y volver a probar
					if (objectMeshes.length === 0)
						continue;
					target.isHighlighted = true;// marco estado interno pa no repetir la activacion
					this.glowManager.enableGlow(objectMeshes, target.glowConfig);// enciendo glow con su config concreta
					target.onEnterRange?.();// si hay callback extra, lo lanzo, ejemplo: mostrar holograma
				} else {// caso: acabo de salir del rango	
					target.isHighlighted = false;// actualizo estado primero
					this.glowManager.disableGlow(target.interactiveObject.getModelMeshes()); // apago el glow del objeto
					target.onExitRange?.();// callback opcional al salir
				}
			}
			// si esta activo, animo el pulso del glow... asi el aura "respira" mientras estoy cerca
			if (target.isHighlighted) {
				this.glowManager.updatePulse(target.glowConfig);
			}
		}
	}
	// apago todos los highlights de golpe..util pa cleanup, pause, cambio de escena, etc
	public deactivateAll(): void {
		for (const target of this.proximityTargets) {
			if (target.isHighlighted) {
				this.glowManager.disableGlow(target.interactiveObject.getModelMeshes());
				target.isHighlighted = false;
			}
		}
	}
}

// ===== MINI DICCIONARIO =====
// callback -> funcion que se ejecuta cuando pasa algo
// frame -> cada vuelta del render
// state change -> cambio de estado (apagado -> encendido o al reves)
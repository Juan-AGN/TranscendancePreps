// COLLIDER BUILDER -- fabrica de colliders invisibles (cajas/cilindros)
// este archivo SOLO crea geometria de colision
// lo separo porque:
// - los objetos no deben saber COMO se fabrica un collider
// - si cambio la estrategia de colision → solo toco aqui
// - me ahorro repetir codigo en todos los objetos

import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';
import { DEBUG_CONFIG } from '../config/DebugConfig'; // flags de debug (ver colliders o no)

export interface BoxDimensions {// medidas de una caja de colision
	width: number; // ancho en X
	height: number; // alto en Y
	depth: number; // fondo en Z
}


export class ColliderBuilder {// clase utilitaria (static) pa crear colliders easy

	public static createBox(
		scene: Scene,
		id: string,
		dims: BoxDimensions,
		center: Vector3,
		yOffset = 0,
		debugMode = false
	): Mesh {

		// creo una caja con las medidas dadas
		const collider = MeshBuilder.CreateBox(id, {
			width: dims.width,
			height: dims.height,
			depth: dims.depth,
		}, scene);

		// coloco el collider en la escena X y Z salen del centro del objeto Y la ajusto aparte con yOffset
		collider.position = new Vector3(center.x, yOffset, center.z);

		// metadata = datos extra pegados al mesh aqui marco este mesh como collider
		collider.metadata = { isCollider: true };
		// IMPORTANTE: el raycast de Babylon solo detecta meshes pickables
		// si esto fuera false → CollisionSystem no lo veria
		collider.isPickable = true;

		// ===== DEBUG VISUAL =====
		// si activo debug → lo enseño en rojo wireframe si no → invisible total
		if (debugMode || DEBUG_CONFIG.showColliders) {

			const mat = new StandardMaterial(`${id}_debug_mat`, scene);
			mat.wireframe = true;// solo enseño lineas (sin relleno)asi veo forma y tamaño exactos
			mat.emissiveColor = new Color3(1, 0, 0);// rojo brillante pa que cante rapido
			collider.material = mat;
			collider.isVisible = true;
		} else {
			collider.isVisible = false;// collider invisible en juego normal
		}
		return collider;
	}

	public static createCylinder(
		scene: Scene,
		id: string,
		radius: number,
		height: number,
		center: Vector3,
		yOffset = 0,
		debugMode = false
	): Mesh {
		// creo un cilindro de colision
		const collider = MeshBuilder.CreateCylinder(id, {
			diameter: radius * 2,
			height,
		}, scene);

		collider.position = new Vector3(center.x, yOffset, center.z);// lo coloco en su sitio
		collider.metadata = { isCollider: true };// lo marco como collider pa que el sistema lo detecte
		collider.isPickable = true;// lo hago detectable por raycast
		// ===== DEBUG VISUAL =====
		if (debugMode || DEBUG_CONFIG.showColliders) {
			const mat = new StandardMaterial(`${id}_debug_mat`, scene);
			mat.wireframe = true; // solo lineas
			mat.emissiveColor = new Color3(1, 0, 0); // rojo debug
			collider.material = mat;
			collider.isVisible = true;
		} else {
			collider.isVisible = false;
		}
		return collider;
	}
}

// ===== MINI DICCIONARIO =====
// collider -> forma invisible pa detectar colision
// metadata -> datos extra pegados al mesh
// isPickable -> permite que raycast lo detecte
// raycast -> lanzar un rayo invisible pa ver que toca
// wireframe -> solo lineas, sin relleno
// emissive -> color que brilla por si solo
// static -> metodo que uso sin hacer new
// diameter -> diametro (ancho total del cilindro)
// offset -> desplazamiento extra
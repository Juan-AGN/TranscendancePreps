// COLLISION SYSTEM -- sistema de colisiones con raycast
// aqui compruebo si delante del personaje hay algo solido
// idea: lanzo un rayo invisible hacia delante y pregunto "choco o no?" asi evito meter al personaje dentro de objetos

import { Scene, Vector3, Ray, AbstractMesh } from '@babylonjs/core';

export interface CollisionResult {// resultado que devuelvo al comprobar colision
	hasCollision: boolean; // si hay choque o no
	hitDistance: number; // a que distancia esta el impacto
	hitMesh: AbstractMesh | null; // mesh golpeado (si existe)
}

export class CollisionSystem {

	private scene: Scene; // escena donde estan todos los colliders
	private collisionDistance: number; 
	// lookahead = cuanto mira el rayo hacia delante
	// esto NO es el paso de movimiento, es la distancia de deteccion
	constructor(scene: Scene, collisionDistance: number = 1.5) {
		this.scene = scene;
		this.collisionDistance = collisionDistance;
	}

	// ─── CHECK GENERAL 
	public checkCollision(
		origin: Vector3,
		direction: Vector3,
		maxDistance?: number
	): CollisionResult {
		const checkDistance = maxDistance ?? this.collisionDistance;// uso la distancia dada o, si no viene, mi distancia base
		// si no hay direccion real, no tiene sentido lanzar rayo
		if (direction.lengthSquared() === 0) {
			return { hasCollision: false, hitDistance: 0, hitMesh: null };
		}
		const rayOrigin = origin.clone(); // clono origen pa no tocar el original
		rayOrigin.y += 1; // subo el rayo a la cintura del personaje
		// si lo dejara en el suelo → podria fallar segun collider/suelo
		const ray = new Ray(
			rayOrigin,
			direction.clone().normalize(),
			checkDistance
		);
		// creo el rayo:
		// - origen = donde empiezo
		// - direccion normalizada = solo direccion, sin fuerza rara
		// - longitud = hasta donde quiero mirar

		// pickWithRay lanza el rayo contra la escena
		const hit = this.scene.pickWithRay(
			ray,
			(mesh) => !!mesh.metadata?.isCollider,
			true
		);

		// filtro: solo quiero meshes que tengan metadata.isCollider = true
		// asi ignoro suelo, decoracion, etc
		// true = fastCheck
		// Babylon para al primer impacto
		// eso es mas rapido (importantisimo si esto va cada frame)
		// si golpea algo de verdad dentro del rango → hay colision
		if (hit?.hit && hit.pickedMesh && hit.distance < checkDistance) {
			return {
				hasCollision: true,
				hitDistance: hit.distance,
				hitMesh: hit.pickedMesh
			};
		}
		// si no golpea nada → camino libre
		return {
			hasCollision: false,
			hitDistance: checkDistance,
			hitMesh: null
		};
	}

	// ─── CHECK DE MOV
	public checkMove(currentPos: Vector3, newPos: Vector3): CollisionResult {

		const direction = newPos.subtract(currentPos); // saco vector desde donde estoy hasta donde quiero ir
		if (direction.length() < 0.01) {
			return { hasCollision: false, hitDistance: 0, hitMesh: null };
		}
		// si apenas me muevo, no hace falta comprobar nada
		return this.checkCollision(currentPos, direction, this.collisionDistance);
		// IMPORTANTE: uso lookahead fijo, no el paso real del frame
		// si usara el paso pequeño (~0.3), el rayo miraria demasiado corto
		// y no veria bien el obstaculo antes del choque
	}
}

// ===== MINI DICCIONARIO =====
// ray -> rayo invisible pa detectar impactos
// raycast -> lanzar un rayo y ver que toca
// lookahead -> distancia que miro hacia delante
// metadata -> datos extra del mesh
// fastCheck -> para en el primer impacto (mas rapido)
// AbstractMesh -> tipo base de objeto 3D en Babylon
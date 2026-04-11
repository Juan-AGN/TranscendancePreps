 // MenuInteraction: file HubObjectClickHandler//ahora mismo no hace nada //colidders lo tapan
 // Convierte objetos 3D en botones clickables pa navegacion
 // Detecta clicks en meshes y ejecuta la navegacion a rutas de React Router
 // Gestiona el mapa de objetos interactivos y sus rutas asociadas*/
import { Scene, Mesh, PointerEventTypes } from '@babylonjs/core';

// Clase molde pa crear el sist de interaccion del menu 3D
export class HubObjectClickHandler {
	private scene: Scene;                                                         // escena de babylon donde ocurren los clicks
	private clickableObjects: Map<string, { mesh: Mesh, entity: any }> = new Map();   // mapa q conecta rutas con objetos 3D
	// Map -> estructura de datos tipo diccionario (clave-valor)
	// string -> la clave es la ruta (ej: '/trophy')
	// { mesh, entity } -> el valor es un obj con el mesh 3D y la entidad logica
	// = new Map() -> empezamos con un diccionario vacio
	private navigateToRoute: (route: string) => void;                            // funcion pa navegar entre paginas
	// (route: string) => void -> recibe una ruta y no devuelve nada
	// este callback viene desde fuera (React Router)

	constructor(scene: Scene, navigateToRoute: (route: string) => void) {
		this.scene = scene;                          // guardamos la escena de babylon
		this.navigateToRoute = navigateToRoute;    // guardamos la funcion de navegacion
		this.registerClickHandlers();                   // configuramos los listeners de clicks
	}

	private registerClickHandlers(): void {
		// onPointerObservable -> observable de babylon pa eventos del raton
		// .add() -> añadimos un listener q se ejecuta cada vez q hay un evento de puntero
		this.scene.onPointerObservable.add((pointerInfo) => {
			// Comprobamos si el evento es un click (POINTERDOWN)
			// no nos interesan otros eventos como hover, move, etc
			if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
				// pick() -> lanza un rayo desde el cursor pa ver q mesh toco
				// scene.pointerX, pointerY -> coordenadas del cursor en la pantalla
				// funcion de filtro -> solo consideramos meshes q NO sean el suelo
				const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => {
					return mesh.name !== 'ground';  // ignoramos el suelo
				});

				// Si el rayo impacto algo (hit) y hay un mesh seleccionado
				if (pickResult?.hit && pickResult.pickedMesh) {
					const picked = pickResult.pickedMesh;
					for (const [route, clickableObjects] of this.clickableObjects.entries()) {
						const collider = clickableObjects.entity?.getColliderMesh?.();

						// caso 1: click en el collider invisible q tapa al edificio
					// el collider (caja invisible de fisica) siempre recibe el click antes q el GLB
					// sin esta comprobacion, nunca habria match y el click se perderia
						if (collider && picked === collider) {
							this.navigateToRoute(route);
							break;
						}

						// caso 2: click directo en el mesh del GLB (sube toda la jerarquia)
						// necesario pq los GLB tienen estructura profunda con varios niveles de padres
						// ej: pickedMesh → __root__ → glb_node → mesh_0 → clickableObjects.mesh
						// con un solo .parent nunca llegariamos al mesh registrado
						let node: any = picked;
						let found = false;
						while (node) {
							if (node === clickableObjects.mesh) {
								found = true;
								break;
							}
							node = node.parent;
						}
						if (found) {
							this.navigateToRoute(route);
							break;
						}
					}
				}
			}
		});
	}

	public registerClickableObject(route: string, mesh: Mesh, entity: any): void {
		// set() -> añade un par clave-valor al Map
		// guardamos la ruta como clave y el mesh + entidad como valor
		// asi cuando clickeen este mesh, sabremos a q ruta navegar
		this.clickableObjects.set(route, { mesh, entity });
	}

	public getClickableObjects(): Map<string, { mesh: Mesh, entity: any }> {
		return this.clickableObjects;
	}
}
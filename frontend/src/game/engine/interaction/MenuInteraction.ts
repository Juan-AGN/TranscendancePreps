/**
 * MenuInteraction:
 * Convierte objetos 3D en botones clickables pa navegacion
 * Detecta clicks en meshes y ejecuta la navegacion a rutas de React Router
 * Gestiona el mapa de objetos interactivos y sus rutas asociadas
 */

import { Scene, Mesh, PointerEventTypes } from '@babylonjs/core';

// Clase molde pa crear el sist de interaccion del menu 3D
export class MenuInteraction {
    private scene: Scene;                                                         // escena de babylon donde ocurren los clicks
    private menuObjects: Map<string, { mesh: Mesh, entity: any }> = new Map();   // mapa q conecta rutas con objetos 3D
    // Map -> estructura de datos tipo diccionario (clave-valor)
    // string -> la clave es la ruta (ej: '/trophy')
    // { mesh, entity } -> el valor es un obj con el mesh 3D y la entidad logica
    // = new Map() -> empezamos con un diccionario vacio
    private navigateCallback: (route: string) => void;                            // funcion pa navegar entre paginas
    // (route: string) => void -> recibe una ruta y no devuelve nada
    // este callback viene desde fuera (React Router)

    constructor(scene: Scene, navigateCallback: (route: string) => void) {
        this.scene = scene;                          // guardamos la escena de babylon
        this.navigateCallback = navigateCallback;    // guardamos la funcion de navegacion
        this.setupClickHandlers();                   // configuramos los listeners de clicks
    }

    /**
     * Configura el sist de deteccion de clicks en la escena
     * este metodo PRIVADO se ejecuta automaticamente en el constructor
     * escucha todos los clicks del raton y detecta q mesh se clickeo
     * si el mesh es uno de los registrados, navega a su ruta
     */
    private setupClickHandlers(): void {
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
                    // Recorremos todos los objetos interactivos registrados
                    // entries() -> devuelve pares [clave, valor] del Map
                    for (const [route, obj] of this.menuObjects.entries()) {
                        // Comprobamos si el mesh clickeado coincide con alguno registrado
                        // o si el mesh clickeado es hijo del mesh registrado (ej: parte de un modelo GLB)
                        if (pickResult.pickedMesh === obj.mesh || pickResult.pickedMesh.parent === obj.mesh) {
                            // Ejecutamos la navegacion a la ruta asociada
                            this.navigateCallback(route);
                            // break -> salimos del bucle, ya encontramos el obj
                            break;
                        }
                    }
                }
            }
        });
    }

    /**
     * Registra un obj 3D como interactivo y lo asocia con una ruta
     * este metodo es PUBLICO, se llama desde SceneEntityManager
     * @param route -> ruta de navegacion (ej: '/trophy')
     * @param mesh -> malla 3D q sera clickable
     * @param entity -> entidad logica del obj (ej: instancia de Trophy)
     */
    public registerMenuObject(route: string, mesh: Mesh, entity: any): void {
        // set() -> añade un par clave-valor al Map
        // guardamos la ruta como clave y el mesh + entidad como valor
        // asi cuando clickeen este mesh, sabremos a q ruta navegar
        this.menuObjects.set(route, { mesh, entity });
    }

    /**
     * Devuelve el mapa completo de objetos interactivos registrados
     * util pa debugging o pa acceder a los objetos desde fuera
     * @returns Map con todas las rutas y sus meshes/entidades asociadas
     */
    public getMenuObjects(): Map<string, { mesh: Mesh, entity: any }> {
        return this.menuObjects;
    }
}
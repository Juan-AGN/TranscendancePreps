// PlayerCONFIG -- todo lo del personaje (modelo, animaciones y movimiento)
// aqui controlo como carga el stickman, como se mueve y sus limites en el mapa

// CARGA DEL MODELO GLB 
// ruta del modelo (yo lo tengo en /public)
export const STICKMAN_GLB_PATH = '/stickman.glb'; // donde esta el modelo del muñeco
export const STICKMAN_SCALE = 3; // multiplico tamaño pa que se vea bien en escena

// filtros pa aplicar cosas solo a ciertos meshes del GLB
export const STICKMAN_MESH_NAME_FILTERS = ['Simple', 'Object_', 'primitive'] as const; // nombres que uso pa detectar partes del modelo
export const STICKMAN_ANIM_RUN = 'run'; // anim cuando se mueve
export const STICKMAN_ANIM_IDLE = 'idle'; // anim cuando no hago nada

//MOVIMIENTO
export const CHARACTER_CONFIG = {

    moveSpeed: 0.3,				// velocidad del personaje (cuanto se mueve cada frame)
    positionSmoothness: 0.25, 	// suavizado del movimiento (lerp), lo hago fluido en vez de teletransporte
    minMapLimit: -55, 			// limite minimo del mapa (no dejo que se salga)
    maxMapLimit: 55, 			// limite maximo del mapa
    trophyRotationSpeed: 0.01, // velocidad a la que gira el trofeo (detalle visual)

} as const;

// ===== MINI DICCIONARIO =====
// idle -> estado quieto
// lerp -> movimiento suave entre posiciones
// frame -> cada tick del render (60fps normalmente)

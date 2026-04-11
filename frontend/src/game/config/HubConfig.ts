// SCENE CONFIG -- config central del hub 3D (donde va cada cosa)
// aqui coloco todos los objetos: posicion, escala, rotacion y rutas
// 

import { Vector3 } from '@babylonjs/core'; // vector 3D (x, y, z)

export const SCENE_CONFIG = {

    character: { 
        pos: new Vector3(0, 0, 0) // personaje empieza en el centro del mapa (spawn)
    },

    pingpong: { 
        pos: new Vector3(30, 1.5, 28), // mesa colocada a la derecha y un pelin elevada
        scale: 6 // tamaño de la mesa (bastante grande)
    },

    torre: { 
        pos: new Vector3(-40, 12, 0), // torre a la izquierda y alta en Y
        scale: 13 // escala grande (monumento)
    },

    townhouse: { 
        pos: new Vector3(0, 0, 50), // al fondo del mapa
        route: 'panel:settings' // al interactuar → abre panel settings en el hub 3D
    },

    trophy: { 
        pos: new Vector3(-30, 0, -28), // zona izquierda atras
        route: '/tournament' // abre torneos
    },

    computer: { 
        pos: new Vector3(-30, 0, 28), // izquierda delante
        scale: 10, // tamaño grande pa que se vea bien
        route: 'panel:login'
    },

    lafarola: { 
        pos: new Vector3(40, 9.5, 0), // derecha y elevada (farola alta)
        scale: 10, // tamaño grande
        rotation: 0, // sin rotacion (mirando default)
        route: '/settings' // abre ajustes
    },

    rosaleda: { 
        pos: new Vector3(0, 2.7, -50), // atras del todo
        scale: 12, // estadio grande
        rotation: Math.PI * 2 // rotacion completa (realmente igual a 0 pero por si acaso)
    },

    arcade: { 
        pos: new Vector3(30, 3.8, -28), // derecha atras
        scale: 4, // mas pequeño (maquina arcade)
        rotation: -Math.PI / 2 // girado 90º a la izquierda
    },

} as const;


// ===== MINI DICCIONARIO =====

// spawn -> punto donde aparece el personaje
// Math.PI -> 180 grados (usado pa rotaciones)
// Vector3 -> punto o direccion en 3D
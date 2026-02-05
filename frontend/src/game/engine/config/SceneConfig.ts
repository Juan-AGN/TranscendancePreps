/**
 * Configuración centralizada de todas las cositas del hub 3D
 */

import { Vector3 } from '@babylonjs/core';

export const SCENE_CONFIG = {
    character: { 
        pos: new Vector3(0, 0, 0) 
    },
    pingpong: { 
        pos: new Vector3(-40, 1.5, 0), 
        scale: 6 
    },
    torre: { 
        pos: new Vector3(-53, 12, 0), 
        scale: 13 
    },
    townhouse: { 
        pos: new Vector3(0, 0, 50), 
        route: '/game' 
    },
    trophy: { 
        pos: new Vector3(-30, 0, -28), 
        route: '/tournament' 
    },
    computer: { 
        pos: new Vector3(-30, 0, 28), 
        scale: 10 
    },
    lafarola: { 
        pos: new Vector3(30, 7.8, 30), 
        scale: 8, 
        rotation: 0, 
        route: '/settings' 
    },
    rosaleda: { 
        pos: new Vector3(0, 2.7, -45), 
        scale: 12, 
        rotation: Math.PI * 2 
    },
    arcade: { 
        pos: new Vector3(30, 3.8, -35), 
        scale: 4, 
        rotation: -Math.PI / 2 
    },
} as const;

export const CAMERA_CONFIG = {
    lowerRadiusLimit: 15,
    upperRadiusLimit: 80,
    lowerBetaLimit: Math.PI / 6,
    upperBetaLimit: Math.PI / 2.1,
    initialAlpha: -Math.PI / 2,
    initialBeta: Math.PI / 3,
    initialRadius: 35,
} as const;
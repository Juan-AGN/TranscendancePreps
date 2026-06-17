// ┌────────────────────────────────────────────────────────────┐
// │                     HubConfig.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ Defines the central layout configuration for the 3D Hub.   │
// │ Controls object positions, scales, rotations, routes and   │
// │ model paths used by Hub builders.                          │
// │ It does NOT create meshes or handle interactions directly. │
// └────────────────────────────────────────────────────────────┘

import { Vector3 } from '@babylonjs/core'; // vector 3D (x, y, z)
// STEP 1: Define the full 3D Hub scene layout.
// Each object contains the values needed by builders to place it in the scene.
export const SCENE_CONFIG = {
	character: {
		pos: new Vector3(0, 0, 0), 					// Player spawn position. 
	},

	pingpong: {
		pos: new Vector3(30, 3.5, 30), 				// table placed on the right and slightly elevated
		scale: 6, 									// table size (quite large)
		rotation: Math.PI / 4 						// diagonal towards the center
	},

	torre: {
		pos: new Vector3(-70, 12, 0), 				// tower on the left and high in Y
		scale: 13, 									// large scale (monument)
		rotation: 0
	},

	townhouse: {
		pos: new Vector3(0, 7, 70),					// at the back of the map
		scale: 12,
		rotation: Math.PI / 2,
		route: 'panel:settings'						// on interaction → opens settings panel in 3D hub
	},

	trophy: {
		pos: new Vector3(-30, 2, -30),				 // left back area
		scale: 7,
		rotation: 0,
		route: '/tournament' 						// opens tournaments
	},

	computer: {
		pos: new Vector3(-30, 4.5, 30), 			// left front
		scale: 5, 									// large size so it looks good
		rotation: -Math.PI / 3,
		route: 'panel:login'
	},

	lafarola: {
		pos: new Vector3(70, 9.5, 0), 				// right and elevated (tall lamp)
		scale: 10,									// large size
		rotation: 0, 								// no rotation (default look)
		route: 'panel:chat' 						// opens global chat
	},

	rosaleda: {
		pos: new Vector3(0, 4.5, -75), 				// at the very back
		scale: 18, 									// large stadium
		rotation: Math.PI , 						// full rotation (really same as 0 but just in case)
		route: '/remote-game'
	},

	arcade: {
		pos: new Vector3(30, 5.5, -30), 			// right back
		scale: 4, 									// smaller (arcade machine)
		rotation: -Math.PI / 4,					 	// rotated 90º to the left
		route: '/game' 								// opens 2D arcade game screen
	},

	totemIsra: {
		pos: new Vector3(60, 10, -60),
		scale: 10,
		rotation: -Math.PI / 4,
		model: '/models/TotemIsra.glb'
	},

	totemCarlos: {
		pos: new Vector3(-60, 10, 60),
		scale: 10,
		rotation: 3 * Math.PI / 4,
		model: '/models/TotemCarlos.glb'
	},

	totemDani: {
		pos: new Vector3(-60, 10, -60),
		scale: 10,
		rotation: Math.PI / 4,
		model: '/models/TotemDani.glb'
	},

	totemJuan: {
		pos: new Vector3(60, 10, 60),
		scale: 10,
		rotation: -3 * Math.PI / 4,
		model: '/models/TotemJuan.glb'
	},

	pedestalPc: {
		pos: new Vector3(-30, 1, 30),
		scale: 8,
		rotation: 0,
		model: '/models/PedestalOlimpo.glb'
	},

	pedestalArcade: {
		pos: new Vector3(30, 1, -30),
		scale: 8,
		rotation: 0,
		model: '/models/PedestalOlimpo.glb'
	},

	pedestalPingpong: {
		pos: new Vector3(30, 1, 30),
		scale: 8,
		rotation: 0,
		model: '/models/PedestalOlimpo.glb'
	},

	pedestalTrophy: {
		pos: new Vector3(-30, 1, -30),
		scale: 8,
		rotation: 0,
		model: '/models/PedestalOlimpo.glb'
	},

	streetLamps: {
		model: '/models/Smallfarola.glb',
		scale: 3,
		items: [
			{
				// North-east lamp
				pos: new Vector3(10, 3, 10),
				rotation: Math.PI
			},
			{
				// North-west lamp
				pos: new Vector3(-10, 3, 10),
				rotation: Math.PI / 2
			},
			{
				// South-west lamp
				pos: new Vector3(-10, 3, -10),
				rotation: 0
			},
			{
				// South-east lamp
				pos: new Vector3(10, 3, -10),
				rotation: -Math.PI / 2
			},
		]
	},

	palms: {
		items: [
			{
				// Totem Juan -> Townhouse (midpoint)
				pos: new Vector3(30, 6, 65),
				rotation: Math.PI,
				scale: 6,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Juan -> LaFarola (midpoint)
				pos: new Vector3(65, 6, 30),
				rotation: -Math.PI / 2,
				scale: 6,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Carlos -> Townhouse (midpoint)
				pos: new Vector3(-30, 6, 65),
				rotation: Math.PI / 2,
				scale: 5,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Carlos -> TorreMonica (midpoint)
				pos: new Vector3(-65, 6, 30),
				rotation: Math.PI,
				scale: 5,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Dani -> TorreMonica (midpoint)
				pos: new Vector3(-65, 6, -30),
				rotation: 0,
				scale: 6,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Dani -> LaRosaleda (midpoint)
				pos: new Vector3(-30, 6, -65),
				rotation: Math.PI / 2,
				scale: 6,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Isra -> LaFarola (midpoint)
				pos: new Vector3(65, 6, -30),
				rotation: -Math.PI / 2,
				scale: 6,
				model: '/models/palmera2.glb'
			},
			{
				// Totem Isra -> LaRosaleda (midpoint)
				pos: new Vector3(30, 6, -65),
				rotation: 0,
				scale: 6,
				model: '/models/palmera2.glb'
			},
		]
	},

	torches: {
		model: '/models/antorch.glb',
		scale: 1,
		items: [
			{
				// Totem Isra - front torch
				pos: new Vector3(52, 1, -52),
				rotation: -Math.PI / 4
			},
			{
				// Totem Carlos - front torch
				pos: new Vector3(-52, 1, 52),
				rotation: 3 * Math.PI / 4
			},
			{
				// Totem Dani - front torch
				pos: new Vector3(-52, 1, -52),
				rotation: Math.PI / 4
			},
			{
				// Totem Juan - front torch
				pos: new Vector3(52, 1, 52),
				rotation: -3 * Math.PI / 4
			},
		]
	},

	columns: {
		model: '/models/columna.glb',
		scale: 5,
		items: [
			{
				// Totem Isra - left column
				pos: new Vector3(50, 5, -58),
				rotation: 0
			},
			{
				// Totem Isra - right column
				pos: new Vector3(58, 5, -50),
				rotation: 0
			},
			{
				// Totem Carlos - left column
				pos: new Vector3(-50, 5, 58),
				rotation: 0
			},
			{
				// Totem Carlos - right column
				pos: new Vector3(-58, 5, 50),
				rotation: 0
			},
			{
				// Totem Dani - left column
				pos: new Vector3(-50, 5, -58),
				rotation: 0
			},
			{
				// Totem Dani - right column
				pos: new Vector3(-58, 5, -50),
				rotation: 0
			},
			{
				// Totem Juan - left column
				pos: new Vector3(58, 5, 50),
				rotation: 0
			},
			{
				// Totem Juan - right column
				pos: new Vector3(50, 5, 58),
				rotation: 0
			},
		]
	},

} as const;


// ===== MINI DICTIONARY =====

// spawn -> point where the character appears
// Math.PI -> 180 degrees (used for rotations)
// Vector3 -> point or direction in 3D
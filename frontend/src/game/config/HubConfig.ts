// SCENE CONFIG -- config central del hub 3D (donde va cada cosa)
// aqui coloco todos los objetos: posicion, escala, rotacion y rutas
// 

import { Vector3 } from '@babylonjs/core'; // vector 3D (x, y, z)

export const SCENE_CONFIG = {

	character: {
		pos: new Vector3(0, 0, 0) // personaje empieza en el centro del mapa (spawn)
	},

	pingpong: {
		pos: new Vector3(30, 3.5, 30), // mesa colocada a la derecha y un pelin elevada
		scale: 6 // tamaño de la mesa (bastante grande)
	},

	torre: {
		pos: new Vector3(-70, 12, 0), // torre a la izquierda y alta en Y
		scale: 13 // escala grande (monumento)
	},

	townhouse: {
		pos: new Vector3(0, 0, 70), // al fondo del mapa
		route: 'panel:settings' // al interactuar → abre panel settings en el hub 3D
	},

	trophy: {
		pos: new Vector3(-30, 1, -30), // zona izquierda atras
		route: '/tournament' // abre torneos
	},

	computer: {
		pos: new Vector3(-30, 2, 30), // izquierda delante
		scale: 10, // tamaño grande pa que se vea bien
		route: 'panel:login'
	},

	lafarola: {
		pos: new Vector3(70, 9.5, 0), // derecha y elevada (farola alta)
		scale: 10, // tamaño grande
		rotation: 0, // sin rotacion (mirando default)
		route: 'panel:chat' // abre el chat global
	},

	rosaleda: {
		pos: new Vector3(0, 2.7, -70), // atras del todo
		scale: 12, // estadio grande
		rotation: Math.PI * 2 // rotacion completa (realmente igual a 0 pero por si acaso)
	},

	arcade: {
		pos: new Vector3(30, 5.5, -30), // derecha atras
		scale: 4, // mas pequeño (maquina arcade)
		rotation: -Math.PI / 4, // girado 90º a la izquierda
		route: '/game' // abre la pantalla del juego arcade 2D
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


// ===== MINI DICCIONARIO =====

// spawn -> punto donde aparece el personaje
// Math.PI -> 180 grados (usado pa rotaciones)
// Vector3 -> punto o direccion en 3D
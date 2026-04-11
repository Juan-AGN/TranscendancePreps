// LIGHTING CONFIG -- config de luces de la escena (como se ve todo de iluminado)
// aqui controlo ambiente, luz principal y sombras (look general del hub)

export const LIGHTING_CONFIG = {

	ambientLight: {
		intensity: 0.5, // luz base general → la uso pa que nada quede negro total
		groundColor: [0.9, 0.9, 0.9] as [number, number, number], // rebote de luz desde el suelo (tono claro)
	},

	mainLight: {
		direction: [-1, -2, -1] as [number, number, number], // direccion de la luz (como si fuera el sol)
		position: [20, 40, 20] as [number, number, number], // desde donde ilumina (altura + lateral)
		intensity: 0.9, // fuerza de la luz principal (casi a tope pero sin quemar)
	},

	shadows: {
		resolution: 512, // calidad de sombras (equilibrio, no quiero matar el rendimiento)
		softness: 16, // suavizado → sombras mas difusas (queda mas pro)
		darkness: 0.4, // intensidad de sombra → no negras del todo (mas realista)
	},

} as const;


// ===== MINI DICCIONARIO =====
// ambientLight -> luz base global (relleno)
// mainLight -> luz principal (tipo sol)
// direction -> hacia donde apunta la luz
// position -> desde donde sale la luz
// shadows -> sombras de los objetos
// resolution -> calidad del mapa de sombras
// softness -> desenfoque de la sombra
// darkness -> lo oscura que es la sombra
// intensity -> fuerza de la luz
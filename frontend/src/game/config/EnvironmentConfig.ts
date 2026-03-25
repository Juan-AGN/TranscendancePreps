// ENVIRONMENT CONFIG -- config del entorno base (suelo + luz HDRI)
// define como se ve el mundo: color, reflejos y luz global (look general de la escena)

export const ENVIRONMENT_CONFIG = {

	// ===== GROUND =====
	ground: {
		size: 200,  // tamaño del suelo (ancho/alto), cuanto mas grande mas mundo visible
		baseColor: [0.98, 0.98, 0.98] as [number, number, number],  // color base RGB (0-1), casi blanco pero no nuclear
		reflectionColor: [0.05, 0.05, 0.05] as [number, number, number], // fuerza del reflejo, bajo = mate, alto = espejo
		reflectionSharpness: 10,  // nitidez del reflejo, bajo = blur, alto = mas definido
	},

	// ===== HDRI (luz global) =====
	hdri: {
		texturePath: '/environment/studio.env',  // archivo HDRI (da luz + reflejos globales), cambia esto y cambia todo el mood
		lightIntensity: 0.8,  // intensidad de luz global, mas alto = mas brillo, mas bajo = mas oscuro
	},

} as const;


// ===== MINI DICCIONARIO =====
// hdri -> textura de entorno que da luz realista
// sharpness -> que tan definido se ve algo (nitidez)
// intensity -> fuerza de la luz
// rgb -> colores en rojo/verde/azul (0 a 1)

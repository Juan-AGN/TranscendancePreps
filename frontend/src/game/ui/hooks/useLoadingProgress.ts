// USE LOADING PROGRESS -- hook pa controlar la barra de carga (UI)
// este hook es como un mini gestor de estado pa la splash/loading screen
// aqui guardo:- % de carga- texto que muestro - si ya termine o no

import { useState, useCallback } from 'react'

export function useLoadingProgress() {
	const [progress, setProgress] = useState(0) // porcentaje de carga (0 → 100)
	const [label, setLabel] = useState('Initializing Transcende')// texto que enseño al usuario (rollo "cargando cosas...")
	const [isComplete, setIsComplete] = useState(false)// flag pa saber si ya he terminado (y cambiar pantalla)
	const updateProgress = useCallback(
		(loaded: number, total: number, newLabel?: string) => {
			// calculo el porcentaje- IMPORTANTE:- evito division por 0 (si total = 0)
			const percentage = total > 0 ? (loaded / total) * 100 : 0
			setProgress(percentage) // actualizo barra
			if (newLabel) {
				setLabel(newLabel)// si me pasan texto nuevo → lo cambio
			}
		},
		[]
	)

	// useCallback:  hace que esta funcion NO se recree en cada render
	// IMPORTANTE: si la paso a otros componentes → evito re-renders innecesarios
	const complete = useCallback(() => {
		setProgress(100)// fuerzo barra al 100%
		setLabel('Ready!')// mensaje final
		setIsComplete(true)// cambio estado → normalmente dispara cambio de pantalla
	}, [])

	const reset = useCallback(() => {

		setProgress(0)// vuelvo a 0
		setLabel('Initializing...')// reinicio texto
		setIsComplete(false)// vuelvo a estado inicial

	}, [])

	return {
		progress,
		label,
		isComplete,
		updateProgress,
		complete,
		reset
	}
	// devuelvo todo el pack pa usarlo en la UI
}

// ===== MINI DICCIONARIO =====
// hook -> funcion de React pa gestionar estado/logica reutilizable
// state -> datos que cambian y provocan render
// setState -> funcion pa actualizar ese estado
// useCallback -> memoriza funciones (evita recrearlas)
// splash screen -> pantalla de carga inicial
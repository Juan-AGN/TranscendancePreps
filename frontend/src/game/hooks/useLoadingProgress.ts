import { useState, useCallback } from 'react'

export function useLoadingProgress() {
  // ESTADOS DE LA UI: para controlar la barra de carga
  const [progress, setProgress] = useState(0) // Del 0 al 100
  const [label, setLabel] = useState('Initializing Transcende') // Mensaje tipo "Cargando texturas y esas cosas"
  const [isComplete, setIsComplete] = useState(false) // Semáforo para saber si hemos acabado

  // FUNCIÓN 1: Calcular porcentaje
  // Uso useCallback para "congelar" la función y poder pasarla a otros componentes 
  // sin que React piense que es una función nueva en cada render
  const updateProgress = useCallback((loaded: number, total: number, newLabel?: string) => {
    // Regla para sacar el %
    const percentage = total > 0 ? (loaded / total) * 100 : 0
    
    setProgress(percentage)
    if (newLabel) {
      setLabel(newLabel)
    }
  }, [])

  // FUNCIÓN 2: Forzar finalización
  // Útil para cuando la carga es tan rápida que queremos asegurar que llegue al 100% visualmente.
  const complete = useCallback(() => {
    setProgress(100)
    setLabel('Ready!')
    setIsComplete(true) //Dispara la transición a la siguiente pantalla, la principal
  }, [])

  // FUNCIÓN 3: Resetear
  // Por si el usuario sale y vuelve a entrar, dejamos todo limpio.
  const reset = useCallback(() => {
    setProgress(0)
    setLabel('Initializing...')
    setIsComplete(false)
  }, [])

  // Devuelvo el paquete completo para usarlo en la Splash Screen
  return {
    progress,
    label,
    isComplete,
    updateProgress,
    complete,
    reset
  }
}
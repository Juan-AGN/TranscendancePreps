import { useEffect, useRef } from 'react'

interface UseBabylonSceneOptions {
  canvasId: string
  onProgress?: (loaded: number, total: number) => void
  onReady?: () => void
}

export function useBabylonScene({ canvasId, onProgress, onReady }: UseBabylonSceneOptions) {
  // He usado useRef en vez de useState para guardar la escena
  // Si usara useState, cada cambio haría que React renderice todo de nuevo
  // y no quiero que eso pase con el motor 3D
  const sceneRef = useRef<any>(null)
  
  // Esto es un truco para manejar los callbacks dentro del useEffect
  // Los guardo en refs para tener siempre la última versión sin tener que
  // meterlos en las dependencias (si los meto, el juego se reinicia solo)
  const onProgressRef = useRef(onProgress)
  const onReadyRef = useRef(onReady)

  // Here actualizo las referencias si cambian las funciones desde fuera
  useEffect(() => {
    onProgressRef.current = onProgress
    onReadyRef.current = onReady
  }, [onProgress, onReady])

  // Este useEffect solo se ejecuta una vez al principio (por el array vacío al final)
  useEffect(() => {
    // TODO: Fase 8 - Aquí meteré el código real de Babylon
    // De momento simulación con un contador para ver si la barra de carga funciona--- luego lo ajustamos
    let loaded = 0
    const total = 15
    
    const interval = setInterval(() => {
      loaded++
      
      // Si me pasnn una función para ver el progreso, la ejecuto
      if (onProgressRef.current) {
        onProgressRef.current(loaded, total)
      }

      // Si ya hemos llegado al total, paramo todo
      if (loaded >= total) {
        clearInterval(interval)
        
        // Aviso de q ya está todo listo para quitar la pantalla de carga
        if (onReadyRef.current) {
          onReadyRef.current()
        }
      }
    }, 300)

    // Esto es la limpieza (cleanup!
    // Importante parar el intervalo y borrar la escena si me voy de la página
    // para que no se quede consumiendo memoria del navegador
    return () => {
      clearInterval(interval)
      if (sceneRef.current) {
        // sceneRef.current.dispose()
      }
    }
  }, []) 

  return { sceneRef }
}
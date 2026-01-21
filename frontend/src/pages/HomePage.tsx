import { useState } from 'react'
import { SplashScreen } from '../components/ui/SplashScreen'
import { useLoadingProgress } from '../hooks/useLoadingProgress'
import { useBabylonScene } from '../hooks/useBabylonScene'

export function HomePage() {
  // Estado para controlar la visibilidad de la pantalla de carga
  const [showSplash, setShowSplash] = useState(true)

  // Hook que gestiona la lógica matemática de la barra de progreso
  const { progress, label, updateProgress, complete } = useLoadingProgress()

  // Inicializamos el motor 3D
  useBabylonScene({
    canvasId: 'homeCanvas',
    // Conectamos los eventos de carga del motor con nuestra UI
    onProgress: (loaded, total) => {
      updateProgress(loaded, total, `Setup all the cositas ${loaded}/${total}`)
    },
    onReady: () => {
      complete() //Carga COmpleta
    }
  })

  return (
    <>
      {/* Renderizado condicional: La Splash Screen se desmonta del DOM al terminar */}
      {showSplash && (
        <SplashScreen 
          progress={progress} 
          label={label}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Contenedor principal */}
      {/* h-[calc(100vh-88px)]: Restamos la altura del Header para evitar scroll vertical */}
      <div className="relative w-full h-[calc(100vh-88px)] flex flex-col">
        
        {/* HUD / Overlay: Texto flotante sobre el 3D */}
        {/* z-10 asegura que el texto quede por encima del canvas */}
        <div className="text-center py-8 z-10 relative">
          <h2 
            className="text-5xl font-bold text-white mb-2"
            style={{
              // Sombra para asegurar legibilidad sobre cualquier fondo 3D
              textShadow: `
                0 2px 4px rgba(0, 0, 0, 0.8),
                0 4px 8px rgba(0, 0, 0, 0.6),
                0 0 20px rgba(255, 255, 255, 0.5)
              `
            }}
          >
            TRANSCENDENCE
          </h2>
          <p 
            className="text-white text-base tracking-wider opacity-90"
            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' }}
          >
            Usa las flechas ↑ ↓ ← → para mover, lo de mirar arriba y abajo luego lo pongo
          </p>
        </div>

        {/* Contenedor del Canvas 3D */}
        <div className="flex-1 relative">
          <canvas 
            id="homeCanvas" 
            className="w-full h-full outline-none"
            style={{ touchAction: 'none' }} // Deshabilita gestos táctiles del navegador oJOJo
          />
        </div>
      </div>
    </>
  )
}
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  progress: number
  label: string
  onComplete?: () => void
}

export function SplashScreen({ progress, label, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Cuando llega al 100%, esperar un momento y hacer fadeOut
    if (progress >= 100 && onComplete) {
      setTimeout(() => {
        setIsFadingOut(true)
        // Después del fadeOut, ocultar completamente y llamar a onComplete
        setTimeout(() => {
          setIsVisible(false)
          onComplete()
        }, 600) // Duración del fadeOut
      }, 1200) // Esperar 1.2s para que el user vea el 100%
    }
  }, [progress, onComplete])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        {/* Logo Animao de 42 */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 text-4xl font-bold">
            <span 
              className="text-white animate-pulse"
              style={{
                textShadow: `
                  0 0 10px rgba(59, 130, 246, 0.8),
                  0 0 20px rgba(59, 130, 246, 0.6),
                  0 0 30px rgba(59, 130, 246, 0.4)
                `
              }}
            >
              42
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-blue-400">Telefónica</span>
            <span className="text-gray-400">|</span>
            <span className="text-green-400">PONG</span>
          </div>
        </div>

        {/* Barra de progressss */}
        <div className="w-96 mx-auto">
          <div className="bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Metadata del progreso */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-300 font-semibold">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
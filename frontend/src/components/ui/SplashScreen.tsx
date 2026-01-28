import { Link } from 'react-router-dom'

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center">
        {/* Logo animado de 42 */}
        <div className="mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-4 text-6xl font-bold">
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

        {/* Título del juego */}
        <h1 className="text-5xl font-bold text-white mb-8 animate-fade-in-up">
          TRANSCENDENCE
        </h1>
        

        {/* Botón para continuar */}
        <Link
          to="/start"
          className="inline-block px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          Press to Continue
        </Link>
      </div>
    </div>
  )
}
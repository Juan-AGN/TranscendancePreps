// importamos Link para navegación y useLocation para detectar la ruta actual
import { Link, useLocation } from 'react-router-dom'

// componente Header que muestra logo y menú de navegación en todas las páginas
export function Header() {
  // hook que obtiene la ubicación actual (pathname)
  const location = useLocation()
  
  // Helper para saber si un link está activo
  const isActive = (path: string) => location.pathname === path
  
  return (
    <header className="bg-white px-12 py-6 flex justify-between items-center border-b border-gray-200 shadow-sm">
      {/* Logo 42 con efecto de sombra */}
      <h1 className="text-2xl font-semibold text-white" 
          style={{
            textShadow: `
              0 1px 0 rgba(0, 0, 0, 0.7),
              0 2px 1px rgba(0, 0, 0, 0.5),
              0 3px 3px rgba(0, 0, 0, 0.4),
              0 4px 6px rgba(0, 0, 0, 0.3),
              0 6px 10px rgba(0, 0, 0, 0.2)
            `
          }}>
        42
      </h1>
      
      {/* Navegación */}
      <nav className="flex gap-12">
        <Link 
          to="/start" 
          className={`text-base font-medium transition-colors duration-200 hover:text-blue-600 ${
            isActive('/start') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          Home
        </Link>
        <Link 
          to="/tournament" 
          className={`text-base font-medium transition-colors duration-200 hover:text-blue-600 ${
            isActive('/tournament') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          Tournament
        </Link>
        <Link 
          to="/game" 
          className={`text-base font-medium transition-colors duration-200 hover:text-blue-600 ${
            isActive('/game') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          Game
        </Link>
        <Link 
          to="/settings" 
          className={`text-base font-medium transition-colors duration-200 hover:text-blue-600 ${
            isActive('/settings') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          Settings
        </Link>
      </nav>
    </header>
  )
}
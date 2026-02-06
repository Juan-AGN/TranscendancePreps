import { useState } from 'react'
// Hook de React para manejar estado local (hover)
import { useNavigate, useLocation } from 'react-router-dom'
// Hooks de React Router:
// - useNavigate → navega
// - useLocation → saber en q ruta estamos (para marcar opc activa)


// Opciones del menu2D
// - id: identificador interno
// - label: texto visible
// - path: ruta a la que navega
const MENU2D_OPTIONS = [
  { id: 'home', label: 'HOME', path: '/home' },
  { id: 'game', label: 'GAME', path: '/game' },
  { id: 'tournament', label: 'TOURNAMENT', path: '/tournament' },
  { id: 'settings', label: 'SETTINGS', path: '/settings' },
  { id: 'login', label: 'LOGIN', path: '/login' },
]

// Componente principal del menn2D
export function Menu2DPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  // Estado para saber q butonn est siendo "hovered" o enfocado , null = ninguno
  const navigate = useNavigate()
  // Fun para cambiar de ruta
  const location = useLocation()
  // Info d la ruta actual (pathname)

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-88px)] bg-white font-mono">
      {/* h-[calc(100vh-88px)] → altura viewport - 88px del header (sin scroll) */}
      
      <h1 className="text-[3.75rem] font-black mb-[0.25rem]">
        PONG
      </h1>
	  <h3 className="text-[1rem] font-black mb-[3rem]">
        ARCADE
      </h3>

      <nav className="flex flex-col gap-[1rem] w-full max-w-[24rem]">
        {/* Recorr cada opcion del menu */}
        {MENU2D_OPTIONS.map((option) => {
          const isActive = location.pathname === option.path
		  // isActive → true si la ruta actual coincide con la option
          //  permite que el buton quede marcado tras hacer click
          const isHighlighted = hovered === option.id || isActive
          // isHighlighted → true si el boton esta en hover o es la ruta activa

          return (
            <button
              key={option.id}
              type="button"
              // Eventos de hover y focus
              onMouseEnter={() => setHovered(option.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(option.id)}
              onBlur={() => setHovered(null)}
              // Al hacer click, navegamos a la ruta
              onClick={() => navigate(option.path)}
              // Estilos: borde negro 0.25rem, texto grande y mayus (todo en rem)
              // Colores invertidos si esta highlighted (negro/blanco)
              className={[
                'relative px-[1.5rem] py-[0.75rem] text-[1.5rem] font-black uppercase',
                'border-[0.25rem] border-black',
                isHighlighted
                  ? 'bg-black text-white'
                  : 'bg-white text-black',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </nav>

    </div>
  )
}

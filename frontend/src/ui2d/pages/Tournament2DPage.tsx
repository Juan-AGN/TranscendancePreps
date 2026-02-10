import { useState } from 'react'
//hook de react (react lo actuliza solo(le da memoria))
import { useNavigate, useLocation } from 'react-router-dom'

// const de un arru de options del menu
const TOURNAMENT2D_OPTIONS = [
    {id: 'create', label: 'CREATE TOURNAMETN', path: '/createTournament'},// aun por determinar los paths de torneos y juego 2d
    {id: 'join', label: 'JOIN TOURNAMENT', path: '/joinTournament'},// aun por determinar los paths de torneos y juego 2d
    {id: 'list', label: 'LIVE TOURNAMENTS', path: '/liveTournament'},// aun por determinar los paths de torneos y juego 2d
]

//compo de react
export function Tournament2DPage() {
    const [hovered, setHovered] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-88px)] bg-white font-mono">
            <h1 className="text-[3.75rem] font-black mb-[0.25rem]">
                TOURNAMENT MODE
            </h1>

            <nav className="flex flex-col gap-[1rem] w-full max-w-[24rem]">
                {/*recorremos el arrayy generamos un boton por opcion*/}
                {TOURNAMENT2D_OPTIONS.map((option) => {
                    const isActive = location.pathname === option.path
                    const isHighlighted = hovered === option.id || isActive

                    return (
                        <button
                        key={option.id}
                        type="button"
                        onMouseEnter={() => setHovered(option.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(option.id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => navigate(option.path)}
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
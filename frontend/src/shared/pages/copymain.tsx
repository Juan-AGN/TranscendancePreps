import React, { useState, useRef, useEffect } from 'react'
import { PlanetBackground } from '../components/BackgroundEffects/PlanetBackground'

interface StartGateProps {
    onStart3D: () => void
    onGo2DMenu?: () => void
    onGoTech?: () => void
    onGo3D?: () => void
    onGoArcade?: () => void
    onGoCreators?: () => void
}

type CardColor = 'pink' | 'yellow' | 'blue'

interface GenreCardProps {
    title: string
    color: CardColor
    onClick?: () => void
    delay?: number
    initialTilt?: number
}

const CARD_COLORS = {
    pink: {
        main: '#ff38d4',
        soft: 'rgba(255,56,212,0.35)',
        bg: 'rgba(255,56,212,0.08)',
    },
    yellow: {
        main: '#ffd84d',
        soft: 'rgba(255,216,77,0.35)',
        bg: 'rgba(255,216,77,0.08)',
    },
    blue: {
        main: '#27d8ff',
        soft: 'rgba(39,216,255,0.35)',
        bg: 'rgba(39,216,255,0.08)',
    },
}

const GENRE_ICONS: Record<string, (c: string) => React.ReactElement> = {
    tech: (c) => (
        <img src="/techCard.png" alt="tech" className="w-[80%] h-[80%] object-contain  translate-x-[-8%]" />
    ),
    '3d': (_c) => (
        <img src="/3dcard2.png" alt="arcade" className="w-full h-full object-contain" />
    ),
    arcade: (_c) => (
        <img src="/Ac3.png" alt="arcade" className="w-full h-full scale-78 object-contain" />
    ),
    creators: (c) => (
        <img src="/3dcard4.png" alt="creators" className="w-full h-full object-contain translate-x-[8%] translate-y-[6%]" />
    ),
}

function GenreCard({ title, color, onClick, delay = 0, initialTilt = 0 }: GenreCardProps) {
    const palette = CARD_COLORS[color]

    // target: donde quiere llegar el ratón (actualización instantánea)
    const target = useRef({ x: 0, y: 0, active: false })
    // current: valores interpolados que se renderizan
    const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const LERP = 0.08 // 0–1: más bajo = más suave/lento
        let current = { x: 0, y: 0 }

        const tick = () => {
            current.x += (target.current.x - current.x) * LERP
            current.y += (target.current.y - current.y) * LERP
            setMouse({ x: current.x, y: current.y, active: target.current.active })
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [])

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const px = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5
        const py = ((e.clientY - rect.top) / rect.height - 0.5) * 1.5
        target.current = { x: px, y: py, active: true }
    }

    const handleLeave = () => {
        target.current = { x: 0, y: 0, active: false }
    }

    const rotateX = mouse.y * -20
    const rotateY = mouse.x * 20 + initialTilt

    // effectiveX incorpora el tilt inicial para que el parallax de capas
    // esté alineado con la rotación base (initialTilt/20 = equivalente de mouse.x)
    const effectiveX = mouse.x + initialTilt / 20
    const effectiveY = mouse.y

    const shineX = mouse.x * 30
    const shineY = mouse.y * 20

    return (
        <div
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="relative w-full h-[22rem] md:h-[22rem] xl:h-[22rem] opacity-0 animate-[cardIn_500ms_cubic-bezier(0.25,0.25,0.75,0.75)_forwards]"
            style={{ animationDelay: `${delay}ms` }}
        >
            <button
                onClick={onClick}
                aria-label={title}
                className="absolute inset-0 z-40 cursor-pointer bg-transparent border-0"
            />

            <div className="relative w-full h-full [perspective:800px]">
                <div
                    className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-150 ease-out"
                    style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
                >
                    
                    {/* GLOW - halo difuso detras */}
                    <div
                        className="absolute inset-0 scale-[1.06] transition-opacity duration-300"
                        style={{
                            clipPath: 'polygon(18% 12%, 82% 12%, 88% 18%, 88% 82%, 82% 88%, 18% 88%, 12% 82%, 12% 18%)',
                            background: palette.main,
                            filter: 'blur(1rem)',
                            opacity: mouse.active ? 0.25 : 0,
                            transform: `translate(${effectiveX * -70}px, ${effectiveY * -65}px) scale(0.92)`
                        }}
                    />
                    

                    {/* CAPA 1 — borde exterior, más lejano → se mueve menos */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out"
                        style={{ transform: `translate(${effectiveX * -3}px, ${effectiveY * -3}px)`, animation: mouse.active ? 'borderPulse 1.2s ease-in-out infinite' : 'none' }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <polygon
                                points="10,0 90,0 100,10 100,90 90,100 10,100 0,90 0,10"
                                fill="none"
                                stroke={palette.main}
                                strokeWidth="2.15"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>

                    {/* CAPA 2 — borde medio */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out"
                        style={{ transform: `translate(${effectiveX * -40}px, ${effectiveY * -40}px)`, animation: mouse.active ? 'borderPulse 1.4s ease-in-out infinite' : 'none' }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <polygon
                                points="14,8 86,8 92,14 92,86 86,92 14,92 8,86 8,14"
                                fill="none"
                                stroke={`${palette.main}99`}
                                strokeWidth={mouse.active ? '2.8' : '1.5'}
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>

                    {/* CAPA 3 — borde interior, más cercano → se mueve más */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out"
                        style={{ transform: `translate(${effectiveX * -85}px, ${effectiveY * -85}px)`, animation: mouse.active ? 'borderPulse 1.5s ease-in-out infinite' : 'none' }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <polygon
                                points="18,12 82,12 88,18 88,82 82,88 18,88 12,82 12,18"
                                fill="none"
                                stroke={`${palette.main}55`}
                                strokeWidth="0.55"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>

                    {/* CONTENIDO — flota encima via translateZ */}
                    <div
                        className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
                        style={{ transform: 'translateZ(30px)' }}
                    >
                        <div
                            className={title === 'arcade' || title === '3d' || title === 'creators' || title === 'tech' ? 'w-full h-full flex items-center justify-center transition-transform duration-150 ease-out' : 'w-[58%] h-[52%] flex items-center justify-center'}
                            style={{
                                filter: `drop-shadow(0 0 0px ${palette.soft}) drop-shadow(0 0 0px ${palette.soft})`,
                                ...((title === 'arcade' || title === '3d') ? { transform: `translate(${effectiveX * -85}px, ${effectiveY * -85}px)` } : {}),
                            }}
                        >
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: mouse.active ? 'floatBob 2s ease-in-out infinite' : 'none' }}>
                                {GENRE_ICONS[title]?.(palette.main)}
                            </div>
                        </div>
                        <div className="absolute bottom-[0.6rem] left-0 w-full flex items-center justify-center">
                            <p className="m-0 text-white/90 text-[0.95rem] md:text-[1rem] font-light tracking-[0.02rem]">
                                {title}
                            </p>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export function StartGate({ onStart3D, onGo2DMenu, onGoTech, onGo3D, onGoArcade, onGoCreators }: StartGateProps) {


    return (

        <div className="relative min-h-screen w-full overflow-hidden">


            <div className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: "url('/bg6.png')" }}>


                <div className="absolute inset-0 z-[1] pointer-events-none">
                    <div className="absolute left-1/2 top-[34%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[150px]" />
                    <PlanetBackground />
                </div>

                <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-white/20 via-white/4 to-white/30" />





                <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-5 md:px-8 xl:px-10">
                    <div className="w-full max-w-[77rem] mx-auto grid grid-cols-2 xl:grid-cols-4 gap-6 md:gap-6 items-center translate-y-[4rem]">
                        <GenreCard title="tech" color="pink" onClick={onGoTech ?? onStart3D} delay={500} initialTilt={8} />
                        <GenreCard title="3d" color="yellow" onClick={onGo3D ?? onGo2DMenu} delay={300} initialTilt={2} />
                        <GenreCard title="arcade" color="blue" onClick={onGoArcade} delay={100} initialTilt={-2} />
                        <GenreCard title="creators" color="pink" onClick={onGoCreators} delay={700} initialTilt={-8} />
                    </div>
                    
                </div>
            </div>

            <style>{`
                @keyframes cardIn {
                    0% { opacity: 0; transform: translateY(154px) scale(0.28); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes floatBob {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes borderPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.15; }
                }
    
                    
            `}</style>
        </div>
    )
}
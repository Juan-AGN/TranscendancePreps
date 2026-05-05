import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlanetBackground } from '../components/BackgroundEffects/PlanetBackground'
import { Footer } from '../components/layout/Footer'

interface StartGateProps {
	onStart3D: () => void
	onGo2DMenu?: () => void
	onGoTech?: () => void
	onGo3D?: () => void
	onGoArcade?: () => void
	onGoCreators?: () => void
}

interface GenreCardProps {
	title: 'tech' | '3d' | 'arcade' | 'creators'
	image: string
	onClick?: () => void
	delay?: number
	initialTilt?: number
	imageClassName?: string
}

function GenreCard({
	title,
	image,
	onClick,
	delay = 0,
	initialTilt = 0,
	imageClassName = '',
}: GenreCardProps) {
	const target = useRef({ x: 0, y: 0, active: false })
	const [mouse, setMouse] = useState({ x: 0, y: 0, active: false })
	const rafRef = useRef<number | null>(null)

	useEffect(() => {
		const LERP = 0.08
		let current = { x: 0, y: 0 }

		const tick = () => {
			current.x += (target.current.x - current.x) * LERP
			current.y += (target.current.y - current.y) * LERP
			setMouse({ x: current.x, y: current.y, active: target.current.active })
			rafRef.current = requestAnimationFrame(tick)
		}
		rafRef.current = requestAnimationFrame(tick)
		return () => {
			if (rafRef.current)
				cancelAnimationFrame(rafRef.current)
		}
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
	const effectiveX = mouse.x + initialTilt / 20
	const effectiveY = mouse.y
	return (
		<div
			onMouseMove={handleMove}
			onMouseLeave={handleLeave}
			className="relative w-full h-[22rem] md:h-[22rem] xl:h-[22rem] opacity-0 animate-[cardIn_500ms_cubic-bezier(0.25,0.25,0.75,0.75)_forwards]"
			style={{ animationDelay: `${delay}ms` }}>
			<button onClick={onClick} aria-label={title}
				className="absolute inset-0 z-40 cursor-pointer bg-transparent border-0" />
			<div className="relative w-full h-full [perspective:800px]">
				<div className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-150 ease-out"
					style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}>
					<img src="/pedestal2.png" alt=""
						className="absolute left-1/2 bottom-[-4.5rem] z-20 w-[90%] pointer-events-none select-none transition-all duration-300"
						style={{
							opacity: mouse.active ? 1 : 0.9,
							transform: `translateX(-50%) scale(${mouse.active ? 1.14 : 1})`,
						}} />
					<div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
						style={{ transform: 'translateZ(30px)' }}>
						<div className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
							style={{ transform: `translate(${effectiveX * -85}px, ${effectiveY * -85}px)`, }}>
							<div className="w-full h-full flex items-center justify-center"
								style={{ animation: mouse.active ? 'floatBob 2s ease-in-out infinite' : 'none', }}>
								<img src={image} alt={title} className={` object-contain ${imageClassName}`} />
							</div>
						</div>
						<div className="absolute bottom-[-4.6rem] left-0 w-full flex items-center justify-center">
							<p className="m-0 rounded-full border border-white/25 bg-black/50 px-5 py-1 text-white text-[0.75rem] md:text-[0.8rem]
									font-light uppercase tracking-[0.18rem] backdrop-blur-md shadow-[0_0_18px_rgba(255,255,255,0.22)]">
								{title}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export function StartGate({
	onStart3D,
	onGo2DMenu,
	onGoTech,
	onGo3D,
	onGoArcade,
	onGoCreators,
}: StartGateProps) {
	const BG_ZOOM_DURATION_MS = 2200
	const WHITE_FADE_DELAY_MS = 600
	const WHITE_FADE_DURATION_MS = 900
	const NAVIGATION_DELAY_MS = WHITE_FADE_DELAY_MS + WHITE_FADE_DURATION_MS + 20
	const PLANET_ZOOM_SCALE = 3.6
	const [isBgZooming, setIsBgZooming] = useState(false)

	const handleGo3D = () => {
		if (isBgZooming)
			return
		setIsBgZooming(true)
		setTimeout(() => {
			if (onGo3D)
				onGo3D()
			else if (onGo2DMenu)
				onGo2DMenu()
		}, NAVIGATION_DELAY_MS)
	}

	return (
		<div className="relative h-screen w-full overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-center bg-cover"
				style={{ backgroundImage: "url('/bg6.png')", transformOrigin: '50% 34%',}}
				initial={{ scale: 1, opacity: 1 }}
				animate={isBgZooming ? { scale: PLANET_ZOOM_SCALE, opacity: 0.88 } : { scale: 1, opacity: 1 }}
				transition={{ duration: BG_ZOOM_DURATION_MS / 1000, ease: [0.3, 0.05, 0.18, 1] }}>
				<div className="absolute inset-0 z-[1] pointer-events-none">
					<div className="absolute left-1/2 top-[34%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[150px]" />
					<PlanetBackground />
				</div>
				<div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-white/20 via-white/4 to-white/30" />
				<div className="relative z-10 min-h-screen w-full flex items-center justify-center px-5 md:px-8 xl:px-10">
					<div className="w-full max-w-[77rem] mx-auto grid grid-cols-2 xl:grid-cols-4 gap-6 md:gap-6 items-center translate-y-[4rem]">
						<GenreCard title="tech" image="/techCard.png"
							onClick={onGoTech ?? onStart3D}
							delay={500} initialTilt={8}
							imageClassName="scale-[0.70] translate-x-[1rem] translate-y-[1.3rem]" />
						<GenreCard title="3d" image="/3dcard2.png"
							onClick={handleGo3D}
							delay={300} initialTilt={2}
							imageClassName=" scale-[0.9] translate-x-[0.8rem] translate-y-[2.5rem]"/>
						<GenreCard title="arcade" image="/Ac3.png"
							onClick={onGoArcade}
							delay={100} initialTilt={-2}
							imageClassName="scale-[0.58] translate-y-[2rem]" />
						<GenreCard
							title="creators" image="/3dcard4.png"
							onClick={onGoCreators}
							delay={700} initialTilt={-8}
							imageClassName="translate-x-[-0.6rem] translate-y-[3rem]"/>
					</div>
				</div>
			</motion.div>

			<motion.div
				className="absolute inset-0 pointer-events-none z-[90] bg-white"
				initial={{ opacity: 0 }}
				animate={isBgZooming ? { opacity: 0.96 } : { opacity: 0 }}
				transition={{ duration: WHITE_FADE_DURATION_MS / 1000,
							delay: WHITE_FADE_DELAY_MS / 1000,
							ease: 'easeInOut',}}/>
			<style>{`
				@keyframes cardIn {
					0% { opacity: 0; transform: translateY(154px) scale(0.28); }
					100% { opacity: 1; transform: translateY(0) scale(1); }
				}

				@keyframes floatBob {
					0%, 100% { transform: translateY(0px); }
					50% { transform: translateY(-10px); }
				}
			`}</style>
			<div className="absolute bottom-0 left-0 right-0 z-20">
				<Footer />
			</div>
		</div>
	)
}
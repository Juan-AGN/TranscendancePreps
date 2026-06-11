import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

interface GenreCardProps {
	title: 'tech' | '3d' | 'arcade' | 'creators'
	image: string
	onClick?: () => void
	delay?: number
	initialTilt?: number
	imageClassName?: string
	label: string
}

export function GenreCard({
	title,
	image,
	onClick,
	delay = 0,
	initialTilt = 0,
	imageClassName = '',
	label,
}: GenreCardProps) {
	const mouseTarget = useRef({ x: 0, y: 0, active: false })
	const smoothMouse = useRef({ x: 0, y: 0 })
	const [cardMotion, setCardMotion] = useState({ x: 0, y: 0, active: false })
	const animationFrameRef = useRef<number | null>(null)

	const animateCard = () => {
		const SMOOTH_SPEED = 0.08
		smoothMouse.current.x += (mouseTarget.current.x - smoothMouse.current.x) * SMOOTH_SPEED
		smoothMouse.current.y += (mouseTarget.current.y - smoothMouse.current.y) * SMOOTH_SPEED
		setCardMotion({ x: smoothMouse.current.x, y: smoothMouse.current.y, active: mouseTarget.current.active })

		const distanceX = Math.abs(mouseTarget.current.x - smoothMouse.current.x)
		const distanceY = Math.abs(mouseTarget.current.y - smoothMouse.current.y)
		const isAnimationFinished = distanceX < 0.001 && distanceY < 0.001

		if (mouseTarget.current.active || !isAnimationFinished) {
			animationFrameRef.current = requestAnimationFrame(animateCard)
			return;
		}
		animationFrameRef.current = null
	}

	const startAnimationIfNeeded = () => {
		if (animationFrameRef.current === null)
			animationFrameRef.current = requestAnimationFrame(animateCard)
	}

	useEffect(() => {
		return () => {
			if (animationFrameRef.current)
				cancelAnimationFrame(animationFrameRef.current)
		}
	}, [])

	const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		const relativeX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5
		const relativeY = ((e.clientY - rect.top) / rect.height - 0.5) * 1.5
		mouseTarget.current = { x: relativeX, y: relativeY, active: true }
		startAnimationIfNeeded()
	}

	const handleLeave = () => {
		mouseTarget.current = { x: 0, y: 0, active: false }
		startAnimationIfNeeded()
	}

	const cardRotateX = cardMotion.y * -20
	const cardRotateY = cardMotion.x * 20 + initialTilt
	const imageMoveXBase = cardMotion.x + initialTilt / 20
	const imageMoveYBase = cardMotion.y

	return (
		<div
			onMouseMove={handleMove}
			onMouseLeave={handleLeave}
			className="relative w-full h-[clamp(10rem,24vw,22rem)] opacity-0
						animate-[cardIn_500ms_cubic-bezier(0.25,0.25,0.75,0.75)_forwards]
						max-sm:min-w-[82vw] max-sm:w-[82vw] max-sm:h-[26rem] max-sm:snap-center max-sm:shrink-0"
			style={{ animationDelay: `${delay}ms` }}>

			<button type="button"
				onClick={onClick}
				aria-label={title}
				className="absolute inset-0 z-40 cursor-pointer bg-transparent border-0" />

			<div className="relative w-full h-full [perspective:800px]">
				<div className="relative w-full h-full [transform-style:preserve-3d]
								transition-transform duration-150 ease-out"
					style={{ transform: `rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)` }}>

					<img src="/images/pedestal2.png"
						alt=""
						className="absolute left-1/2 bottom-[clamp(-4.5rem,-5vw,-2rem)] z-20 w-[90%]
									pointer-events-none select-none"
						style={{
							opacity: cardMotion.active ? 1 : 0.9,
							transform: `translateX(-50%) scale(${cardMotion.active ? 1.10 : 1})`,
							transition: cardMotion.active
								? 'transform 180ms ease-out, opacity 180ms ease-out, filter 180ms ease-out'
								: 'transform 350ms ease-in-out, opacity 350ms ease-in-out, filter 350ms ease-in-out',
							filter: cardMotion.active ? 'drop-shadow(0 2px 20px rgb(59, 177, 249))' : 'none',
						}} />

					<div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
						style={{ transform: 'translateZ(30px)' }}>

						<div className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
							style={{ transform: `translate(${imageMoveXBase * -85}px, ${imageMoveYBase * -85}px)` }}>

							<div className="w-full h-full flex items-center justify-center"
								style={{ animation: cardMotion.active ? 'floatBob 2s ease-in-out infinite' : 'none', }}>

								<img src={image}
									alt={title}
									className={`object-contain ${imageClassName}`}
									style={{
										filter: cardMotion.active
											? 'drop-shadow(0 0 1px rgb(10, 10, 0)) drop-shadow(0 -5px 40px rgb(59, 177, 251))' : 'none',
										transition: 'filter 200ms ease-out',
									}} />
							</div>
						</div>

						<div className="absolute top-[clamp(-2.5rem,-10vh,-2.1rem)] left-0 w-full flex items-center justify-center">
							<p className={`m-0 rounded-full px-4 py-1 font-semibold text-[clamp(0.35rem,0.95vw,0.9rem)] tracking-[0.2rem] font-['Orbitron'] transition-all duration-800
											${cardMotion.active
									? 'opacity-100 bg-blue-400/20 border border-blue-400/10 text-blue-400 uppercase tracking-[0.2rem] backdrop-blur-md shadow-[0_0px_22px_rgba(96,165,250,0.55)] border-blue-300/80'
									: 'opacity-0 rounded-full py-5 text-yellow-800 uppercase'}`}>
								{label}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
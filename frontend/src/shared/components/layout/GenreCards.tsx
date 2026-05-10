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
						animate-[cardIn_500ms_cubic-bezier(0.25,0.25,0.75,0.75)_forwards]"
			style={{ animationDelay: `${delay}ms` }}>

			<button type="button"
				onClick={onClick}
				aria-label={title}
				className="absolute inset-0 z-40 cursor-pointer bg-transparent border-0" />

			<div className="relative w-full h-full [perspective:800px]">
				<div className="relative w-full h-full [transform-style:preserve-3d]
								transition-transform duration-150 ease-out"
					style={{ transform: `rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)` }}>

					<img src="/pedestal2.png"
						alt=""
						className="absolute left-1/2 bottom-[clamp(-4.5rem,-5vw,-2rem)] z-20 w-[90%]
									pointer-events-none select-none transition-all duration-300"
						style={{
							opacity: cardMotion.active ? 1 : 0.9,
							transform: `translateX(-50%) scale(${cardMotion.active ? 1.14 : 1})`,
						}} />

					<div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
						style={{ transform: 'translateZ(30px)' }}>

						<div className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
							style={{ transform: `translate(${imageMoveXBase * -85}px, ${imageMoveYBase * -85}px)`, }}>

							<div className="w-full h-full flex items-center justify-center"
								style={{ animation: cardMotion.active ? 'floatBob 2s ease-in-out infinite' : 'none', }}>

								<img src={image}
									alt={title}
									className={` object-contain ${imageClassName}`} />
							</div>
						</div>

						<div className="absolute bottom-[clamp(-4.6rem,-10vh,-2.1rem)]
									left-0 w-full flex items-center justify-center">
							<p className="m-0 rounded-full border border-white/25 bg-black/50 px-5 py-1
										text-white text-[0.75rem] md:text-[0.8rem]
                                    	font-light uppercase tracking-[0.18rem] backdrop-blur-md shadow-[0_0_18px_rgba(255,255,255,0.22)]">
								{label}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
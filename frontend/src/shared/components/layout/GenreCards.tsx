// ┌────────────────────────────────────────────────────────────┐
// │                       GenreCards.tsx                       │
// ├────────────────────────────────────────────────────────────┤
// │ Reusable animated section card used by the start page.     │
// │ It renders a clickable 3D-like card with mouse movement,   │
// │ floating image, pedestal, label and entrance animation.    │
// └────────────────────────────────────────────────────────────┘
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

// STEP 2: Define the props required to render one genre card.
interface GenreCardProps {
	title: 'tech' | '3d' | 'arcade' | 'online' | 'creators';
	image: string;
	onClick?: () => void;
	delay?: number;
	initialTilt?: number;
	imageClassName?: string;
	label: string;
}

// ════════ COMPONENT: GenreCard: Render one animated clickable section card. ════════
export function GenreCard({
	title,
	image,
	onClick,
	delay = 0,
	initialTilt = 0,
	imageClassName = '',
	label,
}: GenreCardProps) {
	// Step 1: Store the target mouse position and the smoothed card motion.
	const mouseTarget = useRef({ x: 0, y: 0, active: false });
	const smoothMouse = useRef({ x: 0, y: 0 });
	const [cardMotion, setCardMotion] = useState({ x: 0, y: 0, active: false });
	const animationFrameRef = useRef<number | null>(null);

	// ════════ FCT: animateCard: Smoothly move the card towards the current mouse target. ════════
	const animateCard = () => {
		const SMOOTH_SPEED = 0.08;
		smoothMouse.current.x += (mouseTarget.current.x - smoothMouse.current.x) * SMOOTH_SPEED;
		smoothMouse.current.y += (mouseTarget.current.y - smoothMouse.current.y) * SMOOTH_SPEED;
		setCardMotion({ x: smoothMouse.current.x, y: smoothMouse.current.y, active: mouseTarget.current.active });

		const distanceX = Math.abs(mouseTarget.current.x - smoothMouse.current.x);
		const distanceY = Math.abs(mouseTarget.current.y - smoothMouse.current.y);
		const isAnimationFinished = distanceX < 0.001 && distanceY < 0.001;

		if (mouseTarget.current.active || !isAnimationFinished) {
			animationFrameRef.current = requestAnimationFrame(animateCard)
			return;
		}

		animationFrameRef.current = null;
	};

	// ════════ FCT: startAnimationIfNeeded: Start the animation loop only when it is not already running. ════════
	const startAnimationIfNeeded = () => {
		if (animationFrameRef.current === null)
			animationFrameRef.current = requestAnimationFrame(animateCard);
	}
	// STEP 3: Cancel the animation frame when the component is unmounted.
	useEffect(() => {
		return () => {
			if (animationFrameRef.current)
				cancelAnimationFrame(animationFrameRef.current);
		}
	}, []);

	// ════════ FCT: handleMove: Convert mouse position into normalized card movement. ════════
	const handleMove = (event: MouseEvent<HTMLDivElement>) => {
		// Step 1: Calculate the mouse position relative to the card center.
		const rect = event.currentTarget.getBoundingClientRect();
		const relativeX = ((event.clientX - rect.left) / rect.width - 0.5) * 1.5;
		const relativeY = ((event.clientY - rect.top) / rect.height - 0.5) * 1.5;
		// Step 2: Update the target motion and start the animation loop.
		mouseTarget.current = { x: relativeX, y: relativeY, active: true };
		startAnimationIfNeeded();
	};

	// ════════ FCT: handleLeave: Reset the card movement when the mouse leaves. ════════
	const handleLeave = () => {
		mouseTarget.current = { x: 0, y: 0, active: false }
		startAnimationIfNeeded();
	};

	// Step 4: Calculate rotation and image movement from the smoothed motion values.
	const cardRotateX = cardMotion.y * -20;
	const cardRotateY = cardMotion.x * 20 + initialTilt;
	const imageMoveXBase = cardMotion.x + initialTilt / 20;
	const imageMoveYBase = cardMotion.y;

	return (
		<div
			onMouseMove={handleMove}
			onMouseLeave={handleLeave}
			className="relative w-full h-[clamp(10rem,24vw,22rem)] opacity-0
						animate-[cardIn_500ms_cubic-bezier(0.25,0.25,0.75,0.75)_forwards]
						max-sm:min-w-[82vw] max-sm:w-[82vw] max-sm:h-[26rem] max-sm:snap-center max-sm:shrink-0"
			style={{ animationDelay: `${delay}ms` }}>
			{/* Step 5: Render the invisible button that makes the whole card clickable. */}
			<button type="button"
				onClick={onClick}
				aria-label={label}
				className="absolute inset-0 z-40 cursor-pointer bg-transparent border-0" />
			{/* Step 6: Render the 3D perspective container. */}
			<div className="relative w-full h-full [perspective:800px]">
				<div className="relative w-full h-full [transform-style:preserve-3d]
							transition-transform duration-150 ease-out"
					style={{ transform: `rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)` }}>

					<img src="/images/pedestal2.png"
						 alt=""
						 className="absolute left-1/2 bottom-[clamp(-4.5rem,-5vw,-2rem)] z-20 w-[90%] pointer-events-none select-none"
						 style={{
							opacity: cardMotion.active ? 1 : 0.9,
							transform: `translateX(-50%) scale(${cardMotion.active ? 1.10 : 1})`,
							transition: cardMotion.active
								? 'transform 180ms ease-out, opacity 180ms ease-out, filter 180ms ease-out'
								: 'transform 350ms ease-in-out, opacity 350ms ease-in-out, filter 350ms ease-in-out',
							filter: cardMotion.active ? 'drop-shadow(0 2px 20px rgb(59, 177, 249))' : 'none' }} />
					{/* Step 7: Render the floating card image and hover label. */}
					<div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
						style={{ transform: 'translateZ(30px)' }}>

						<div className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
							style={{ transform: `translate(${imageMoveXBase * -85}px, ${imageMoveYBase * -85}px)` }}>

							<div className="w-full h-full flex items-center justify-center"
								style={{ animation: cardMotion.active ? 'floatBob 2s ease-in-out infinite' : 'none', }}>

								<img src={image}
									 alt={title}
									 className={`object-contain ${imageClassName}`}
									 style={{ filter: cardMotion.active
											? 'drop-shadow(0 0 1px rgb(10, 10, 0)) drop-shadow(0 -5px 40px rgb(59, 177, 251))' : 'none',
											transition: 'filter 200ms ease-out',}} />
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
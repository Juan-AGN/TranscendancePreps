import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlanetBackground } from '../components/BackgroundEffects/PlanetBackground'
import { Footer } from '../components/layout/Footer'
import { useTranslation } from 'react-i18next'
import { GenreCard } from '../components/layout/GenreCards'

interface StartGateProps {
	onStart3D: () => void
	onGo2DMenu?: () => void
	onGoTech?: () => void
	onGo3D?: () => void
	onGoArcade?: () => void
	onGoCreators?: () => void
}

export function StartGate({
	onStart3D,
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
	const navTimeoutRef = useRef<number | null>(null)
	const go3DHandler = onGo3D ?? onStart3D

	const navigate = useNavigate();

	const { t } = useTranslation()

	const handleGo3D = () => {
		if (isBgZooming || !go3DHandler)
			return
		setIsBgZooming(true)
		navTimeoutRef.current = window.setTimeout(() => {
			go3DHandler()
		}, NAVIGATION_DELAY_MS)
	}

	useEffect(() => {
		return () => {
			if (navTimeoutRef.current !== null)
				window.clearTimeout(navTimeoutRef.current)
		}
	}, [])

	return (
		<div className="relative h-screen w-full overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-center bg-cover"
				style={{ backgroundImage: "url('/images/bg6.png')", transformOrigin: '50% 34%', }}
				initial={{ scale: 1, opacity: 1 }}
				animate={isBgZooming ? { scale: PLANET_ZOOM_SCALE, opacity: 0.88 } : { scale: 1, opacity: 1 }}
				transition={{ duration: BG_ZOOM_DURATION_MS / 1000, ease: [0.3, 0.05, 0.18, 1] }}>
				<div className="absolute inset-0 z-[1] pointer-events-none">
					<div className="absolute left-1/2 top-[10%] -translate-x-1/2 ">
						<h1 className="font-['Orbitron'] uppercase text-[clamp(0.7rem,1.55vw,1.65rem)] tracking-[clamp(0.28rem,0.8vw,0.65rem)]
							font-medium leading-none text-white/55 bg-clip-text bg-gradient-to-b from-white via-slate-200 to-blue-500
							select-none drop-shadow-[0_4px_2px_rgba(0,0,0,0.35)]">
							Transcendence</h1>

					</div>
					<div className="absolute left-1/2 top-[34%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[150px]" />
					<PlanetBackground />
				</div>
				<div className="absolute inset-0 z-[2] pointer-events-none
								bg-gradient-to-b from-white/20 via-white/4 to-white/30" />
				<div className="hidden dark:block absolute inset-0 z-[3] pointer-events-none bg-black/70" />
				<div className="relative z-10 h-screen w-full flex items-center justify-center overflow-hidden
								px-[clamp(0.5rem,2vw,2.5rem)]
								max-sm:items-center max-sm:justify-start max-sm:overflow-hidden max-sm:px-0">
					<div className="w-[min(77rem,94vw)]  grid grid-cols-4 gap-[clamp(0.4rem,1.4vw,1.5rem)] items-center
									translate-y-[clamp(1rem,7vh,4.5rem)] max-sm:flex max-sm:w-full max-sm:grid-cols-none
									max-sm:gap-10 max-sm:translate-y-0 max-sm:overflow-x-auto max-sm:overflow-y-hidden
									max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-smooth max-sm:px-[9vw]
									[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

						<GenreCard
							title="tech"
							image="/images/techCard.png"
							label={t('startGate.tech')}
							onClick={onGoTech}
							delay={500} initialTilt={8}
							imageClassName="scale-[0.70] translate-x-[1rem] translate-y-[clamp(1rem,5vh,3.5rem)] max-sm:scale-[0.50]"
						/>
						<GenreCard
							title="3d"
							image="/images/3dcard2.png"
							label={t('startGate.enter3d')}
							onClick={handleGo3D}
							delay={300} initialTilt={2}
							imageClassName=" scale-[0.9] translate-x-[0.8rem] translate-y-[clamp(1rem,6vh,3rem)] max-sm:scale-[0.65] " />
						<GenreCard
							title="arcade"
							image="/images/Ac3.png"
							label={t('startGate.arcade')}
							onClick={onGoArcade}
							delay={100} initialTilt={-2}
							imageClassName="scale-[0.58] translate-y-[clamp(1rem,6vh,3.5rem)] max-sm:scale-[0.50]" />
						<GenreCard
							title="creators" image="/images/3dcard4.png"
							label={t('startGate.creators')}
							onClick={onGoCreators}
							delay={700} initialTilt={-8}
							imageClassName="translate-x-[-0.6rem] translate-y-[clamp(1rem,6vh,3.5rem)] max-sm:scale-[0.55]" />
					</div>
				</div>
			</motion.div>

			<motion.div
				className="absolute inset-0 pointer-events-none z-[90] bg-white"
				initial={{ opacity: 0 }}
				animate={isBgZooming ? { opacity: 0.96 } : { opacity: 0 }}
				transition={{
					duration: WHITE_FADE_DURATION_MS / 1000,
					delay: WHITE_FADE_DELAY_MS / 1000,
					ease: 'easeInOut',
				}} />


			<div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center">
				<button
					onClick={() => navigate('/remote-game')}
					className="text-black border border-white px-6 py-2 rounded-full">
					Online Game
				</button>
			</div>
			<div className="absolute bottom-0 left-0 right-0 z-20">
				<Footer />
			</div>
		</div>
	)
}
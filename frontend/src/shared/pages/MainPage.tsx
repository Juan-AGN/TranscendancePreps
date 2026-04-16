// STARTGATE - pantalla de entrada al hub (puerta de decision)
// layout de secciones full-screen con scroll suave CSS
//
// estructura:
//   seccion 1 -> video 3D + boton entrar mundo 3D
//   seccion 2 -> entrada modo arcade 2D
//   seccion 3 -> meet the creators
//   seccion final -> footer

import { Footer } from '../components/Footer'

interface StartGateProps {
	onStart3D: () => void;
	onGo2DMenu?: () => void;
}

const CREATORS = [
	{ image: '/israface.png', alt: 'albelope', role: 'Technical Lead', username: '@albelope' },
	{ image: '/juanface.png', alt: 'juan', role: 'Project Manager', username: '@juan' },
	{ image: '/daniface.png', alt: 'd-ruiz', role: 'Backend Developer', username: '@d-ruiz' },
	{ image: '/carlosface.png', alt: 'cagarci', role: 'Product Owner', username: '@cagarci' },
]

export function StartGate({ onStart3D, onGo2DMenu }: StartGateProps) {
	return (
		<div className="h-auto xl:h-[calc(100vh-88px)] 			
						overflow-y-visible xl:overflow-y-auto overflow-x-hidden scroll-smooth
						xl:snap-y xl:snap-mandatory
						bg-black ">
			<section className="h-[calc(100vh-88px)]
								xl:snap-start
								flex items-center justify-center p-5">
				<div className="relative w-[min(90vw,95rem)] h-[82vh] rounded-3xl
																	overflow-hidden
																	shadow-2xl
																	ring-2 ring-white/50">
					<video
						src="/main3dvideo.mp4"
						autoPlay loop muted playsInline
						className='absolute inset-0 w-full h-full object-cover'>
					</video>
					<div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/1 to-transparent">
						<div className="absolute inset-0 w-full h-full flex items-end justify-end pb-8 pr-8">
							<button
								type="button"
								onClick={onStart3D}
								className="px-10 py-4 bg-white text-black font-bold text-lg rounded-2xl
											hover:bg-white/90 transition duration-300 shadow-lg"
							> ENTER 3D
							</button>
						</div>
					</div>
				</div>
			</section>
			
			<section className="h-[calc(100vh-88px)]
						xl:snap-start
						flex items-center justify-center p-5">
				<div className="w-[min(90vw,95rem)] h-[82vh] rounded-3xl
									overflow-hidden
									shadow-2xl
									ring-2 ring-white/50">
					<div className="w-full h-full flex items-center justify-evenly">
						<div className="flex flex-col gap-4 shrink-0">
							<h2 className="text-2xl font-bold text-white">Arcade 2D</h2>
							<button
								type="button"
								onClick={() => onGo2DMenu?.()}
								className="px-10 py-4 bg-white text-black font-bold text-lg rounded-2xl
											hover:bg-white/90 transition duration-300 shadow-lg">
								Arcade Mode
							</button>
						</div>
						<img src="/arcade2.png" alt="Arcade 2D" className="h-[90%] w-auto object-contain shrink-0" />
					</div>
				</div>
			</section>

			<section className="min-h-[calc(100vh-88px)] xl:h-[calc(100vh-88px)] snap-none xl:snap-start flex items-center justify-center p-5">
				<div className="w-[min(90vw,95rem)] flex flex-col h-auto xl:h-[82vh] rounded-3xl ring-2 ring-white/25 p-6">
					<h2 className="text-3xl sm:text-4xl xl:text-6xl font-bold text-white text-center shrink-0 mb-20">Meet Creators</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
						{CREATORS.map((creator) => (
							<div key={creator.username} className="bg-black rounded-2xl flex flex-col items-center p-4 min-w-0">
								<div className="w-full max-w-[20rem] aspect-square rounded-full overflow-hidden ring-2 ring-[#00E5FF]/60">
									<img src={creator.image} alt={creator.alt} className="w-full h-full object-cover" />
								</div>
								<h3 className="text-lg sm:text-xl xl:text-2xl font-bold text-white pt-3 text-center">{creator.role}</h3>
								<h3 className="text-xs sm:text-sm font-bold text-white pt-2">{creator.username}</h3>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="xl:snap-start">
				<Footer />
			</section>

		</div>
	)
}
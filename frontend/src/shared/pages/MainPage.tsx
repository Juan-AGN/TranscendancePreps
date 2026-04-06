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

export function StartGate({ onStart3D, onGo2DMenu }: StartGateProps) {
	return (
		<div className="h-[calc(100vh-88px)]				
						overflow-y-scroll overflow-x-hidden scroll-smooth
						snap-y snap-mandatory
						bg-black ">
			<section className="h-[calc(100vh-88px)]
												snap-start
												flex items-center justify-center p-5">
				<div className="relative w-full max-w-5xl h-[90%] rounded-3xl
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
						snap-start
						flex items-center justify-center p-5">
				<div className="relative w-full max-w-5xl h-[90%] rounded-3xl
									overflow-hidden
									shadow-2xl
									ring-2 ring-white/50">
					<div className="w-full h-full flex flex-row items-center justify-between px-6 sm:px-14 md:px-24">
						<div className="flex flex-col gap-4 shrink-0">
							<h2 className="text-xl sm:text-2xl font-bold text-white">Arcade 2D</h2>
							<button
								type="button"
								onClick={() => onGo2DMenu}
								className="px-6 py-3 sm:px-10 sm:py-4 bg-white text-black font-bold text-base sm:text-lg rounded-2xl
								hover:bg-white/90 transition duration-300 shadow-lg">
								Arcade Mode
							</button>
						</div>
						<img src="/arcade2.png" className="h-[55%] sm:h-[70%] w-auto object-contain shrink-0" />
					</div>
				</div>
			</section>

			<section className="h-[calc(100vh-88px)] snap-start flex items-center justify-center p-5">
				<div className="w-full max-w-5xl flex flex-col gap-4 h-[90%] rounded-3xl ring-2 ring-white/25 p-6">
					<h2 className="text-3xl font-bold text-white text-center shrink-0">Meet Creators</h2>
					<div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-0">
						<div className="bg-black rounded-2xl p-4 flex flex-col items-center min-h-0 overflow-hidden">
							<div className="flex-1 min-h-0 aspect-square max-w-full rounded-full overflow-hidden ring-2 ring-[#00E5FF]/60">
								<img src="/israface.png" className="w-full h-full object-cover" />
							</div>
							<h3 className="text-2xl font-bold text-white pt-2 shrink-0">Technical Lead</h3>
							<h3 className="text-xm font-bold text-white pt-2 shrink-0">@albelope</h3>
						</div>
						<div className="bg-black rounded-2xl p-4 flex flex-col items-center  min-h-0 overflow-hidden">
							<div className="flex-1 min-h-0 aspect-square max-w-full rounded-full overflow-hidden ring-2 ring-[#00E5FF]/60">
								<img src="/juanface.png" className="w-full h-full object-cover" />
							</div>
							<h3 className="text-2xl font-bold text-white pt-2 shrink-0">Project Manager</h3>
							<h3 className="text-xm font-bold text-white pt-2 shrink-0">@juan</h3>
						</div>
						<div className="bg-black rounded-2xl p-4 flex flex-col items-center min-h-0 overflow-hidden">
							<div className="flex-1 min-h-0 aspect-square max-w-full rounded-full overflow-hidden ring-2 ring-[#00E5FF]/60">
								<img src="/daniface.png" className="w-full h-full object-cover" />
							</div>
							<h3 className="text-2xl font-bold text-white pt-2 shrink-0">Backend Developer</h3>
							<h3 className="text-xm font-bold text-white pt-2 shrink-0">@d-ruiz</h3>
						</div>
						<div className="bg-black rounded-2xl p-4 flex flex-col items-center min-h-0 overflow-hidden">
							<div className="flex-1 min-h-0 aspect-square max-w-full rounded-full overflow-hidden ring-2 ring-[#00E5FF]/60">
								<img src="/carlosface.png" className="w-full h-full object-cover" />
							</div>
							<h3 className="text-2xl font-bold text-white pt-2 shrink-0">Product Owner</h3>
							<h3 className="text-xm font-bold text-white pt-2 shrink-0">@cagarci</h3>
						</div>
					</div>
				</div>
			</section>

			<section className="snap-start">
				<Footer />
			</section>

		</div>
	)
}
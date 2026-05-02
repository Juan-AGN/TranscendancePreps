// STARTGATE - pantalla de entrada al hub (puerta de decision)
// layout de secciones full-screen con scroll suave CSS
//
// estructura:
//   seccion 1 -> video 3D + boton entrar mundo 3D
//   seccion 2 -> entrada modo arcade 2D
//   seccion 3 -> tech & project
//   seccion 4 -> meet the creators

import { Footer } from '../components/layout/Footer'

export type MainSection = 'tech' | '3d' | 'arcade' | 'creators'

interface Mainpage2Props {
	selectedSection: MainSection
	onStart3D: () => void
	onGo2DMenu?: () => void
}

const CREATORS = [
	{ image: '/israface.png', alt: 'albelope', role: 'Technical Lead', username: '@albelope' },
	{ image: '/juanface.png', alt: 'juan', role: 'Project Manager', username: '@juan' },
	{ image: '/daniface.png', alt: 'd-ruiz', role: 'Backend Developer', username: '@d-ruiz' },
	{ image: '/carlosface.png', alt: 'cagarci', role: 'Product Owner', username: '@cagarci' },
]

const LOGOS = [
	{ image: '/imgreact.png', alt: 'React', name: 'React' },
	{ image: '/imgTypescript.png', alt: 'Typescript', name: 'Typescript' },
	{ image: '/imgTailwind.png', alt: 'Tailwind', name: 'Tailwind' },
	{ image: '/imgbabylon2.png', alt: 'Babylon', name: 'Babylon' },
	{ image: '/imgNestjs.png', alt: 'NestJS', name: 'NestJS' },
	{ image: '/imgDocker.png', alt: 'Docker', name: 'Docker' },
]

function ButtonMainPage({ label, onClick }: { label: string; onClick?: () => void }) {
	return (
		<button
			onClick={onClick}
			className="w-14 h-14 flex items-center text-[1rem] justify-center text-blue-300 cursor-pointer
					rounded-full border-5 border-white/20 uppercase
					shadow-[1px_1px_10px_1px_#eab308,-1px_-1px_10px_1px_#eab308]
					transition-all duration-700 ease-out select-none group overflow-visible
					hover:bg-black hover:shadow-[2px_2px_50px_2px_#3b82f6,0px_0px_20px_2px_#eab308] hover:text-yellow-300">
			<span className="whitespace-nowrap tracking-[0.8rem] group-hover:tracking-[1.9rem] hover:scale-130 
					transition-all duration-700 ease-out inline-block origin-center">
				{label}
			</span>
		</button>
	)
}

export function Mainpage2({ selectedSection, onStart3D, onGo2DMenu }: Mainpage2Props) {
	return (
		<div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth bg-black">
			<div>
				<div>
					{selectedSection === '3d' && (
						<section className="stack-section h-screen flex items-center justify-center pt-5 bg-top bg-cover bg-no-repeat"
							style={{ backgroundImage: "url('/bgvideo.png')" }}>
							<div className="w-[min(78vw,80rem)] flex flex-col items-center gap-8">
								<div className="stack-panel relative w-full h-[65vh] rounded-3xl overflow-hidden ">
									<video src="/main3dvideo.mp4" autoPlay loop muted playsInline
										className="absolute inset-0 w-full h-full object-cover opacity-80" />
								</div>
								<div className="relative flex h-24 min-w-[28rem] items-center justify-center rounded-full
									bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.28)_66%,transparent_72%)] ">
									<ButtonMainPage
										label="explore"
										onClick={onStart3D}
									/>
								</div>
							</div>
						</section>
					)}

					{selectedSection === 'arcade' && (
						<section className="stack-section h-screen flex items-center justify-center p-5 bg-center bg-no-repeat bg-[length:100%_100%]"
									style={{ backgroundImage: "url('/bgtop2.png')" }}>
							<div className="stack-panel relative w-[min(63vw,75rem)] h-[60vh] rounded-3xl overflow-hidden bg-black/60 backdrop-blur-[2px]
											border border-amber-300/25 shadow-[0_0_45px_8px_rgba(180,115,45,0.45)] ">
								<div className="relative w-full h-full">
									<h2 className="absolute left-[15%] top-[20%] z-20 max-w-[86%] md:max-w-[46%] text-[clamp(0.95rem,2vw,2rem)]
												font-light leading-[1.45] font-black/10 text-white tracking-[0.03em]">
										<span className="block">Welcome to Retro Arcade Pong </span>
										<span className="block">Our game is simple & easy...</span>
										<span className="block">but the challenge is elite!</span>
										<span className="block">speed, precision, focus, </span>
										<span className="block">and no room for mistakes.</span>
										<span className="block"> Are you ready?</span>
									</h2>
									<div className="absolute left-[35%] bottom-[10%] z-20 ">
										<ButtonMainPage label="Arcade Arena" onClick={onGo2DMenu} />
									</div>
									<img src="/Ac3.png" alt="Arcade 2D" className="absolute right-[5%]  h-[100%] w-auto object-contain z-10" />
								</div>
							</div>
						</section>
					)}

					{selectedSection === 'tech' && (
						<section className="stack-section h-screen flex items-center justify-center p-5 bg-center bg-no-repeat bg-[length:100%_100%]"
									style={{backgroundImage: "url('/bgTech.png')"}}>
							<div className="stack-panel relative w-[min(70vw,70rem)] h-[55vh] rounded-3xl overflow-hidden
										shadow-[1px_1px_3px_1px_#eab308,-1px_-1px_20px_1px_#eab100]/40 bg-black/60 px-6 py-8 md:px-10 md:py-10">
								<div className="w-full h-full flex flex-col justify-center">
									<h2 className="text-yellow-400 text-3xl md:text-3xl uppercase tracking-[0.40rem] mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
										Tech & Project
									</h2>
									<div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 items-center h-full">
										<div className="flex flex-col justify-center">
											<h3 className="text-white text-2xl md:text-2xl uppercase tracking-[0.30rem] mb-6">
												About the project
											</h3>
											<p className="text-white/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-[0.09rem]  text-sm md:text-lg leading-7 md:leading-8 max-w-3xl">
												Transcendence is a modern reinterpretation of the classic Pong experience,
												combining competitive gameplay, a retro arcade spirit, and an immersive 3D hub.
												The project mixes frontend, backend, real-time interaction and visual design
												to create a complete digital experience where users can explore, play,
												compete and connect inside the same platform.
											</p>
											<p className="text-white/70 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-[0.05rem] text-sm md:text-base leading-7 mt-6 max-w-3xl">
												The goal was not only to build a game, but to create a full universe around it:
												a navigable 3D environment, a polished interface, structured backend logic,
												auth system, game modes, and a visual identity inspired by futuristic arcade culture.
											</p>
										</div>
										<div className="grid grid-cols-2">
											{LOGOS.map((tech) => (
												<div
													key={tech.name}
													className="group p-2 flex flex-col items-center text-center hover:border-yellow-300/40
														hover:shadow-[0px_0px_25px_0px_rgba(250,204,21,0.12)] transition-all duration-500" >
													<div className="w-40 h-25  flex items-center justify-center">
														<img
															src={tech.image}
															alt={tech.alt}
															className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
														/>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</section>
					)}

					{selectedSection === 'creators' && (
						<section className="stack-section h-screen flex items-center justify-center p-5 bg-center bg-cover bg-no-repeat "
							style={{ backgroundImage: "url('/bgCreators.png')" }}>
							<div className="stack-panel relative w-[min(63vw,65rem)] h-[65vh] rounded-3xl border-1 overflow-hidden flex flex-col items-center justify-center p-5 md:p-7 ">
								<h2 className="text-4xl md:text-4xl font-light text-yellow-400 tracking-[0.35rem] uppercase mb-6 md:mb-8 opacity-80 text-center">
									Meet Creators
								</h2>
								<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8 w-full max-w-5xl">
									{CREATORS.map((creator) => (
										<div key={creator.username} className="creator-card flex flex-col items-center group">
											<div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-3 md:mb-4">
												<div className="absolute inset-0 rounded-full blur-lg group-hover:bg-[#00E5FF] scale-110 transition-all duration-800"></div>
												<div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-[#00E5FF]/50">
													<img
														src={creator.image}
														alt={creator.alt}
														className="w-full h-full object-cover grayscale-[50%] group-hover:scale-112 group-hover:grayscale-0 transition-all duration-700"
													/>
												</div>
											</div>
											<h3 className="text-[0.68rem] md:text-sm font-bold text-white tracking-wider uppercase mb-2 h-6 text-center leading-tight">
												{creator.role}
											</h3>

											<div className="scale-[0.52] sm:scale-[0.62] md:scale-75 transition-transform duration-500 group-hover:scale-[0.8] md:group-hover:scale-90">
												<ButtonMainPage label={creator.username} />
											</div>
										</div>
									))}
								</div>
							</div>
						</section>
					)}
				</div>

				<section>
					<Footer />
				</section>
			</div>
		</div>
	)
}

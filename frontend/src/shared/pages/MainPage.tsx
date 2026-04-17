// STARTGATE - pantalla de entrada al hub (puerta de decision)
// layout de secciones full-screen con scroll suave CSS
//
// estructura:
//   seccion 1 -> video 3D + boton entrar mundo 3D
//   seccion 2 -> entrada modo arcade 2D
//   seccion 3 -> meet the creators
//   seccion final -> footer

import { Footer } from '../components/Footer';
import { useRef } from 'react';
import { useLenisGsaEffect } from '../hooks/useLenisGsaEffect';

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

const LOGOS = [
	{ image: '/imgreact.png', alt: 'React', name: 'React' },
	{ image: '/imgTypescript.png', alt: 'Typescript', name: 'Typescript' },
	{ image: '/imgTailwind.png', alt: 'Tailwind', name: 'Tailwind' },
	{ image: '/imgbabylon2.png', alt: 'Babylon', name: 'Babylon' },
	{ image: '/imgNestjs.png', alt: 'NestJS', name: 'NestJS' },
	{ image: '/imgDocker.png', alt: 'Docker', name: 'Docker' }
]

function ButtonMainPage({ label, onClick }: { label: string; onClick?: () => void }) {
	return (
		<button
			onClick={onClick}
			className="w-14 h-14 flex items-center justify-center text-white cursor-pointer
					rounded-full border-5 border-white/20 uppercase font-light  
					shadow-[1px_1px_10px_1px_#eab308,-1px_-1px_10px_1px_#eab308] 
        			transition-all duration-700 ease-out select-none group overflow-visible 
					hover:bg-black  hover:shadow-[2px_2px_50px_2px_#3b82f6,0px_0px_20px_2px_#eab308] hover:text-yellow-200">
			<span className="whitespace-nowrap tracking-[0.9rem] group-hover:tracking-[1.8rem] hover:scale-125 transition-all duration-700">
				{label}
			</span>
		</button>
	)
}

export function StartGate({ onStart3D, onGo2DMenu }: StartGateProps) {
	const sectionRef = useRef<HTMLDivElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const stackRef = useRef<HTMLDivElement | null>(null);

	useLenisGsaEffect({
		wrapperRef: sectionRef,
		contentRef,
		stackRef,
	});

	return (
		<div ref={sectionRef}
			className="h-[calc(100vh-88px)] overflow-y-auto overflow-x-hidden scroll-smooth
						bg-black ">
			<div ref={contentRef}>
				<div ref={stackRef}>
					<section className="stack-section h-[calc(100vh-88px)] flex items-center justify-center p-5 bg-black">
						<div className="stack-panel relative w-[min(90vw,95rem)] h-[82vh] rounded-3xl
								overflow-hidden shadow-[10px_10px_30px_10px_#1E3A8A,-10px_-10px_30px_10px_#1E3A8A]">
							<video
								src="/main3dvideo.mp4"
								autoPlay loop muted playsInline
								className='absolute inset-0 w-full h-full object-cover'>
							</video>
							<div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/1 to-transparent pb-12 pr-12">
								<div className="absolute inset-0 w-full h-full flex items-end justify-end pb-15 pr-40">
									<ButtonMainPage label="explore" onClick={onStart3D}></ButtonMainPage>
								</div>
							</div>
						</div>
					</section>

					<section className="stack-section h-[calc(100vh-88px)] flex items-center justify-center p-5 bg-black">
						<div className="stack-panel relative w-[min(90vw,95rem)] h-[82vh] rounded-3xl overflow-hidden
										shadow-[10px_10px_30px_10px_#7A4E2D,-10px_-10px_30px_10px_#7A4E2D] ">
							<div className="relative w-full h-full">
								<h2 className="absolute left-[15%] top-[20%] z-20 max-w-[86%] md:max-w-[46%] text-[clamp(0.95rem,2vw,2rem)] font-light leading-[1.45] font-black/10 text-white tracking-[0.03em]">
									<span className="block">Welcome to Retro Arcade Pong </span>
									<span className="block">Our game is simple & easy...</span>
									<span className="block">but the challenge is elite!</span>
									<span className="block">speed, precision, focus, </span>
									<span className="block">and no room for mistakes.</span>
									<span className="block"> Are you ready?</span>
								</h2>

								<div className="absolute left-[30%] bottom-[20%] z-20">
									<ButtonMainPage label="Arcade Arena" onClick={onGo2DMenu} />
								</div>

								<img
									src="/arcade2.png"
									alt="Arcade 2D"
									className="absolute right-[12%] bottom-[4%] h-[86%] w-auto object-contain z-10"
								/>
							</div>
						</div>
					</section>

					<section className="stack-section h-[calc(100vh-88px)] flex items-center justify-center p-5 bg-black">
						<div className="stack-panel relative w-[min(90vw,95rem)] h-[82vh] rounded-3xl overflow-hidden
										shadow-[10px_10px_30px_10px_#eab308,-10px_-10px_30px_10px_#eab100] bg-black px-6 py-8 md:px-10 md:py-10">
							<div className="w-full h-full flex flex-col justify-center">
								<h2 className="text-3xl md:text-5xl font-light text-white tracking-[0.5rem] uppercase mb-8 opacity-80 text-center">
									Tech & Project
								</h2>

								<div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-10 items-center h-full">
									<div className="flex flex-col justify-center">
										<h3 className="text-white text-2xl md:text-3xl uppercase tracking-[0.25rem] mb-6">
											About the project
										</h3>

										<p className="text-white/80 text-sm md:text-lg leading-7 md:leading-8 max-w-3xl">
											Transcendence is a modern reinterpretation of the classic Pong experience,
											combining competitive gameplay, a retro arcade spirit, and an immersive 3D hub.
											The project mixes frontend, backend, real-time interaction and visual design
											to create a complete digital experience where users can explore, play,
											compete and connect inside the same platform.
										</p>

										<p className="text-white/60 text-sm md:text-base leading-7 mt-6 max-w-3xl">
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
															hover:shadow-[0px_0px_25px_0px_rgba(250,204,21,0.12)] transition-all duration-500">
												<div className="w-50 h-40 flex items-center justify-center">
													<img
														src={tech.image}
														alt={tech.alt}
														className="w-full h-full object-contain group-hover:scale-130 transition-transform duration-500"
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</section>

					<section className="stack-section h-[calc(100vh-88px)] flex items-center justify-center p-5 bg-black">
						<div className="stack-panel relative w-[min(90vw,95rem)] h-[82vh] rounded-3xl overflow-hidden 
										shadow-[10px_10px_30px_10px_#00E5FF,-10px_-10px_30px_10px_#00E5FF] flex flex-col items-center justify-center p-8 bg-black">

							<h2 className="text-4xl md:text-5xl font-light text-white tracking-[0.5rem] uppercase mb-12 opacity-80">
								Meet Creators
							</h2>

							<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-12 w-full max-w-7xl">
								{CREATORS.map((creator) => (
									<div key={creator.username} className="creator-card flex flex-col items-center group">
										<div className="relative w-40 h-40 md:w-70 md:h-70 mb-5">
											<div className="absolute inset-0 rounded-full blur-lg group-hover:bg-[#00E5FF] scale-110 transition-all duration-800"></div>
											<div className="relative w-full h-full rounded-full  overflow-hidden ring-2 ring-[#00E5FF]/50">
												<img
													src={creator.image}
													alt={creator.alt}
													className="w-full h-full object-cover grayscale-[50%] group-hover:scale-112 group-hover:grayscale-0 transition-all duration-700" />
											</div>
										</div>

										<h3 className="text-lg font-bold text-white tracking-wider uppercase mb-6 h-8">
											{creator.role}
										</h3>

										<div className="scale-75 md:scale-90 transition-transform duration-500 group-hover:scale-100">
											<ButtonMainPage
												label={creator.username} />
										</div>
									</div>
								))}
							</div>
						</div>
					</section>
				</div>

				<section>
					<Footer />
				</section>
			</div>
		</div>
	)
}
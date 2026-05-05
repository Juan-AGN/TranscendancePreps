// STARTGATE - pantalla de entrada al hub (puerta de decision)
// layout de secciones full-screen con scroll suave CSS
//
// estructura:
//   seccion 1 -> video 3D + boton entrar mundo 3D
//   seccion 2 -> entrada modo arcade 2D
//   seccion 3 -> tech & project
//   seccion 4 -> meet the creators

import { Footer } from '../components/layout/Footer'
import { motion } from 'framer-motion'

export type MainSection = 'tech' | '3d' | 'arcade' | 'creators' // tipo union: las 4 secciones posibles

interface Mainpage2Props {
	selectedSection: MainSection  // sección activa que se renderiza
	onStart3D: () => void         // callback al pulsar "explore" (mundo 3D)
	onGo2DMenu?: () => void       // callback opcional al pulsar "Arcade Arena"
}

const CREATORS = [                                                                               // lista estática de los 4 creadores
	{ image: '/israChar.png', alt: 'albelope', role: 'Technical Lead', username: 'albelope' },
	{ image: '/juanCHar2.png', alt: 'juan', role: 'Project Manager', username: 'juan' },
	{ image: '/danichar4.png', alt: 'd-ruiz', role: 'Backend Developer', username: 'd-ruiz' },
	{ image: '/carlosChar5.png', alt: 'cagarci', role: 'Product Owner', username: 'cagarci' },
]

const LOGOS = [                                               // tecnologías del stack mostradas en la sección tech
	{ image: '/imgreact.png', alt: 'React', name: 'React' },
	{ image: '/imgTypescript.png', alt: 'Typescript', name: 'Typescript' },
	{ image: '/imgTailwind.png', alt: 'Tailwind', name: 'Tailwind' },
	{ image: '/imgbabylon2.png', alt: 'Babylon', name: 'Babylon' },
	{ image: '/imgNestjs.png', alt: 'NestJS', name: 'NestJS' },
	{ image: '/imgDocker.png', alt: 'Docker', name: 'Docker' },
]

function ButtonMainPage({
	label,
	onClick,
	tracking = "tracking-[0.8rem]",           // espaciado de letras por defecto
	textColor = "text-blue-300",              // color de texto por defecto
	size = "w-14 h-14",                       // tamaño del botón circular por defecto
	hoverTracking = "group-hover:tracking-[0.9rem]", // espaciado al hacer hover
	textSize = "text-[1rem]",                 // tamaño de fuente por defecto
}: {
	label: string
	onClick?: () => void
	tracking?: string
	textColor?: string
	size?: string
	hoverTracking?: string
	textSize?: string
}) {
	return (
		<button
			onClick={onClick}
			className={`${size} flex items-center justify-center ${textColor} cursor-pointer
				rounded-full border-5 border-white/20 uppercase
				shadow-[1px_1px_10px_1px_#eab308,-1px_-1px_10px_1px_#eab308]
				transition-all duration-700 ease-out select-none group overflow-visible
				hover:bg-black hover:shadow-[2px_2px_50px_2px_#3b82f6,0px_0px_20px_2px_#eab308] hover:text-yellow-300`}>
			{/* glow amarillo en reposo; hover → fondo negro + glow azul/amarillo + texto yellow */}
			<span className={`whitespace-nowrap ${tracking} ${hoverTracking} ${textSize}
				transition-all duration-1000 ease-out inline-block origin-center`}>
				{label}
			</span>
		</button>
	)
}

export function Mainpage2({ selectedSection, onStart3D, onGo2DMenu }: Mainpage2Props) { // componente principal: renderiza solo la sección activa
	return (
		<motion.div
			initial={{ opacity: 0, scale: 1, filter: 'blur(6px)' }}
			animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
			transition={{ duration: 2.1, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
			className="h-full overflow-y-auto overflow-x-hidden scroll-smooth bg-black"
		> {/* contenedor raíz, scroll suave */}
			<div>
				<div>
					{selectedSection === '3d' && ( // sección 3D: solo visible si selectedSection === '3d'
						<section className="stack-section h-screen flex items-center justify-center py-16 bg-top bg-cover bg-no-repeat"
							style={{ backgroundImage: "url('/bgvideo.png')" }}> {/* fondo de pantalla completa */}
							<div className="w-[min(78vw,80rem)] flex flex-col items-center gap-12">
								<div className="stack-panel relative w-full h-[65vh] rounded-3xl overflow-hidden ">
									{/* video de fondo del mundo 3D, silenciado y en loop */}
									<video src="/main3dvideo.mp4" autoPlay loop muted playsInline
										className="absolute inset-0 w-full h-full object-cover opacity-80" />
								</div>
								<div className="relative flex h-24 min-w-[28rem] items-center justify-center rounded-full
									bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.28)_66%,transparent_72%)] ">
									<ButtonMainPage label="explore" onClick={onStart3D} />
								</div>
							</div>
						</section>
					)}

					{selectedSection === 'arcade' && ( // sección Arcade: solo visible si selectedSection === 'arcade'
						<section className="stack-section h-screen flex items-center justify-center py-16 px-5 bg-center bg-no-repeat bg-[length:100%_100%]"
							style={{ backgroundImage: "url('/bgtop2.png')" }}> {/* fondo arcade estirando la imagen al 100% */}
							<div className="stack-panel relative w-[min(63vw,75rem)] h-[65vh] rounded-3xl overflow-hidden bg-black/60 backdrop-blur-[2px]
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
										<ButtonMainPage label="Arcade Arena" onClick={onGo2DMenu} /> {/* botón que navega al menú 2D */}
									</div>
									<img src="/Ac3.png" alt="Arcade 2D" className="absolute right-[5%]  h-[100%] w-auto object-contain z-10" /> {/* imagen decorativa arcade a la derecha */}
								</div>
							</div>
						</section>
					)}

					{selectedSection === 'tech' && ( // sección Tech: solo visible si selectedSection === 'tech'
						<section className="stack-section h-screen flex items-center justify-center py-16 px-5 bg-center bg-no-repeat bg-[length:100%_100%]"
							style={{ backgroundImage: "url('/bgTech.png')" }}> {/* fondo tech */}
							<div className="stack-panel relative w-[min(70vw,70rem)] h-[60vh] rounded-3xl overflow-hidden
										shadow-[1px_1px_3px_1px_#eab308,-1px_-1px_20px_1px_#eab100]/40 bg-black/60 px-8 py-12 md:px-12 md:py-14">
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
										<div className="grid grid-cols-2"> {/* grid 2 columnas para los logos de tecnologías */}
											{LOGOS.map((tech) => ( // itera sobre el array LOGOS
												<div
													key={tech.name}
													className="group p-2 flex flex-col items-center text-center hover:border-yellow-300/40
														hover:shadow-[0px_0px_25px_0px_rgba(250,204,21,0.12)] transition-all duration-500" >
													<div className="w-40 h-25  flex items-center justify-center">
														<img src={tech.image} alt={tech.alt}
															className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</section>
					)}

					{selectedSection === 'creators' && ( // sección Creators: solo visible si selectedSection === 'creators'
						<section
							className="stack-section relative h-screen flex items-center justify-center py-12 bg-center bg-[length:100%_100%]"
							style={{ backgroundImage: "url('/bgCreators.png')" }}> {/* fondo creators */}
							<div className="absolute inset-0 bg-white/20" /> {/* overlay blanco semitransparente sobre el fondo */}

							<div className="relative stack-panel z-10 w-[min(72vw,82rem)] h-[88vh] rounded-3xl overflow-hidden flex flex-col items-center">
								<div className="grid grid-cols-4 w-full max-w-5xl mt-auto items-end gap-20"> {/* 4 columnas, una por creador */}
									{CREATORS.map((creator) => ( // itera sobre el array CREATORS
										<div key={creator.username}
											className="creator-card group/creator flex flex-col items-center justify-end">
											<div className="flex flex-col items-center">
												<div className="peer group order-2 relative z-10 flex items-center justify-center overflow-visible cursor-pointer
															transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.04]"> {/* placa con username; order-2 → queda debajo del personaje */}
													<img src="/placa5.png"
														alt={`placa ${creator.username}`}
														className="h-[12rem] w-[17rem] scale-x-[1.4] object-contain 
															drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out
															group-hover:drop-shadow-[0_4px_22px_rgba(56,189,248,0.85)]"/>
													<span className="absolute mt-17 text-[1.5rem] font-bold font-serif uppercase  text-[#7a5a32]
															transition-all duration-1000 ease-out group-hover:tracking-[0.3rem] ">
														{creator.username}
													</span>
												</div>

												{/* contenedor del personaje: sube y escala con hover en la placa (peer); aura dorada */}
												<div className="creator-god-aura order-1 z-20 relative w-68 h-[27rem] overflow-visible rounded-xl
															transition-all duration-700 ease-out peer-hover:-translate-y-10 peer-hover:scale-[1.1]
															peer-hover:drop-shadow-[2px_-30px_40px_rgba(234,179,8,0.35)]">
													{/* badge de rol: textura mármol blanco + ribete dorado, igual que la placa/pedestal */}
													<h3 className="absolute top-8 left-1/2 z-30 w-max -translate-x-1/2 rounded-full border-2 border-[#c9a447]
															bg-gradient-to-br from-white via-[#e8e4de] to-[#cec9c0] px-4 py-1 text-[0.85rem]  
															leading-none tracking-[0.05rem] text-[#6b4e18] font-black uppercase
															shadow-[0_2px_0_rgba(255,255,255,0.9)_inset,0_-1px_0_rgba(0,0,0,0.18)_inset,0_4px_14px_rgba(0,0,0,0.45),0_0_10px_rgba(201,164,71,0.35)]">
														{creator.role}
													</h3>
													<div className="relative w-full h-full overflow-visible mt-23">
														<img alt={creator.alt}
															src={creator.image}
															className="w-full h-full z-10 object-cover object-top
																drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)]"/>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</section>
					)}
				</div>
			</div>
		</motion.div>
	)
}

// ┌────────────────────────────────────────────────────────────┐
// │                      SectionsPage.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ Routed section page for the main frontend experience.      │
// │ It renders only the selected section: 3D, Arcade, Tech or  │
// │ Creators, using translated texts and visual section assets.│
// └────────────────────────────────────────────────────────────┘
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MainPageButton } from '../components/Buttons/MainPageButton';
// STEP 2: Define the available main sections.
type MainSection = 'tech' | '3d' | 'arcade' | 'creators';

// STEP 3: Define the props received by the section renderer.
interface Mainpage2Props {
	selectedSection: MainSection;
	onStart3D: () => void;         
	onGo2DMenu?: () => void;       
}
// STEP 4: Define the creators displayed in the creators section.
const CREATORS = [
	{ image: '/images/israChar.png', role: 'sections.creators.technicalLead', username: 'albelope' },
	{ image: '/images/juanCHar2.png', role: 'sections.creators.projectManager', username: 'juan' },
	{ image: '/images/danichar4.png', role: 'sections.creators.backendDev', username: 'd-ruiz' },
	{ image: '/images/carlosChar5.png', role: 'sections.creators.productOwner', username: 'cagarci' },
]
// STEP 5: Define the technology logos displayed in the tech section.
const LOGOS = [
	{ image: '/images/imgreact.png', alt: 'React', name: 'React' },
	{ image: '/images/imgTypescript.png', alt: 'Typescript', name: 'Typescript' },
	{ image: '/images/imgTailwind.png', alt: 'Tailwind', name: 'Tailwind' },
	{ image: '/images/imgbabylon2.png', alt: 'Babylon', name: 'Babylon' },
	{ image: '/images/imgNestjs.png', alt: 'NestJS', name: 'NestJS' },
	{ image: '/images/imgDocker.png', alt: 'Docker', name: 'Docker' },
]
// ════════ COMPONENT: Mainpage2: Render the currently selected main section. ════════
export function Mainpage2({ selectedSection, onStart3D, onGo2DMenu }: Mainpage2Props) {
	const { t } = useTranslation();
	return (
		<motion.div
			initial={{ opacity: 0, scale: 1, filter: 'blur(6px)' }}
			animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
			transition={{ duration: 2.1, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
			className="h-full  overflow-x-hidden scroll-smooth bg-black">
				{/* STEP 2: Render the 3D section when selected. */}
			{selectedSection === '3d' && (
				<section className="min-h-screen overflow-y-visible flex items-center justify-center py-[clamp(2rem,5vh,4rem)] bg-top bg-cover bg-no-repeat"
					style={{ backgroundImage: "url('/images/bgvideo.png')" }}>
					<div className="w-[min(78vw,80rem)] flex flex-col items-center gap-12">
						<div className="relative w-full h-[65vh] rounded-3xl overflow-hidden ">
							{/* Step 1: Render the 3D preview video as a muted looping background. */}
							<video src="/videos/main3dvideo.mp4" autoPlay loop muted playsInline
								className="absolute inset-0 w-full h-full object-cover opacity-80" />
						</div>
						<div className="relative flex h-[clamp(4.5rem,10vh,4rem)] w-[clamp(12rem,30vw,24rem)] items-center justify-center rounded-full
									bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.28)_66%,transparent_72%)] ">
							<MainPageButton label={t('sections.3d.explore')} onClick={onStart3D} />
						</div>
					</div>
				</section>
			)}
			{/* STEP 3: Render the Arcade section when selected. */}
			{selectedSection === 'arcade' && (
				<section className="h-screen flex items-center justify-center py-16 px-5 bg-center bg-no-repeat bg-[length:100%_100%]"
					style={{ backgroundImage: "url('/images/bgtop2.png')" }}>
					<div className="relative w-[63vw] max-w-[75rem] max-lg:w-[82vw] max-sm:w-[63vw] h-[65vh] max-lg:h-[58vh] max-sm:h-[58vh]  rounded-3xl 
								overflow-hidden bg-black/60 backdrop-blur-[2px] border border-amber-300/25 shadow-[0_0_45px_8px_rgba(180,115,45,0.45)] ">
						<div className="relative w-full h-full">
							{/* Step 1: Render the arcade introduction text. */}
							<h2 className="absolute left-[15%] top-[20%] max-lg:left-[12%] max-lg:top-[22%] max-sm:left-[15%] max-sm:top-[20%] z-20 
									max-w-[86%] md:max-w-[46%] max-lg:max-w-[38%] max-sm:max-w-[86%] text-[clamp(0.95rem,2vw,2rem)] max-lg:text-[0.85rem]
									max-sm:text-[0.95rem] font-light leading-[1.45] text-white tracking-[0.03em]">
								<span className="block">{t('sections.arcade.welcome')}</span>
								<span className="block">{t('sections.arcade.simple')}</span>
								<span className="block">{t('sections.arcade.challenge')}</span>
								<span className="block">{t('sections.arcade.skills')}</span>
								<span className="block">{t('sections.arcade.noMistakes')}</span>
								<span className="block">{t('sections.arcade.ready')}</span>
							</h2>
							{/* Step 2: Render the button that enters the 2D arcade menu. */}
							<div className="absolute left-[35%] bottom-[10%] z-20 max-sm:left-1/2 max-sm:bottom-[5%] max-sm:-translate-x-1/2">
								<MainPageButton label={t('sections.arcade.enterBtn')} onClick={onGo2DMenu} />
							</div>
							{/* Step 3: Render the decorative arcade image. */}
							<img src="/images/Ac3.png" alt="Arcade 2D" className="absolute right-[5%] h-[100%] max-lg:right-[3%] max-lg:h-[88%]
								max-lg:bottom-[4%] max-sm:right-[5%] max-sm:h-[100%] max-sm:bottom-0 max-sm:opacity-35 w-auto object-contain z-10" /> {/* imagen decorativa arcade a la derecha */}
						</div>
					</div>
				</section>
			)}
			{/* STEP 4: Render the Tech section when selected. */}
			{selectedSection === 'tech' && (
				<section className="min-h-screen flex items-center justify-center py-16 px-5 bg-center bg-no-repeat bg-[length:100%_100%]"
					style={{ backgroundImage: "url('/images/bgTech.png')" }}>
					<div className="relative w-[min(80vw,70rem)] max-h-[80vh] rounded-3xl overflow-y-auto premium-scrollbar
										shadow-[1px_1px_3px_1px_#eab308,-1px_-1px_20px_1px_#eab100]/40 bg-black/60 px-8 py-12 md:px-12 md:py-14">
						<div className="w-full h-full flex flex-col justify-center">
							{/* Step 1: Render the tech section title and project description. */}
							<h2 className="text-yellow-400 text-3xl md:text-3xl uppercase tracking-[0.40rem] mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
								{t('sections.tech.title')}
							</h2>
							<div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 items-center h-full">
								<div className="flex flex-col justify-center">
									<h3 className="text-white text-2xl md:text-2xl uppercase tracking-[0.30rem] mb-6">
										{t('sections.tech.subtitle')}
									</h3>
									<p className="text-white/90 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-[0.09rem]  text-sm md:text-lg leading-7 md:leading-8 max-w-3xl">
										{t('sections.tech.desc1')}
									</p>
									<p className="text-white/70 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-[0.05rem] text-sm md:text-base leading-7 mt-6 max-w-3xl">
										{t('sections.tech.desc2')}
									</p>
								</div>
								{/* Step 2: Render the technology stack logos. */}
								<div className="grid grid-cols-2 "> 
									{LOGOS.map((tech) => (
										<div
											key={tech.name}
											className="group p-2 flex flex-col items-center text-center hover:border-yellow-300/40
														hover:shadow-[0px_0px_25px_0px_rgba(250,204,21,0.12)] transition-all duration-500">
											<div className="w-[clamp(8.5rem,10vw,10rem)] h-[clamp(3rem,7vw,6.25rem)] flex items-center justify-center">
												<img src={tech.image} alt={tech.alt}
													className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
											</div>
											<span className="text-white/70 text-xs uppercase tracking-widest mt-1">{tech.name}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>
			)}
			{/* STEP 5: Render the Creators section when selected. */}
			{selectedSection === 'creators' && (
				<section
					className="relative min-h-[100svh] lg:h-screen flex items-center justify-center overflow-hidden bg-center bg-cover lg:bg-[length:100%_100%]"
					style={{ backgroundImage: "url('/images/bgCreators.png')" }}>
						{/* Step 1: Render the overlay used to improve contrast. */}
					<div className="absolute inset-0 bg-white/20 dark:bg-black/70" />

					<div className="relative z-10 w-[94vw] lg:w-[min(82rem,96vw)] xl:w-[min(82rem,90vw)] min-h-[calc(100svh-4.5rem)] lg:h-[88vh] rounded-3xl flex flex-col justify-center lg:justify-end items-center">
						<div className="w-full max-h-[calc(100svh-4.5rem)] overflow-y-auto overflow-x-hidden lg:overflow-visible lg:max-h-none">
							{/* Step 2: Render the creator cards grid. */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full min-h-full items-center lg:items-end justify-items-center gap-x-2 gap-y-6 lg:gap-[clamp(0.1rem,1vw,1rem)]">
								{CREATORS.map((creator) => (
									<div
										key={creator.username}
										className="creator-card group/creator flex flex-col items-center justify-center lg:justify-end origin-center lg:origin-bottom
										scale-[0.78] md:scale-[0.68] lg:scale-[0.82] xl:scale-100
										transition-all duration-1000">
											{/* Step 3: Render the creator name plate. */}
										<div className="flex flex-col items-center">
											<div className="peer group order-2 relative z-10 flex items-center justify-center overflow-visible cursor-pointer
												transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.04]">
												<img
													src="/images/placa5.png"
													alt={`name plate for ${creator.username}`}
													className="h-[10rem] md:h-[11rem] xl:h-[12rem] w-[17rem] scale-x-[1.0] md:scale-x-[1.1] xl:scale-x-[1.0] object-cover
													drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out
													group-hover:drop-shadow-[0_4px_22px_rgba(56,189,248,0.85)]"/>

												<span className="absolute mt-17 text-[1.5rem] font-bold font-serif uppercase text-[#7a5a32]
														transition-all duration-1000 ease-out group-hover:tracking-[0.3rem]">
													{creator.username}
												</span>
											</div>
											{/* Step 4: Render the creator character and translated role. */}
											<div className="creator-god-aura order-1 z-20 relative w-68 h-[24rem] md:h-[26rem] xl:h-[27rem] overflow-visible rounded-xl
												transition-all duration-700 ease-out peer-hover:-translate-y-10 peer-hover:scale-[1.1]
												peer-hover:drop-shadow-[2px_-30px_40px_rgba(234,179,8,0.35)]">
												<h3 className="absolute top-8 left-1/2 z-30 w-max -translate-x-1/2 rounded-full border-2 border-[#c9a447]
													bg-gradient-to-br from-white via-[#e8e4de] to-[#cec9c0] px-4 py-1 text-[0.85rem]
													leading-none tracking-[0.05rem] text-[#6b4e18] font-black uppercase
													shadow-[0_2px_0_rgba(255,255,255,0.9)_inset,0_-1px_0_rgba(0,0,0,0.18)_inset,0_4px_14px_rgba(0,0,0,0.45),0_0_10px_rgba(201,164,71,0.35)]">
													{t(creator.role)}
												</h3>

												<div className="relative w-full h-full overflow-visible mt-23">
													<img
														alt={creator.username}
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
					</div>
				</section>
			)}

		</motion.div>
	)
}

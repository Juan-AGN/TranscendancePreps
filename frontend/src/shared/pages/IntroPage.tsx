import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function IntroButtons({ label, onCLick }: { label: string; onCLick?: () => void }) { // boton reutilizable pa la intro
	return (
		<button onClick={onCLick}
			className=" group relative overflow-hidden whitespace-nowrap text-[#9b7431] text-[clamp(0.72rem,0.9vw,0.95rem)]
				px-[clamp(1.1rem,4vw,5rem)] py-[clamp(0.55rem,1.2vw,1rem)] rounded-full font-medium
				border-2 border-[#c9952f] bg-white/[0.78] backdrop-blur-xl tracking-[0.15em] uppercase
				shadow-[0_6px_16px_rgba(90,60,20,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] 
				transition-all duration-500 ease-out active:scale-[0.90]
				hover:scale-[1.04] hover:border-[#fff1b8] hover:bg-white hover:text-white 
				hover:shadow-[0_0_24px_rgba(234,179,8,0.70),0_10px_24px_rgba(90,60,20,0.28),inset_0_1px_0_rgba(255,255,255,0.75)]" >
			<span className="relative z-10">{label}</span>
			<span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
					duration-500 bg-gradient-to-r from-[#b47a12]/80 via-[#ffe58a]/70 to-[#b47a12]/80"></span>
		</button>
	)
}

export function SplashScreen() {
	const navigate = useNavigate()
	const [showLogo, setShowLogo] = useState(false)
	const [showTitle, setShowTitle] = useState(false)
	const [showButtons, setShowButtons] = useState(false)

	useEffect(() => {
		const t1 = setTimeout(() => setShowLogo(true), 200)
		const t2 = setTimeout(() => setShowTitle(true), 1100)
		const t3 = setTimeout(() => setShowButtons(true), 1500)
		return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
	}, [])

	return (
		<div
			className="fixed inset-0 bg-black flex flex-col items-center justify-start overflow-hidden
					bg-center bg-no-repeat bg-cover"
			style={{ backgroundImage: "url('/bg7.png')" }}>
			<div className="w-full max-w-[1400px] min-h-full flex flex-col items-center justify-between px-4 pt-[clamp(2rem,8vh,6.25rem)] pb-[clamp(1rem,4vh,2.5rem)]">
				<div className="flex flex-col items-center gap-[clamp(0.15rem,0.6vh,0.4rem)] w-full">
					<img src="/logoT.png" alt="Logo"
						className={`w-[clamp(110px,22vw,420px)] max-h-[22vh] object-contain transition-all duration-3000 ease-out
							${showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-60"}
							animate-logo-pulse`} />
					<img src="/titleT2.png"
						alt="Title"
						className={`w-[clamp(280px,88vw,1200px)] max-h-[34vh] mt-[clamp(0.5rem,2vh,1.25rem)] object-contain transition-[opacity] duration-2500 ease-out
						${showTitle ? "opacity-100" : "opacity-0"}`}
						style={showTitle ? { animation: 'float 8s ease-in-out infinite' } : {}} />
					<p className={`text-center text-yellow-600 text-[clamp(0.62rem,1.1vw,1.1rem)] tracking-[0.18em] uppercase font-light px-3
							transition-opacity duration-1100 ease-out mt-[clamp(-0.4rem,-0.8vh,-0.15rem)]
					${showTitle ? "opacity-100" : "opacity-0"}`}>
						3D HUB · ARCADE PONG · REALTIME BATTLES · 42 PROJECT
					</p>
				</div>
				<div className={`w-full flex flex-wrap items-center justify-center py-[clamp(1rem,3.6vh,2.5rem)] gap-[clamp(0.6rem,1.8vw,2rem)] transition-all duration-2700 ease-out
				${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<IntroButtons label="Guest" onCLick={() => navigate("start")} />
					<IntroButtons label="42 Login" onCLick={() => navigate("Login42")} />
					<IntroButtons label="Login" onCLick={() => navigate("login")} />
				</div>
				<p className={`text-center text-yellow-600 text-[clamp(0.62rem,1.05vw,1rem)] py-[clamp(0.4rem,2vh,1.8rem)] tracking-[0.14em] uppercase font-light px-3
						transition-opacity duration-1100 ease-out
					${showTitle ? "opacity-100" : "opacity-0"}`}>
					v1.0 - · - realtime pong experience - · - 42 malaga
				</p>
			</div>
		</div>
	)
}

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function IntroButtons({ label, onCLick }: { label: string; onCLick?: () => void }) { // boton reutilizable pa la intro
	return (
		<button onClick={onCLick}
			className=" group relative overflow-hidden text-[#9b7431] text-[0.95rem] px-20 py-4 rounded-full font-medium
				border-2 border-[#c9952f] bg-white/[0.78] backdrop-blur-xl tracking-[0.15em] uppercase
				shadow-[0_6px_16px_rgba(90,60,20,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] 
				transition-all duration-500 ease-out active:scale-[0.90]
				hover:scale-[1.10] hover:border-[#fff1b8] hover:bg-white hover:text-white 
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
			className="fixed inset-0 bg-black flex flex-col items-center justify-start  overflow-hidden
					bg-center bg-no-repeat bg-[length:100%_100%] pt-25"
			style={{ backgroundImage: "url('/bg7.png')" }}>
			<div className="flex flex-col items-center gap-0 max-h-[60vh] flex-shrink-0">
				<img src="/logoT.png" alt="Logo"
					className={`max-w-[25vw] max-h-[25vh] object-contain transition-all duration-3000 ease-out
						${showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-60"}
						animate-logo-pulse`} />
				<img src="/titleT2.png"
					alt="Title"
					className={`max-w-[95vw] max-h-[48vh] mt-5 object-contain transition-[opacity] duration-2500 ease-out
						${showTitle ? "opacity-100" : "opacity-0"}`}
					style={showTitle ? { animation: 'float 8s ease-in-out infinite' } : {}} />
				<p className={`text-center text-yellow-600 text-[1.1rem] tracking-widest uppercase font-light 
							transition-opacity duration-1100 ease-out -mt-9
					${showTitle ? "opacity-100" : "opacity-0"}`}>
					3D HUB · ARCADE PONG · REALTIME BATTLES · 42 PROJECT
				</p>
			</div>
			<div className={`flex items-center justify-center py-10 gap-8 transition-all duration-2700 ease-out flex-shrink-0
				${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<IntroButtons label="Guest" onCLick={() => navigate("start")} />
				<IntroButtons label="42 Login" />
				<IntroButtons label="Login" />
			</div>
			<p className={`text-center text-yellow-600 text-[1.1rem] py-15 tracking-widest uppercase font-light
						transition-opacity duration-1100 ease-out -mt-9
					${showTitle ? "opacity-100" : "opacity-0"}`}>
				v1.0    - · -    realtime pong experience    - · -   42 malaga
			</p>
		</div>
	)
}

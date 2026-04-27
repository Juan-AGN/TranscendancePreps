import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

//componente para botones iguales
export function IntroButtons({ label, onCLick }: { label: string; onCLick?: () => void }) { // boton reutilizable pa la intro
	return (
		<button
			onClick={onCLick}
			className="
				group relative overflow-hidden text-gray-900 text-[0.95rem] px-9 py-2.5 rounded-full font-medium
				border-2 border-yellow-600 bg-white/[0.85] backdrop-blur-xl tracking-[0.15em] uppercase
				shadow-[0_4px_12px_rgba(0,0,0,0.2)] 
				transition-all duration-500 ease-out
				hover:scale-[1.08] hover:border-yellow-500 hover:bg-white hover:text-gray-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]
				active:scale-[0.95]" >
			<span className="relative z-10">{label}</span>
			<span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
							duration-500 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent"></span>
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
		const t2 = setTimeout(() => setShowTitle(true), 1500)
		const t3 = setTimeout(() => setShowButtons(true), 1200)
		return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
	}, [])

	return (
		<div 
			className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 overflow-hidden px-4 bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: "url('/bgIntro.png')" }}
		>
			<div className="flex flex-col items-center gap-0 max-h-[60vh] flex-shrink-0">
				<img
					src="/logoT.png"
					alt="Logo"
					className={`max-w-[25vw] max-h-[18vh] object-contain transition-all duration-3000 ease-out
						${showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-60"}
						animate-logo-pulse`}
				/>
				<img
					src="/titleT.png"
					alt="Title"
					className={`max-w-[90vw] max-h-[55vh] object-contain transition-[opacity] duration-1000 ease-out
						${showTitle ? "opacity-100" : "opacity-0"}`}
					style={showTitle ? { animation: 'float 6s ease-in-out infinite' } : {}}
				/>
			</div>
			<div className={`flex items-center justify-center gap-8 transition-all duration-700 ease-out flex-shrink-0
				${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<IntroButtons label="Guest" onCLick={() => navigate("start")} />
				<IntroButtons label="42 Login" />
				<IntroButtons label="Login" />
			</div>
		</div>
	)
}

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { IntroButtons } from "../components/Buttons/IntroButtons"


export function SplashScreen() {
	const navigate = useNavigate()
	const { t } = useTranslation()
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
			style={{ backgroundImage: "url('/images/bg7.png')" }}>
			<div className="w-full max-w-[1400px] min-h-full flex flex-col items-center justify-between px-4 pt-[clamp(2rem,8vh,6.25rem)] pb-[clamp(1rem,4vh,2.5rem)]">
				<div className="flex flex-col items-center gap-[clamp(0.15rem,0.6vh,0.4rem)] w-full">
					<img src="/images/logoT.png" alt="Logo"
						className={`w-[clamp(110px,22vw,420px)] max-h-[22vh] object-contain transition-all duration-3000 ease-out
							${showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-60"}
							animate-logo-pulse`} />
					<img src="/images/titleT2.png"
						alt="Title"
						className={`w-[clamp(280px,88vw,1200px)] max-h-[34vh] mt-[clamp(0.5rem,2vh,1.25rem)] object-contain transition-[opacity] duration-2500 ease-out
						${showTitle ? "opacity-100" : "opacity-0"}`}
						style={showTitle ? { animation: 'float 8s ease-in-out infinite' } : {}} />
					<p className={`text-center text-yellow-600 text-[clamp(0.62rem,1.1vw,1.1rem)] tracking-[0.18em] uppercase font-light px-3
							transition-opacity duration-1100 ease-out mt-[clamp(-0.4rem,-0.8vh,-0.15rem)]
					${showTitle ? "opacity-100" : "opacity-0"}`}>
					{t('splash.tagline')}
					</p>
				</div>
				<div className={`w-full flex flex-wrap items-center justify-center py-[clamp(1rem,3.6vh,2.5rem)] gap-[clamp(0.6rem,1.8vw,2rem)] transition-all duration-2700 ease-out
				${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<IntroButtons label={t('splash.guest')} onCLick={() => navigate("start")} />
				<IntroButtons label={t('splash.login42')} onCLick={() => navigate("Login42")} />
				<IntroButtons label={t('splash.login')} onCLick={() => navigate("login")} />
				</div>
				<p className={`text-center text-yellow-600 text-[clamp(0.62rem,1.05vw,1rem)] py-[clamp(0.4rem,2vh,1.8rem)] tracking-[0.14em] uppercase font-light px-3
						transition-opacity duration-1100 ease-out
					${showTitle ? "opacity-100" : "opacity-0"}`}>
					{t('splash.version')}
				</p>
			</div>
		</div>
	)
}

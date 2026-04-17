import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/-+?¿^*¨Ç@#~}{" // char raros para el efecto princ
const FINAL_TEXT = "TRANSCENDENCE PROJECT" // el texto q revela en la intro

function getRandomChar(): string { // coge un indice al azar y devuelve ese caracter de CHARS
	const index = Math.floor(Math.random() * CHARS.length)
	return CHARS[index]
}

//componente para botones iguales
export function IntroButtons({ label, onCLick }: { label: string; onCLick?: () => void }) { // boton reutilizable pa la intro
	return (
		<button
			onClick={onCLick}
			className="
				group relative overflow-hidden text-white text-[0.88rem] px-10 py-3 rounded-full
				border-1 border-white/20 bg-white/[0.04] backdrop-blur-xl tracking-[0.25em] uppercase font-light
				shadow-[0_0_20px_rgba(255,255,255,0.04)] transition-all duration-500 ease-out
				hover:scale-[1.15] hover:border-yellow-400/[0.30] hover:bg-blue-500/[0.15]
				hover:text-yellow-300 active:scale-[0.98]" >
			<span className="relative z-10">{label}</span>
			<span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
							duration-2700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></span>
		</button>
	)
}

export function SplashScreen() { // pantalla d intro, el texto se descifra letra a letra
	const [displayText, setDisplayText] = useState("") // lo q se muestra en pantalla
	const [showButtons, setShowButtons] = useState(false) // si mostrar o no los botones
	const navigate = useNavigate();

	useEffect(() => {
		let lettersRevealed = 0 // cuantas letras d FINAL_TEXT ya son reales (no ruido)
		let lastTime = 0 // timestamp del ultimo reveal
		let finishedAt = 0 // timestamp d cuando acabamos d revelar todo
		let animationId = 0 // id del rAF pa cancelarlo

		function loop(now: number) { // now = timestamp en ms del rAF
			if (lastTime === 0)
				lastTime = now // primer frame, inicializamos

			if (lettersRevealed < FINAL_TEXT.length && now - lastTime > 130) { // cada 130ms revelamos 1 letra, cambia 130 pa velocidad
				lettersRevealed++
				lastTime = now // reset contador
			}

			let result = "" // string q vamos a pintar
			for (let i = 0; i < FINAL_TEXT.length; i++) {
				if (FINAL_TEXT[i] === " ")
					result += " " // los espacios siempre son espacios, never ruido
				else if (i < lettersRevealed)
					result += FINAL_TEXT[i] // letra ya revelada
				else
					result += getRandomChar() // todavia ruido
			}
			setDisplayText(result) // actualizamos lo q se ve

			if (lettersRevealed >= FINAL_TEXT.length) { // terminamos d revelar todo
				if (finishedAt === 0)
					finishedAt = now // guardamos cuando termino
				if (now - finishedAt > 300) { // 300ms d pausa y ya sta todo revelado
					setShowButtons(true) // mostramos los botones
					return // no hace falta hacer nada mas, el texto ya esta fijo
				}
			}
			animationId = requestAnimationFrame(loop) // next frame
		}
		animationId = requestAnimationFrame(loop) // arrancamos
		return () => cancelAnimationFrame(animationId) // limpieza al desmontar
	}, [])

	return (
		<div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
			<div className="relative w-[80vw] h-[60vh] overflow-hidden flex items-center justify-center bg-black"> {/* cambia w y h pa ajustar el area d intro */}
				<h1 className={`text-lg md:text-4xl font-serif text-center tracking-[0.30em] 
    							transform-gpu transition-all duration-[10000ms] ease-out 
    							${displayText === FINAL_TEXT
								? "scale-[1.35] text-sky-100 animate-[pulse_5s_infinite] " +
								"[text-shadow:0_0_6px_rgba(186,230,255,0.95),0_0_18px_rgba(59,130,246,0.90),0_0_32px_rgba(14,165,233,0.80),0_0_55px_rgba(56,189,248,0.60)]"
								: "scale-100 text-white"}`}>
						{displayText}
				</h1>
			</div>
			<div className={`flex items-center justify-center gap-8 transition-all duration-[6000ms]
							${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<IntroButtons label="Guest" onCLick={() => navigate("start")} />
				<IntroButtons label="42 Login" />
				<IntroButtons label="Login" />
			</div>
		</div>
	)
}

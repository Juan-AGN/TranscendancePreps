// SPLASHSCREEN - pantalla inicial del juego (entrada visual)
import { Link } from 'react-router-dom'

export function SplashScreen() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">

			{/* ===== VIDEO ===== */}
			<div className="w-full max-w-4xl px-4 rounded-3xl overflow-hidden shadow-2xl">
				<video
					src="/introvideo.mp4"
					autoPlay loop muted playsInline
					className="w-full h-auto object-cover rounded-3xl"
				/>
			</div>

			{/* ===== BOTONES ===== */}
			<div className="flex flex-col sm:flex-row items-center gap-4 p-8">
				<Link
					to="/start"
					className="min-w-46 text-center px-6 py-4 font-bold text-base rounded-2xl shadow-lg transition duration-300 bg-white text-black hover:bg-white/90"
				>
					Guest
				</Link>

				<Link
					to="/start"
					className="min-w-46 text-center px-6 py-4 font-bold text-base rounded-2xl shadow-lg transition duration-300 bg-blue-600 text-white hover:bg-blue-700"
				>
					Login 42
				</Link>

				<Link
					to="/login"
					className="min-w-46 text-center px-6 py-4 font-bold text-base rounded-2xl shadow-lg transition duration-300 bg-transparent text-white border border-white/40 hover:bg-white/10"
				>
					Login
				</Link>
			</div>

		</div>
	)
}





// ===== RESUMEN MENTAL =====
// pantalla inicial tipo intro
//
// flujo:
// usuario entra ->
// ve logo animado ->
// ve titulo ->
// click en boton ->
// navega a /start
//
// importante:
// Link NO recarga la pagina (SPA)
// solo cambia la ruta internamente
// SPLASHSCREEN - pantalla inicial del juego (entrada visual)
// solo UI, no tiene logica de estado ni backend
// 3 things ->
//   - muestra logo animado (42 | Telefonica | PONG)
//   - muestra titulo del juego
//   - boton para continuar (navega a /start)

// pq existe:
//   - dar entrada visual al juego (branding)
//   - separar la pantalla inicial del resto del flujo
import { Link } from 'react-router-dom'   // Link = navegar sin recargar la pagina (SPA)

export function SplashScreen() {

	return (
		<div className="
      fixed inset-0 z-50 
      flex flex-col items-center justify-center 
      bg-gradient-to-br from-gray-900 via-gray-800 to-black
    ">
			{/* contenedor full screen (fixed + inset-0) ocupa toda la pantalla */}
			{/* z-50 -> se pone por encima de todo */}
			{/* flex center -> centra todo en pantalla */}
			{/* bg-gradient -> fondo degradado oscuro */}

			<div className="text-center">
				{/* centra el contenido interno (texto + boton) */}

				{/* ===== LOGO 42 ===== */}
				<div className="mb-16 animate-fade-in">
					{/* margen inferior + animacion de entrada */}

					<div className="flex items-center justify-center gap-4 text-6xl font-bold">
						{/* layout horizontal del logo */}

						<span
							className="text-white animate-pulse"
							// texto blanco + animacion de pulso
							style={{
								textShadow: `
                  0 0 10px rgba(59, 130, 246, 0.8),
                  0 0 20px rgba(59, 130, 246, 0.6),
                  0 0 30px rgba(59, 130, 246, 0.4)
                `			// glow azul (efecto neon)
							}}
						>
							42
						</span>
						<span className="text-gray-400">|</span>   {/* separador visual */}
						<span className="text-blue-400">Telefónica</span>  {/* marca */}
						<span className="text-gray-400">|</span>   {/* separador */}
						<span className="text-green-400">PONG</span>       {/* nombre del juego */}
					</div>
				</div>

				{/* ===== TITULO ===== */}
				<h1 className="text-5xl font-bold text-white mb-8 animate-fade-in-up">
					{/* titulo grande + animacion entrada */}
					TRANSCENDENCE
				</h1>

				{/* ===== BOTON ===== */}
				<Link
					to="/start"   // ruta a la q navega (React Router)
					className="
            inline-block px-12 py-4 
            bg-blue-600 hover:bg-blue-700 
            text-white text-lg font-semibold 
            rounded-xl 
            transition-all duration-300 
            transform hover:scale-105 
            shadow-lg hover:shadow-xl 
            animate-fade-in-up
          "
					// boton visual con hover (crece + sombra)
					style={{ animationDelay: '0.4s' }}
				// retraso de animacion para entrada mas fluida
				>
					Press to Continue
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
// STARTGATE - pantalla de entrada al hub (puerta de decision)
// solo UI, no controla logica del juego
// 3 things ->
//   - muestra titulo del juego
//   - boton principal para entrar al mundo 3D
//   - boton secundario para ir al modo 2D

// pq existe:
//   - separar la decision inicial (3D vs 2D)
//   - mantener limpio el flujo antes de entrar al hub

import { Footer } from '../../../shared/components/Footer'     // footer comun (legal / info)
import { HubButton } from './HubButton'                     // boton visual del hub (imagen + video hover)


// props -> lo q viene desde fuera (este componente no decide nada)
interface StartGateProps {
  onStart3D: () => void          // accion para entrar al mundo 3D
  onGo2DMenu?: () => void        // accion opcional para ir al menu 2D
}

export function StartGate({ onStart3D, onGo2DMenu }: StartGateProps) {

  // handler del boton 2D (fallback si no existe funcion)
  const handleSkip = () => {
    if (onGo2DMenu) {            // si existe la funcion
      onGo2DMenu()               // ejecutamos menu 2D
    } else {
      console.log('onGo2DMenu is undefined') // debug por si no se pasa
    }
  }

  return (
  	<div className="relative w-full h-[calc(100vh-88px)] flex flex-col">
    {/* contenedor principal */}
    {/* ocupa toda la pantalla menos header (88px) */}
    {/* flex column -> contenido arriba + footer abajo */}

    	{/* ===== CENTRO ===== */}
    	<div className="flex-1 flex items-center justify-center px-6">
      {/* centra el contenido vertical y horizontal */}

			<div className="w-full max-w-xl text-center">
      {/* limita ancho y centra texto */}

				<h1 className="text-5xl font-bold text-black mb-4">
					TRANSCENDENCE
				</h1>
        {/* titulo principal */}

				{/* BOTON PRINCIPAL (3D) */}
				<div className="animate-fade-in-up-pro delay-150">
        {/* animacion de entrada con delay */}
					<HubButton onClick={onStart3D} />
          {/* al hacer click -> entra al mundo 3D */}
				</div>

				{/* BOTON SECUNDARIO (2D) */}
				<button
				type="button"
				onClick={handleSkip}   // ejecuta logica del 2D
				className="
          mt-4 w-full py-3 
          rounded-2xl font-semibold 
          text-black/90 
          border border-white/30 
          hover:bg-white/10 
          transition
        "
				>
					Arcade 2D
				</button>

			</div>
      	</div>

      {/* ===== FOOTER ===== */}
      <Footer />
      {/* footer fijo abajo (legal / info) */}

    </div>
  )
}


// ===== RESUMEN MENTAL =====
// pantalla de decision antes de entrar al juego
//
// flujo:
// usuario entra ->
// ve titulo ->
// puede elegir:
//
// 1) HubButton -> entra al mundo 3D
// 2) boton 2D -> va al menu arcade
//
// importante:
// este componente NO decide nada
// solo ejecuta funciones q vienen por props
import { useState } from 'react';
import { useLoadingProgress } from '../hooks/useLoadingProgress';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { HubPanel } from '../components/HubPanel';
import { HubPanelSettings } from '../components/HubPanelSettings';
import { HubPanelLogin } from '../components/HubLoginPanel';

export function HomePage() {
	// Hook que gestiona la lógica matemática de la barra de progreso
	const { progress, label, isComplete, updateProgress, complete } = useLoadingProgress();

	// Estado del panel activo (null = ninguno abierto)
	const [activePanel, setActivePanel] = useState<string | null>(null);

	// Inicializamos el motor 3D
	useBabylonScene({
		canvasId: 'homeCanvas',
		enabled: true,
		// Conectamos los eventos de carga del motor con nuestra UI
		onProgress: (percentage, newLabel) => {
			updateProgress(percentage, newLabel)
		},
		onComplete: () => {
			complete() //Carga Completa
		},
		onPanelOpen: (panelId) => {
			if (panelId === 'chat') {
				window.dispatchEvent(new CustomEvent('chat:open'));
				return;
			}
			setActivePanel(panelId);
		}
	})

	return (
		<>
			<div className="relative w-full h-full via-slate-800 to-slate-900 flex flex-col items-center justify-center px-3 py-6 sm:p-8">
				{/* 
            relative: Posicionamiento relativo para que los hijos absolutos se posicionen respecto a este contenedor
            w-full: Ancho 100%
            h-[calc(100vh-88px)]: Altura = 100% viewport - 88px del header (evita scroll vertical)
            via-slate-800 to-slate-900: Colores del gradiente de fondo
            flex flex-col: Diseño flexbox vertical
            items-center: Centra horizontalmente los elementos hijos
            justify-center: Centra verticalmente los elementos hijos
            p-8: Padding de 2rem (32px) en todos los lados
          */}

				{/* Título y instrucciones arriba del canvas */}
				<div className="text-center mb-10">
					{/* mb-6: Margen inferior de 1.5rem (24px) para separar del canvas */}

					<h2 className="text-[1.65rem] sm:text-5xl font-bold text-black mb-2 drop-shadow-lg tracking-tight whitespace-nowrap">
						{/* 
                text-5xl: Tamaño de fuente 3rem (48px)
                font-bold: Peso de fuente en negrita
                text-black: Color negro
                mb-2: Margen inferior de 0.5rem (8px)
                drop-shadow-lg: Sombra para que el texto sea legible sobre el canvas
              */}
						TRANSCENDENCE
					</h2>
				</div>

				{/* Contenedor del Canvas - Aquí controlas el tamaño del mundo 3D */}
				<div className="relative w-full max-w-[100rem] aspect-square bg-black/30 rounded-2xl overflow-hidden shadow-2xl">
					{/* 
              relative: Posicionamiento relativo
              w-full: Ancho 100% del contenedor padre
              max-w-6xl: Ancho máximo de 72rem (~1152px) - CAMBIA ESTO para ajustar el tamaño
              aspect-square: Mantiene proporción 1:1 (cuadrado) - CAMBIA a aspect-video para 16:9
              bg-black/30: Fondo negro con 30% de opacidad (por si el canvas no carga)
              rounded-2xl: Bordes redondeados de 1rem (16px)
              overflow-hidden: Oculta cualquier contenido que sobresalga (necesario para bordes redondeados)
              shadow-2xl: Sombra grande para destacar el canvas del fondo
            */}

					<canvas
						id="homeCanvas"
						className="w-full h-full outline-none"
						style={{ touchAction: 'none' }}
					/>

					{!isComplete && (
						<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm">
							<div className="mb-4 text-xl font-bold tracking-[0.25em] text-yellow-200">
								LOADING 3D WORLD
							</div>

							<div className="w-full max-w-md overflow-hidden rounded-full border border-yellow-400/50 bg-black/50 p-1">
								<div
									className="h-3 rounded-full bg-yellow-300 transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>

							<div className="mt-3 text-sm font-medium text-yellow-100/80">
								{label} · {Math.round(progress)}%
							</div>
						</div>
					)}

					{activePanel === 'settings' && (
						<HubPanel title="⚙ Settings" onClose={() => setActivePanel(null)}>
							<HubPanelSettings />
						</HubPanel>
					)}
					{activePanel === 'login' && (
						<HubPanel title="⚙ Login" onClose={() => setActivePanel(null)}>
							<HubPanelLogin />
						</HubPanel>
					)}
				</div>

			</div>
		</>
	)

}
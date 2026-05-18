// HUBBUTTON - boton interactivo del hub con preview visual (imagen -> video en hover)
// actua como UI component, no decide logica externa (solo ejecuta onClick)
// 3 things ->
//   - muestra imagen por defecto
//   - cambia a video cuando hay hover
//   - controla video (play, pause, reset)

// pq existe:
//   - para reutilizar mismo boton en game/settings/etc
//   - para no repetir logica de hover + video en cada sitio

import { useState, useRef } from 'react';

// props -> lo q puedes cambiar desde fuera sin tocar este archivo
interface HubButtonProps {
	onClick: () => void              // accion externa (navegar, cambiar escena, etc)
	imgSrc?: string                 // imagen base (sin hover)
	imgAlt?: string                 // texto alternativo
	ringSrc?: string                // anillo decorativo (opcional)
	videoSrc?: string               // video q aparece en hover
}

export function HubButton({
	onClick,
	imgSrc = '/images/WorldPong3D.png',    // imagen por defecto si no se pasa otra
	imgAlt = 'Enter 3D',            // alt por defecto
	ringSrc = '/images/ring.png',          // anillo (puedes cambiarlo o quitarlo)
	videoSrc = '/videos/videoPong.mp4',    // video hover (cuidado con peso)
}: HubButtonProps) {

	// ===== ESTADO =====

	const [isHovered, setIsHovered] = useState(false);   
	// controla todo el comportamiento visual
	// true = estamos encima -> se ve el video
	// false = no -> se ve la imagen

	const videoRef = useRef<HTMLVideoElement>(null);     
	// referencia al <video> para controlarlo manual
	// sin esto no podrias hacer play/pause/reset

	// ===== EVENTOS =====

	const handleMouseEnter = () => {                     // cuando el raton entra
		setIsHovered(true);                              // activa hover (cambia UI)
		if (videoRef.current) {                          
			videoRef.current.play();                     // reproducimos video
		}
	};

	const handleMouseLeave = () => {                     // cuando el raton sale
		setIsHovered(false);                             // quitamos hover (vuelve imagen)
		if (videoRef.current) {
			videoRef.current.pause();                    // pausamos video
			videoRef.current.currentTime = 0;            // lo reiniciamos (si no seguiria)
		}
	};

	// ===== RENDER =====

	return (
		<div className="relative inline-flex items-center justify-center">  
		{/* contenedor centrado + permite capas (anillo, video, imagen) */}

			{/* anillo decorativo (solo si existe) */}
			{ringSrc && (
				<img
					src={ringSrc}
					alt="Ring decoration"
					className="absolute pointer-events-none select-none"  
					// no interactua con clicks (no bloquea el boton)
					style={{
						objectFit: 'contain',
						width: '30rem',
						height: '30rem',
						maxWidth: 'none',
						scale: 1.4,
						transformOrigin: '50% 50%',
						animation: 'spin 8s linear infinite',            
						// rotacion continua
					}}
				/>
			)}

			<button
				type="button"                             
				onClick={onClick}                         // ejecuta accion externa (este componente no decide)
				onMouseEnter={handleMouseEnter}           // activa hover
				onMouseLeave={handleMouseLeave}           // desactiva hover
				className="
                relative z-10
                w-full py-10
                rounded-2x1
                font-bold
                flex items-center
                justify-center
                transition-transform duration-500 ease-out
                hover:scale-105                         
                active:scale-95"
				// hover = crece, click = se hunde
			>

				{/* VIDEO -> visible solo en hover */}
				<video
					ref={videoRef}                        
					src={videoSrc}                        
					loop                                   
					muted                                  
					// muted necesario para autoplay en navegadores

					className={`
                    w-90 h-90
                    rounded-full object-cover
                    transition-opacity duration-250 ease-in-out
                    ${isHovered ? 'opacity-100' : 'opacity-0'}  
                    // si hover -> visible
                    // si no -> invisible
                   `}
					style={{
						objectPosition: '50% 35%',
						position: 'absolute'              
						// se coloca encima de la imagen
					}}
				/>

				{/* IMAGEN -> visible cuando NO hay hover */}
				<img
					src={imgSrc}                          
					alt={imgAlt}
					className={`
                    w-90 h-90
                    rounded-full object-cover
                    transition-opacity duration-250 ease-in-out
                    ${isHovered ? 'opacity-0' : 'opacity-100'}  
                    // se oculta cuando aparece el video
                   `}
					style={{ objectPosition: '50% 26%' }}
				/>

			</button>
		</div>
	)
}


// ===== RESUMEN MENTAL =====
// este componente es:
// boton + imagen + video + hover + click
//
// flujo:
// no hover -> se ve imagen
// hover -> se muestra video + play()
// salir -> pause + reset + vuelve imagen
//
// importante:
// NO elimina video/imagen -> solo cambia opacidad (mejor UX)
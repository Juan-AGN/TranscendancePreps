import { useState } from 'react';
// Hook de React para manejar estado local (hover)
import { useNavigate, useLocation } from 'react-router-dom';
// Hooks de React Router:
// - useNavigate → navega
// - useLocation → saber en q ruta estamos (para marcar opc activa)
import { useTranslation } from 'react-i18next';
// hook de i18n: t() devuelve el texto en el idioma activo
import { ArcadeBgLayout } from '../components/ArcadeBgLayout';

// Opciones del menu2D
// - id: identificador interno (y clave i18n)
// - path: ruta a la que navega
const MENU2D_OPTIONS = [
	{ id: 'home',       path: '/start' },
	{ id: 'game',       path: '/game' },
	{ id: 'settings',  path: '/settings' },
	{ id: 'tournament', path: '', disabled: true },
	{ id: 'login',     path: '/login' },
]

// Componente principal del menu2D
export function Menu2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	// Estado para saber q boton esta siendo "hovered" o enfocado, null = ninguno
	const navigate = useNavigate();
	// Fun para cambiar de ruta
	const location = useLocation();
	// Info de la ruta actual (pathname)
	const { t } = useTranslation();

	return (
		<ArcadeBgLayout>
			
			<h3 className="text-[clamp(1rem,4vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.menu.title')}
			</h3>

			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[23rem]">
				{/* Recorr cada opcion del menu */}
				{MENU2D_OPTIONS.map((option) => {
					const isActive = location.pathname === option.path
					// isActive → true si la ruta actual coincide con la option
					//  permite que el boton quede marcado tras hacer click
					const isHighlighted = hovered === option.id || isActive
					// isHighlighted → true si el boton esta en hover o es la ruta activa

					return (
						<button
							key={option.id}
							type="button"
							// Eventos de hover y focus
							onMouseEnter={() => setHovered(option.id)}
							onMouseLeave={() => setHovered(null)}
							onFocus={() => setHovered(option.id)}
							onBlur={() => setHovered(null)}
							// Al hacer click, navegamos a la ruta (si no esta disabled)
							onClick={() => { 
								if (!option.disabled)
									navigate(option.path)
							}}
							// Estilos: borde negro 0.25rem, texto grande y mayus (todo en rem)
							// Colores invertidos si esta highlighted (negro/blanco)
							className={[
									"relative py-[clamp(0rem,0.2vw,0.5rem)] text-[clamp(0.35rem,1.45vw,1rem)] font-black uppercase font-['Press_Start_2P']",
								option.disabled
									? 'bg-black text-yellow-400/30 cursor-not-allowed'
									: isHighlighted
										? 'bg-black text-white scale-120'
										: 'bg-black text-yellow-400',
							].join(' ')}
						>
							{t(`arcade2d.menu.${option.id}`)}
						</button>
					)
				})}
			</nav>
		</ArcadeBgLayout>
		
	)
}

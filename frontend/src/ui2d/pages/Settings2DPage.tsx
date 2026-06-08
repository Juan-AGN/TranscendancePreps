import { useState } from 'react';
//hook de react (react lo actuliza solo(le da memoria))
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// hook de i18n: t() devuelve el texto en el idioma activo
import { ArcadeBgLayout } from '../components/ArcadeBgLayout';

// const de un array de options del menu
const SETTINGS2D_OPTIONS = [
	{id: 'gameSetting', path: '/gamesettings'},
	{id: 'audio',       path: '/audio'},
	{id: 'display',     path: '/display'},
	{id: 'back',        path: '/menu2D'},
]

//compo de react
export function Settings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	return (
		<ArcadeBgLayout>
		
			<h1 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.settings.title')}
			</h1>
			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
				{/*recorremos el array y generamos un boton por opcion*/}
				{SETTINGS2D_OPTIONS.map((option) => {
					const isActive = location.pathname === option.path
					const isHighlighted = hovered === option.id || isActive

					return (
						<button
						key={option.id}
						type="button"
						onMouseEnter={() => setHovered(option.id)}
						onMouseLeave={() => setHovered(null)}
						onFocus={() => setHovered(option.id)}
						onBlur={() => setHovered(null)}
						onClick={() => navigate(option.path)}
						className={[
							"relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
							isHighlighted
								? 'bg-black text-white scale-120'
									: 'bg-black text-yellow-400',
						].join(' ')}
						>
							{t(`arcade2d.settings.${option.id}`)}
						</button>
					)
				})}
			</nav>
		</ArcadeBgLayout>
	)
}
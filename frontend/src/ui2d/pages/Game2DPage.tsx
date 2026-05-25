import { useState } from 'react';
//hook de react (react lo actuliza solo(le da memoria))
import { useNavigate, useLocation } from 'react-router-dom';

import { ArcadeBgLayout } from '../components/ArcadeBgLayout';

// const de un arru de options del menu
const GAME2D_OPTIONS = [
	{id: '1player', label: '1 PLAYER LOCAL', path: '/play1vsgame'},
	{id: '2player', label: '2 PLAYER LOCAL', path: '/play2vsgame'},
	{id: 'spectator', label: 'SPECTATOR MODE', path: '/playspectator'},
	{id: 'back', label: '← BACK', path: '/menu2D'},
]

//compo de react
export function Game2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	

	return (
		<ArcadeBgLayout>
		
			<h1 className="text-[2.75rem] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				GAME MODE
			</h1>

			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[23rem]">
				{/*recorremos el arrayy generamos un boton por opcion*/}
				{GAME2D_OPTIONS.map((option) => {
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
								"relative px-[1rem] py-[0.25rem] text-[1rem] font-['Press_Start_2P'] uppercase",
							'border-[0.05rem] border-black',
							isHighlighted
							? 'bg-black text-white scale-120'
							: 'bg-black text-yellow-400',
						].join(' ')}
						>
							{option.label}
						</button>
					)
				})}
			</nav>
			
	
		</ArcadeBgLayout>
	)
}
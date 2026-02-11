import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GAMESETTINGS2D_OPTIONS = [
	{id: 'scorelimit', label: 'SCORE LIMIT', path: '/notyet'},
	{id: 'paddlesize', label: 'PADDLE SIZE', path: '/notyet'},
	{id: 'ballspeed', label: 'BALL SPEED', path: '/notyet'},
	{id: 'back', label: '← BACK', path: '/settings'},
]

export function GameSettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null)
	const navigate = useNavigate()
	const location = useLocation()

	return (
		<div className="flex flex-col items-center justify-center h-[calc(100vh-88px)] bg-white font-mono">
			<h1 className="text-[3.75rem] font-black mb-[0.25rem]">
				GAME SETTINGS
			</h1>

			<nav className="flex flex-col gap-[1rem] w-full max-w-[24rem]">
				{GAMESETTINGS2D_OPTIONS.map((option) => {
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
							'relative px-[1.5rem] py-[0.75rem] text-[1.5rem] font-black uppercase',
							'border-[0.25rem] border-black',
							isHighlighted
							? 'bg-black text-white'
							: 'bg-white text-black',
						].join(' ')}
						>
							{option.label}
						</button>
					)
				})}
			</nav>
		</div>
	)
}
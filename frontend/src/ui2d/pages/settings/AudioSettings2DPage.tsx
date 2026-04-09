import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout'

const AUDIOSETTINGS2D_OPTIONS = [
	{id: 'mastervolume', label: 'MASTER VOLUME', path: '/notyet'},
	{id: 'musicvolume', label: 'MUSIC VOLUME', path: '/notyet'},
	{id: 'sfxvolume', label: 'SFX VOLUME', path: '/notyet'},
	{id: 'mute', label: 'MUTE ALL', path: '/notyet'},
	{id: 'back', label: '← BACK', path: '/settings'},
]

export function AudioSettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null)
	const navigate = useNavigate()
	const location = useLocation()

	return (
		<ArcadeBgLayout>
			<h1 className="text-[2.75rem] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				AUDIO SETTINGS
			</h1>

			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
				{AUDIOSETTINGS2D_OPTIONS.map((option) => {
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
							"relative px-[1rem] py-[0.25rem] text-[1rem] font-black uppercase font-['Press_Start_2P']",
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

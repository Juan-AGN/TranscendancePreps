import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';
import { useAudioStore } from '../../../shared/store/audioStore';

//misma estructura q GameSettings2DPage -> un boton por ajuste q cicla el valor al hacer click
const AUDIOSETTINGS2D_OPTIONS = [
	{ id: 'music', label: 'MUSIC', path: '' },
	{ id: 'sfx', label: 'SFX', path: '' },
	{ id: 'back', label: '← BACK', path: '/settings' },
];

export function AudioSettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	//leemos del store de audio (localStorage -> se mantiene entre sesiones)
	const { musicEnabled, sfxEnabled, setMusicEnabled, setSfxEnabled } = useAudioStore();

	//devuelve el valor actual a mostrar junto al label del boton
	const getOptionValue = (id: string) => {
		if (id === 'music')
			return musicEnabled ? 'ON' : 'OFF';
		if (id === 'sfx')
			return sfxEnabled ? 'ON' : 'OFF';
		return '';
	}

	const handleOptionClick = (id: string, path: string) => {
		if (id === 'music') {
			setMusicEnabled(!musicEnabled);
			return;
		}
		if (id === 'sfx') {
			setSfxEnabled(!sfxEnabled);
			return;
		}
		navigate(path);
	}

	return (
		<ArcadeBgLayout>
			<h1 className="text-[2.75rem] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				AUDIO SETTINGS
			</h1>

			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
				{AUDIOSETTINGS2D_OPTIONS.map((option) => {
					const isActive = location.pathname === option.path;
					const isHighlighted = hovered === option.id || isActive;
					const optionValue = getOptionValue(option.id);

					return (
						<button
							key={option.id}
							type="button"
							onMouseEnter={() => setHovered(option.id)}
							onMouseLeave={() => setHovered(null)}
							onFocus={() => setHovered(option.id)}
							onBlur={() => setHovered(null)}
							onClick={() => handleOptionClick(option.id, option.path)}
							className={[
								"relative px-[1rem] py-[0.25rem] text-[1rem] font-black uppercase font-['Press_Start_2P']",
								'border-[0.05rem] border-black',
								isHighlighted
									? 'bg-black text-white scale-120'
									: 'bg-black text-yellow-400',
							].join(' ')}
						>
							<span>{option.label}</span>
							{optionValue !== '' && (
								<span className="ml-[1rem] text-blue-300">
									{optionValue}
								</span>
							)}
						</button>
					)
				})}
			</nav>
		</ArcadeBgLayout>
	)
}



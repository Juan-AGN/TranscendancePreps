import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// hook de i18n: t() devuelve el texto en el idioma activo
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';
import { useAudioStore } from '../../../shared/store/audioStore';

//misma estructura q GameSettings2DPage -> un boton por ajuste q cicla el valor al hacer click
const AUDIOSETTINGS2D_OPTIONS = [
	{ id: 'music', path: '' },
	{ id: 'sfx',   path: '' },
	{ id: 'back',  path: '/settings' },
];

export function AudioSettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	//leemos del store de audio (localStorage -> se mantiene entre sesiones)
	const { musicEnabled, sfxEnabled, setMusicEnabled, setSfxEnabled } = useAudioStore();
	const { t } = useTranslation();

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
			<h1 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.audioSettings.title')}
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
								"relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
								isHighlighted
									? 'bg-black text-white scale-120'
									: 'bg-black text-yellow-400',
							].join(' ')}
						>
							<span>{t(`arcade2d.audioSettings.${option.id}`)}</span>
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



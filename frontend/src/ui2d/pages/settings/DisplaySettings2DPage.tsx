import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
// hook de i18n: t() devuelve el texto en el idioma activo
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout'
import { useDisplay2dStore, BALL_COLORS, PADDLE_COLORS, BALL_SIZE_MAP } from '../../../shared/store/display2dSettingsStore'

const DISPLAYSETTINGS2D_OPTIONS = [
	{ id: 'ballcolor',   path: '' },
	{ id: 'paddlecolor', path: '' },
	{ id: 'ballsize',    path: '' },
	{ id: 'balltrail',   path: '' },
	{ id: 'back',        path: '/settings' },
];

// mapa hex -> clave i18n del color (usada en getColorLabel)
const COLOR_KEY_MAP: Record<string, string> = {
	'#70ee31': 'green',
	'#ffffff': 'white',
	'#ffee00': 'yellow',
	'#ff4444': 'red',
	'#00ffff': 'cyan',
};

export function DisplaySettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const {
		ballColor, paddleColor, ballSize, ballTrail,
		setBallColor, setPaddleColor, setBallSize, setBallTrail,
	} = useDisplay2dStore();
	const { t } = useTranslation();

	const getColorLabel = (hex: string) => {
		const key = COLOR_KEY_MAP[hex];
		return key ? t(`arcade2d.displaySettings.${key}`) : hex;
	};

	//devuelve el valor actual a mostrar
	const getOptionValue = (id: string) => {
		if (id === 'ballcolor')
			return getColorLabel(ballColor);
		if (id === 'paddlecolor')
			return getColorLabel(paddleColor);
		if (id === 'ballsize')
			return ballSize.toUpperCase();
		if (id === 'balltrail')
			return ballTrail ? 'ON' : 'OFF';
		return '';
	}

	const handleOptionClick = (id: string, path: string) => {
		if (id === 'ballcolor') {
			//cicla al siguiente color de BALL_COLORS
			const idx = BALL_COLORS.indexOf(ballColor);
			setBallColor(BALL_COLORS[(idx + 1) % BALL_COLORS.length]);
			return;
		}
		if (id === 'paddlecolor') {
			const idx = PADDLE_COLORS.indexOf(paddleColor);
			setPaddleColor(PADDLE_COLORS[(idx + 1) % PADDLE_COLORS.length]);
			return;
		}
		if (id === 'ballsize') {
			const sizes = Object.keys(BALL_SIZE_MAP) as (keyof typeof BALL_SIZE_MAP)[];
			const idx = sizes.indexOf(ballSize);
			setBallSize(sizes[(idx + 1) % sizes.length]);
			return;
		}
		if (id === 'balltrail') {
			setBallTrail(!ballTrail);
			return; }
		navigate(path);
	}

	return (
		<ArcadeBgLayout>
			<h1 className="text-[clamp(1rem,4vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.displaySettings.title')}
			</h1>

			<nav className="flex flex-col gap-[0.3rem] w-full max-w-[26rem]">
				{DISPLAYSETTINGS2D_OPTIONS.map((option) => {
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
							"relative py-[clamp(0rem,0.2vw,0.5rem)] text-[clamp(0.35rem,1.45vw,1rem)] font-black uppercase font-['Press_Start_2P']",
							isHighlighted
								? 'bg-black text-white scale-[1.05]'
								: 'bg-black text-yellow-400',
						].join(' ')}
						>
							<span>{t(`arcade2d.displaySettings.${option.id}`)}</span>
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

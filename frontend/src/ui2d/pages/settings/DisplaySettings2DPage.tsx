import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout'
import { useDisplay2dStore, BALL_COLORS, PADDLE_COLORS, BALL_SIZE_MAP } from '../../../shared/store/display2dSettingsStore'

const DISPLAYSETTINGS2D_OPTIONS = [
	{ id: 'ballcolor',   label: 'BALL COLOR',   path: '' },
	{ id: 'paddlecolor', label: 'PADDLE COLOR', path: '' },
	{ id: 'ballsize',    label: 'BALL SIZE',    path: '' },
	{ id: 'balltrail',   label: 'BALL TRAIL',   path: '' },
	{ id: 'back',        label: '← BACK',       path: '/settings' },
];

const COLOR_LABELS: Record<string, string> = {
	'#70ee31': 'GREEN',
	'#ffffff': 'WHITE',
	'#ffee00': 'YELLOW',
	'#ff4444': 'RED',
};

export function DisplaySettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const {
		ballColor, paddleColor, ballSize, ballTrail,
		setBallColor, setPaddleColor, setBallSize, setBallTrail,
	} = useDisplay2dStore();

	//devuelve el valor actual a mostrar
	const getOptionValue = (id: string) => {
		if (id === 'ballcolor')
			return COLOR_LABELS[ballColor]   ?? ballColor;
		if (id === 'paddlecolor')
			return COLOR_LABELS[paddleColor] ?? paddleColor;
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
			<h1 className="text-[2.75rem] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				DISPLAY SETTINGS
			</h1>

			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
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

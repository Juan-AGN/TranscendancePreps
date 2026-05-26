import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// hook de i18n: t() devuelve el texto en el idioma activo
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';
import { use2dGameSettingsStore } from "../../../shared/store/game2dSettingsStore";

const GAMESETTINGS2D_OPTIONS = [
	{id: 'scorelimit', path: '/notyet'},
	{id: 'paddlesize', path: '/notyet'},
	{id: 'ballspeed',  path: '/notyet'},
	{id: 'back',       path: '/settings'},
];

export function GameSettings2DPage() {
	const [hovered, setHovered] = useState<string | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const scoreLimit = use2dGameSettingsStore((state) => state.scoreLimit);
	const paddleSize = use2dGameSettingsStore((state) => state.paddleSize);
	const ballSpeed = use2dGameSettingsStore((state) => state.ballSpeed);

		const setScoreLimit = use2dGameSettingsStore((state) => state.setScoreLimit);
	const setPaddleSize = use2dGameSettingsStore((state) => state.setPaddleSize);
	const setBallSpeed = use2dGameSettingsStore((state) => state.setBallSpeed);
	const { t } = useTranslation();

	const getOptionValue = (id: string) => {
		if (id === 'scorelimit')
			return scoreLimit;
		if (id === 'paddlesize')
			return paddleSize.toUpperCase();
		if (id === 'ballspeed')
			return ballSpeed.toUpperCase();
		return '';
	}

	const changeScoreLimit = () => {
		if (scoreLimit === 5)
			setScoreLimit(10);
		else if (scoreLimit === 10)
			setScoreLimit(15);
		else
			setScoreLimit(5);
	}

	const changePaddleSize = () => {
		if (paddleSize === 'small')
			setPaddleSize('medium');
		else if (paddleSize === 'medium')
			setPaddleSize('large');
		else
			setPaddleSize('small');
	}

	const changeBallSpeed = () => {
		if (ballSpeed === 'slow')
			setBallSpeed('normal');
		else if (ballSpeed === 'normal')
			setBallSpeed('fast');
		else
			setBallSpeed('slow');
	}

	const handleOptionClick = (id: string, path: string) => {
		if (id === 'scorelimit') {
			changeScoreLimit();
			return;
		}
		if (id === 'paddlesize') {
			changePaddleSize();
			return;
		}
		if (id === 'ballspeed') {
			changeBallSpeed();
			return;
		}
		navigate(path);
	}

	return (
		<ArcadeBgLayout>
			<h1 className="text-[clamp(1rem,4vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.gameSettings.title')}
			</h1>

			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
				{GAMESETTINGS2D_OPTIONS.map((option) => {
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
								? 'bg-black text-white scale-120'
								: 'bg-black text-yellow-400',
						].join(' ')}
						>
							<span>{t(`arcade2d.gameSettings.${option.id}`)}</span>
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
// ┌────────────────────────────────────────────────────────────┐
// │                  GameSettings2DPage.tsx                    │
// ├────────────────────────────────────────────────────────────┤
// │ Renders the 2D game settings menu.                         │
// │ Allows the player to change score limit, paddle size and   │
// │ ball speed before playing the local 2D game.               │
// │ It does NOT render the game or store settings manually.    │
// └────────────────────────────────────────────────────────────┘
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';
import { use2dGameSettingsStore } from "../../../shared/store/game2dSettingsStore";

// ════════ TYPE: GameSettings2DOption: Defines each settings button. ════════
// Each option needs:
// - id: translation key suffix and internal identifier.
// - path: route used only when the option navigates.
type GameSettings2DOption = {
	id: 'scorelimit' | 'paddlesize' | 'ballspeed' | 'back';
	path: string;
};
// STEP 1: Define all game settings menu options.
// The first three options update Zustand settings.
// The back option navigates to the previous 2D settings menu.
const GAMESETTINGS2D_OPTIONS: GameSettings2DOption[] = [
	{ id: 'scorelimit', path: '/notyet' },
	{ id: 'paddlesize', path: '/notyet' },
	{ id: 'ballspeed', path: '/notyet' },
	{ id: 'back', path: '/settings' },
];

// ════════ COMPONENT: GameSettings2DPage: 2D gameplay settings menu. ════════
export function GameSettings2DPage() {
	// STEP 2: Store which button is currently hovered or focused.
	// This state is only visual. It does not change the real game settings.
	const [hovered, setHovered] = useState<string | null>(null);
	// STEP 3: Get router helpers.
	// navigate() changes route without reloading the browser.
	// location.pathname lets us detect if a route is currently active.
	const navigate = useNavigate();
	const location = useLocation();
	// STEP 4: Read current 2D game settings from Zustand.
	// These values are used by the game setup before starting a match.
	const scoreLimit = use2dGameSettingsStore((state) => state.scoreLimit);
	const paddleSize = use2dGameSettingsStore((state) => state.paddleSize);
	const ballSpeed = use2dGameSettingsStore((state) => state.ballSpeed);
	// STEP 5: Read Zustand setter functions.
	// These functions update the persisted 2D game settings.
	const setScoreLimit = use2dGameSettingsStore((state) => state.setScoreLimit);
	const setPaddleSize = use2dGameSettingsStore((state) => state.setPaddleSize);
	const setBallSpeed = use2dGameSettingsStore((state) => state.setBallSpeed);
	const { t } = useTranslation();

	// ════════ FCT: getOptionValue: Returns the visible value for each setting. ════════
	const getOptionValue = (id: GameSettings2DOption['id']): string => {
		if (id === 'scorelimit')
			return String(scoreLimit);
		if (id === 'paddlesize')
			return paddleSize.toUpperCase();
		if (id === 'ballspeed')
			return ballSpeed.toUpperCase();
		return '';
	};
	// ════════ FCT: changeScoreLimit: Cycles through available score limits. ════════
	const changeScoreLimit = () => {
		if (scoreLimit === 5)
			setScoreLimit(10);
		else if (scoreLimit === 10)
			setScoreLimit(15);
		else
			setScoreLimit(5);
	}
	// ════════ FCT: changePaddleSize: Cycles through available paddle sizes. ════════
	const changePaddleSize = () => {
		if (paddleSize === 'small')
			setPaddleSize('medium');
		else if (paddleSize === 'medium')
			setPaddleSize('large');
		else
			setPaddleSize('small');
	}
	// ════════ FCT: changeBallSpeed: Cycles through available ball speeds. ════════
	const changeBallSpeed = () => {
		if (ballSpeed === 'slow')
			setBallSpeed('normal');
		else if (ballSpeed === 'normal')
			setBallSpeed('fast');
		else
			setBallSpeed('slow');
	}

	// ════════ FCT: handleOptionClick: Updates setting or navigates back. ════════
	const handleOptionClick = (id: GameSettings2DOption['id'], path: string): void => {
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
	};

	return (
		<ArcadeBgLayout>
			{/* STEP 7: Render the page title using i18n. */}
			<h1 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.gameSettings.title')}
			</h1>
			{/* STEP 8: Render the 2D game settings menu. */}
			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
				{/* STEP 9: Create one button for each configurable option. */}
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
								"relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
								isHighlighted
									? 'bg-black text-white scale-120'
									: 'bg-black text-yellow-400',
							].join(' ')}>
							<span>{t(`arcade2d.gameSettings.${option.id}`)}</span>
							{/* STEP 10: Show the current value only for real settings options. */}
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
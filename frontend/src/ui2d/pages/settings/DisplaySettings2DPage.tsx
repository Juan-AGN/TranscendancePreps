// ┌────────────────────────────────────────────────────────────┐
// │                DisplaySettings2DPage.tsx                   │
// ├────────────────────────────────────────────────────────────┤
// │ Renders the 2D display settings menu.                      │
// │ Allows the player to customize ball color, paddle color,   │
// │ ball size and ball trail visibility.                       │
// │ It does NOT render the game or handle game physics.        │
// └────────────────────────────────────────────────────────────┘

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';
import { useDisplay2dStore, BALL_COLORS, PADDLE_COLORS, BALL_SIZE_MAP, type BallSizeOption } from '../../../shared/store/display2dSettingsStore';

// ════════ TYPE: DisplaySettings2DOption: Defines each display settings button. ════════
// Each option needs:
// - id: translation key suffix and internal identifier.
// - path: route used only when the option navigates.
type DisplaySettings2DOption = {
	id: 'ballcolor' | 'paddlecolor' | 'ballsize' | 'balltrail' | 'back';
	path: string;
};

// STEP 1: Define all display settings menu options.
// The first four options update Zustand display settings.
// The back option navigates to the previous 2D settings menu.
const DISPLAYSETTINGS2D_OPTIONS: DisplaySettings2DOption[] = [
	{ id: 'ballcolor', path: '' },
	{ id: 'paddlecolor', path: '' },
	{ id: 'ballsize', path: '' },
	{ id: 'balltrail', path: '' },
	{ id: 'back', path: '/settings' },
];

// STEP 2: Map color hex values to translation keys.
// This allows the UI to show readable color names instead of raw hex codes.
const COLOR_KEY_MAP: Record<string, string> = {
	'#70ee31': 'green',
	'#ffffff': 'white',
	'#ffee00': 'yellow',
	'#ff4444': 'red',
	'#00ffff': 'cyan',
};

// ════════ COMPONENT: DisplaySettings2DPage: 2D visual settings menu. ════════
export function DisplaySettings2DPage() {
	// STEP 3: Store which button is currently hovered or focused.
	// This state is only visual and does not change settings directly.
	const [hovered, setHovered] = useState<string | null>(null);

	// STEP 4: Get router helpers.
	// navigate() changes route without reloading the browser.
	// location.pathname lets us detect if a route is currently active.
	const navigate = useNavigate();
	const location = useLocation();

	// STEP 5: Read current display settings and setter functions from Zustand.
	// These values control how the 2D game is drawn on the canvas.
	const { ballColor, paddleColor, ballSize, ballTrail,
		setBallColor, setPaddleColor, setBallSize, setBallTrail } = useDisplay2dStore();

	// STEP 6: Get the translation function for the active language.
	const { t } = useTranslation();

	// ════════ FCT: getColorLabel: Converts a hex color into a translated label. ════════
	const getColorLabel = (hex: string): string => {
		const key = COLOR_KEY_MAP[hex];

		return key ? t(`arcade2d.displaySettings.${key}`) : hex;
	};

	// ════════ FCT: getOptionValue: Returns the visible value for each setting. ════════
	const getOptionValue = (id: DisplaySettings2DOption['id']): string => {
		if (id === 'ballcolor')
			return getColorLabel(ballColor);
		if (id === 'paddlecolor')
			return getColorLabel(paddleColor);
		if (id === 'ballsize')
			return ballSize.toUpperCase();
		if (id === 'balltrail')
			return ballTrail ? 'ON' : 'OFF';
		return '';
	};

	// ════════ FCT: getNextBallSize: Returns the next available ball size. ════════
	const getNextBallSize = (): BallSizeOption => {
		const sizes = Object.keys(BALL_SIZE_MAP) as BallSizeOption[];
		const idx = sizes.indexOf(ballSize);

		return sizes[(idx + 1) % sizes.length];
	};

	// ════════ FCT: handleOptionClick: Updates visual settings or navigates back. ════════
	const handleOptionClick = (id: DisplaySettings2DOption['id'], path: string): void => {
		if (id === 'ballcolor') {
			// Cycle to the next available ball color.
			const idx = BALL_COLORS.indexOf(ballColor);

			setBallColor(BALL_COLORS[(idx + 1) % BALL_COLORS.length]);
			return;
		}
		if (id === 'paddlecolor') {
			// Cycle to the next available paddle color.
			const idx = PADDLE_COLORS.indexOf(paddleColor);

			setPaddleColor(PADDLE_COLORS[(idx + 1) % PADDLE_COLORS.length]);
			return;
		}
		if (id === 'ballsize') {
			// Cycle to the next available ball size.
			setBallSize(getNextBallSize());
			return;
		}
		if (id === 'balltrail') {
			// Toggle the visual trail rendered behind the ball.
			setBallTrail(!ballTrail);
			return;
		}
		navigate(path);
	};

	return (
		<ArcadeBgLayout>
			{/* STEP 7: Render the page title using i18n. */}
			<h1 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.displaySettings.title')}
			</h1>

			{/* STEP 8: Render the display settings navigation menu. */}
			<nav
				className="flex flex-col gap-[0.5rem] w-full max-w-[26rem]"
				aria-label={t('arcade2d.displaySettings.title')}
			>
				{/* STEP 9: Create one button for each display option. */}
				{DISPLAYSETTINGS2D_OPTIONS.map((option) => {
					// Only options with a real path can be considered route-active.
					const isActive = option.path !== '' && location.pathname === option.path;

					// Highlight the button when it is hovered, focused, or active.
					const isHighlighted = hovered === option.id || isActive;

					// Get the current visible value for display setting buttons.
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
							aria-current={isActive ? 'page' : undefined}
							className={[
								"relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
								isHighlighted
									? 'bg-black text-white scale-[1.05]'
									: 'bg-black text-yellow-400',
							].join(' ')}
						>
							<span>{t(`arcade2d.displaySettings.${option.id}`)}</span>

							{/* STEP 10: Show the current value only for real display settings. */}
							{optionValue !== '' && (
								<span className="ml-[1rem] text-blue-300">
									{optionValue}
								</span>
							)}
						</button>
					);
				})}
			</nav>
		</ArcadeBgLayout>
	);
}
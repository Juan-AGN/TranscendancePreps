// ┌────────────────────────────────────────────────────────────┐
// │                    Settings2DPage.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ Renders the main 2D settings menu.                         │
// │ Allows the player to open game settings, display settings, │
// │ or return to the 2D arcade menu.                           │
// │ It does NOT store the settings values directly.            │
// └────────────────────────────────────────────────────────────┘
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArcadeBgLayout } from '../components/ArcadeBgLayout';

// STEP 1: Define the available 2D settings menu options.
// The id is reused for translations: arcade2d.settings.${option.id}
// The path is reused for navigation and active-route detection.
const SETTINGS2D_OPTIONS = [
	{id: 'gameSetting', path: '/gamesettings'},
	{id: 'display',     path: '/display'},
	{id: 'back',        path: '/menu2D'},
];

// ════════ COMPONENT: Settings2DPage: Main 2D settings navigation page. ════════
export function Settings2DPage() {
	// STEP 2: Store which button is currently hovered or focused.
	// This is only visual state. It does not affect real settings values.
	const [hovered, setHovered] = useState<string | null>(null);
	// STEP 3: Get router helpers.
	// navigate() changes page without reloading the browser.
	// location.pathname tells us the current route.
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	return (
		<ArcadeBgLayout>
			{/* STEP 5: Render the page title using i18n. */}
			<h1 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.settings.title')}
			</h1>
			{/* STEP 6: Render the settings navigation menu. */}
			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[24rem]">
				{/* STEP 7: Create one button for each settings option. */}
				{SETTINGS2D_OPTIONS.map((option) => {
					// Check if the current browser route matches this option.
					const isActive = location.pathname === option.path;
					// Highlight the button when it is hovered, focused, or already active.
					const isHighlighted = hovered === option.id || isActive;

					return (
						<button
						key={option.id}
						type="button"
						onMouseEnter={() => setHovered(option.id)}
						onMouseLeave={() => setHovered(null)}
						onFocus={() => setHovered(option.id)}
						onBlur={() => setHovered(null)}
						onClick={() => navigate(option.path)}
						className={[ // Base arcade button style shared by all options.
							"relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
							isHighlighted
								? 'bg-black text-white scale-120'
									: 'bg-black text-yellow-400',
						].join(' ')}>
							{/* The option id completes the translation key. */}
							{t(`arcade2d.settings.${option.id}`)}
						</button>
					)
				})}
			</nav>
		</ArcadeBgLayout>
	)
}
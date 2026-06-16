// ┌────────────────────────────────────────────────────────────┐
// │                      Game2DPage.tsx                        │
// ├────────────────────────────────────────────────────────────┤
// │ Arcade 2D game mode selection page. It lets the user choose│
// │ between local game modes, spectator mode or returning back.│
// └────────────────────────────────────────────────────────────┘
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArcadeBgLayout } from '../components/ArcadeBgLayout';

type Game2DOption = {
	id: "1player" | "2player" | "spectator" | "back";
	path: string;
};

// STEP 1: Define every available option in the 2D game mode menu.
// - id: Internal identifier used for translations and hover state.
// - path: Route where the user will be redirected after clicking.
const GAME2D_OPTIONS: Game2DOption[] = [
	{ id: "1player", path: "/play1vsgame" },
	{ id: "2player", path: "/play2vsgame" },
	{ id: "spectator", path: "/playspectator" },
	{ id: "back", path: "/menu2D" },
];

// ════════ COMPONENT: Game2DPage: Render the 2D game mode menu. ════════
export function Game2DPage() {
	// STEP 2: Store which option is currently hovered or focused.
	// null means that no option is highlighted by interaction.
	const [hovered, setHovered] = useState<string | null>(null);
	// STEP 3: Get React Router helpers.
	// navigate changes the current route programmatically.
	// location gives access to the current URL path.
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();

	return (
		<ArcadeBgLayout>
			{/* STEP 4: Render the translated game mode menu title. */}
			<h1 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.game.title')}
			</h1>
			{/* STEP 6: Render the navigation container for game mode selection. */}
			<nav className="flex flex-col gap-[0.5rem] w-full max-w-[23rem]">
				{/* STEP 7: Convert the game mode configuration into real buttons. */}
				{GAME2D_OPTIONS.map((option) => {
					// STEP 8: Check if the current route matches this option.
					// This lets the UI mark the active page when applicable.
					const isActive = location.pathname === option.path;
					// STEP 9: Highlight the button when it is hovered, focused or active.
					// Focus support keeps the menu usable with keyboard navigation.
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
							className={[	// STEP 10: Base arcade button style shared by every option.
								"relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
								// STEP 11: Apply a different visual state when the button is highlighted.
								// scale-[1.2] keeps the original 120% scale intention safely in Tailwind
								isHighlighted
									? 'bg-black text-white scale-120'
									: 'bg-black text-yellow-400',
							].join(' ')}>
							{/* STEP 12: Use the option id to read the correct translated label. */}
							{t(`arcade2d.game.${option.id}`)}
						</button>
					)
				})}
			</nav>


		</ArcadeBgLayout>
	)
}
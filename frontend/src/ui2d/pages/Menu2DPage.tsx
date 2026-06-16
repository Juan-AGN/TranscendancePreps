// ┌────────────────────────────────────────────────────────────┐
// │                       Menu2DPage.tsx                       │
// ├────────────────────────────────────────────────────────────┤
// │ Arcade 2D menu page used to navigate between the main 2D    │
// │ game sections.                                             │
// └────────────────────────────────────────────────────────────┘
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArcadeBgLayout } from '../components/ArcadeBgLayout';

type Menu2DOption = {
	id: "home" | "game" | "settings" | "login";
	path: string;
};

// STEP 1: Define every available option in the 2D arcade menu.
// Each option has:
// - id: Internal identifier used for translations and hover state.
// - path: Route where the user will be redirected after clicking.
const MENU2D_OPTIONS: Menu2DOption[] = [
	{ id: "home", path: "/start" },
	{ id: "game", path: "/game" },
	{ id: "settings", path: "/settings" },
	{ id: "login", path: "/login" },
];

// ════════ COMPONENT: Menu2DPage: Render the 2D arcade navigation menu. ════════
export function Menu2DPage() {
	// STEP 2: Store which menu option is currently hovered or focused.
	// null means that no option is currently highlighted by interaction.
	const [hovered, setHovered] = useState<string | null>(null);
	// STEP 3: Get React Router helpers.
	// navigate changes the current route programmatically.
	// location gives access to the current URL path.
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();//step4; get the 18n trasnfunction.

	return (
		<ArcadeBgLayout>
			{/* STEP 5: Render the translated menu title. */}
			<h3 className="text-[clamp(1.12rem,4.2vw,2.75rem)] text-blue-300 font-bold mb-[0.55rem] font-['Press_Start_2P']">
				{t('arcade2d.menu.title')}
			</h3>
			{/* STEP 6: Render the navigation container.
			   aria-label gives an accessible name to this navigation block. */}
			<nav aria-label={t("arcade2d.menu.title")}
				className="flex flex-col gap-[0.5rem] w-full max-w-[23rem]">
					{/* STEP 7: Convert the menu configuration into real buttons.
				   This avoids repeating the same button markup manually. */}
				{MENU2D_OPTIONS.map((option) => {
					// STEP 8: Check if the current route matches this option.
					const isActive = location.pathname === option.path;
					// STEP 9: Highlight the button when it is hovered, focused or active.
					// Focus support is important for keyboard navigation.
					const isHighlighted = hovered === option.id || isActive;

					return (
						<button
							key={option.id}
							type="button"
							aria-current={isActive ? "page" : undefined}
							onMouseEnter={() => setHovered(option.id)}
							onMouseLeave={() => setHovered(null)}
							onFocus={() => setHovered(option.id)}
							onBlur={() => setHovered(null)}
							onClick={() => navigate(option.path)}
							className={[ "relative py-[clamp(0.1rem,0.25vw,0.5rem)] text-[clamp(0.5rem,1.6vw,1rem)] font-black uppercase font-['Press_Start_2P']",
								isHighlighted // STEP 10: Apply a different visual state when the button is highlighted.								
										? 'bg-black text-white scale-120'
										: 'bg-black text-yellow-400',
							].join(' ')}>
								{/* STEP 12: Use the option id to read the correct translated label. */}
							{t(`arcade2d.menu.${option.id}`)}
						</button>
					)
				})}
			</nav>
		</ArcadeBgLayout>
		
	)
}

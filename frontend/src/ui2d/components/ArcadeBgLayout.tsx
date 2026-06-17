// ┌────────────────────────────────────────────────────────────┐
// │                    ArcadeBgLayout.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ Shared arcade frame layout used by the 2D menu and game    │
// │ screens.                                                   │
// └────────────────────────────────────────────────────────────┘
import type { ReactNode } from "react";
import { useTranslation } from 'react-i18next';

const arcadeBg = '/images/arcadebg5.png';

type BgProps = {
	children: ReactNode;
	onBack?: () => void;
	showGameHud?: boolean;
	player1Name?: string;
	player2Name?: string;
	player1Score?: number;
	player2Score?: number;
}

// ════════ COMPONENT: ArcadeBgLayout: Render the arcade background wrapper. ════════
export function ArcadeBgLayout({
	children,
	onBack,
	showGameHud = false,
	player1Name = 'PLAYER 1',
	player2Name = 'PLAYER 2',
	player1Score = 0,
	player2Score = 0
}: BgProps) {
	const { t } = useTranslation();

	return (
		<div className="flex items-center justify-center h-full bg-black  w-full">
			{/* STEP 1: Keep all arcade elements positioned relative to the background image. */}
			<div className="relative h-full w-full max-w-[85rem]">
				{/* STEP 2: Render the decorative arcade frame background. */}
				<img src={arcadeBg}
					alt="Arcade"
					aria-hidden="true"
					className="w-full h-full object-fill block pointer-events-none"/>
				{/* STEP 3: Place the page content inside the visible arcade screen area. */}
				<div className="arcade-scroll absolute left-[8%] top-[28%] md:top-[30%] lg:top-[21%] w-[88%] md:w-[86%] lg:w-[85%] h-[54%] md:h-[56%] lg:h-[60%] flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden pt-[8%] md:pt-[7.5%] lg:pt-[7%]">
					{children}
				</div>
				{/* STEP 4: Render an optional back button when the parent page provides onBack. */}
				{onBack && (
					<button type="button"
						onClick={onBack}
						className={`absolute z-[80] font-['Press_Start_2P'] text-yellow-400 whitespace-nowrap
								cursor-pointer hover:bg-black hover:text-white transition-colors px-2 py-1
								${showGameHud ? 'bottom-[1.2%] left-1/2 -translate-x-1/2' : 'top-[5%] right-[6%]'}`}
						style={{ fontSize: showGameHud ? '2vmin' : '2.5vmin' }}>
						{t('arcade2d.common.back')}
					</button>
				)}
				{/* STEP 5: Render the optional game HUD only when the game screen needs it. */}
				{showGameHud && (
					<>	{/* Player 1 name. */}
						<div className="absolute bottom-[8.05%] sm:bottom-[8.02%] lg:bottom-[8%] left-[23.8%] sm:left-[24.2%] lg:left-[25%] z-10 font-['Press_Start_2P'] text-yellow-400 w-[18%] sm:w-[19%] lg:max-w-[20%] overflow-hidden text-center leading-none text-[clamp(6px,1.3vmin,8px)] sm:text-[clamp(8px,1.4vmin,11px)] lg:text-[clamp(8px,1.6vmin,2vmin)]">
							<span className="block whitespace-nowrap truncate">{player1Name}</span>
						</div>
						{/* Player 2 name. */}
						<div className="absolute bottom-[8.05%] sm:bottom-[8.02%] lg:bottom-[8%] right-[23.8%] sm:right-[24.2%] lg:right-[25%] font-['Press_Start_2P'] text-yellow-400 w-[18%] sm:w-[19%] lg:max-w-[20%] overflow-hidden text-center leading-none text-[clamp(6px,1.3vmin,8px)] sm:text-[clamp(8px,1.4vmin,11px)] lg:text-[clamp(8px,1.6vmin,2vmin)]">
							<span className="block whitespace-nowrap truncate">{player2Name}</span>
						</div>
						{/* Player 1 score. */}
						<div className="absolute bottom-[8.05%] sm:bottom-[8.02%] lg:bottom-[7.9%] left-[47.1%] sm:left-[47.6%] lg:left-auto lg:right-[53%] w-[3.8%] sm:w-[4.2%] lg:w-auto font-['Press_Start_2P'] text-yellow-400 text-center leading-none text-[clamp(7px,1.45vmin,9px)] sm:text-[clamp(8px,1.35vmin,11px)] lg:text-[2vmin]">
							<span>{player1Score}</span>
						</div>
						{/* Player 2 score. */}
						<div className="absolute bottom-[8.05%] sm:bottom-[8.02%] lg:bottom-[7.9%] left-[52.8%] sm:left-[53.2%] lg:left-[54%] w-[3.8%] sm:w-[4.2%] lg:w-auto font-['Press_Start_2P'] text-yellow-400 text-center leading-none text-[clamp(7px,1.45vmin,9px)] sm:text-[clamp(8px,1.35vmin,11px)] lg:text-[2vmin]">
							<span>{player2Score}</span>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
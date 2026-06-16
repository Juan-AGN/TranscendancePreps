// ┌────────────────────────────────────────────────────────────┐
// │                    MainPageButton.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ Reusable animated circular button used in main sections.   │
// │ It renders a styled action button with configurable text,  │
// │ size, color, tracking and hover effects.                   │
// └────────────────────────────────────────────────────────────┘
// STEP 1: Define the props used to customize the main page button.
interface MainPageButtonProps {
	label: string;
	onClick?: () => void;
	tracking?: string;
	textColor?: string;
	size?: string;
	hoverTracking?: string;
	textSize?: string;
}

// ════════ COMPONENT: MainPageButton: Render a reusable animated section button. ════════
export function MainPageButton({
	label,
	onClick,
	tracking = 'tracking-[0.8rem]',
	textColor = 'text-blue-300',
	size = 'w-[clamp(0.5rem,7vw,4.5rem)] h-[clamp(0.5rem,7vw,4.5rem)]',
	hoverTracking = 'group-hover:tracking-[clamp(1.10rem,1.2vw,1.95rem)]',
	textSize = 'text-[clamp(0.55rem,1.2vw,1.2rem)]',
}: MainPageButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`${size} flex items-center justify-center ${textColor} cursor-pointer
				rounded-full border-5 border-white/20 uppercase
				shadow-[1px_1px_10px_1px_#eab308,-1px_-1px_10px_1px_#eab308]
				transition-all duration-700 ease-out select-none group overflow-visible
				hover:bg-black hover:shadow-[2px_2px_50px_2px_#3b82f6,0px_0px_20px_2px_#eab308] hover:text-yellow-300`}>
			{/* Step 1: Render the button label with configurable tracking and text size. */}
			<span className={`whitespace-nowrap ${tracking} ${hoverTracking} ${textSize}
					transition-all duration-1000 ease-out inline-block origin-center`}>
				{label}
			</span>
		</button>
	)
}
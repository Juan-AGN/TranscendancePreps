// ┌────────────────────────────────────────────────────────────┐
// │                      IntroButtons.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ Reusable button used in the initial splash screen.         │
// └────────────────────────────────────────────────────────────┘
type IntroButtonsProps = {
	label: string;
	onClick?: () => void;
};

// ════════ COMPONENT: IntroButtons: Render a styled intro action button. ════════
export function IntroButtons({ label, onClick }: IntroButtonsProps) {
	return (
		<button type="button" 
			onClick={onClick}
			className=" group relative overflow-hidden whitespace-nowrap text-[#9b7431] text-[clamp(0.72rem,0.9vw,0.95rem)]
				px-[clamp(1.1rem,4vw,5rem)] py-[clamp(0.55rem,1.2vw,1rem)] rounded-full font-medium
				border-2 border-[#c9952f] bg-white/[0.78] backdrop-blur-xl tracking-[0.15em] uppercase
				shadow-[0_6px_16px_rgba(90,60,20,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] 
				transition-all duration-500 ease-out active:scale-[0.90]
				hover:scale-[1.04] hover:border-[#fff1b8] hover:bg-white hover:text-white 
				hover:shadow-[0_0_24px_rgba(234,179,8,0.70),0_10px_24px_rgba(90,60,20,0.28),inset_0_1px_0_rgba(255,255,255,0.75)]" >
			<span className="relative z-10">{label}</span>
			<span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
					duration-500 bg-gradient-to-r from-[#b47a12]/80 via-[#ffe58a]/70 to-[#b47a12]/80"></span>
		</button>
	)
}
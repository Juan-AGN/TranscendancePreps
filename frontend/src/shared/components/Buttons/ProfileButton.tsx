interface OlympusButtonProps {
	children: React.ReactNode
	onClick?: () => void
	className?: string
}

export function OlympusButton({
	children,
	onClick,
	className = '',
}: OlympusButtonProps) {

	return (

		<button
			onClick={onClick}
			className={`
            group relative overflow-hidden rounded-full border border-yellow-500/60
            bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,248,220,0.38),rgba(255,255,255,0.16))]
            px-6 py-2.5 backdrop-blur-xl
			text-[0.72rem] font-bold uppercase tracking-[0.05rem] text-[#6b3d08] 
            shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_0_0_1px_rgba(255,255,255,0.35),0_8px_24px_rgba(120,72,10,0.12)]
            transition-all duration-100 ease-out
            hover:-translate-y-[2px] hover:border-yellow-400/30 hover:text-yellow-500/80 hover:bg-blue-400/60
            hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(255,255,255,0.55),0_0_28px_rgba(234,179,8,0.28),0_12px_30px_rgba(120,72,10,0.18)]
            ${className}`}>

			{/* glow */}
			<div className="
                absolute inset-0 opacity-0 transition-opacity duration-500
                group-hover:opacity-100
                bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_70%)]" />
			{/* content */}
			<span className="relative z-10 flex items-center justify-center gap-2">
				{children}
			</span>

		</button>
	)
}
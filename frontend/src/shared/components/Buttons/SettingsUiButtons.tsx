
export function OptionButton({ active, onClick, children }: {
    active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			onClick={onClick}
			className={`rounded-full px-5 py-2 text-xs font-bold uppercase transition ${active
				? 'bg-yellow-500/25 text-yellow-800 shadow-[0_0_18px_rgba(234,179,8,0.25)]'
				: 'text-black/50 hover:bg-white/30'
				}`}>
			{children}
		</button>
	);
}

export function ToggleButton({ enabled, onClick }: {
	enabled: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={`rounded-full px-5 py-2 text-xs font-bold uppercase transition ${enabled
				? 'bg-yellow-500/25 text-yellow-800 shadow-[0_0_18px_rgba(234,179,8,0.25)]'
				: 'bg-white/20 text-black/45'
				}`}>
			{enabled ? 'On' : 'Off'}
		</button>
	);
}

export function FlagOptionButton({ onClick,	label,	active,	src, alt }: {
	active: boolean;
	onClick: () => void;
	label: string;
	src: string;
	alt: string;
}) {
	return (
		<button
			onClick={onClick}
			className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${active
				? 'border-yellow-400/55 bg-yellow-500/25 text-yellow-800 shadow-[0_0_18px_rgba(234,179,8,0.25)]'
				: 'border-transparent text-black/60 hover:border-yellow-500/30 hover:bg-white/30'
				}`}>
			<img src={src} alt={alt} className="h-4 w-6 rounded-sm object-cover" />
			<span>{label}</span>
		</button>
	);
}
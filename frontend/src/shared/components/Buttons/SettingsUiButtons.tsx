// ┌────────────────────────────────────────────────────────────┐
// │                  SettingsUiButtons.tsx                     │
// ├────────────────────────────────────────────────────────────┤
// │ Reusable button components for the settings UI page.       │
// └────────────────────────────────────────────────────────────┘
import type { ReactNode } from "react";

type OptionButtonProps = {
	active: boolean;
	onClick: () => void;
	children: ReactNode;
};

type ToggleButtonProps = {
	enabled: boolean;
	onClick: () => void;
};

type FlagOptionButtonProps = {
	active: boolean;
	onClick: () => void;
	label: string;
	src: string;
	alt: string;
};

// ════════ COMPONENT: OptionButton: Render a selectable settings option. ════════

export function OptionButton({ active, onClick, children }: OptionButtonProps) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={`rounded-full px-5 py-2 text-xs font-bold uppercase transition ${
				active
					? "bg-yellow-500/25 text-yellow-800 shadow-[0_0_18px_rgba(234,179,8,0.25)]"
					: "text-black/50 hover:bg-white/30"
			}`}>
			{children}
		</button>
	);
}

// ════════ COMPONENT: ToggleButton: Render an on/off settings control. ════════
export function ToggleButton({ enabled, onClick }: ToggleButtonProps) {
	return (
		<button
			type="button"
			aria-pressed={enabled}
			onClick={onClick}
			className={`rounded-full px-5 py-2 text-xs font-bold uppercase transition ${
				enabled
					? "bg-yellow-500/25 text-yellow-800 shadow-[0_0_18px_rgba(234,179,8,0.25)]"
					: "bg-white/20 text-black/45"
			}`}>
			{enabled ? "On" : "Off"}
		</button>
	);
}

// ════════ COMPONENT: FlagOptionButton: Render a language option with flag. ════════
export function FlagOptionButton({
	active,
	onClick,
	label,
	src,
	alt,
}: FlagOptionButtonProps) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${
				active
					? "border-yellow-400/55 bg-yellow-500/25 text-yellow-800 shadow-[0_0_18px_rgba(234,179,8,0.25)]"
					: "border-transparent text-black/60 hover:border-yellow-500/30 hover:bg-white/30"
			}`}
		>
			<img src={src} alt={alt} className="h-4 w-6 rounded-sm object-cover" />
			<span>{label}</span>
		</button>
	);
}
import type { ComponentType, ReactNode } from "react";

type Props = {
	ComponentBig: ComponentType;
	ComponentSmall: ComponentType;
};

function OlympusShell({ children }: { children: ReactNode }) {
	return (
		<div className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden px-4 py-6 pointer-events-none">
			<div className="pointer-events-none absolute left-1/2 top-[18%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-yellow-300/10 blur-[130px]" />
			<div className="pointer-events-none absolute bottom-[8%] left-[18%] h-[20rem] w-[20rem] rounded-full bg-amber-500/10 blur-[120px]" />
			<div className="pointer-events-none absolute bottom-[12%] right-[18%] h-[18rem] w-[18rem] rounded-full bg-yellow-100/20 blur-[110px]" />
			{children}
		</div>
	);
}

function OlympusPanel({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`relative pointer-events-auto overflow-hidden rounded-[2rem] border border-yellow-500/45 bg-white/[0.50]backdrop-blur-[5px] ${className}`}>
			<div className="relative z-10 h-full w-full">
				{children}
			</div>
		</div>
	);
}

export function Doubledivvert({ ComponentBig, ComponentSmall }: Props) {
	return (
		<OlympusShell>
			<div className="relative flex w-full max-w-6xl flex-col items-center gap-4 pointer-events-none">

				<OlympusPanel
					className=" w-full min-h-[52vh] max-h-[68vh] md:min-h-[58vh]">
					<ComponentBig />
				</OlympusPanel>

				<div className="pointer-events-auto w-full max-w-4xl">
					<ComponentSmall />
				</div>

			</div>
		</OlympusShell>
	);
}

export function Doubledivgame({ ComponentBig, ComponentSmall }: Props) {
	return (
		<div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none px-4 py-6">
			<div className="flex w-full max-w-7xl flex-col items-center justify-center gap-4 pointer-events-none">

				<div
					className="pointer-events-auto w-full rounded-[1.5rem]border border-yellow-300/45
						bg-white/30 backdrop-blur-2xl shadow-[0_18px_55px_rgba(55,78,140,0.20)] p-3">
					<ComponentSmall />
				</div>

				<div
					className="relative pointer-events-auto w-full min-h-[60vh] max-h-[72vh] overflow-hidden rounded-[2rem]
						border border-yellow-300/50 bg-white/35 backdrop-blur-2xlshadow-[0_30px_90px_rgba(55,78,140,0.25)]">
					<ComponentBig />
				</div>

			</div>
		</div>
	);
}


export function Singledivgame({ Component }: { Component: ComponentType }) {
	return (
		<OlympusShell>
			<OlympusPanel
				className="w-full max-w-3xl min-h-[22rem]">
				<Component />
			</OlympusPanel>
		</OlympusShell>
	);
}

interface TextFieldProps {
	value: string;
	onChange: (value: string) => void;
	submit: (value: string) => void;
	text: string;
	tw?: number;
}

export function TextField({ value, onChange, text, submit }: TextFieldProps) {
	function dothing() {
		submit(value);
	}

	return (
		<div
			className="flex h-14 w-full items-center gap-3 rounded-full border border-yellow-500/35 bg-white/60 px-3
			backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_35px_rgba(90,60,20,0.16)] transition
			focus-within:border-yellow-500/60 focus-within:bg-white/70
			focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_45px_rgba(90,60,20,0.22)]">
			<div
				className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yellow-500/35
				bg-white/50 text-yellow-700 shadow-[0_6px_18px_rgba(90,60,20,0.14)]">
				✦
			</div>

			<input
				className=" h-full flex-1 bg-transparent text-sm font-medium text-yellow-950 placeholder:text-yellow-900/45 outline-none"
				placeholder="Enter lobby name..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter")
						dothing();
				}}
			/>

			<button
				type="button"
				onClick={dothing}
				className="h-11 min-w-[9rem] rounded-full border border-yellow-200/80 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400
				px-6 text-xs font-black tracking-[0.28em] text-yellow-950 shadow-[0_8px_25px_rgba(217,170,40,0.35)]
				transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-95">
				{text}
			</button>
		</div>
	);
}

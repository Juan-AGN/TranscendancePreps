import type { ComponentType, ReactNode } from "react";
import { useTranslation } from 'react-i18next';

type Props = {
	ComponentBig: ComponentType;
	ComponentSmall: ComponentType;
};

type TextFieldProps = {
	value: string;
	onChange: (value: string) => void;
	text: string;
	submit: (value: string) => void;
};

function OlympusShell({ children }: { children: ReactNode }) {
	return (
		<div className=" fixed inset-0 z-10 flex justify-center pointer-events-none items-start overflow-y-auto overflow-x-hidden px-3 pb-3 pt-[5rem]
				sm:px-4 sm:pb-4 sm:pt-[5.5rem] md:pt-[6rem] lg:items-center lg:overflow-hidden lg:px-4 lg:py-6 lg:pt-6">
			<div className="pointer-events-none absolute left-1/2 top-[18%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-yellow-300/10 blur-[130px]" />
			<div className="pointer-events-none absolute bottom-[8%] left-[18%] h-[20rem] w-[20rem] rounded-full bg-amber-500/10 blur-[120px]" />
			<div className="pointer-events-none absolute bottom-[12%] right-[18%] h-[18rem] w-[18rem] rounded-full bg-yellow-100/20 blur-[110px]" />
			{children}
		</div>
	);
}

function OlympusPanel({ children, className = "", }: { children: ReactNode; className?: string; }) {
	return (
		<div
			className={`relative pointer-events-auto overflow-hidden rounded-[2rem] border border-yellow-500/45 bg-white/[0.50] backdrop-blur-[5px] ${className}`}>
			<div className="relative z-10 h-full w-full">
				{children}
			</div>
		</div>
	);
}

export function Doubledivvert({ ComponentBig, ComponentSmall }: Props) {
	return (
		<OlympusShell>
			<div className=" relative flex w-full max-w-6xl flex-col items-center pointer-events-none gap-2 min-h-[calc(100dvh-5.75rem)]
					sm:gap-3 sm:min-h-[calc(100dvh-6.25rem)] md:gap-4 lg:min-h-0 lg:gap-4">
				<OlympusPanel className="w-full max-lg:flex-1 max-lg:min-h-[22rem] max-lg:max-h-none
						sm:max-lg:min-h-[26rem] md:max-lg:min-h-[30rem] lg:min-h-[52vh] lg:max-h-[68vh]">
					<ComponentBig />
				</OlympusPanel>
				<div className="pointer-events-auto w-full max-w-4xl shrink-0 mb-5 sm:mb-6 lg:mb-0">
					<ComponentSmall />
				</div>
			</div>
		</OlympusShell>
	);
}

export function Doubledivgame({ ComponentBig, ComponentSmall }: Props) {
	return (
		<div className=" fixed inset-0 z-10 flex justify-center pointer-events-none items-start overflow-y-auto overflow-x-hidden px-3 pb-3 pt-[5rem]
				sm:px-4 sm:pb-4 sm:pt-[5.5rem] md:pt-[6rem] lg:items-center lg:overflow-hidden lg:px-4 lg:py-6 lg:pt-6">
			<div className="flex w-full max-w-7xl flex-col items-center pointer-events-none gap-2 min-h-[calc(100dvh-5.75rem)]
					sm:gap-3 sm:min-h-[calc(100dvh-6.25rem)] md:gap-4 lg:min-h-0 lg:justify-center lg:gap-4">
				<div className=" pointer-events-auto w-full shrink-0 rounded-[1.5rem] border border-yellow-300/45
						bg-white/30 backdrop-blur-2xl shadow-[0_18px_55px_rgba(55,78,140,0.20)] p-2 lg:p-3">
					<ComponentSmall />
				</div>

				<div className="relative pointer-events-auto w-full rounded-[2rem] border border-yellow-300/50 bg-white/35 backdrop-blur-2xl
						shadow-[0_30px_90px_rgba(55,78,140,0.25)] overflow-y-auto overflow-x-hidden max-lg:flex-1 max-lg:min-h-[20rem] max-lg:max-h-none
						sm:max-lg:min-h-[24rem] md:max-lg:min-h-[28rem] lg:overflow-hidden lg:min-h-[60vh] lg:max-h-[72vh]" >
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
				className="flex w-full items-center justify-center max-w-3xl min-h-[20rem]sm:min-h-[24rem] lg:min-h-[22rem]">
				<Component />
			</OlympusPanel>
		</OlympusShell>
	);
}


export function TextField({ value, onChange, text, submit }: TextFieldProps) {
	const { t } = useTranslation();
	function dothing() {
		submit(value);
	}

	return (
		<div className="flex h-12 w-full items-center gap-2 rounded-full border border-yellow-500/35 bg-white/60 px-2
				backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_35px_rgba(90,60,20,0.16)] transition
				focus-within:border-yellow-500/60 focus-within:bg-white/70
				focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_45px_rgba(90,60,20,0.22)]
				lg:h-14 lg:gap-3 lg:px-3">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-500/35
					bg-white/50 text-yellow-700 shadow-[0_6px_18px_rgba(90,60,20,0.14)] lg:h-9 lg:w-9">
				✦
			</div>

			<input className="h-full min-w-0 flex-1 bg-transparent text-[0.72rem] font-medium text-yellow-950 placeholder:text-yellow-900/45
					outline-none lg:text-sm"
				placeholder={t('remoteGame.enterLobbyName')}
				value={value}
				maxLength={20}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter")
						dothing();
				}} />

			<button type="button" onClick={dothing}
				className="h-8 min-w-[4.8rem] rounded-full border border-yellow-200/80 shadow-[0_8px_25px_rgba(217,170,40,0.35)] 
					transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-95
					bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-2 text-[0.52rem] font-black tracking-[0.1em] text-yellow-950
					sm:h-10 sm:min-w-[5.8rem] sm:px-3 sm:text-[0.62rem] sm:tracking-[0.16em]
					lg:h-11 lg:min-w-[9rem] lg:px-6 lg:text-xs lg:tracking-[0.28em]">
				{text}
			</button>
		</div>
	);
}

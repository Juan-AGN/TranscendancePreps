//Hubseetingspanel.tsx
import type { ReactNode } from "react";
import { useState } from "react";

function SettingOption({
	title,
	children
} : {
	title : string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between p-3">
			<span>{title}</span>
			<div>{children}</div>
		</div>

	);
}

export function HubPanelSettings() {

	const [audioEnabled,setAudioEnabled] = useState("ON");
	const [playerSpeed, setPlayerSpeed] = useState("MEDIUM");
	const [displayLevel, setDisplayLevel] = useState("MEDIUM");
	const audiopts = ["ON", "OFF"];
	const speeds =  ["SLOW", "MEDIUM", "FAST"];
	const qualitys = ["LOW", "MEDIUM", "HIGH"];

	return(
		<div className="p-2">
			<SettingOption title="AUDIO">
				<div className="flex gap-2">
					{audiopts.map((audiopts) => (
						<button
							key={audiopts}
							onClick={() =>setAudioEnabled(audiopts)}
							className={audiopts === audioEnabled ?
								'rounded border px-2 py-1 font-bold bg-gray-100'
								: 'rounded px-2 py-1 hover:bg-gray-50'
							}
						>
							{audiopts}
						</button>
					))}
				</div>
					
			</SettingOption>

			<SettingOption title="DISPLAY">
				<div className="flex gap-2">
					{qualitys.map((qualitys) => (
						<button
							key={qualitys}
							onClick={() =>setDisplayLevel(qualitys)}
							className={qualitys === displayLevel ?
								'rounded border px-2 py-1 font-bold bg-gray-100'
								: 'rounded px-2 py-1 hover:bg-gray-50'}
						>
							{qualitys}
						</button>
					))}
				</div>
			</SettingOption>

			<SettingOption title="CONTROLS">
				<span>notyet</span>
			</SettingOption>

			<SettingOption title="PLAYER SPEED">
				<div className="flex gap-2">
					{speeds.map((speed) => (
						<button
							key={speed}
							onClick={() => setPlayerSpeed(speed)}
							className={speed === playerSpeed ?
								'rounded border px-2 py-1 font-bold bg-gray-100'
								: 'rounded px-2 py-1 hover:bg-gray-50'
							}
						>
							{speed}
						</button>
					)	)}
				</div>
			</SettingOption>

		</div>
	)
}
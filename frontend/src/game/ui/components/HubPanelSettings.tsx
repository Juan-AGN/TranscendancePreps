// HubPanelSettings — panel de opciones del hub 3D
import type { ReactNode } from "react";
import { useGameSettingsStore, type SpeedPreset, type SensitivityPreset, type SizePreset } from "../../config/gameSettingsStore";

function SettingOption({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
			<span className="text-sm font-medium text-gray-700">{title}</span>
			<div>{children}</div>
		</div>
	);
}

function OptionButtons({
	options,
	value,
	onChange,
}: {
	options: readonly string[];
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex gap-1">
			{options.map((opt) => (
				<button
					key={opt}
					onClick={() => onChange(opt)}
					className={opt === value
						? 'rounded border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-100'
						: 'rounded px-2 py-1 text-xs hover:bg-gray-50 text-gray-500'}
				>
					{opt}
				</button>
			))}
		</div>
	);
}

export function HubPanelSettings() {
	const {
		moveSpeed, setMoveSpeed,
		cameraSensitivity, setCameraSensitivity,
		playerSize, setPlayerSize,
	} = useGameSettingsStore();

	return (
		<div className="p-1">
			<SettingOption title="PLAYER SPEED">
				<OptionButtons
					options={["SLOW", "MEDIUM", "FAST"]}
					value={moveSpeed}
					onChange={(v) => setMoveSpeed(v as SpeedPreset)}
				/>
			</SettingOption>

			<SettingOption title="CAMERA SENSITIVITY">
				<OptionButtons
					options={["LOW", "MEDIUM", "HIGH"]}
					value={cameraSensitivity}
					onChange={(v) => setCameraSensitivity(v as SensitivityPreset)}
				/>
			</SettingOption>

			<SettingOption title="PLAYER SIZE">
				<OptionButtons
					options={["SMALL", "NORMAL", "BIG"]}
					value={playerSize}
					onChange={(v) => setPlayerSize(v as SizePreset)}
				/>
			</SettingOption>
		</div>
	);
}
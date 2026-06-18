// ┌────────────────────────────────────────────────────────────┐
// │               HubPanelSettings.tsx                         │
// ├────────────────────────────────────────────────────────────┤
// │ Settings panel for 3D Hub gameplay options.                │
// │ Controls speed, camera sensitivity, and player size.       │
// │ Persists values through global game settings store.        │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import settings and translation dependencies
import type { ReactNode } from "react";
import { useGameSettingsStore, type SpeedPreset, type SensitivityPreset, type SizePreset } from "../../config/gameSettingsStore";
import { useTranslation } from 'react-i18next';

function SettingOption({ title, children }: { title: string; children: ReactNode }) {
	// STEP 2: Reusable settings row layout
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
	options: readonly { value: string; label: string }[];
	value: string;
	onChange: (v: string) => void;
}) {
	// STEP 3: Render grouped option toggle buttons
	return (
		<div className="flex gap-1">
			{options.map((opt) => (
				<button
					key={opt.value}
					onClick={() => onChange(opt.value)}
					className={opt.value === value
						? 'rounded border border-gray-400 px-2 py-1 text-xs font-bold bg-gray-100'
						: 'rounded px-2 py-1 text-xs hover:bg-gray-50 text-gray-500'}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

export function HubPanelSettings() {
	// STEP 4: Read/store settings state and actions
	const { t } = useTranslation();
	const {
		moveSpeed, setMoveSpeed,
		cameraSensitivity, setCameraSensitivity,
		playerSize, setPlayerSize,
	} = useGameSettingsStore();

	// STEP 5: Render setting sections
	return (
		<div className="p-1">
			<SettingOption title={t('hubPanelSettings.playerSpeed')}>
				<OptionButtons
					options={[
						{ value: 'SLOW', label: t('hubPanelSettings.slow') },
						{ value: 'MEDIUM', label: t('hubPanelSettings.medium') },
						{ value: 'FAST', label: t('hubPanelSettings.fast') },
					]}
					value={moveSpeed}
					onChange={(v) => setMoveSpeed(v as SpeedPreset)}
				/>
			</SettingOption>

			<SettingOption title={t('hubPanelSettings.cameraSensitivity')}>
				<OptionButtons
					options={[
						{ value: 'LOW', label: t('hubPanelSettings.low') },
						{ value: 'MEDIUM', label: t('hubPanelSettings.medium') },
						{ value: 'HIGH', label: t('hubPanelSettings.high') },
					]}
					value={cameraSensitivity}
					onChange={(v) => setCameraSensitivity(v as SensitivityPreset)}
				/>
			</SettingOption>

			<SettingOption title={t('hubPanelSettings.playerSize')}>
				<OptionButtons
					options={[
						{ value: 'SMALL', label: t('hubPanelSettings.small') },
						{ value: 'NORMAL', label: t('hubPanelSettings.normal') },
						{ value: 'BIG', label: t('hubPanelSettings.big') },
					]}
					value={playerSize}
					onChange={(v) => setPlayerSize(v as SizePreset)}
				/>
			</SettingOption>
		</div>
	);
}

// ===== MINI DICTIONARY =====
// preset -> predefined option value used by gameplay systems
// global store -> shared app state container
// toggle button group -> set of mutually selectable values
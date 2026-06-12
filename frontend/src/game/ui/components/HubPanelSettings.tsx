// HubPanelSettings — panel de opciones del hub 3D
import type { ReactNode } from "react";
import { useGameSettingsStore, type SpeedPreset, type SensitivityPreset, type SizePreset } from "../../config/gameSettingsStore";
import { useTranslation } from 'react-i18next';

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
	options: readonly { value: string; label: string }[];
	value: string;
	onChange: (v: string) => void;
}) {
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
	const { t } = useTranslation();
	const {
		moveSpeed, setMoveSpeed,
		cameraSensitivity, setCameraSensitivity,
		playerSize, setPlayerSize,
	} = useGameSettingsStore();

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
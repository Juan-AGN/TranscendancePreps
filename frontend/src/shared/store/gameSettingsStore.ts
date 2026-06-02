import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpeedPreset       = 'SLOW' | 'MEDIUM' | 'FAST';
export type ControlsPreset    = 'ARROWS' | 'WASD';
export type SensitivityPreset = 'LOW' | 'MEDIUM' | 'HIGH';
export type SizePreset        = 'SMALL' | 'NORMAL' | 'BIG';

// valor real que se pasa al motor
export const SPEED_MAP: Record<SpeedPreset, number> = {
	SLOW:   0.15,
	MEDIUM: 0.30,
	FAST:   0.50,
};

// multiplicador de velocidad de rotacion de camara
export const SENSITIVITY_MAP: Record<SensitivityPreset, number> = {
	LOW:    0.015,
	MEDIUM: 0.030,
	HIGH:   0.060,
};

// escala del muñeco en la escena
export const PLAYER_SIZE_MAP: Record<SizePreset, number> = {
	SMALL:  2,
	NORMAL: 3,
	BIG:    4.5,
};

interface GameSettingsState {
	moveSpeed:         SpeedPreset;
	controlsPreset:    ControlsPreset;
	cameraSensitivity: SensitivityPreset;
	invertCameraY:     boolean;
	playerSize:        SizePreset;

	setMoveSpeed:         (v: SpeedPreset) => void;
	setControlsPreset:    (v: ControlsPreset) => void;
	setCameraSensitivity: (v: SensitivityPreset) => void;
	setInvertCameraY:     (v: boolean) => void;
	setPlayerSize:        (v: SizePreset) => void;
}

export const useGameSettingsStore = create<GameSettingsState>()(
	persist(
		(set) => ({
			moveSpeed:         'MEDIUM',
			controlsPreset:    'ARROWS',
			cameraSensitivity: 'MEDIUM',
			invertCameraY:     false,
			playerSize:        'NORMAL',

			setMoveSpeed:         (v) => set({ moveSpeed: v }),
			setControlsPreset:    (v) => set({ controlsPreset: v }),
			setCameraSensitivity: (v) => set({ cameraSensitivity: v }),
			setInvertCameraY:     (v) => set({ invertCameraY: v }),
			setPlayerSize:        (v) => set({ playerSize: v }),
		}),
		{ name: 'game-settings' }
	)
);

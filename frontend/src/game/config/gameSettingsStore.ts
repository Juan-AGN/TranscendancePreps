// ┌────────────────────────────────────────────────────────────┐
// │                 gameSettingsStore.ts                       │
// ├────────────────────────────────────────────────────────────┤
// │ Stores configurable settings for the 3D Hub/player.        │
// │ Controls movement speed, controls, camera and player size. │
// │ It does NOT store 2D Pong gameplay or display settings.    │
// └────────────────────────────────────────────────────────────┘
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpeedPreset       = 'SLOW' | 'MEDIUM' | 'FAST';
export type ControlsPreset    = 'ARROWS' | 'WASD';
export type SensitivityPreset = 'LOW' | 'MEDIUM' | 'HIGH';
export type SizePreset        = 'SMALL' | 'NORMAL' | 'BIG';

// STEP 1: Map movement speed presets to real values used by the 3D engine.
export const SPEED_MAP: Record<SpeedPreset, number> = {
	SLOW:   0.15,
	MEDIUM: 0.30,
	FAST:   0.50,
};

// STEP 2: Map camera sensitivity presets to real rotation multipliers.
export const SENSITIVITY_MAP: Record<SensitivityPreset, number> = {
	LOW:    0.015,
	MEDIUM: 0.030,
	HIGH:   0.060,
};

// STEP 3: Map player size presets to real mesh scale values.
export const PLAYER_SIZE_MAP: Record<SizePreset, number> = {
	SMALL:  2,
	NORMAL: 3,
	BIG:    4.5,
};
// ════════ TYPE: GameSettingsState: Zustand store shape for 3D settings. ════════
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
// ════════ STORE: useGameSettingsStore: Persisted 3D Hub/player settings. ════════
export const useGameSettingsStore = create<GameSettingsState>()(
	persist(
		(set) => ({
			// STEP 4: Define default 3D player settings.
			moveSpeed:         'MEDIUM',
			controlsPreset:    'ARROWS',
			cameraSensitivity: 'MEDIUM',
			invertCameraY:     false,
			playerSize:        'NORMAL',
			// STEP 5: Define setter actions.
			setMoveSpeed:         (v) => set({ moveSpeed: v }),
			setControlsPreset:    (v) => set({ controlsPreset: v }),
			setCameraSensitivity: (v) => set({ cameraSensitivity: v }),
			setInvertCameraY:     (v) => set({ invertCameraY: v }),
			setPlayerSize:        (v) => set({ playerSize: v }),
		}),
		{ name: 'game-3d-settings' }// STEP 6: Persist these settings between browser sessions.
	)
);

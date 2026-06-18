// ┌────────────────────────────────────────────────────────────┐
// │                game2dSettingsStore.ts                      │
// ├────────────────────────────────────────────────────────────┤
// │ Stores gameplay settings for the local 2D game.            │
// │ Controls score limit, paddle size and ball speed.          │
// │ It does NOT store visual display settings.                 │
// └────────────────────────────────────────────────────────────┘
import { create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// ════════ TYPE: ScoreLimitOption: Available score limits. ════════
export type ScoreLimitOption = 5 | 10 | 15;

// ════════ TYPE: PaddleSizeOption: Available paddle size labels. ════════
export type PaddleSizeOption = 'small' | 'medium' | 'large';

// ════════ TYPE: BallSpeedOption: Available ball speed labels. ════════
export type BallSpeedOption = 'slow' | 'normal' | 'fast';

// STEP 1: Map paddle size labels to the real paddle height in pixels.
export const PADDLE_SIZE_MAP: Record<PaddleSizeOption, number> = {
	small: 50,
	medium: 100,
	large: 150,
};

// STEP 2: Map ball speed labels to the real initial ball speed.
export const BALL_SPEED_MAP: Record<BallSpeedOption, number> = {
	slow: 3,
	normal: 5,
	fast: 8,
};

// ════════ TYPE: Game2dSettingsState: Zustand store shape. ════════
// This type defines both the current settings and the setter actions.
interface Game2dSettingsState {
	scoreLimit: ScoreLimitOption;
	paddleSize: PaddleSizeOption;
	ballSpeed: BallSpeedOption;

	setScoreLimit: (v: ScoreLimitOption) => void;
	setPaddleSize: (v: PaddleSizeOption) => void;
	setBallSpeed: (v: BallSpeedOption) => void;
}

// ════════ STORE: use2dGameSettingsStore: Gameplay settings persisted in sessionStorage. ════════
export const use2dGameSettingsStore = create<Game2dSettingsState>()(
	persist(
		(set) => ({
			// STEP 3: Define default gameplay settings.
			scoreLimit: 5,
			paddleSize: 'medium',
			ballSpeed: 'normal',

			// STEP 4: Define setter actions.
			setScoreLimit: (v) => set({ scoreLimit: v }),
			setPaddleSize: (v) => set({ paddleSize: v }),
			setBallSpeed: (v) => set({ ballSpeed: v }),
		}),
		{
			// STEP 5: Persist gameplay settings only for the current browser session.
			name: 'game-settings',
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);
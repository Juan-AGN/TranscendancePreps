// ┌────────────────────────────────────────────────────────────┐
// │              display2dSettingsStore.ts                     │
// ├────────────────────────────────────────────────────────────┤
// │ Stores visual display settings for the local 2D game.      │
// │ Controls ball color, paddle color, ball size and trail.    │
// │ It does NOT store gameplay rules such as score or speed.   │
// └────────────────────────────────────────────────────────────┘

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// STEP 1: Define available colors for the ball and paddles.
// The values are hex colors used directly by the canvas renderer.
export const BALL_COLORS = ['#70ee31', '#ffee00', '#ff4444'] as const;
export const PADDLE_COLORS = ['#70ee31', '#ffee00', '#ff4444'] as const;

// ════════ TYPE: BallColorOption: Available ball color values. ════════
export type BallColorOption = typeof BALL_COLORS[number];

// ════════ TYPE: PaddleColorOption: Available paddle color values. ════════
export type PaddleColorOption = typeof PADDLE_COLORS[number];

// STEP 2: Map ball size labels to the real radius used by the canvas renderer.
export const BALL_SIZE_MAP = {
	small: 5,
	normal: 9,
	large: 14,
} as const;

// ════════ TYPE: BallSizeOption: Available ball size labels. ════════
export type BallSizeOption = keyof typeof BALL_SIZE_MAP;

// ════════ TYPE: Display2dState: Zustand store shape. ════════
// This type defines both the current visual settings and the setter actions.
interface Display2dState {
	ballColor: BallColorOption;
	paddleColor: PaddleColorOption;
	ballSize: BallSizeOption;
	ballTrail: boolean;

	setBallColor: (v: BallColorOption) => void;
	setPaddleColor: (v: PaddleColorOption) => void;
	setBallSize: (v: BallSizeOption) => void;
	setBallTrail: (v: boolean) => void;
}

// ════════ STORE: useDisplay2dStore: Visual 2D settings persisted in localStorage. ════════
export const useDisplay2dStore = create<Display2dState>()(
	persist(
		(set) => ({
			// STEP 3: Define default visual settings.
			ballColor: '#70ee31',
			paddleColor: '#70ee31',
			ballSize: 'normal',
			ballTrail: false,

			// STEP 4: Define setter actions.
			setBallColor: (v) => set({ ballColor: v }),
			setPaddleColor: (v) => set({ paddleColor: v }),
			setBallSize: (v) => set({ ballSize: v }),
			setBallTrail: (v) => set({ ballTrail: v }),
		}),
		{
			// STEP 5: Persist visual preferences between browser sessions.
			name: 'display-2d-settings-v3',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
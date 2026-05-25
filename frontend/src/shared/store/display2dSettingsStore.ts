import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

//colores disponibles para ciclar
export const BALL_COLORS   = ['#ffffff', '#ffee00', '#00ffff', '#ff4444'] as const
export const PADDLE_COLORS = ['#70ee31', '#ffee00', '#00ffff', '#ff4444'] as const
export type BallColorOption   = typeof BALL_COLORS[number]
export type PaddleColorOption = typeof PADDLE_COLORS[number]

//tamaños de bola -> radio en pixeles
export const BALL_SIZE_MAP = { small: 5, normal: 9, large: 14 } as const
export type BallSizeOption = keyof typeof BALL_SIZE_MAP

interface Display2dState {
	ballColor: BallColorOption
	paddleColor: PaddleColorOption
	ballSize: BallSizeOption
	ballTrail: boolean

	setBallColor: (v: BallColorOption) => void
	setPaddleColor: (v: PaddleColorOption) => void
	setBallSize: (v: BallSizeOption) => void
	setBallTrail: (v: boolean) => void
}

export const useDisplay2dStore = create<Display2dState>()(
	persist(
		(set) => ({
			ballColor: '#ffffff' as BallColorOption,
			paddleColor: '#70ee31' as PaddleColorOption,
			ballSize: 'normal' as BallSizeOption,
			ballTrail: false,
			setBallColor: (v) => set({ ballColor: v }),
			setPaddleColor: (v) => set({ paddleColor: v }),
			setBallSize: (v) => set({ ballSize: v }),
			setBallTrail: (v) => set({ ballTrail: v }),
		}),
		{
			name: 'display-2d-settings',
			storage: createJSONStorage(() => localStorage),
		}
	)
)

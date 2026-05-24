// Zustand store for 2D game settings
// Uses sessionStorage so values reset when the browser/tab is closed
// Any component can read or update these settings via the hook
import { create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Maps the label option to the actual pixel height used for each paddle
export const PADDLE_SIZE_MAP = {
    small: 50,
    medium: 100,
    large: 150,
} as const;

// Maps the label option to the actual initial speed value used for the ball
export const BALL_SPEED_MAP = {
    slow:   3,
    normal: 5,
    fast:   8,
} as const;

// Shape of the store: current values + setter actions
interface Game2dSettingsState {
    scoreLimit: 5 | 10 | 15;                   // points needed to win a match
    paddleSize: 'small' | 'medium' | 'large';  // paddle height option
    ballSpeed: 'slow' | 'normal' | 'fast';     // ball speed option

    setScoreLimit: (v: 5 | 10 | 15) => void;
    setPaddleSize: (v: 'small' | 'medium' | 'large') => void;
    setBallSpeed: (v: 'slow' | 'normal' | 'fast') => void;
}

export const use2dGameSetingsStore = create<Game2dSettingsState>() ( 
    persist(
        (set) => ({
            // Default values on first load (or after browser closes)
            // 'as' casts are needed because TS infers literal '5' instead of '5 | 10 | 15'
            scoreLimit: 5 as 5 | 10 | 15,
            paddleSize: 'medium' as 'small' | 'medium' | 'large',
            ballSpeed: 'normal' as 'slow' | 'normal' | 'fast',

            // Actions — replace the matching field in the store
            setScoreLimit: (v) => set({ scoreLimit: v}),
            setPaddleSize: (v) => set({ paddleSize: v}),
            setBallSpeed: (v) => set({ ballSpeed: v}),
        }),
        {
            name: 'game-settings',          // key used in sessionStorage
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);



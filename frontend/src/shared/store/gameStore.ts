// ┌────────────────────────────────────────────────────────────┐
// │                       gameStore.ts                         │
// ├────────────────────────────────────────────────────────────┤
// │ Stores global UI state shared by the React app and 3D Hub. │
// │ Controls loading state, Hub readiness and current scene.   │
// │ It does NOT replace secure backend authentication.         │
// └────────────────────────────────────────────────────────────┘
import { create } from 'zustand';

// ════════ TYPE: GameState: Defines the global Zustand state shape. ════════
// This store works like a shared control panel for UI and 3D state.
interface GameState {
	// Loading state used while heavy 3D assets are being prepared.
	isLoading: boolean;
	loadingProgress: number;
	loadingLabel: string;
	// Lightweight UI authentication state.
	// Secure authentication is still handled through backend session/token logic.
	isAuthenticated: boolean;
	username: string | null;
	// 3D Hub state.
	isHubReady: boolean;
	currentScene: 'hub' | 'game' | null;
	// Loading actions.
	setLoading: (isLoading: boolean) => void;
	setLoadingProgress: (progress: number, label?: string) => void;
	// Hub actions.
	setHubReady: (ready: boolean) => void;
	setCurrentScene: (scene: 'hub' | 'game' | null) => void;
	// User UI actions.
	login: (username: string) => void;
	logout: () => void;
}

// ════════ STORE: useGameStore: Global UI and 3D Hub state. ════════
export const useGameStore = create<GameState>((set) => ({
		// STEP 1: Define initial loading state.
	isLoading: true,
	loadingProgress: 0,
	loadingLabel: 'Loading...',
	// STEP 2: Define initial lightweight user state.
	isAuthenticated: false,
	username: null,
	// STEP 3: Define initial Hub state.
	isHubReady: false,
	currentScene: null,
	// STEP 4: Update whether the app is currently loading.
	setLoading: (isLoading) =>
		set({ isLoading }),
	// STEP 5: Update loading progress and optionally replace the loading label.
	setLoadingProgress: (progress, label) =>
		set((state) => ({
			loadingProgress: progress,
			loadingLabel: label || state.loadingLabel
		})),
	// STEP 6: Mark the Hub as ready or not ready.
	setHubReady: (ready) =>
		set({ isHubReady: ready }),
	// STEP 7: Change the current high-level scene.
	setCurrentScene: (scene) =>
		set({ currentScene: scene }),
	// STEP 8: Store lightweight user UI state.
	login: (username) =>
		set({
			isAuthenticated: true,
			username
		}),
	// STEP 9: Clear lightweight user UI state.
	logout: () =>
		set({
			isAuthenticated: false,
			username: null
		}),
}))




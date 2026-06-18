// ┌────────────────────────────────────────────────────────────┐
// │               useBabylonScene.ts                           │
// ├────────────────────────────────────────────────────────────┤
// │ React hook that manages Babylon Hub scene lifecycle.       │
// │ Creates, initializes, and disposes the 3D scene.          │
// │ Reports loading progress and syncs global store state.     │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import React/Babylon integration dependencies

import { useEffect, useRef } from 'react';
import { HubScene } from '../../scenes/hub/HubScene';
import { useGameStore } from '../../../shared/store/gameStore';

// STEP 2: Define hook input contract
interface UseBabylonSceneProps {
	canvasId: string;  // HTML canvas id where 3D is rendered
	enabled?: boolean;
	onProgress?: (progress: number, label: string) => void;  // Optional progress callback
	onComplete?: () => void;  // Optional callback fired when loading ends
	onPanelOpen?: (panelId: string) => void;  // Callback to open React panel from 3D scene
}

// STEP 3: Create hook for full 3D scene lifecycle (create/load/cleanup)
export const useBabylonScene = ({
	canvasId,
	enabled = true,
	onProgress,
	onComplete,
	onPanelOpen
}: UseBabylonSceneProps) => {
	// STEP 4: Hold mutable scene/init state with refs (no re-renders)
	const sceneRef = useRef<HubScene | null>(null);  // Persistent scene reference
	const isInitializingRef = useRef(false);         // Prevent parallel double initialization

	// STEP 5: Get store action to mark Hub readiness
	const setHubReady = useGameStore(state => state.setHubReady);

	// STEP 6: Initialize scene on mount and dispose on unmount
	useEffect(() => {
		if (!enabled)
			return;

		// Avoid duplicate init if scene already exists or init is in progress
		if (sceneRef.current || isInitializingRef.current) {
			return;
		}
		// Cancellation flag prevents state updates after unmount
		let isCancelled = false;
		isInitializingRef.current = true;

		// STEP 7: Async scene bootstrap
		const initScene = async () => {
			try {
				// Create HubScene with progress callback
				const scene = new HubScene(canvasId, (loaded, total, currentLabel) => {
					// Ignore updates if component already unmounted
					if (isCancelled)
						return;

					// Compute loading percentage (e.g., 5/10 = 50%)
					const percentage = Math.round((loaded / total) * 100);
					// Build progress label for UI
					const label = `${currentLabel}...  ${loaded}/${total}`;

					// Call progress callback if provided
					onProgress?.(percentage, label);
				}, (panelId) => {
					if (!isCancelled)
						onPanelOpen?.(panelId);
				});

				// If unmounted during creation, cleanup and exit
				if (isCancelled) {
					scene.dispose();  // Release memory/resources
					return;
				}

				// Store active scene reference for later cleanup
				sceneRef.current = scene;

				// Load all scene assets (models, textures, etc.)
				await scene.loadAssets();

				// If unmounted while loading, cleanup and exit
				if (isCancelled) {
					scene.dispose();
					return;
				}

				// Successfully loaded
				onProgress?.(100, 'Completed');
				setHubReady(true);  // Mark Hub ready in global store
				onComplete?.();

			} catch (error) {
				// Handle initialization/load failure
				if (!isCancelled) {
					void error;
					onProgress?.(100, 'Loading error');
					onComplete?.();  // Still complete to unblock UI flow
				}
			} finally {
				isInitializingRef.current = false;
			}
		};

		// Start async scene initialization
		initScene();

		// STEP 8: Cleanup on unmount
		return () => {
			isCancelled = true;  // Mark component as disposed
			isInitializingRef.current = false;
			// Dispose active scene if present
			if (sceneRef.current) {
				sceneRef.current.dispose();  // Release engine, scene, meshes, etc.
				sceneRef.current = null;  // Clear reference
			}
		};
	}, [canvasId, enabled]);
	// Dependency array includes stable initialization keys only
	// We intentionally avoid volatile callbacks to prevent re-init loops
	// Return current scene reference for optional external access
	return { scene: sceneRef.current };
};

// ===== MINI DICTIONARY =====
// hook -> reusable React logic function
// ref -> mutable value holder that does not trigger render
// lifecycle -> mount/update/unmount phases
// cleanup -> resource disposal when component unmounts
// optional chaining (?.) -> invoke only if value exists
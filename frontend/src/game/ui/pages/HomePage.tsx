// ┌────────────────────────────────────────────────────────────┐
// │                   HomePage.tsx                             │
// ├────────────────────────────────────────────────────────────┤
// │ Main UI page for the 3D Hub experience.                  │
// │ Connects loading hooks, Babylon scene, and overlay panels.│
// │ Renders loading screen, canvas, and panel entry points.   │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import page dependencies
import { useState } from 'react';
import { useLoadingProgress } from '../hooks/useLoadingProgress';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { HubPanel } from '../components/HubPanel';
import { HubPanelSettings } from '../components/HubPanelSettings';

export function HomePage() {
	// STEP 2: Initialize loading progress state
	const { progress, label, isComplete, updateProgress, complete } = useLoadingProgress();

	// STEP 3: Track currently active overlay panel (null = closed)
	const [activePanel, setActivePanel] = useState<string | null>(null);

	// STEP 4: Initialize Babylon Hub scene and wire callbacks
	useBabylonScene({
		canvasId: 'homeCanvas',
		enabled: true,
		// Bridge scene loading events to UI state
		onProgress: (percentage, newLabel) => {
			updateProgress(percentage, newLabel)
		},
		onComplete: () => {
			complete() // Loading complete
		},
		onPanelOpen: (panelId) => {
			if (panelId === 'chat') {
				window.dispatchEvent(new CustomEvent('chat:open'));
				return;
			}
			setActivePanel(panelId);
		}
	})

	return (
		<>
			<div className="relative w-full h-full via-slate-800 to-slate-900 flex flex-col items-center justify-center px-3 py-6 sm:p-8">
				{/* STEP 5: Header area above the 3D canvas */}
				<div className="text-center mb-10">
					{/* mb-10: bottom margin to separate title from canvas */}

					<h2 className="text-[1.65rem] sm:text-5xl font-bold text-black mb-2 drop-shadow-lg tracking-tight whitespace-nowrap">
						{/*
								text sizing: responsive heading size
								font-bold: strong emphasis
								text-black + drop-shadow: readability over dynamic background
								tracking-tight: reduced letter spacing
							*/}
						TRANSCENDENCE
					</h2>
				</div>

				{/* STEP 6: Canvas container (controls 3D world viewport size) */}
				<div className="relative w-full max-w-[100rem] aspect-square bg-black/30 rounded-2xl overflow-hidden shadow-2xl">
					<canvas
						id="homeCanvas"
						className="w-full h-full outline-none"
						style={{ touchAction: 'none' }}/>

					{/* STEP 7: Loading overlay while scene assets are not complete */}
					{!isComplete && (
						<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm">
							<div className="mb-4 text-xl font-bold tracking-[0.25em] text-yellow-200">
								LOADING 3D WORLD
							</div>

							<div className="w-full max-w-md overflow-hidden rounded-full border border-yellow-400/50 bg-black/50 p-1">
								<div
									className="h-3 rounded-full bg-yellow-300 transition-all duration-300"
									style={{ width: `${progress}%` }}/>
							</div>

							<div className="mt-3 text-sm font-medium text-yellow-100/80">
								{label} · {Math.round(progress)}%
							</div>
						</div>
					)}

					{/* STEP 8: Conditional panel rendering from 3D interactions */}
					{activePanel === 'settings' && (
						<HubPanel title="⚙ Settings" onClose={() => setActivePanel(null)}>
							<HubPanelSettings />
						</HubPanel>
					)}
				</div>
			</div>
		</>
	)

}
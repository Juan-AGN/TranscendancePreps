// ┌────────────────────────────────────────────────────────────┐
// │             useLoadingProgress.ts                          │
// ├────────────────────────────────────────────────────────────┤
// │ Hook for loading-screen progress state management.         │
// │ Stores percentage, label text, and completion status.      │
// │ Exposes update/complete/reset actions for UI flow.         │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import React state utilities

import { useState, useCallback } from 'react'

export function useLoadingProgress() {
	// STEP 2: Define loading state values
	const [progress, setProgress] = useState(0) // Loading percentage (0 -> 100)
	const [label, setLabel] = useState('Initializing Transcende') // UI status label
	const [isComplete, setIsComplete] = useState(false) // Completion flag for view transitions

	// STEP 3: Update progress safely with clamped values
	const updateProgress = useCallback(
		(percentage: number, newLabel?: string) => {
			setProgress(Math.max(0, Math.min(100, percentage)))
			if (newLabel) {
				setLabel(newLabel)
			}
		},
		[]
	)

	// useCallback keeps stable function references across renders
	// Useful when passing handlers to child components

	// STEP 4: Mark loading as complete
	const complete = useCallback(() => {
		setProgress(100) // Force progress bar to 100%
		setLabel('Ready!') // Final status message
		setIsComplete(true) // Toggle completion state for screen transition
	}, [])

	// STEP 5: Reset loading state to initial values
	const reset = useCallback(() => {

		setProgress(0) // Reset percentage
		setLabel('Initializing...') // Reset label text
		setIsComplete(false) // Back to initial state

	}, [])

	return {
		progress,
		label,
		isComplete,
		updateProgress,
		complete,
		reset
	}
	// Return full state/actions package for loading UI
}

// ===== MINI DICTIONARY =====
// hook -> reusable React logic function
// state -> data that triggers UI re-render on change
// setState -> updater function for state values
// useCallback -> memoizes function references
// splash screen -> initial loading screen
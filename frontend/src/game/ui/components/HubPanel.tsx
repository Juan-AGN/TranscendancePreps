// ┌────────────────────────────────────────────────────────────┐
// │                   HubPanel.tsx                             │
// ├────────────────────────────────────────────────────────────┤
// │ Generic modal panel wrapper for Hub overlays.             │
// │ Handles close-on-backdrop and close button behavior.      │
// │ Renders custom children content in panel body.            │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import React types
import type { ReactNode } from 'react';

interface HubPanelProps {
	onClose: () => void;
	title: string;
	children: ReactNode;
}

export function HubPanel({ onClose, title, children }: HubPanelProps) {
	// STEP 2: Render dismissible modal panel
	return (
		<div
			className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
			onClick={onClose} // Backdrop click closes panel
		>
			<div
				className="w-full max-w-md rounded-xl bg-white shadow-xl"
				onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside panel
			>
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h2 className="text-lg font-semibold">{title}</h2>
					<button
						onClick={onClose}
						className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-black"
					>
						✕
					</button>
				</div>

				<div className="p-6"> {children} </div>
			</div>
		</div>
	);
}
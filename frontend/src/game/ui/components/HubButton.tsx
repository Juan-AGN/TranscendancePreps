// ┌────────────────────────────────────────────────────────────┐
// │                   HubButton.tsx                            │
// ├────────────────────────────────────────────────────────────┤
// │ Interactive Hub button with visual preview behavior.       │
// │ Default image switches to video on hover.                  │
// │ Encapsulates hover playback logic (play/pause/reset).      │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import React state and refs

import { useState, useRef } from 'react';

// STEP 2: Define configurable component props
interface HubButtonProps {
	onClick: () => void              // External action (navigate, open panel, etc.)
	imgSrc?: string                 // Base image shown when not hovered
	imgAlt?: string                 // Alt text
	ringSrc?: string                // Optional decorative ring image
	videoSrc?: string               // Hover preview video source
}

export function HubButton({
	onClick,
	imgSrc = '/images/WorldPong3D.png',    // Default image if none provided
	imgAlt = 'Enter 3D',            // Default alt text
	ringSrc = '/images/ring.png',          // Ring decoration (optional)
	videoSrc = '/videos/videoPong.mp4',    // Hover video (keep file size reasonable)
}: HubButtonProps) {

	// ===== STEP 3: STATE =====

	const [isHovered, setIsHovered] = useState(false);   
	// Controls visual state
	// true = hover active -> show video
	// false = no hover -> show image

	const videoRef = useRef<HTMLVideoElement>(null);     
	// Ref to <video> element for manual playback control
	// Needed for play/pause/reset operations

	// ===== STEP 4: EVENT HANDLERS =====

	const handleMouseEnter = () => {                     // Mouse enters button area
		setIsHovered(true);                              // Activate hover visuals
		if (videoRef.current) {                          
			videoRef.current.play();                     // Start video preview
		}
	};

	const handleMouseLeave = () => {                     // Mouse leaves button area
		setIsHovered(false);                             // Restore image state
		if (videoRef.current) {
			videoRef.current.pause();                    // Pause preview
			videoRef.current.currentTime = 0;            // Reset to start
		}
	};

	// ===== STEP 5: RENDER =====

	return (
		<div className="relative inline-flex items-center justify-center">  
		{/* Centered container with layered elements (ring, video, image) */}

			{/* Decorative ring (render only if source exists) */}
			{ringSrc && (
				<img
					src={ringSrc}
					alt="Ring decoration"
					className="absolute pointer-events-none select-none"  
					// Non-interactive layer so it does not block button clicks
					style={{
						objectFit: 'contain',
						width: '30rem',
						height: '30rem',
						maxWidth: 'none',
						scale: 1.4,
						transformOrigin: '50% 50%',
						animation: 'spin 8s linear infinite',
						// Continuous rotation
					}}
				/>
			)}

			<button
				type="button"                             
				onClick={onClick}                         // Execute external action
				onMouseEnter={handleMouseEnter}           // Activate hover state
				onMouseLeave={handleMouseLeave}           // Deactivate hover state
				className="
                relative z-10
                w-full py-10
                rounded-2x1
                font-bold
                flex items-center
                justify-center
                transition-transform duration-500 ease-out
                hover:scale-105                         
                active:scale-95"
				// Hover scales up, active press scales down
			>

				{/* Video layer visible only during hover */}
				<video
					ref={videoRef}                        
					src={videoSrc}                        
					loop                                   
					muted                                  
					// muted is required for autoplay behavior in most browsers

					className={`
                    w-90 h-90
                    rounded-full object-cover
                    transition-opacity duration-250 ease-in-out
					${isHovered ? 'opacity-100' : 'opacity-0'}
					// Hover on -> visible
					// Hover off -> hidden
                   `}
					style={{
						objectPosition: '50% 35%',
						position: 'absolute'
						// Layered above image
					}}
				/>

				{/* Image layer visible when hover is not active */}
				<img
					src={imgSrc}                          
					alt={imgAlt}
					className={`
                    w-90 h-90
                    rounded-full object-cover
                    transition-opacity duration-250 ease-in-out
					${isHovered ? 'opacity-0' : 'opacity-100'}
					// Hidden when video appears
                   `}
					style={{ objectPosition: '50% 26%' }}
				/>

			</button>
		</div>
	)
}


// ===== MINI DICTIONARY =====
// hover -> cursor-over interaction state
// layered UI -> stacked visual elements in same area
// ref -> direct handle to DOM/video element
// opacity swap -> smooth visual transition without unmounting elements
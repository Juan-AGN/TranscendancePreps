// ┌────────────────────────────────────────────────────────────┐
// │              InputHandler.ts                               │
// ├────────────────────────────────────────────────────────────┤
// │ Manages keyboard input state in real-time.                 │
// │ Listens and stores which keys are currently pressed.       │
// │ Other classes query current key state (true/false).        │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Define keyboard input handler class
export class KeyboardInput {
	// STEP 2: Dictionary to store key states: true = pressed, false = released
	// Use object (not array) because key lookup is faster
	private keyStates: { [key: string]: boolean } = {};

	// STEP 3: Store event handler references for cleanup
	// Must save these to properly remove listeners in dispose()
	// If not saved, we can't call removeEventListener() correctly
	private onKeyDown: (e: KeyboardEvent) => void;
	private onKeyUp: (e: KeyboardEvent) => void;

	// STEP 4: Constructor - called automatically on new KeyboardInput()
	// Initialize everything needed to start listening for keyboard
	constructor() {
		// bind(this) is critical: ensures 'this' refers to KeyboardInput inside handlers
		// Without it, 'this' would be window and we couldn't access this.keyStates
		this.onKeyDown = this.handleKeyDown.bind(this);
		this.onKeyUp = this.handleKeyUp.bind(this);

		// Setup keyboard event listeners
		this.setupKeyboardListeners();
	}

	// STEP 5: Initial setup of keyboard event listeners
	// window.addEventListener listens to ALL keyboard events across the window
	// (not just canvas, but entire browser while this tab is active)
	private setupKeyboardListeners(): void {
		window.addEventListener('keydown', this.onKeyDown);
		window.addEventListener('keyup', this.onKeyUp);
	}

	// STEP 5.5: Check if the user is typing inside an editable element.
	// If true, gameplay input should not react to the key event.
	private isTypingTarget(target: EventTarget | null): boolean {

		if (!(target instanceof HTMLElement))
			return false;

		const tagName = target.tagName.toLowerCase();

		return (
			tagName === 'input' ||
			tagName === 'textarea' ||
			tagName === 'select' ||
			target.isContentEditable
		);
	}

	// ─── KEY PRESS HANDLERS

	// STEP 6: Execute when user PRESSES a key
	// e.key contains key name: "w", "ArrowUp", etc.
	private handleKeyDown(e: KeyboardEvent): void {
		// Do not move the player or camera while the user is typing in a form field.
		if (this.isTypingTarget(e.target))
			return;

		// STEP 7: Only process keys we care about for gameplay
		// WASD for alternative movement + Arrows for classic movement
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
			e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' ||
			e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {

			// STEP 8: Prevent browser default behavior
			// Without this, arrow keys would scroll the page (annoying during gameplay)
			e.preventDefault();

			// STEP 9: Normalize key to consistent format
			// - If arrow key, keep as is: "ArrowUp", "ArrowLeft", etc.
			// - If letter, convert to lowercase: "W" → "w", "A" → "a"
			// Avoids checking uppercase and lowercase separately
			const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();

			// STEP 10: Mark key as pressed (true)
			this.keyStates[key] = true;
		}
	}

	// STEP 11: Execute when user RELEASES a key
	// Mirrors handleKeyDown but marks key as false (not pressed)
	private handleKeyUp(e: KeyboardEvent): void {
		// STEP 12: Same keys as keydown: WASD + arrows
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
			e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
			e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D' ||
			e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {

			// Normalize key same as keydown
			const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();

			// STEP 13: Always mark key as released internally.
			// This prevents stuck keys if focus changes while a key is pressed.
			this.keyStates[key] = false;

			// STEP 14: Only block browser behavior when the user is not typing.
			if (!this.isTypingTarget(e.target))
				e.preventDefault();
		}
	}

	// ─── CLEANUP AND DESTRUCTION

	// STEP 14: Cleanup method - call when input handler is no longer needed
	// (e.g., exiting game or changing scenes)
	// VERY IMPORTANT to prevent memory leaks
	public dispose(): void {
		// STEP 15: Remove event listeners from window
		// If not done, they continue listening FOREVER even after object destruction
		// This causes memory leaks and strange behavior
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);

		// STEP 16: Clear key dictionary to free memory
		this.keyStates = {};
	}

	// ─── PUBLIC QUERY METHODS

	// STEP 17: Check if a specific key is currently pressed
	// Public method for other classes to query key state
	// Example: inputHandler.isKeyPressed('w') → true if W is being pressed
	public isKeyPressed(key: string): boolean {
		// Return key state, or false if not in dictionary
		// The || false prevents returning undefined (safer)
		return this.keyStates[key] || false;
	}

	// STEP 18: Get entire key dictionary
	// Useful for debugging or systems that need multiple keys at once
	// Example: const allKeys = inputHandler.getKeyStates(); console.log(allKeys);
	public getKeyStates(): { [key: string]: boolean } {
		return this.keyStates;
	}
}

// ===== MINI DICTIONARY =====
// Keyboard Event = browser event triggered by key press/release
// preventDefault = block browser's default action for a key
// Listener = function that waits for and responds to events
// bind(this) = ensures 'this' context in callback function
// Observable = pattern for event subscription
// Normalize = convert to consistent format
// Dispose = cleanup/destroy and free resources
// Key state = whether a key is currently pressed or not
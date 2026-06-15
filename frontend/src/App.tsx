// ┌────────────────────────────────────────────────────────────┐
// │                          App.tsx                           │
// ├────────────────────────────────────────────────────────────┤
// │ Root React component.                                      │
// │                                                            │
// │ Responsibilities:                                          │
// │ - Load the main application router.                        │
// │ - Keep the top-level component simple and predictable.     │
// └────────────────────────────────────────────────────────────┘

import { AppRouter } from './core/router';

// Step 1: Render the main router that controls all application pages.
function App() {
	return (
		<AppRouter />
	)
}

export default App;

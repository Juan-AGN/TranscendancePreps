// ┌────────────────────────────────────────────────────────────┐
// │                         main.tsx                           │
// ├────────────────────────────────────────────────────────────┤
// │ Frontend application entry point.                          │
// │                                                            │
// │ Responsibilities:                                          │
// │ - Load global styles.                                      │
// │ - Load the global i18n configuration.                      │
// │ - Initialize the saved UI theme before React renders.      │
// │ - Mount the React application into the root HTML element.  │
// └────────────────────────────────────────────────────────────┘

import { createRoot } from 'react-dom/client';
import './index.css';
import './core/i18n/i18n';
import App from './App';

type AppTheme = 'light' | 'dark';
const DEFAULT_THEME: AppTheme = 'light';
const THEME_STORAGE_KEY = 'theme';

// STEP 1 ==>: Load and validate the saved theme before React renders.
function getInitialTheme(): string {
	try {
		const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
		if (savedTheme === 'dark' || savedTheme === 'light')
			return savedTheme;
	} catch {
		// Ignore storage access errors and use the default theme.
	}
	return DEFAULT_THEME;
}

// STEP 2 ==>: Apply the selected theme to the document root.
document.documentElement.dataset.theme = getInitialTheme();

// STEP 3 ==>: Get the HTML element where the React application is mounted.
const rootElement = document.getElementById('root');

if (!rootElement)
	throw new Error('Root element #root was not found');

// STEP 4==>: Mount the React application.
createRoot(rootElement).render(<App />);
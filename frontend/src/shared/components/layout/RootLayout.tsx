// ┌────────────────────────────────────────────────────────────┐
// │                       RootLayout.tsx                       │
// ├────────────────────────────────────────────────────────────┤
// │ Shared layout for the routed application pages.            │
// │ It renders the global structure and marks the user offline │
// │ when leaving the application.                              │
// └────────────────────────────────────────────────────────────┘

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ChatWidget } from '../chat/ChatWidget';
import { API_URL } from '../../pages/auth/config';

// STEP 2: Define the localStorage keys used to read the current session.
const TOKEN_STORAGE_KEY = 'token';
const USER_ID_STORAGE_KEY = 'userId';

// STEP 3: Define the shape of the session data needed by this layout.
type StoredSession = {
	token: string;
	userId: string;
};

//════════ FCT: getUserStatusUrl: Build the backend URL used to update the current user's status.════════
function getUserStatusUrl(userId: string): string {
	// Step 1: Encode the user id before using it inside the URL.
	const safeUserId = encodeURIComponent(userId);

	return `${API_URL}/users/${safeUserId}/status`;
}

// ════════ FCT: getStoredSession : Safely read the current session data from localStorage. ════════
function getStoredSession(): StoredSession | null {
	try {
		// Step 1: Read the stored authentication data.
		const token = localStorage.getItem(TOKEN_STORAGE_KEY);
		const userId = localStorage.getItem(USER_ID_STORAGE_KEY);

		// Step 2: Stop if the session is incomplete.
		if (!token || !userId)
			return null;

		return { token, userId };
	} catch {
		return null;
	}
}

// ════════ FCT: sendOfflineStatus: Notify the backend that the current user is offline.════════
function sendOfflineStatus(session: StoredSession): void {
	// Step 1: Send the authenticated status update request.
	fetch(getUserStatusUrl(session.userId), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.token}`,
		},
		body: JSON.stringify({ onlineStatus: false }),
		keepalive: true,
	}).catch(() => {
		// Ignore unload errors because the page may already be closing.
	});
}
// ════════ HOOK: useSetOfflineOnClose: Register browser events that mark the user offline when leaving. ════════════
function useSetOfflineOnClose(): void {
	useEffect(() => {
		let requestAlreadySent = false;

		function handleAppClose(): void {
			// Step 1: Read the current session and avoid duplicated requests.
			const session = getStoredSession();

			if (requestAlreadySent || !session)
				return;

			// Step 2: Lock the request and notify the backend.
			requestAlreadySent = true;
			sendOfflineStatus(session);
		}

		// Step 3: Listen to browser events triggered when the user leaves the page.
		window.addEventListener('pagehide', handleAppClose);
		window.addEventListener('beforeunload', handleAppClose);

		return () => {
			window.removeEventListener('pagehide', handleAppClose);
			window.removeEventListener('beforeunload', handleAppClose);
		};
	}, []);
}

// ════════ FTC RootLayout :Render the shared application structure. ════════
export function RootLayout() {
	// Step 1: Enable offline status handling when the user leaves the app.
	useSetOfflineOnClose();

	return (
		// Step 2: Render the global application layout.
		<div className="h-screen flex flex-col overflow-hidden bg-stone-100 dark:bg-neutral-950 transition-colors duration-300">
			<Header />

			<main className="flex-1 min-h-0 overflow-y-auto">
				<Outlet />
			</main>

			<ChatWidget />
		</div>
	);
}
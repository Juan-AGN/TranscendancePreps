// ┌────────────────────────────────────────────────────────────┐
// │                       RootLayout.tsx                       │
// ├────────────────────────────────────────────────────────────┤
// │ Shared application layout.                                 │
// │                                                            │
// │ Responsibilities:                                          │
// │ - Render the global header.                                │
// │ - Render the active page through React Router Outlet.      │
// │ - Render the global chat widget.                           │
// │ - Mark the user as offline when leaving the application.   │
// └────────────────────────────────────────────────────────────┘

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ChatWidget } from '../chat/ChatWidget';
import { useEffect } from 'react';

const TOKEN_STORAGE_KEY = 'token';
const USER_ID_STORAGE_KEY = 'userId';
const USER_STATUS_API_BASE = '/api/auth/users';

// Build the backend endpoint used to update the current user status.
function getUserStatusUrl(userId: string): string {
	return `${USER_STATUS_API_BASE}/${encodeURIComponent(userId)}/status`;
}

// Read the current session data from localStorage.
function getStoredSession(): { token: string; userId: string } | null {
	try {
		const token = localStorage.getItem(TOKEN_STORAGE_KEY);
		const userId = localStorage.getItem(USER_ID_STORAGE_KEY);

		if (!token || !userId)
			return null;

		return { token, userId };
	} catch {
		return null;
	}
}

//STEP 1== > Send an offline status update when the page is closed or hidden.
function useSetOfflineOnClose(): void {
	useEffect(() => {
		let requestAlreadySent = false;

		const setUserOffline = () => {
			if (requestAlreadySent)
				return;
			const session = getStoredSession();
			if (!session)
				return;
			requestAlreadySent = true;
			fetch(getUserStatusUrl(session.userId), {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.token}`,
				},
				body: JSON.stringify({ onlineStatus: false }),
				keepalive: true,
			}).catch(() => {
				// Ignore unload request errors because the page is already closing.
			});
		};

		window.addEventListener('pagehide', setUserOffline);
		window.addEventListener('beforeunload', setUserOffline);

		return () => {
			window.removeEventListener('pagehide', setUserOffline);
			window.removeEventListener('beforeunload', setUserOffline);
		};
	}, []);
}

// Step 2: Render the shared layout used by routed pages.
export function RootLayout() {
	useSetOfflineOnClose();

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-stone-100 dark:bg-neutral-950 transition-colors duration-300">
			<Header />
			<main className="flex-1 min-h-0 overflow-y-auto">
				<Outlet />
			</main>
			<ChatWidget />
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// File summary
// This file defines the shared layout used by the main routed pages. It keeps the Header and ChatWidget visible across pages, renders
// the active route through Outlet, and notifies the backend when the authenticated user leaves the application.
// - getUserStatusUrl:
//  	 Builds the backend URL used to update the current user status.
// - getStoredSession:
//   	Reads the authentication token and user id from localStorage.
//   	Returns null if the session data is missing or cannot be accessed.
// - useSetOfflineOnClose:
//   	Registers browser events that send an offline status update when the page is closed, refreshed, or hidden.
// - RootLayout:
//   	Renders the shared application structure: Header, active route, and ChatWidget.
// MD  ==>  :
// - RootLayout: Shared wrapper used around nested routes.
// - Outlet: React Router placeholder where the active child page renders inside the shared Layout
// - Header: Global navigation/header component.
// - ChatWidget: Global chat component available across the layout.
// - useEffect: React hook used to register and clean browser events.
// - pagehide: Browser event fired when the page is hidden or unloaded.
// - beforeunload: Browser event fired before the page is closed/reloaded.
// - keepalive: Allows the request to continue while the page is closing.
import { API_URL } from './config';

export function clearSession() {
	localStorage.removeItem('token');
	localStorage.removeItem('userId');
	localStorage.removeItem('userName');
	window.dispatchEvent(new Event('auth:changed'));
}

export async function validateSession(): Promise<boolean> {
	const token = localStorage.getItem('token');

	if (!token) {
		clearSession();
		return false;
	}

	try {
		const response = await fetch(`${API_URL}/auth/me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			clearSession();
			return false;
		}

		return true;
	} catch (error) {
		clearSession();
		return false;
	}
}
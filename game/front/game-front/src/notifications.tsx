import { createContext, useContext, useState } from "react";

import './css/notifications.css';

const NotificationContext = createContext<NotificationContextType | null>(null);

type NotificationContextType = {
    addNotification: (msg: string) => void;
	handleApiError: (res: any) => void;
	addToken: (msg: string | null) => void;
	token : string | null;
}
import { generalErrors } from "./types/types";

const errorMessages: Record<number, string> = {
    [generalErrors.LOBBYDOESNTEXIST]: "Lobby does not exist",
	[generalErrors.LOBBYALREADYEXIST]: "Lobby does already exist",

    [generalErrors.INVALIDNAME]: "Invalid lobby name",
    [generalErrors.RULESNOTPROVIDED]: "Rules not provided",

    [generalErrors.NOTHOST]: "You are not the host",
    [generalErrors.NOTANEXPECTATOR]: "You are not a spectator",
    [generalErrors.NOTAPLAYER]: "You are not a player",
    [generalErrors.NOTINALOBBY]: "You are not in a lobby",

    [generalErrors.ALREADYINTHELOBBY]: "Already in the lobby",
    [generalErrors.ALREADYINALOBBY]: "Already in a lobby",

    [generalErrors.NOWS]: "No WebSocket connection",
    [generalErrors.LOBBYINGAME]: "Game already in progress",

    [generalErrors.NOTINTHELOBBY]: "You are not in the lobby",
    [generalErrors.PLAYERSFULL]: "Lobby is full",
    [generalErrors.NOTENOUGHPLAYERS]: "Not enough players to start",
};

export const NotificationProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [notifications, setNotifications] = useState<string[]>([]);
	const [ token, setToken ] = useState(localStorage.getItem("token"));

	const addNotification = (msg: string) => {
		setNotifications(prev => [...prev, msg]);

		setTimeout(() => {
			setNotifications(prev => prev.slice(1));
		}, 4000);
	};

	const addToken = (ttoken: string | null) => {
		setToken(ttoken);
	};

	function handleApiError(res: any) {
		const code = res?.code ?? res?.error ?? res;

		if (code === 'Invalid token' || code === 'Invalid or expired token' || code === 'Authentication token not provided') {
			addNotification("Session expired. Please log again.");
			localStorage.removeItem("token");
			setToken(null);
			return;
		}
	
		const message = errorMessages[code] ?? "Unknown error";

		addNotification(message);
	}

	return (
		<NotificationContext.Provider value={{ addNotification, handleApiError, addToken, token }}>
			{children}

			<div className="notification-box">
				{notifications.map((n, index) => (
					<div key={index} className="notification-box-box">
						{n}
					</div>
				))}
			</div>
		</NotificationContext.Provider>
	);
};

export const useNotification = () => {
	const ctx = useContext(NotificationContext);

	if (!ctx)
		throw new Error('useNotification must be used inside NotificationProvider');

	return ctx;
};
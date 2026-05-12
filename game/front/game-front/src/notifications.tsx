import { createContext, useContext, useState, ReactNode } from "react";

import './css/notifications.css';

const NotificationContext = createContext<NotificationContextType | null>(null);

type NotificationContextType = {
    addNotification: (msg: string) => void;
}

export const NotificationProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [notifications, setNotifications] = useState<string[]>([]);

	const addNotification = (msg: string) => {
		setNotifications(prev => [...prev, msg]);

		setTimeout(() => {
			setNotifications(prev => prev.slice(1));
		}, 4000);
	};

	return (
		<NotificationContext.Provider value={{ addNotification }}>
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
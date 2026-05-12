import { createContext, useContext, useState, ReactNode } from "react";

const LobbyContext = createContext<LobbyContextType | null>(null);

type LobbyContextType = {
	lobby: string;
    addLobby: (id: string) => void;
}

export const LobbyProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [lobby, setLobby] = useState<string>("");

	const addLobby = (id: string) => {
		setLobby(id);
	};

	return (<LobbyContext.Provider
			value={{
				lobby,
				addLobby,
			}}>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = () => {
	const ctx = useContext(LobbyContext);

	if (!ctx)
		throw new Error('useLobby must be used inside LobbyProvider');

	return ctx;
};
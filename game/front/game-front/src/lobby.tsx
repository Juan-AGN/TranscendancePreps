import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { Lobby } from "./types/types";

const LobbyContext = createContext<LobbyContextType | null>(null);

let address = window.location.host;

let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

const apiBase = `https://${noport}:8889/api/auth`

const apiBaselob = `https://${noport}:8889/api/game`

export class Usernames {
	usermap = new Map<number, string>();
	imgmap = new Map<number, string>();
	me : number = -1;

	checkname(id: number) {
		if (!this.usermap.has(id))
			return(`User ${id}`);
		else
			return(this.usermap.get(id));
	}

	async checknameupdate(id: number) {
		if (this.usermap.has(id))
			return(this.usermap.get(id));

		try
		{
			let response = await fetch(`${apiBase}/users/${id}`);
			if (!response.ok)
				return(`User ${id}`);
			else
			{
				const res = await response.json();
				this.usermap.set(id, res.name);
				return (res.name);
			}
		}
		catch (error)
		{
			if (!this.usermap.has(id))
				return(`User ${id}`);
			else
				return(this.usermap.get(id) ?? `User ${id}`);
		}
	}

	async checkimgupdate(id: number) {
		if (this.imgmap.has(id))
			return (this.imgmap.get(id) ?? "");

		try
		{
			let response = await fetch(`${apiBase}/users/${id}/avatar`);
			if (!response.ok)
				return("");
			else
			{
				const res = await response.json();
				this.imgmap.set(id, `${apiBase}${res.avatarUrl}`);
				return (`${apiBase}${res.avatarUrl}`);
			}
		}
		catch (error)
		{
			if (!this.imgmap.has(id))
				return("");
			else
				return(this.imgmap.get(id) ?? "");
		}
	}

	checkimg(id: number) {
		if (this.imgmap.has(id))
			return (this.imgmap.get(id));
		else return (undefined);
	}

	async getme() {
		const token = localStorage.getItem("token");

		if (!token)
			this.me = -1;
		if (this.me != -1)
			return (this.me)
		else
		{
			try
			{
				let response = await fetch(`${apiBase}/auth/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					authorization: `Bearer ${token}`,
				},});
				if (!response.ok)
					return(-1);
				else
				{
					const res = await response.json();
					this.me = res.user.id;
					await this.checknameupdate(this.me);
					return (this.me);
				}
			}
			catch (error)
			{
				return (-1);
			}
		}
	}

	getmenoupdt() {
		const token = localStorage.getItem("token");

		if (!token)
			this.me = -1;
		if (this.me != -1)
			return (this.me);
		else
			return (-1);
	}
}

export async function isinLobby() {
	try {
		const token = localStorage.getItem("token");

		if (!token)
			return (null);

		const res = await fetch(`${apiBaselob}/lobbies/checkout`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({lobbyId: ""}),
		});
		if (!res.ok)
			return (null);
		const data = await res.json();
		if (data.message != "true")
			return (null);
		return(data.lobby);
	}
	catch
	{
		return (null);
	}
};

type LobbyContextType = {
	names: Usernames;
	lobby: Lobby | null;
    addLobby: (id: Lobby | null) => void;
}

export const LobbyProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [lobby, setLobby] = useState<Lobby | null>(null);
	const namesRef = useRef(new Usernames());

	const addLobby = (id: Lobby | null) => {
		setLobby(id);
	};

	async function checkLobby() {
		const lob = await isinLobby();
		if (lob == null)
			return ;
		else
			setLobby(lob);
	};

	useEffect(() => {
		checkLobby();
	}, []);

	return (<LobbyContext.Provider
			value={{
				lobby,
				addLobby,
				names: namesRef.current,
			}}>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = () => {
	const ctx = useContext(LobbyContext);

	if (!ctx)
		throw new Error('useLobby must be used inside LobbyProvider');

	return (ctx);
};
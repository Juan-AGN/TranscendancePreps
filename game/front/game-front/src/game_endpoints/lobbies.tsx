let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

import { NotificationProvider, useNotification } from '../notifications';
import { useEffect, useState } from "react";
import type { Lobbys, Lobby } from "../types/types"
const wsbase = `wss://${noport}:8889/api/game`;
const apiBase = `https://${noport}:8889/api/game`;

async function listLobbies() {
    try {
	    const res = await fetch(`${apiBase}/lobbies`);
        if (!res.ok)
            return (null);
	    const data = await res.json();
	    return(data);
    }
    catch
    {
        return (null);
    }
}

async function joinLobbye() {
    try {
	    const res = await fetch(`${apiBase}/lobbies`);
        if (!res.ok)
            return (null);
	    const data = await res.json();
	    return(data);
    }
    catch
    {
        return (null);
    }
}

export function Lobbies() {
    const [response, setResponse ] = useState<Lobbys | null>(null);
    const { addNotification } = useNotification();

    useEffect(() => {
        async function searchforlobbies() {
            setResponse(await listLobbies());
        }

        searchforlobbies();

        const interval = setInterval(() => {
            searchforlobbies();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!response || !response.all || response.all.length == 0)
		return (<p className="align-middle h-full w-full text-center justify-center items-center content-center">No lobbies available</p>);

	return (
		<div className="flex justify-center flex-wrap h-full items-start overflow-auto">
		{response.all.map((lobbyItem: Lobby) => (
			<div className="content-center  justify-center align-middle text-center bg-linear-to-r from-cyan-200 to-blue-300 pointer-events-auto w-30 h-30 aspect-square rounded-2xl overflow-auto text-xs m-5 hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out" key={lobbyItem.id} onClick={() => addNotification(`This will join the lobby ${lobbyItem.id}`)}>
				<div><strong>Name:</strong> {lobbyItem.id}</div>
				<div><strong>Host:</strong> {lobbyItem.hostId}</div>
				<div><strong>Players:</strong> {lobbyItem.players.length}</div>
				<div><strong>Spectators:</strong> {lobbyItem.spectators.length}</div>
				<div><strong>Status:</strong> {lobbyItem.status}</div>
			</div>
		))}
		</div>
		);
}
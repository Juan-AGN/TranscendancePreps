let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

import { NotificationProvider, useNotification } from '../notifications';
import { useEffect, useState } from "react";
import type { Lobbys, Lobby } from "../types/types"
const wsbase = `wss://${noport}:8889/api/game`;
const apiBase = `https://${noport}:8889/api/game`;
import { LobbyProvider, useLobby, isinLobby } from '../lobby';
import { Singledivgame, Doubledivgame, Doubledivvert } from '../commoncomp/commoncomp';
import { div } from 'framer-motion/client';

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

async function joinlobby(which: string) {
    const { addNotification } = useNotification();
    const token = localStorage.getItem("token");

    if (isinLobby)

    if (!token)
    {
        addNotification("Please, log again.");
        return (null);
    }
    try {
	    const res = await fetch(`${apiBase}/lobbies/join`);
        if (!res.ok)
        {
            addNotification("Unable to join lobby.");
            return (null);
        }
	    const data = await res.json();
	    return(data);
    }
    catch
    {
        addNotification("Unable to join lobby.");
        return (null);
    }
}

export function MiniLobby({ lobbyItem }: { lobbyItem: Lobby }) {
    const { names } = useLobby();
    const [name, setName] = useState(`User ${lobbyItem.hostId}`);
    const { addNotification } = useNotification();

    useEffect(() => {
        names.checknameupdate(lobbyItem.hostId).then(setName);
    }, [lobbyItem.hostId]);

    return (
	    <div className="content-center  justify-center align-middle text-center bg-linear-to-r from-cyan-200 to-blue-300 pointer-events-auto w-30 h-30 aspect-square rounded-2xl overflow-auto text-xs m-5 hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out cursor-pointer" onClick={() => joinlobby(lobbyItem.id)}>
		    <div><strong>Name:</strong> {lobbyItem.id}</div>
		    <div><strong>Host:</strong> {name}</div>
		    <div><strong>Players:</strong> {lobbyItem.players.length}</div>
		    <div><strong>Spectators:</strong> {lobbyItem.spectators.length}</div>
		    <div><strong>Status:</strong> {lobbyItem.status}</div>
		</div>
    )
}

export function Lobbies() {
    const [response, setResponse ] = useState<Lobbys | null>(null);
    const { addNotification } = useNotification();
    const { lobby, addLobby, names } = useLobby();

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

    if (!response)
		return (<p className="align-middle h-full w-full text-center justify-center items-center content-center">Unable to reach lobbies, try again later!</p>);

    if (!response.all || response.all.length == 0)
		return (<p className="align-middle h-full w-full text-center justify-center items-center content-center">No lobbies available</p>);
    if (!lobby) {
	    return (
		    <div className="flex justify-center flex-wrap h-full items-start overflow-auto">
		    {response.all.map((lobbyItem: Lobby) => (
                <MiniLobby lobbyItem={lobbyItem} key={lobbyItem.id} />
		    ))}
		</div>
		);
    }
}

export function Nolobbystate() {
    return (<Doubledivvert ComponentBig={Lobbies} ComponentSmall={div}/>);
}

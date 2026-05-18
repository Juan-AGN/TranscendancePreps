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

async function joinlobby(which: string, addNotification: (msg: string) => void, addLobby: (id: Lobby | null) => void) {
    const token = localStorage.getItem("token");
    

    if (!token)
    {
        addNotification("Please, log again.");
        return (null);
    }
    const tlobby = await isinLobby();
    if (tlobby != null)
    {
        addNotification("Already in a lobby.");
        addLobby(tlobby);
        return (tlobby);
    }
    try {
	    const res = await fetch(`${apiBase}/lobbies/join`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${which}`}),
        });
        if (!res.ok)
        {
            addNotification("Unable to join lobby.");
            return (null);
        }
	    const data = await res.json();
        addLobby(data);
	    return(data);
    }
    catch
    {
        addNotification("Unable to join lobby.");
        return (null);
    }
}

async function changetopectator(addNotification: (msg: string) => void, tlobby: Lobby | null) {
    const token = localStorage.getItem("token");

    if (!token)
    {
        addNotification("Please, log again.");
        return ;
    }
    if (!tlobby)
    {
        addNotification("Not in a lobby.");
        return ;
    }
    try {
	    const res = await fetch(`${apiBase}/lobbies/change/player`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${tlobby.id}`}),
        });
        if (!res.ok)
        {
            addNotification("Unable to change to spectator.");
            return ;
        }
	    return ;
    }
    catch
    {
        addNotification("Unable to change to spectator.");
        return (null);
    }
}

async function changetoplay(addNotification: (msg: string) => void, tlobby: Lobby | null) {
    const token = localStorage.getItem("token");

    if (!token)
    {
        addNotification("Please, log again.");
        return ;
    }
    if (!tlobby)
    {
        addNotification("Not in a lobby.");
        return ;
    }
    try {
	    const res = await fetch(`${apiBase}/lobbies/change/spectator`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${tlobby.id}`}),
        });
        if (!res.ok)
        {
            addNotification("Unable to change to player.");
            return ;
        }
	    return ;
    }
    catch
    {
        addNotification("Unable to change to player.");
        return (null);
    }
}

export function MiniLobby({ lobbyItem }: { lobbyItem: Lobby }) {
    const { names, addLobby } = useLobby();
    const [name, setName] = useState(`User ${lobbyItem.hostId}`);
    const { addNotification } = useNotification();
    const lobbyx = lobbyItem.id;

    useEffect(() => {
        names.checknameupdate(lobbyItem.hostId).then(setName);
    }, [lobbyItem.hostId]);

    const joinlobbyx = () => {
        joinlobby(lobbyx, addNotification, addLobby);
    };

    return (
	    <div className="content-center justify-center align-middle text-center bg-linear-to-r from-cyan-200 to-blue-300 pointer-events-auto w-30 h-30 aspect-square rounded-2xl overflow-auto text-xs m-5 hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out cursor-pointer" onClick={joinlobbyx}>
		    <div><strong>Name:</strong> {lobbyItem.id}</div>
		    <div><strong>Host:</strong> {name}</div>
		    <div><strong>Players:</strong> {lobbyItem.players.length}</div>
		    <div><strong>Spectators:</strong> {lobbyItem.spectators.length}</div>
		    <div><strong>Status:</strong> {lobbyItem.status}</div>
		</div>
    );
}

export function Lobbies() {
    const [response, setResponse ] = useState<Lobbys | null>(null);

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
	return (
	    <div className="flex justify-center flex-wrap h-full items-start overflow-auto">
		{response.all.map((lobbyItem: Lobby) => (
            <MiniLobby lobbyItem={lobbyItem} key={lobbyItem.id} />
		))}
	    </div>
	);
}

export function MiniUser({user}: {user: number}) {
    const { names, lobby } = useLobby();
    const [ username, setUsername ] = useState(`User ${user}`);
    const [ img, setImg ] = useState("");

    async function updtusername() {
        setUsername(await names.checknameupdate(user));
    }

    async function updtimg() {
        setImg(await names.checkimgupdate(user));
        
    }
    useEffect(() => {
        updtusername();
        updtimg();
    }, [lobby]);

    if (img && img != "")
        return (<div className='text-center bg-linear-to-r from-cyan-200 to-blue-300 w-[40%] m-2 p-2 rounded-2xl shadow flex overflow-auto h-10'><img className="rounded-3xl h-[80%] mr-2" src={img}></img>{username}</div>);
    else
        return (<div className='text-center bg-linear-to-r from-cyan-200 to-blue-300 w-[40%] m-2 p-2 rounded-2xl shadow h-10'>{username}</div>);
}

export function Minimini({user}: {user: number}) {
    const { names, lobby } = useLobby();
    const [ username, setUsername ] = useState(`User ${user}`);
    const [ img, setImg ] = useState("");

    async function updtusername() {
        setUsername(await names.checknameupdate(user));
    }

    async function updtimg() {
        setImg(await names.checkimgupdate(user));
        
    }
    useEffect(() => {
        updtusername();
        updtimg();
    }, [lobby]);

    if (img && img != "")
        return (<div className='text-center bg-linear-to-r from-cyan-200 to-blue-300 w-fit m-2 p-2 rounded-2xl shadow flex h-10 flex-nowrap whitespace-nowrap'><img className="rounded-3xl h-[80%] mr-2" src={img}></img> {username}</div>);
    else
        return (<div className='text-center bg-linear-to-r from-cyan-200 to-blue-300 w-fit m-2 p-2 rounded-2xl shadow h-10 flex-nowrap whitespace-nowrap'>{username}</div>);
}

export function SingLobby() {
    const { names, lobby } = useLobby();
    const [ host, setHost ] = useState(`User ${lobby!.hostId}`);

    async function updthost() {
        setHost(await names.checknameupdate(lobby!.hostId));
    }

    useEffect(() => {
        if (lobby)
            updthost();
    }, [ lobby ]);

    if (!lobby)
        return (<p className="align-middle h-full w-full text-center justify-center items-center content-center">Lobby needed</p>)

    return (<div className="flex justify-center flex-wrap h-full items-start overflow-auto content-center">
        <div className="w-[20vw] overflow-auto py-8" >
            <p><b>Lobby:</b> {lobby.id}</p>
            <p><b>Lobby owner:</b> {host}</p>
            <p><b>Nº of Players:</b> {lobby.players.length}</p>
            <p><b>Nº of Spectators:</b> {lobby.spectators.length}</p>
        </div>
        <div className="text-center content-center">
            <p className="text-1.5xl"><b>PLAYERS</b></p>
            <div className="flex flex-wrap w-[50vw] align-middle justify-center">
            {lobby.players.map((user: number) => (
                <MiniUser user={user} key={user} />
            ))}
            </div>
        </div>
        {lobby.spectators.length > 0 &&
        <div className="text-center content-center mt-5">
            <p className="text-1.5xl"><b>SPECTATORS</b></p>
            <div className="flex w-[70vw] align-middle justify-start overflow-x-auto">
            {lobby.spectators.map((user: number) => (
                <Minimini user={user} key={user} />
            ))}
            </div>
        </div>
        }
    </div>);
}

export function ControlBar() {
    const { names, lobby } = useLobby();
    const [ host, setHost ] = useState(`User ${lobby!.hostId}`);
    const [ pos, setPos ] = useState(-1);
    const { addNotification } = useNotification();

    async function tospectchange() {
        const me = await names.getme();
        const index = lobby?.players.indexOf(me);
    
        if (me === -1 || (index != undefined && index > -1))
            changetopectator(addNotification, lobby);
        else
            addNotification("Unable to change to spectator.");
    }

    async function toplaychange() {
        const me = await names.getme();
        const index = lobby?.spectators.indexOf(me);
    
        if (me === -1 || (index != undefined && index > -1))
            changetoplay(addNotification, lobby);
        else
            addNotification("Unable to change to player.");
    }

    async function checkplaystate() {
        const me = await names.getme();
        const indexs = lobby?.spectators.indexOf(me);
        const indexp = lobby?.players.indexOf(me);

        if (indexp != undefined && indexp > -1)
            setPos(1);
        else if (indexs != undefined && indexs > -1)
            setPos(2);
        else
            setPos(-1);
    }

    useEffect(() => {
        checkplaystate();
    }, [ lobby ]);

    return (<div className="flex justify-center flex-wrap h-full items-start overflow-auto content-center">
        <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1">START GAME</div>
        {(pos === -1 || pos === 1) && 
            <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1" onClick={tospectchange}>TO SPECTATOR</div>
        }
        {(pos === -1 || pos === 2) && 
            <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1" onClick={toplaychange}>TO PLAYER</div>
        }
    </div>);
}

export function Handler() {
    const { names, lobby } = useLobby();
    const [ host, setHost ] = useState(-1);

    async function updthost() {
        setHost(await names.getme());
    }

    useEffect(() => {
        if (lobby)
            updthost();
    }, [ lobby ]);

    if (!lobby)
        return (<Doubledivvert ComponentBig={Lobbies} ComponentSmall={div}/>);
    else
    {        
        if (host === -1 || host === lobby!.hostId)
            return (<Doubledivgame ComponentBig={SingLobby} ComponentSmall={ControlBar}/>);
        else
            return (<Doubledivgame ComponentBig={SingLobby} ComponentSmall={ControlBar}/>)
    }
}
let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

import { useNotification } from '../notifications';
import { useEffect, useState } from "react";
import type { Lobbys, Lobby } from "../types/types"
const apiBase = `https://${noport}:8889/api/game`;
import { useLobby } from '../lobby';
import { Doubledivgame, Doubledivvert, TextField } from '../commoncomp/commoncomp';
import { useWs } from '../wshandler';

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

async function joinlobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
    const token = localStorage.getItem("token");

    try {
	    const res = await fetch(`${apiBase}/lobbies/join`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${which}`}),
        });
        const data = await res.json();
        if (!res.ok)
        {
            handleApiError(data.message ?? data.error);
            return (null);
        }
        addLobby(data);
	    return(data);
    }
    catch (err)
    {
        handleApiError(err);
        return ;
    }
}

async function startgame(which: string, handleApiError: (msg: any) => void) {
    const token = localStorage.getItem("token");

    try {
	    const res = await fetch(`${apiBase}/lobbies/start`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${which}`}),
        });
        const data = await res.json();
        if (!res.ok)
            handleApiError(data.message ?? data.error);

	    return ;
    }
    catch (err)
    {
        handleApiError(err);
        return ;
    }
}

async function createlobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
    const token = localStorage.getItem("token");

    try {
	    const res = await fetch(`${apiBase}/lobbies/create`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${which}`}),
        });
        const data = await res.json();
        if (!res.ok)
        {
            handleApiError(data.message ?? data.error);
            return ;
        }

        addLobby(data);
	    return(data);
    }
    catch (err)
    {
        handleApiError(err);
        return ;
    }
}

async function leavelobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
    const token = localStorage.getItem("token");

    try {
	    const res = await fetch(`${apiBase}/lobbies/leave`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${which}`}),
        });
        const data = await res.json();
        if (!res.ok)
        {
            handleApiError(data.message ?? data.error);
            return ;
        }

        addLobby(null);
	    return ;
    }
    catch (err)
    {
        handleApiError(err);
        return ;
    }
}

async function changetopectator(handleApiError: (msg: any) => void, tlobby: Lobby | null) {
    const token = localStorage.getItem("token");

    if (!tlobby)
        return ;

    try {
	    const res = await fetch(`${apiBase}/lobbies/change/player`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${tlobby.id}`}),
        });
        const data = await res.json();
        if (!res.ok)
            handleApiError(data.message ?? data.error);
    
	    return ;
    }
    catch (err)
    {
        handleApiError(err);
        return ;
    }
}

async function changetoplay(handleApiError: (msg: any) => void, tlobby: Lobby | null) {
    const token = localStorage.getItem("token");

    if (!tlobby)
        return ;

    try {
	    const res = await fetch(`${apiBase}/lobbies/change/spectator`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${tlobby.id}`}),
        });
        const data = await res.json();
        if (!res.ok)
            handleApiError(data.message ?? data.error);

	    return ;
    }
    catch (err)
    {
        handleApiError(err);
        return ;
    }
}

export function MiniLobby({ lobbyItem }: { lobbyItem: Lobby }) {
    const { names, addLobby } = useLobby();
    const [name, setName] = useState(`User ${lobbyItem.hostId}`);
    const { handleApiError } = useNotification();
    const lobbyx = lobbyItem.id;

    useEffect(() => {
        names.checknameupdate(lobbyItem.hostId).then(setName);
    }, [lobbyItem.hostId]);

    const joinlobbyx = () => {
        joinlobby(lobbyx, handleApiError, addLobby);
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
        return (<div className='text-center bg-linear-to-r from-cyan-200 to-blue-300 w-[40%] m-2 p-2 rounded-2xl shadow flex overflow-auto h-10 items-center content-center'><img className="rounded-3xl h-[80%] aspect-square mr-2" src={img}></img>{username}</div>);
    else
        return (<div className='text-center bg-linear-to-r from-cyan-200 to-blue-300 w-[40%] m-2 p-2 rounded-2xl shadow h-10 justify-center items-center content-center'>{username}</div>);
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
        return (<div className='text-center bg-linear-to-r from-yellow-200 to-yellow-300 w-fit m-2 p-2 rounded-2xl shadow flex h-10 flex-nowrap whitespace-nowrap justify-center items-center content-center'><img className="rounded-3xl h-[80%] aspect-square mr-2" src={img}></img> {username}</div>);
    else
        return (<div className='text-center bg-linear-to-r from-yellow-200 to-yellow-300 w-fit m-2 p-2 rounded-2xl shadow h-10 flex-nowrap whitespace-nowrap justify-center items-center content-center'>{username}</div>);
}

type ResProps = {
    place: number;
    user : number;
};

export function Placement({place, user} : ResProps)
{
    const { result } = useWs();
    const [ username, setUsername ] = useState(`User ${result?.first}`);
    const [ img, setImg ] = useState("");
    const { names } = useLobby();
    const [ colors, setColors ] = useState("bg-linear-to-r from-amber-200 to-amber-300");

    async function updtusername() {
        setUsername(await names.checknameupdate(user));
    }

    async function updtimg() {
        setImg(await names.checkimgupdate(user));
    }

    useEffect(() => {
        updtusername();
        updtimg();
        if (place === 1)
            setColors("bg-linear-to-r from-amber-200 to-amber-300");
        else if (place === 2)
            setColors("bg-linear-to-r from-mist-200 to-mist-300");
        else if (place === 3)
            setColors("bg-linear-to-r from-orange-200 to-orange-300");
        else if (place === 4)
            setColors("bg-linear-to-r from-stone-400 to-stone-500");
    });

    if (img && img != "")
        return (<div className={`text-center bg-linear-to-r ${colors} w-fit m-2 p-2 rounded-2xl shadow flex h-10 flex-nowrap whitespace-nowrap justify-center items-center content-center`}><p>{place}º </p><img className="rounded-3xl h-[80%] aspect-square m-2" src={img}></img> {username}</div>);
    else
        return (<div className={`text-center bg-linear-to-r ${colors} w-fit m-2 p-2 rounded-2xl shadow flex h-10 flex-nowrap whitespace-nowrap justify-center items-center content-center`}><p className="m-2">{place}º </p>{username}</div>);
}

export function ShowResults() {
    const { result } = useWs();

    return (<div className="flex align-middle justify-center overflow-x-auto">
        <Placement place={1} user={result!.first}/>
        <Placement place={2} user={result!.second}/>
        {result?.third && result.third !== -1 &&
            <Placement place={3} user={result!.third}/>
        }
        {result?.fourth && result.fourth !== -1 &&
            <Placement place={4} user={result!.fourth}/>
        }
    </div>)
}

export function SingLobby() {
    const { result } = useWs();
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
        { result &&
            <div className="text-center content-center w-full">
            <p className="text-1.5xl"><b>LAST GAME RESULTS</b></p>
            <ShowResults/>
            </div>
            
        }
        <br></br>
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
        <div className="text-center content-center">
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
    const { names, lobby, addLobby } = useLobby();
    const [ pos, setPos ] = useState(-1);
    const { handleApiError } = useNotification();
    const [ host, setHost ] = useState(-1);

    async function tospectchange() {
        changetopectator(handleApiError, lobby);
    }

    async function toplaychange() {
        changetoplay(handleApiError, lobby);
    }

    function leavelob() {
        leavelobby(lobby!.id, handleApiError, addLobby);
    }

    function strtgame() {
        startgame(lobby!.id, handleApiError);
    }

    async function updthost() {
        setHost(await names.getme());
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
        if (lobby)
            updthost();
    }, [ lobby ]);

    return (<div className="flex justify-center flex-wrap h-full items-start overflow-auto content-center text-xs ">
        {host === -1 || host === lobby!.hostId && 
            <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1" onClick={strtgame}>START GAME</div>
        }
        {(pos === -1 || pos === 1) && 
            <div className="h-15 w-[80%] bg-radial from-yellow-100 to-yellow-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-yellow-100 hover:to-yellow-200 transition delay-150 duration-300 ease-in-out my-1 overflow-x-auto" onClick={tospectchange}>TO SPECTATOR</div>
        }
        {(pos === -1 || pos === 2) && 
            <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1" onClick={toplaychange}>TO PLAYER</div>
        }
        <div className="h-15 w-[80%] bg-radial from-red-100 to-red-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-red-100 hover:to-red-200 transition delay-150 duration-300 ease-in-out my-1" onClick={leavelob}>LEAVE</div>
    </div>);
}

function Lobcreator() {
    const [ lobname, setLobname ] = useState("");
    const { addNotification, handleApiError } = useNotification();
    const { addLobby } = useLobby();

    function creator() {
        if (lobname === "" || lobname.trim().length === 0)
        {
            addNotification("Bad lobby name input.");
            return ;
        }
        createlobby(lobname, handleApiError, addLobby);
    }

    return (<div className="content-center w-full h-full flex justify-center align-middle items-center"><TextField value={lobname} onChange={setLobname} text={'CREATE'} submit={creator} tw={90}></TextField></div>);
}

export function Handler() {
    const { lobby } = useLobby();

    if (!lobby)
        return (<Doubledivvert ComponentBig={Lobbies} ComponentSmall={Lobcreator}/>);
    else      
        return (<Doubledivgame ComponentBig={SingLobby} ComponentSmall={ControlBar}/>)
}
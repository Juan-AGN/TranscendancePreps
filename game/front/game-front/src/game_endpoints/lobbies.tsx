let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

import { useNotification } from '../notifications';
import { useEffect, useState } from "react";
import type { Lobbys, Lobby, Ruleset } from "../types/types"
import { changeErrors } from "../types/types" 
const apiBase = `https://${noport}:8889/api/game`;
import { useLobby } from '../lobby';
import { Doubledivgame, Doubledivvert, TextField } from '../commoncomp/commoncomp';
import { useWs } from '../wshandler';
import { createPortal } from "react-dom";

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

async function fetchrules(which: string, handleApiError: (msg: any) => void, rules: Ruleset) {
    const token = localStorage.getItem("token");

    try {
	    const res = await fetch(`${apiBase}/lobbies/ruleset`, {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
            body: JSON.stringify({"lobbyId": `${which}`, "ruleset": rules}),
        });
        const data = await res.json();
        if (!res.ok)
            handleApiError(data.message ?? data.error);

        const failedStatus = Object.values(data.status).find(
            (status) =>
                status !== changeErrors.SUCCESS &&
                status !== changeErrors.NOCHANGE
        );
        if (failedStatus) {
            handleApiError(data.message ?? data.error);
            return;
        }
            
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

export async function leavelobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
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

type SettingsProps = {
    setRulesm: ( n: number ) => void;
};

const limits = {
  waitingnewball: { min: 500, max: 100000 },
  maxx: { min: 600, max: 2000 },
  maxy: { min: 600, max: 2000 },
  ballhitbox: { min: 5, max: 200 },
  playerhitbox: { min: 30, max: 300 },
  ballspeed: { min: 1, max: 30 },
  playerspeed: { min: 1, max: 20 },
  speedrandom: { min: 0, max: 15 },
  hitboxrandom: { min: 0, max: 100 },
  maxballs: { min: 0, max: 999 },
};

export function RulesSetter({
    rules,
    setRules,
    }: {
    rules: Ruleset;
    setRules: React.Dispatch<React.SetStateAction<Ruleset>>;
    }) {
    const handleChange = (
        key: keyof Ruleset,
        value: number
    ) => {
        setRules((prev) => ({
        ...prev,
        [key]: value,
        }));
    };

    const ruleList = [
        { key: "waitingnewball", label: "Time for new ball" },
        { key: "ballspeed", label: "Ball speed" },
        { key: "playerhitbox", label: "Player hitbox" },
        { key: "playerspeed", label: "Player speed" },
        { key: "ballhitbox", label: "Ball hitbox" },
        { key: "hitboxrandom", label: "Ball hitbox modifier" },
        { key: "speedrandom", label: "Ball speed modifier" },
        { key: "maxx", label: "Border X" },
        { key: "maxy", label: "Border Y" },
        { key: "maxballs", label: "Max nº of balls (0 for infinite)" },
    ] as const;

    return (
        <div className="flex flex-col items-center justify-center w-full">
        {ruleList.map((rule) => (
            <div
            key={rule.key}
            className="bg-linear-to-r from-mist-400 to-mist-500 
            w-[90%] rounded-xl p-2 mb-1 flex flex-col"
            >
            <div className="flex justify-between text-xs mb-1">
                <span>{rule.label}</span>
                <span>{rules[rule.key]}</span>
            </div>

            <input
                type="range"
                min={limits[rule.key].min}
                max={limits[rule.key].max}
                value={rules[rule.key]}
                onChange={(e) =>
                handleChange(rule.key, Number(e.target.value))
                }
                className="w-full"
            />
            </div>
        ))}
        </div>
    );
}

export function Crules() {
    const { lobby } = useLobby();
    const [ tcollision, setTcolission ] = useState("Yes");
    const [ mb, setMb ] = useState("Infinite");

    useEffect(() => {
        if (lobby!.rules.collision)
            setTcolission("Yes");
        else
            setTcolission("No");
        if (lobby!.rules.maxballs === 0)
            setMb("Infinite");
        else
            setMb(`${lobby!.rules.maxballs}`);

    }, [lobby]);


    return (<div className=' justify-center content-center flex flex-col items-center'>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Time for new ball: {lobby!.rules.waitingnewball}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball speed: {lobby!.rules.ballspeed}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Player collision: {tcollision}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Player hitbox: {lobby!.rules.playerhitbox}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Player speed: {lobby!.rules.playerspeed}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball hitbox: {lobby!.rules.ballhitbox}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball hitbox modifier: {lobby!.rules.hitboxrandom}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball speed: {lobby!.rules.ballspeed}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball speed modifier: {lobby!.rules.speedrandom}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Border x: {lobby!.rules.maxx}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Border y: {lobby!.rules.maxy}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Max nº of balls: {mb}</p></div>
    </div>)
}

export function Prerules({ srules }: { srules: Ruleset }) {
    const [ tcollision, setTcolission ] = useState("Yes");
    const [ mb, setMb ] = useState("Infinite");

    useEffect(() => {
        if (srules.collision)
            setTcolission("Yes");
        else
            setTcolission("No");
        if (srules.maxballs === 0)
            setMb("Infinite");
        else
            setMb(`${srules.maxballs}`);

    }, [srules]);


    return (<div className=' justify-center content-center flex flex-col items-center w-[40vw]'>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Time for new ball: {srules.waitingnewball}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball speed: {srules.ballspeed}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Player collision: {tcollision}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Player hitbox: {srules.playerhitbox}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Player speed: {srules.playerspeed}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball hitbox: {srules.ballhitbox}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball hitbox modifier: {srules.hitboxrandom}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball speed: {srules.ballspeed}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Ball speed modifier: {srules.speedrandom}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Border x: {srules.maxx}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Border y: {srules.maxy}</p></div>
        <div className='bg-linear-to-r from-mist-400 to-mist-500 h-8 text-ms w-[90%] rounded-full overflow-x-auto whitespace-nowrap flex items-center mb-0.5'><p className='content-center ml-1 mr-1 w-full'>Max nº of balls: {mb}</p></div>
    </div>)
}

const defaultrules : Ruleset = {
    waitingnewball: 5000,
    maxx: 1000,
    maxy: 750,
    ballhitbox: 50,
    playerhitbox: 90,
    ballspeed: 10,
    playerspeed: 10,
    speedrandom: 10,
    hitboxrandom: 0,
    maxballs: 0,
    collision: true,
}

const bullethell : Ruleset = {
    waitingnewball: 500,
    maxx: 1000,
    maxy: 1000,
    ballhitbox: 5,
    playerhitbox: 60,
    ballspeed: 1,
    playerspeed: 10,
    speedrandom: 10,
    hitboxrandom: 10,
    maxballs: 0,
    collision: true,
}

const macrobullethell : Ruleset = {
    waitingnewball: 500,
    maxx: 2000,
    maxy: 2000,
    ballhitbox: 5,
    playerhitbox: 90,
    ballspeed: 1,
    playerspeed: 10,
    speedrandom: 10,
    hitboxrandom: 10,
    maxballs: 0,
    collision: true,
}

const closequarters : Ruleset = {
    waitingnewball: 5000,
    maxx: 500,
    maxy: 500,
    ballhitbox: 20,
    playerhitbox: 40,
    ballspeed: 5,
    playerspeed: 10,
    speedrandom: 5,
    hitboxrandom: 10,
    maxballs: 0,
    collision: true,
}

const lopghall : Ruleset = {
    waitingnewball: 4000,
    maxx: 2000,
    maxy: 500,
    ballhitbox: 50,
    playerhitbox: 90,
    ballspeed: 15,
    playerspeed: 15,
    speedrandom: 10,
    hitboxrandom: 20,
    maxballs: 0,
    collision: true,
}

const giantball : Ruleset = {
    waitingnewball: 3000,
    maxx: 2000,
    maxy: 1800,
    ballhitbox: 200,
    playerhitbox: 100,
    ballspeed: 10,
    playerspeed: 2,
    speedrandom: 10,
    hitboxrandom: 100,
    maxballs: 0,
    collision: true,
}

export function SettingsMenu( { setRulesm } : SettingsProps) {
    const { handleApiError } = useNotification();
    const { lobby } = useLobby();

    const [nrules, setNrules] = useState(lobby!.rules);
    const [nshow, setNshow] = useState(0);

    function closethebox() {
        setRulesm(0);
    }

    function sendrules() {
        fetchrules(lobby!.id, handleApiError, nrules);
    }

    const handleChange = (value: string) => {
        if (value === "custom")
        {
            setNshow(0);
            return ;
        }
        else if (value === "default")
            setNrules(defaultrules);
        else if (value === "bullethell")
            setNrules(bullethell);
        else if (value === "macrobullethell")
            setNrules(macrobullethell);
        else if (value === "closequarters")
            setNrules(closequarters);
        else if (value === "lopghall")
            setNrules(lopghall);
        else if (value === "giantball")
            setNrules(giantball);
        setNshow(1);
    }

    return (createPortal(
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-[80vw] h-[70vw] landscape:w-[80vw] landscape:h-[70vh] aspect-auto bg-mauve-400/10 backdrop-blur-xs z-100 rounded-2xl m-4 flex shadow flex-wrap overflow-y-auto relative">
                <div className="w-10 h-10 flexpointer-events-none text-center text-3xl absolute top-2 right-4 bg-radial from-green-100/20 to-green-300/20 shadow hover:from-green-100 hover:to-green-200 cursor-pointer pointer-events-auto transition delay-150 duration-300 ease-in-out rounded-full z-30 trasnspa" onClick={closethebox}>{"X"}</div>
                <div className="w-[40vw] h-[60vw] landscape:w-[40vw] landscape:h-[60vh] items-center text-center flex absolute left-0 flex-col overflow-y-auto">
                    <p><b>CHANGE RULES</b></p>
                    {nshow !== 0 &&
                        <Prerules srules={nrules}/>
                    }
                    {nshow === 0 &&
                        <RulesSetter rules={nrules} setRules={setNrules}/>
                    }
                </div>
                <div className="w-[40vw] h-[60vw] landscape:w-[40vw] landscape:h-[60vh] items-center justify-center text-center absolute right-0 overflow-y-auto">
                    <p><b>CURRENT RULES</b></p>
                    <Crules/>
                </div>
                <div className="w-[80vw] h-[10vw] landscape:w-[40vw] landscape:h-[10vh] items-center justify-center text-center flex bottom-0 absolute">
                    <div className="h-8 w-[20%] bg-radial from-green-100 to-green-300 rounded-ms cursor-pointer text-center content-center shadow hover:from-green-100 hover:to-green-200 transition delay-150 duration-300 ease-in-out mx-1 rounded-2xl text-xs" onClick={sendrules}>SUBMIT RULES</div>
                    <select onChange={(e) => handleChange(e.currentTarget.value)} className="h-8 w-[40%] bg-radial from-green-100 to-green-300 rounded-ms cursor-pointer text-center content-center shadow hover:from-green-100 hover:to-green-200 transition delay-150 duration-300 ease-in-out mx-1 rounded-2xl text-xs">
                        <option value="custom">Custom rules</option>
                        <option value="default" >Default rules</option>
                        <option value="bullethell">Bullet hell</option>
                        <option value="mbullethell">Macro bullet hell</option>
                        <option value="closequarters">Close quarters</option>
                        <option value="lopghall">Long hall</option>
                        <option value="giantball">Giant ball</option>
                    </select>
                </div>
            </div>
        </div>,
        document.body
    ));
}

export function OnlyRules( { setRulesm } : SettingsProps) {
    function closethebox() {
        setRulesm(0);
    }

    return (createPortal(
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-[40vw] h-[70vw] landscape:w-[40vw] landscape:h-[70vh] aspect-auto bg-mauve-400/10 backdrop-blur-xs z-100 rounded-2xl m-4 flex shadow flex-wrap overflow-y-auto relative">
                <div className="w-10 h-10 flexpointer-events-none text-center text-3xl absolute top-2 right-4 bg-radial from-green-100/20 to-green-300/20 shadow hover:from-green-100 hover:to-green-200 cursor-pointer pointer-events-auto transition delay-150 duration-300 ease-in-out rounded-full z-30 trasnspa" onClick={closethebox}>{"X"}</div>
                <div className="w-[40vw] h-[70vw] landscape:w-[40vw] landscape:h-[70vh] items-center justify-center text-center absolute right-0 overflow-y-auto">
                    <p><b>CURRENT RULES</b></p>
                    <Crules/>
                </div>
            </div>
        </div>,
        document.body
    ));
}

export function ControlBar() {
    const { names, lobby, addLobby } = useLobby();
    const [ pos, setPos ] = useState(-1);
    const { handleApiError } = useNotification();
    const [ host, setHost ] = useState(-1);
    const [ rulesm, setRulesm ] = useState(0);

    async function openrulesm() {
        setRulesm(1);
    }

    async function openrulesmsee() {
        setRulesm(2);
    }

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
        {(host === -1 || host === lobby!.hostId) && 
            <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1" onClick={strtgame}>START GAME</div>
        }
        {(pos === -1 || pos === 1) && 
            <div className="h-15 w-[80%] bg-radial from-yellow-100 to-yellow-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-yellow-100 hover:to-yellow-200 transition delay-150 duration-300 ease-in-out my-1 overflow-x-auto" onClick={tospectchange}>TO SPECTATOR</div>
        }
        {(pos === -1 || pos === 2) && 
            <div className="h-15 w-[80%] bg-radial from-cyan-100 to-blue-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-cyan-100 hover:to-cyan-200 transition delay-150 duration-300 ease-in-out my-1" onClick={toplaychange}>TO PLAYER</div>
        }
        {(host === -1 || host === lobby!.hostId) && 
            <div className="h-15 w-[80%] bg-radial from-green-100 to-green-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-green-100 hover:to-green-200 transition delay-150 duration-300 ease-in-out my-1" onClick={openrulesm}>CHANGE RULES</div>
        }
        {host !== -1 && host !== lobby!.hostId && 
            <div className="h-15 w-[80%] bg-radial from-green-100 to-green-300 rounded-2xl cursor-pointer text-center content-center shadow hover:from-green-100 hover:to-green-200 transition delay-150 duration-300 ease-in-out my-1" onClick={openrulesmsee}>SEE RULES</div>
        }
        { rulesm === 1 &&
            <SettingsMenu setRulesm={setRulesm}/>
        }
        { rulesm === 2 &&
            <OnlyRules setRulesm={setRulesm}/>
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
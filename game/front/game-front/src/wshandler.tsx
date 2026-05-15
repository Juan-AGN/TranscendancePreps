import { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
import type { GameSession, Lobby } from "./types/types";
import { NotificationProvider, useNotification } from './notifications';
import { LobbyProvider, useLobby } from './lobby';
import { LobbyAction,  } from './types/types';
import { Singledivgame } from './commoncomp/commoncomp';

let address = window.location.host;

let noport = "";

if (address.includes(":"))
    noport = address.split(":")[0];

const apiBase = `https://${noport}:8889/api/auth`

const apiBaselob = `wss://${noport}:8889/api/game`

const WsContext = createContext<WsContextType | null>(null);

type WsContextType = {

}

export const useHeldKey = () => {
    const [heldKey, setHeldKey] = useState(null);

    useEffect(() => {
        const keyDownHandler = (e: any) => {
            // Only track the first press, ignore OS repeat
            if (e.repeat) return;
            if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
                setHeldKey(e.code);
            }
        };

        const keyUpHandler = (e: any) => {
            if (heldKey === e.code) {
                setHeldKey(null);
            }
        };

        window.addEventListener("keydown", keyDownHandler);
        window.addEventListener("keyup", keyUpHandler);

        return () => {
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("keyup", keyUpHandler);
        };
    }, [heldKey]);

    return (heldKey);
};

export function nologgederror() {
    return (<p className="align-middle h-full w-full text-center justify-center items-center content-center">This user requires an user account, please log in and try again!</p>)
}

export const WsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { addNotification } = useNotification();
	const token = localStorage.getItem("token");
    const { names, lobby, addLobby } = useLobby();
    const heldKey = useHeldKey();
    const heldKeyRef = useRef(null);
    const [ game, setGame ] = useState< GameSession | null >(null);
    const [ result, setResults ] = useState< GameSession | null >(null);

	useEffect(() => {
		heldKeyRef.current = heldKey;
	}, [heldKey]);

    async function lobbyupdate(msg: any) {
        const me = await names.getme();

        if (msg.action == "LEAVE" || msg.action == "LEAVESPECTATOR")
        {
            if (msg.user === me)
            {
                addLobby(null);
                return ;
            }
        }

        if (msg.action === LobbyAction.HOST)
            addNotification(`User ${await names.checknameupdate(msg.user)} became the new lobby host.`);
        else if (msg.action === LobbyAction.JOIN || LobbyAction.SPECTATOR)
            addNotification(`User ${await names.checknameupdate(msg.user)} joined the lobby.`);
        else if (msg.action === LobbyAction.LEAVE || LobbyAction.LEAVESPECTATOR)
            addNotification(`User ${await names.checknameupdate(msg.user)} left the lobby.`);
        else if (msg.action === LobbyAction.STARTGAME)
            addNotification(`Game started.`);
        else if (msg.action === LobbyAction.SWITCHTOPLAYER)
            addNotification(`User ${await names.checknameupdate(msg.user)} switched to player.`);
        else if (msg.action === LobbyAction.SWITCHTOSPECTATOR)
            addNotification(`User ${await names.checknameupdate(msg.user)} switched to spectator.`);
        else if (msg.action === LobbyAction.UPDATERULESET)
            addNotification(`Lobby ruleset changed.`);
    }

        
    useEffect(() => {
        if (token)
        {
            const socket = new WebSocket(`${apiBaselob}/?token=${token}`);

            socket.onerror = () => {
                addNotification("Unable to auth.");
            };

            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                    if (msg.type == "LOBBYUPDATE")
                        lobbyupdate(msg);
                    if (msg.type == "GAMESTATE")
                    {
                        setGame(msg.context);

                        if (heldKeyRef.current) {
                            const keyMap = {
                                KeyW: "W",
                                KeyA: "A",
                                KeyS: "S",
                                KeyD: "D",
                            };

                            socket.send(keyMap[heldKeyRef.current]);
                        }
                    }
                    if (msg.type == "GAMERESULT")
                    {
                        setGame(null);
                        setResults(msg.results);
                    }};

            return () => {
            };
        }
    }, [token]);

    if (!token)
        return (<WsContext.Provider value={{ }}><Singledivgame Component={nologgederror}></Singledivgame></WsContext.Provider>);
    return (<WsContext.Provider value={{ }}>
            {children}
        </WsContext.Provider>);
};

export const useWs = () => {
    const ctx = useContext(WsContext);

    if (!ctx)
        throw new Error('useWs must be used inside WsProvider');

    return (ctx);
};
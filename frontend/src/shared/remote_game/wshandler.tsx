import { createContext, useContext, useState, useRef, useEffect } from "react";
import type { GameSession, GameResults } from "./types/types";
import { useNotification } from './notifications';
import { useLobby } from './lobby';
import { LobbyAction } from './types/types';
import { Singledivgame } from './commoncomp/commoncomp';
import { Gamehandler } from "./gamestate/gamestate";
import { useTranslation } from 'react-i18next';

let address = window.location.host;

let noport = "";

if (address.includes(":"))
    noport = address.split(":")[0];

const apiBaselob = `wss://${noport}:8889/api/game`

const WsContext = createContext<WsContextType | null>(null);

type WsContextType = {
    game: GameSession | null;
    addGame: (g: GameSession | null) => void;
    result: GameResults | null;
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

export function NoLoggedError() {
    const { t } = useTranslation();
    return (
        <p className="w-full text-center text-red-400 font-semibold">
            {t('remoteGame.accountRequired')}
        </p>)
}

export const WsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { addNotification, token, addToken } = useNotification();
    const { names, lobby, addLobby } = useLobby();
    const heldKey = useHeldKey();
    const heldKeyRef = useRef(null);
    const [game, setGame] = useState<GameSession | null>(null);
    const [result, setResults] = useState<GameResults | null>(null);

    useEffect(() => {
        heldKeyRef.current = heldKey;
    }, [heldKey]);

    async function lobbyupdate(msg: any) {
        const me = await names.getme();

        if (msg.action == "LEAVE" || msg.action == "LEAVESPECTATOR") {
            if (msg.user === me) {
                addLobby(null);
                return;
            }
        }

        addLobby(msg.lobbystate);

        if (msg.action === LobbyAction.UPDATERULESET)
            addNotification(`Lobby ruleset changed.`);

        if (msg.user === me)
            return;

        if (msg.action === LobbyAction.HOST)
            addNotification(`User ${await names.checknameupdate(msg.user)} became the host.`);
        else if (msg.action === LobbyAction.JOIN)
            addNotification(`User ${await names.checknameupdate(msg.user)} joined the lobby.`);
        else if (msg.action === LobbyAction.LEAVE)
            addNotification(`User ${await names.checknameupdate(msg.user)} left the lobby.`);
        else if (msg.action === LobbyAction.STARTGAME)
            addNotification(`Game started.`);
        else if (msg.action === LobbyAction.SWITCHTOPLAYER)
            addNotification(`User ${await names.checknameupdate(msg.user)} switched to player.`);
        else if (msg.action === LobbyAction.SWITCHTOSPECTATOR)
            addNotification(`User ${await names.checknameupdate(msg.user)} switched to spectator.`);
    }

    const addGame = (g: GameSession | null) => {
        setGame(g);
    };

    useEffect(() => {
        if (lobby === null)
            setResults(null);
    }, [lobby]);

    useEffect(() => {
        if (token) {
            const socket = new WebSocket(`${apiBaselob}/?token=${token}`);

            socket.onerror = () => {
                addNotification("Unable to auth.");
                addToken(null);
                addLobby(null);
            };

            socket.onclose = () => {
                addLobby(null);
            };

            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.type == "LOBBYUPDATE")
                    lobbyupdate(msg);
                if (msg.type == "GAMESTATE") {
                    setGame(msg.game);

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
                if (msg.type == "GAMERESULT") {
                    setGame(null);
                    setResults(msg.results);
                }
            };

            return () => {
                socket.close();
            };
        }
    }, [token]);

    if (!token)
        return (<WsContext.Provider value={{ game, addGame, result }}><Singledivgame Component={NoLoggedError}></Singledivgame></WsContext.Provider>);
    else if (!game)
        return (<WsContext.Provider value={{ game, addGame, result }}>{children}</WsContext.Provider>);
    else
        return (<WsContext.Provider value={{ game, addGame, result }}><Gamehandler /></WsContext.Provider>);
};

export const useWs = () => {
    const ctx = useContext(WsContext);

    if (!ctx)
        throw new Error('useWs must be used inside WsProvider');

    return (ctx);
};
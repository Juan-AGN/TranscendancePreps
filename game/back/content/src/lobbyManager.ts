import { Lobby, Lobbys, LobbyAction, WsAction } from "./types";
import { WebSocketServer, WebSocket } from "ws";

class LobbyManager {
    //map of lobbys by id
    lobbymap = new Map<string, Lobby>();

    //setting a relation between user and its lobbyes
    clientlobby = new Map<string, string>();

    //map of all userswith their corresponding websockets (array in case of multiple ws for one user)
    userrelmap = new Map<string, WebSocket[]>();

    maxsize = 4;

    //getting lobby from lobby id
    get(id: string) {
        return this.lobbymap.get(id);
    }

    //checking if lobby exists from id
    has(id: string) {
        return this.lobbymap.has(id);
    }

    //creating lobby with id name and player as host
    add(id: string, player: string) {
        if (!this.lobbymap.has(id) && !this.clientlobby.has(player))
        {
            const newlobby: Lobby = {
                id,
                hostId: player,
                players: [player],
                spectators: [],
                status: "waiting",
            };
            this.clientlobby.set(player, id);
            this.lobbymap.set(id, newlobby);
            return (true);
        }
        return (false);
    }

    //adding player to lobby id
    addplayer(id: string, player: string) {
        if (this.lobbymap.has(id) && !this.clientlobby.has(player))
        {
            if (this.get(id)?.players.includes(player))
                return (false);
            this.clientlobby.set(player, id);
            if (this.get(id)?.status == "in-game" || this.get(id)!.players.length >= this.maxsize)
            {
                this.get(id)?.spectators.push(player);
                this.broadcastlobby(id, player, LobbyAction.SPECTATOR);
            }
            else
            {
                this.get(id)?.players.push(player);
                this.broadcastlobby(id, player, LobbyAction.JOIN);
            }
            return (true);
        }
        return (false);
    }

    //player leaving from id lobby and setting new host
    leaveplayer(id: string, player: string) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);
        if (!lob.players.includes(player) && !lob.spectators.includes(player))
            return (false);
        if (lob.status == "in-game")
            return (false);

        if (lob.spectators.includes(player))
        {
            let torem = lob.spectators.indexOf(player);
            if (torem != -1)
                lob.spectators.splice(torem, 1);
            this.broadcastlobby(id, player, LobbyAction.LEAVESPECTATOR);
            return (true);
        }
    
        let torem = lob.players.indexOf(player);
        if (torem != -1)
            lob.players.splice(torem, 1);

        if (lob.players.length != 0)
            this.broadcastlobby(id, player, LobbyAction.LEAVE);
        
        if (lob.hostId == player)
        {
            if (lob.players.length != 0)
            {
                lob.hostId = lob.players[0];
                this.broadcastlobby(id, player, LobbyAction.HOST);
            }
            else
                this.lobbymap.delete(id);
        }

        if (lob.players.length != 0)
            this.spectToPlayer(id);
        this.clientlobby.delete(player);
        return (true);
    }

    spectToPlayer(id: string) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);

        if (lob.spectators.length === 0)
            return (false)

        if (lob.players.length >= this.maxsize)
            return (false)

        lob.players.push(lob.spectators[0]);
        this.broadcastlobby(id, lob.spectators[0], LobbyAction.SWITCHTOPLAYER);
        lob.spectators.splice(0, 1);
    }

    //getter for all lobbyes
    getlobbies() {
        const lob: Lobbys = {
            all: [],
        };
        for (const [key, value] of this.lobbymap)
            lob.all.push(value);
        return lob;
    }

    //broadcast to every player an lobby action
    broadcastlobby(id: string, player: string, action: LobbyAction)
    {
        const lob = this.get(id);
        if (lob == undefined)
            return ;
        for (const uniplayer of lob.players)
        {
            const wsarr = this.userrelmap.get(uniplayer);
            if (wsarr)
            {
                for (const ws of wsarr)
                {
                    if (ws && ws.readyState === WebSocket.OPEN) 
                        ws.send(JSON.stringify( {type: WsAction.LOBBYUPDATE, lobby: id, user: player, action: action} ))
                } 
            }
        }

        for (const unispecter of lob.spectators)
        {
            const wsarr = this.userrelmap.get(unispecter);
            if (wsarr)
            {
                for (const ws of wsarr)
                {
                    if (ws && ws.readyState === WebSocket.OPEN) 
                        ws.send(JSON.stringify( {type: WsAction.LOBBYUPDATE, lobby: id, user: player, action: action} ))
                } 
            }
        }
    }

    //adding/creating ws for user
    newws(user: string, ws: WebSocket) {
        if (this.userrelmap.has(user))
            this.userrelmap.get(user)!.push(ws);
        else
            this.userrelmap.set(user, [ws])
    }

    //delleting ws
    deletews(user: string, ws: WebSocket) {
        if (this.userrelmap.has(user))  {
            const arr = this.userrelmap.get(user)!;
            let torem = arr.indexOf(ws);

            if (torem != -1)
                arr.splice(torem, 1); // i hate this i hate this i hate this i hate this i hate this
            if (arr.length === 0)
            {
                this.userrelmap.delete(user);
                if (this.clientlobby.has(user))
                    this.leaveplayer(this.clientlobby.get(user)!, user)
            }
        }
    }
}

export const lobbyManager = new LobbyManager();

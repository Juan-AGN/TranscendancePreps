import { Lobby, Lobbys, LobbyAction, WsAction, Errors, GameSession, GameAction, GameResults } from "./types";
import { WebSocketServer, WebSocket } from "ws";
import { gameManager } from "./gameManager";

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

class LobbyManager {
    //map of lobbys by id
    lobbymap = new Map<string, Lobby>();

    //setting a relation between user and its lobbyes
    clientlobby = new Map<string, string>();

    //map of all userswith their corresponding websockets (array in case of multiple ws for one user)
    userrelmap = new Map<string, WebSocket[]>();

    gamemap = new Map<string, GameSession>();

    movedPlayers : string[] = [];

    maxsize = 4;

    //getting lobby from lobby id
    get(id: string) {
        return this.lobbymap.get(id);
    }

    //checking if lobby exists from id
    has(id: string) {
        return (this.lobbymap.has(id));
    }

    hasplayer(id: string) {
        return (this.clientlobby.has(id));
    }

    //checking if where an user is
    whereis(id: string) {
        if (this.clientlobby.has(id))
            return (this.lobbymap.get(this.clientlobby.get(id)!));
        return (undefined);
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

        if (lob.spectators.includes(player))
        {
            let torem = lob.spectators.indexOf(player);
            if (torem != -1)
                lob.spectators.splice(torem, 1);
            this.clientlobby.delete(player);
            this.broadcastlobby(id, player, LobbyAction.LEAVESPECTATOR);
            return (true);
        }

        if (lob.status == "in-game")
        {
            let game = this.gamemap.get(id)!;

            if (this.lobbymap.get(id)?.players.indexOf(player)! < 0)
                return (false);
            
            let index = gameManager.getplayer(player, game);
            if (index != -1)
                gameManager.killplayer(index, game);
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
                        ws.send(JSON.stringify( {type: WsAction.LOBBYUPDATE, lobby: id, user: player, action: action} ));
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
                        ws.send(JSON.stringify( {type: WsAction.LOBBYUPDATE, lobby: id, user: player, action: action} ));
                }
            }
        }
    }

    broadcastgame(id: string, game: GameSession, action: GameAction)
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
                        ws.send(JSON.stringify( {type: WsAction.GAMESTATE, context: action, game: game }));
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
                        ws.send(JSON.stringify( {type: WsAction.GAMESTATE, context: action, game: game }));
                }
            }
        }
    }

    broadcastresult(id: string, result: GameResults)
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
                        ws.send(JSON.stringify( { type: WsAction.GAMERESULT, results: result }));
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
                        ws.send(JSON.stringify( { type: WsAction.GAMERESULT, results: result }));
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

    setupgame(lobbyId: string, playerId: string) {
        let maxx = 1000;
        let maxy = 750;
        let ballhitbox = 50; // prev: 90
        let playerhitbox = 90;
        let ballspeed = 10;
        let playerspeed = 10;

        if (!this.has(lobbyId))
            return (Errors.NOLOBBY);
        
        let lob = this.get(lobbyId)!;
        if (lob.players.length < 2)
            return (Errors.NOPLAYERS);

        this.broadcastlobby(lobbyId, playerId, LobbyAction.STARTGAME);
        let game = gameManager.setup(lob, maxx, maxy, ballhitbox, playerhitbox, ballspeed, playerspeed);
        this.gamemap.set(lobbyId, game);
        this.startgame(game, lob);
        return (null);
    }

    able(lobbyId: string, hostId: string) {
        if (!this.has(lobbyId))
            return (Errors.NOLOBBY);

        let lob = this.get(lobbyId)!;

        if (hostId != lob.hostId)
            return (Errors.NOTHOST);
        if (lob.status == "in-game")
            return (Errors.INGAME);
        lob.status = "in-game";
        return (null);
    }

    playermovement(keycode: string, userid: string) {
        if (this.movedPlayers.indexOf(userid) > -1)
            return ;
        if (!this.clientlobby.has(userid))
            return ;
        const lob = this.clientlobby.get(userid)!;
        if (!this.gamemap.has(lob))
            return ;
        let game = this.gamemap.get(lob)!;
        if (this.lobbymap.get(lob)?.players.indexOf(userid)! < 0)
            return ;

        switch (keycode) {
            case "W": {
                gameManager.moveplayerup(game, userid);
                break ;
            }
            case "A": {
                gameManager.moveplayerleft(game, userid);
                break ;
            }
            case "S": {
                gameManager.moveplayerdown(game, userid);
                break ;
            }
            case "D": {
                gameManager.moveplayerright(game, userid);
                break ;
            }
        }
        this.movedPlayers.push(userid);
    }

    async startgame(game: GameSession, tlobby: Lobby) {
        let waitingtime = 2000;
        let fps = 30;
        let framesonmiliseconds = 1000 / fps;
        let i = 0;
        let waitingnewball = 5000;
        let speed = game.ball[0].speed;

        this.broadcastgame(game.id, game, GameAction.START);
        await delay(waitingtime);

        while (game.alive.length > 1)
        {
            await delay(framesonmiliseconds);
            gameManager.playframe(game);
            i += framesonmiliseconds;
            if (i >= waitingnewball)
            {
                gameManager.spawnball(game, game.borderx, game.bordery, game.ball[0].hitbox, gameManager.randomIntFromInterval(speed - 10, speed + 10));
                i = 0;
            }
            this.broadcastgame(game.id, game, GameAction.STATE);
            for (const user of tlobby.players)
                if (this.movedPlayers.indexOf(user) > -1)
                    this.movedPlayers.splice(this.movedPlayers.indexOf(user), 1);
        }

        for (const player of game.alive)
            game.dead.push(player.player);


        let first = "", second = "", third = "", fourth = "";
        game.dead.reverse();

        if (game.dead.length > 3)
            fourth = game.dead[3];

        if (game.dead.length > 2)
            third = game.dead[2];

        if (game.dead.length > 1)
            second = game.dead[1];

        first = game.dead[0];

        tlobby.status = "waiting";

        const result: GameResults = {
            first: first,
            second: second,
            third: third,
            fourth: fourth,
        }
        this.gamemap.delete(tlobby.id);
        this.broadcastresult(tlobby.id, result);
    }
}

export const lobbyManager = new LobbyManager();

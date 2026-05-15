import { Lobby, Lobbys, LobbyAction, WsAction, Errors, GameSession, GameAction, GameResults, Ruleset, RulesState, changeErrors } from "./types";
import { WebSocketServer, WebSocket } from "ws";
import { gameManager } from "./gameManager";
import { rulesetHandler } from "./rulesetHandler";
import { stat } from "fs";
import { isNumberObject } from "util/types";

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

class LobbyManager {
    //map of lobbys by id
    lobbymap = new Map<string, Lobby>();

    //setting a relation between user and its lobbyes
    clientlobby = new Map<number, string>();

    //map of all userswith their corresponding websockets (array in case of multiple ws for one user)
    userrelmap = new Map<number, WebSocket[]>();

    gamemap = new Map<string, GameSession>();

    movedPlayers : number[] = [];

    maxsize = 4;

    //getting lobby from lobby id
    get(id: string) {
        return (this.lobbymap.get(id));
    }

    //checking if lobby exists from id
    has(id: string) {
        return (this.lobbymap.has(id));
    }

    hasplayer(id: number) {
        return (this.clientlobby.has(id));
    }

    //checking if where an user is
    whereis(id: number) {
        if (this.clientlobby.has(id))
            return (this.lobbymap.get(this.clientlobby.get(id)!));
        return (undefined);
    }

    //creating lobby with id name and player as host
    add(id: string, player: number) {
        if (!this.lobbymap.has(id) && !this.clientlobby.has(player) && this.userrelmap.has(player))
        {
            const newlobby: Lobby = {
                id,
                hostId: player,
                players: [player],
                spectators: [],
                status: "waiting",
                rules: rulesetHandler.defaultruleset(),
            };
            this.clientlobby.set(player, id);
            this.lobbymap.set(id, newlobby);
            return (true);
        }
        return (false);
    }

    //adding player to lobby id
    addplayer(id: string, player: number) {
        if (this.lobbymap.has(id) && !this.clientlobby.has(player) && this.userrelmap.has(player))
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

    changeruleset(id: string, player: number, rules: Ruleset) {
        if (this.lobbymap.has(id) && this.clientlobby.has(player))
        {
            const lob = this.get(id);
            if (lob!.hostId! != player || lob!.status == "in-game")
                return (false);
            const ruleset = rulesetHandler.newrules(lob!, rules);
            if (ruleset == undefined)
                return (false);
            this.broadcastlobby(id, player, LobbyAction.UPDATERULESET);
            return (ruleset);
        }
        return (false);
    }

    leavehost(tlobby: Lobby, player: number) {
        if (tlobby.players.length != 0)
        {
            tlobby.hostId = tlobby.players[0];
            this.broadcastlobby(tlobby.id, player, LobbyAction.HOST);
        }
        else if (tlobby.spectators.length != 0)
        {
            tlobby.hostId = tlobby.spectators[0];
            this.broadcastlobby(tlobby.id, player, LobbyAction.HOST);
        }
        else
            this.lobbymap.delete(tlobby.id);
    }

    //player leaving from id lobby and setting new host
    leaveplayer(id: string, player: number) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);
        if (!lob.players.includes(player) && !lob.spectators.includes(player))
            return (false);

        if (lob.spectators.includes(player))
        {
            this.broadcastlobby(id, player, LobbyAction.LEAVESPECTATOR);
            let torem = lob.spectators.indexOf(player);
            if (torem != -1)
                lob.spectators.splice(torem, 1);
            this.clientlobby.delete(player);
            if (lob.hostId == player)
                this.leavehost(lob, player);
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
    
        if (lob.players.length != 0)
            this.broadcastlobby(id, player, LobbyAction.LEAVE);

        let torem = lob.players.indexOf(player);
        if (torem != -1)
            lob.players.splice(torem, 1);
        
        if (lob.hostId == player)
            this.leavehost(lob, player);

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

    PlayerToSpect(id: string) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);

        if (lob.players.length === 0)
            return (false);

        lob.players.push(lob.spectators[0]);
        this.broadcastlobby(id, lob.spectators[0], LobbyAction.SWITCHTOPLAYER);
        lob.spectators.splice(0, 1);
    }

    spectToPlayerEndp(id: string, player: number) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);

        let index = lob.spectators.indexOf(player);

        if (index == -1)
            return (false);

        if (lob.spectators.length === 0)
            return (false);

        if (lob.players.length >= this.maxsize)
            return (false);

        lob.players.push(lob.spectators[index]);
        lob.spectators.splice(index, 1);
        this.broadcastlobby(id, player, LobbyAction.SWITCHTOPLAYER);
        return (true);
    }

    playerToSpectEndp(id: string, player: number) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);

        let index = lob.players.indexOf(player);

        if (index == -1)
            return (false);

        if (lob.players.length === 0)
            return (false);

        lob.spectators.push(lob.players[index]);
        lob.players.splice(index, 1);
        this.broadcastlobby(id, player, LobbyAction.SWITCHTOSPECTATOR);
        return (true);
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
    broadcastlobby(id: string, player: number, action: LobbyAction)
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
    newws(user: number, ws: WebSocket) {
        if (this.userrelmap.has(user))
            this.userrelmap.get(user)!.push(ws);
        else
            this.userrelmap.set(user, [ws])
    }

    //delleting ws
    deletews(user: number, ws: WebSocket) {
        if (this.userrelmap.has(user))  {
            const arr = this.userrelmap.get(user)!;
            let torem = arr.indexOf(ws);

            if (torem != -1)
                arr.splice(torem, 1); // i hate this i hate this i hate this i hate this i hate this
            if (arr.length === 0)
            {
                this.userrelmap.delete(user);
                if (this.clientlobby.has(user))
                {
                    const tlobby = this.get(this.clientlobby.get(user)!)!;

                    if (tlobby.status != "in-game" || tlobby.spectators.indexOf(user) != -1)
                        this.leaveplayer(tlobby.id, user);
                }
            }
        }
    }

    setupgame(lobbyId: string, playerId: number) {
        if (!this.has(lobbyId))
            return (Errors.NOLOBBY);
        
        let lob = this.get(lobbyId)!;
        if (lob.players.length < 2)
            return (Errors.NOPLAYERS);

        this.broadcastlobby(lobbyId, playerId, LobbyAction.STARTGAME);
        let game;
        game = gameManager.setup(lob, lob.rules.maxx, lob.rules.maxy, lob.rules.ballhitbox, lob.rules.playerhitbox, lob.rules.ballspeed, lob.rules.playerspeed);
        this.gamemap.set(lobbyId, game);
        this.startgame(game, lob);
        return (null);
    }

    able(lobbyId: string, hostId: number) {
        if (!this.has(lobbyId))
            return (Errors.NOLOBBY);

        let lob = this.get(lobbyId)!;

        if (hostId != lob.hostId)
            return (Errors.NOTHOST);
        if (lob.status == "in-game")
            return (Errors.INGAME);
        if (lob.players.length < 2)
            return (Errors.NOPLAYERS);
        lob.status = "in-game";
        return (null);
    }

    playermovement(keycode: string, userid: number) {
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
        let waitingnewball = tlobby.rules.waitingnewball;
        let speed = tlobby.rules.ballspeed;

        this.broadcastgame(game.id, game, GameAction.START);
        await delay(waitingtime);

        while (game.alive.length > 1)
        {
            await delay(framesonmiliseconds);
            gameManager.playframe(game);
            i += framesonmiliseconds;
            if (i >= waitingnewball && (tlobby.rules.maxballs > game.ball.length || tlobby.rules.maxballs == 0))
            {
                gameManager.spawnball(game, game.borderx, game.bordery, gameManager.randomIntFromNoZero(tlobby.rules.ballhitbox - tlobby.rules.hitboxrandom, tlobby.rules.ballhitbox + tlobby.rules.hitboxrandom), gameManager.randomIntFromInterval(speed - tlobby.rules.speedrandom, speed + tlobby.rules.speedrandom));
                i = 0;
            }
            this.broadcastgame(game.id, game, GameAction.STATE);
            for (const user of tlobby.players)
                if (this.movedPlayers.indexOf(user) > -1)
                    this.movedPlayers.splice(this.movedPlayers.indexOf(user), 1);
        }

        for (const player of game.alive)
            game.dead.push(player.player);

        let first = -1, second = -1, third = -1, fourth = -1;
        game.dead.reverse();

        if (game.dead.length > 3)
            fourth = game.dead[3];

        if (game.dead.length > 2)
            third = game.dead[2];

        if (game.dead.length > 1)
            second = game.dead[1];

        first = game.dead[0];

        tlobby.status = "waiting";
    
        for (const player of tlobby.players)
            if (!this.userrelmap.get(player))
                this.leaveplayer(tlobby.id, player);

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

import { Lobby } from "./types";

class LobbyManager {
    myMap = new Map<string, Lobby>();

    get(id: string) {
        return this.myMap.get(id);
    }

    has(id: string) {
        return this.myMap.has(id);
    }

    add(id: string, player: string) {
        if (!this.myMap.has(id))
        {
            const newlobby: Lobby = {
                id,
                hostId: player,
                players: [player],
                status: "waiting",
            };
            this.myMap.set(id, newlobby);
            return (true);
        }
        return (false);
    }

    addplayer(id: string, player: string) {
        if (this.myMap.has(id))
        {
            if (this.get(id)?.players.includes(player))
                return (false);
            this.get(id)?.players.push(player);
            return (true);
        }
        return (false);
    }

    leaveplayer(id: string, player: string) {
        const lob = this.get(id);

        if (lob == undefined)
            return (false);
        if (!lob.players.includes(player))
            return (false);

        let torem = lob.players.indexOf(player);
        if (torem != -1)
            lob.players.splice(torem, 1);
        if (lob.hostId == player)
        {
            if (lob.players.length != 0)
                lob.hostId = lob.players[0];
            else
                this.myMap.delete(id);
        }
        return (true);
    }

    getlobbies() {
        return (this.myMap);
    }
}

export const lobbyManager = new LobbyManager();

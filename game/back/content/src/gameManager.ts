import { alive, ball, GameSession, Lobby } from "./types";
import { lobbyManager } from "./lobbyManager";


function randomIntFromInterval(min: number, max: number) { 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class GameManager {
    start(clobby: Lobby, maxx: number, maxy: number, ballhitbox: number, playerhitbox: number, ballspeed: number, playerspeed: number) {
        const newball: ball = {
            x: maxx / 2,
            y: maxy / 2,
            angle: randomIntFromInterval(0, 360),
            hitbox: ballhitbox,
            speed: ballspeed,
        }

        let i : number = 0;

        const game: GameSession = {
            id: clobby.id,
            alive: [],
            dead: [],
            ball: [ newball ],
            borderx: maxx,
            bordery: maxy,
        };

        for (const player of clobby.players)
        {
            let setx: number;
            let sety: number;

            if (i == 0 || i == 3)
                sety = playerhitbox + 5;
            else
                sety = maxy - playerhitbox - 5;

            if (i == 0 || i == 2)
                setx = playerhitbox + 5;
            else
                setx = maxx - playerhitbox - 5;

            const toset: alive = {
                player: player,
                x: setx,
                y: sety,
                hitbox: playerhitbox,
                speed: playerspeed,
            }

            game.alive.push(toset);
            i ++;
        }

        return (game);
    }
}

export const gameManager = new GameManager();

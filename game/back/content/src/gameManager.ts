import { alive, ball, GameSession, Lobby } from "./types";
import { lobbyManager } from "./lobbyManager";

class GameManager {
    randomIntFromInterval(min: number, max: number) {
        if (min < 0)
            min = 0;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    setup(clobby: Lobby, maxx: number, maxy: number, ballhitbox: number, playerhitbox: number, ballspeed: number, playerspeed: number) {
        const newball: ball = {
            x: maxx / 2,
            y: maxy / 2,
            angle: this.randomIntFromInterval(0, 360) * (Math.PI / 180),
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
            status: "in-game",
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

    checkPlayerb(player: alive, tocheck: ball): boolean {
        const dx = player.x - tocheck.x;
        const dy = player.y - tocheck.y;

        const distanceSquared = dx * dx + dy * dy;

        const radiusSum = (player.hitbox / 2) + (tocheck.hitbox / 2);
        const radiusSumSquared = radiusSum * radiusSum;

        return (distanceSquared <= radiusSumSquared);
    }

    calcPlayerdisx(x: number, y: number, rad: number, tocheck: alive): number {
        const dx = x - tocheck.x;
        const dy = y - tocheck.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const radiusSum = (rad / 2) + (tocheck.hitbox / 2);

        return (Math.sign(dx) * (radiusSum - distance));
    }

    calcPlayerdisy(x: number, y: number, rad: number, tocheck: alive): number {
        const dx = x - tocheck.x;
        const dy = y - tocheck.y;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const radiusSum = (rad / 2) + (tocheck.hitbox / 2);

        return (Math.sign(dy) * (radiusSum - distance));
    }

    checkPlayerp(x: number, y: number, rad: number, tocheck: alive): boolean {
        const dx = x - tocheck.x;
        const dy = y - tocheck.y;

        const distanceSquared = dx * dx + dy * dy;

        const radiusSum = (rad / 2) + (tocheck.hitbox / 2);
        const radiusSumSquared = radiusSum * radiusSum;

        return (distanceSquared <= radiusSumSquared);
    }

    getplayer(user: string, game: GameSession) {
        for (const player of game.alive)
            if (player.player === user)
                return (game.alive.indexOf(player));
        return (-1);
    }

    killplayer(index: number, game: GameSession) {
        game.dead.push(game.alive[index].player);
        game.alive.splice(index, 1);

        return (-1);
    }

    checkcolission(game: GameSession) {
        game.alive = game.alive.filter(player => {
        for (const ball of game.ball) {
                if (this.checkPlayerb(player, ball))
                {
                    game.dead.push(player.player);
                    return false;
                }
            }
            return true;
        });
    }

    flipXangle(angle: number) {
        return (Math.PI - angle + 2 * Math.PI) % (2 * Math.PI);
    }

    flipYangle(angle: number) {
        return (2 * Math.PI - angle) % (2 * Math.PI);
    }

    flipangle(angle: number) {
        return (angle + Math.PI) % (2 * Math.PI);
    }

    calculateNewPosition(current: ball, maxx: number, maxy: number) {
        let vx = current.speed * Math.cos(current.angle);
        let vy = current.speed * Math.sin(current.angle);

        /* just in case i decide to add deltatime later
        const dx = vx * deltaTime;
        const dy = vy * deltaTime;
        */
    
        if (current.x + vx + (current.hitbox / 2) >= maxx)
        {
            current.x = maxx - (current.hitbox / 2)
            current.angle = this.flipXangle(current.angle);
        }
        else if (current.x + vx - (current.hitbox / 2) < 0)
        {
            current.x = 0 + (current.hitbox / 2)
            current.angle = this.flipXangle(current.angle);  
        }
        else
            current.x += vx;

        if (current.y + vy + (current.hitbox / 2) >= maxy)
        {
            current.y = maxy - (current.hitbox / 2)
            current.angle = this.flipYangle(current.angle);
        }
        else if (current.y + vy - (current.hitbox / 2) <= 0)
        {
            current.y = 0 + (current.hitbox / 2)
            current.angle = this.flipYangle(current.angle);  
        }
        else
            current.y += vy;
    }

    playframe(game: GameSession)
    {
        this.checkcolission(game);
        for (const balls of game.ball)
            this.calculateNewPosition(balls, game.borderx, game.bordery);
        this.checkcolission(game);
    }

    spawnball(game: GameSession, maxx: number, maxy: number, ballhitbox: number, ballspeed: number)
    {
        const newball: ball = {
            x: maxx / 2,
            y: maxy / 2,
            angle: this.randomIntFromInterval(0, 360) * (Math.PI / 180),
            hitbox: ballhitbox,
            speed: ballspeed,
        }

        game.ball.push(newball);
    }

    moveplayerdown(game: GameSession, userId: string) {
        let newy = -1;

        for (const player of game.alive)
        {
            if (userId === player.player)
            {
                newy = player.y;
                newy += player.speed;
                if (newy + (player.hitbox / 2) > game.bordery)
                    newy = game.bordery - (player.hitbox / 2);
                for (const otplayer of game.alive)
                {
                    if (otplayer.player !== userId)
                    {
                        if (this.checkPlayerp(player.x, newy, player.hitbox, otplayer))
                            newy += this.calcPlayerdisy(player.x, newy, player.hitbox, otplayer);
                    }
                }
                player.y = newy;
            }
        }
    }

    moveplayerleft(game: GameSession, userId: string) {
        let newx = -1;
 
        for (const player of game.alive)
        {
            if (userId === player.player)
            {
                newx = player.x;
                newx -= player.speed;
                if (newx - (player.hitbox / 2) < 0)
                    newx = 0 + (player.hitbox / 2);
                for (const otplayer of game.alive)
                {
                    if (otplayer.player !== userId)
                    {
                        if (this.checkPlayerp(newx, player.y, player.hitbox, otplayer))
                            newx += this.calcPlayerdisx(newx, player.y, player.hitbox, otplayer);
                    }
                }
                player.x = newx;
            }
        }
    }

    moveplayerup(game: GameSession, userId: string) {
        let newy = -1;

        for (const player of game.alive)
        {
            if (userId === player.player)
            {
                newy = player.y;
                newy -= player.speed;
                if (newy - (player.hitbox / 2) < 0)
                    newy = 0 + (player.hitbox / 2);
                for (const otplayer of game.alive)
                {
                    if (otplayer.player !== userId)
                    {
                        if (this.checkPlayerp(player.x, newy, player.hitbox, otplayer))
                            newy += this.calcPlayerdisy(player.x, newy, player.hitbox, otplayer);
                    }
                }
                player.y = newy;
            }
        }
    }

    moveplayerright(game: GameSession, userId: string) {
        let newx = -1;

        for (const player of game.alive)
        {
            if (userId === player.player)
            {
                newx = player.x;
                newx += player.speed;
                if (newx + (player.hitbox / 2) > game.borderx)
                    newx = game.borderx - (player.hitbox / 2);
                for (const otplayer of game.alive)
                {
                    if (otplayer.player !== userId)
                    {
                        if (this.checkPlayerp(newx, player.y, player.hitbox, otplayer))
                            newx += this.calcPlayerdisx(newx, player.y, player.hitbox, otplayer);
                    }
                }
                player.x = newx;
            }
        }
    }
}

export const gameManager = new GameManager();

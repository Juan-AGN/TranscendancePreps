import { Lobby, Lobbys, LobbyAction, WsAction, Errors, GameSession, GameAction, GameResults, Ruleset, RulesState, changeErrors } from "./types";
import { WebSocketServer, WebSocket } from "ws";
import { gameManager } from "./gameManager";
import { stat } from "fs";
import { isNumberObject } from "util/types";

class RulesetHandler {
    waitingnewball = 5000;
    maxx = 1000;
    maxy = 750;
    ballhitbox = 50; // prev: 90
    playerhitbox = 90;
    ballspeed = 10;
    playerspeed = 10;
    speedrandom = 10;
    hitboxrandom = 0;

    capwaitingnewball = 100000;
    lowcapwaitingnewball = 1000;

    capmaxx = 2000;
    lowcapmaxx = 600;

    capmaxy = 2000;
    lowcapmaxy = 600;

    capballhitbox = 300;
    lowcapballhitbox = 30; 

    capplayerhitbox = 300;
    lowcapplayerhitbox = 30;

    capballspeed = 30;
    lowcapballspeed = 1;

    capplayerspeed = 20;
    lowcapplayerspeed = 1; 

    capspeedrandom = 15;
    lowcapspeedrandom = 1;

    caphitboxrandom = 10;
    lowcaphitboxrandom = 0;

    defaultruleset() {
        const toset: Ruleset = {
            waitingnewball: this.waitingnewball,
            maxx: this.maxx,
            maxy: this.maxy,
            ballhitbox: this.ballhitbox,
            playerhitbox: this.playerhitbox,
            ballspeed: this.ballspeed,
            playerspeed: this.playerspeed,
            speedrandom: this.speedrandom,
            hitboxrandom: this.hitboxrandom,
        }

        return (toset);
    }

    newrules(lob: Lobby, rules: Ruleset) {
        const toset: Ruleset = this.defaultruleset();

        const status: RulesState = {
            waitingnewball: changeErrors.NOCHANGE,
            maxx: changeErrors.NOCHANGE,
            maxy: changeErrors.NOCHANGE,
            ballhitbox: changeErrors.NOCHANGE,
            playerhitbox: changeErrors.NOCHANGE,
            ballspeed: changeErrors.NOCHANGE,
            playerspeed: changeErrors.NOCHANGE,
            speedrandom: changeErrors.NOCHANGE,
            hitboxrandom: changeErrors.NOCHANGE,
        }

        if (!rules)
            return (undefined);

        if (rules.waitingnewball != undefined)
        {
            if (!Number.isFinite(rules.waitingnewball))
                status.waitingnewball = changeErrors.NOTNUMBER;
            else if (rules.waitingnewball > this.capwaitingnewball)
                status.waitingnewball = changeErrors.TOOHIGH;
            else if (rules.waitingnewball < this.lowcapwaitingnewball)
                status.waitingnewball = changeErrors.TOOLOW;
            else
            {
                toset.waitingnewball = rules.waitingnewball;
                status.waitingnewball = changeErrors.SUCCESS;
            }
        }

        if (rules.maxx != undefined)
        {
            if (!Number.isFinite(rules.maxx))
                status.maxx = changeErrors.NOTNUMBER;
            else if (rules.maxx > this.capmaxx)
                status.maxx = changeErrors.TOOHIGH;
            else if (rules.maxx < this.lowcapmaxx)
                status.maxx = changeErrors.TOOLOW;
            else
            {
                toset.maxx = rules.maxx;
                status.maxx = changeErrors.SUCCESS;
            }
        }
    
        if (rules.maxy != undefined)
        {
            if (!Number.isFinite(rules.maxy))
                status.maxy = changeErrors.NOTNUMBER;
            else if (rules.maxy > this.capmaxy)
                status.maxy = changeErrors.TOOHIGH;
            else if (rules.maxy < this.lowcapmaxy)
                status.maxy = changeErrors.TOOLOW;
            else
            {
                toset.maxy = rules.maxy;
                status.maxy = changeErrors.SUCCESS;
            }
        }

        if (rules.ballhitbox != undefined)
        {
            if (!Number.isFinite(rules.ballhitbox))
                status.ballhitbox = changeErrors.NOTNUMBER;
            else if (rules.ballhitbox > this.capballhitbox)
                status.ballhitbox = changeErrors.TOOHIGH;
            else if (rules.ballhitbox < this.lowcapballhitbox)
                status.ballhitbox = changeErrors.TOOLOW;
            else
            {
                toset.ballhitbox = rules.ballhitbox;
                status.ballhitbox = changeErrors.SUCCESS;
            }
        }

        if (rules.playerhitbox != undefined)
        {
            if (!Number.isFinite(rules.playerhitbox))
                status.playerhitbox = changeErrors.NOTNUMBER;
            else if (rules.playerhitbox > this.capplayerhitbox)
                status.playerhitbox = changeErrors.TOOHIGH;
            else if (rules.playerhitbox < this.lowcapplayerhitbox)
                status.playerhitbox = changeErrors.TOOLOW;
            else
            {
                toset.playerhitbox = rules.playerhitbox;
                status.playerhitbox = changeErrors.SUCCESS;
            }
        }

        if (rules.ballspeed != undefined)
        {
            if (!Number.isFinite(rules.ballspeed))
                status.ballspeed  = changeErrors.NOTNUMBER;
            else if (rules.ballspeed> this.capballspeed)
                status.ballspeed  = changeErrors.TOOHIGH;
            else if (rules.ballspeed < this.lowcapballspeed)
                status.ballspeed  = changeErrors.TOOLOW;
            else
            {
                toset.ballspeed  = rules.ballspeed ;
                status.ballspeed  = changeErrors.SUCCESS;
            }
        }

        if (rules.playerspeed != undefined)
        {
            if (!Number.isFinite(rules.playerspeed))
                status.playerspeed = changeErrors.NOTNUMBER;
            else if (rules.playerspeed > this.capplayerspeed)
                status.playerspeed = changeErrors.TOOHIGH;
            else if (rules.playerspeed < this.lowcapplayerspeed)
                status.playerspeed = changeErrors.TOOLOW;
            else
            {
                toset.playerspeed = rules.playerspeed;
                status.playerspeed = changeErrors.SUCCESS;
            }
        }

        if (rules.speedrandom != undefined)
        {
            if (!Number.isFinite(rules.speedrandom))
                status.speedrandom = changeErrors.NOTNUMBER;
            else if (rules.speedrandom > this.capspeedrandom)
                status.speedrandom = changeErrors.TOOHIGH;
            else if (rules.speedrandom < this.lowcapspeedrandom)
                status.speedrandom = changeErrors.TOOLOW;
            else
            {
                toset.speedrandom = rules.speedrandom;
                status.speedrandom = changeErrors.SUCCESS;
            }
        }

        if (rules.hitboxrandom != undefined)
        {
            if (!Number.isFinite(rules.hitboxrandom))
                status.hitboxrandom = changeErrors.NOTNUMBER;
            else if (rules.hitboxrandom > this.caphitboxrandom)
                status.hitboxrandom = changeErrors.TOOHIGH;
            else if (rules.hitboxrandom < this.lowcaphitboxrandom)
                status.hitboxrandom = changeErrors.TOOLOW;
            else
            {
                toset.hitboxrandom = rules.hitboxrandom;
                status.hitboxrandom = changeErrors.SUCCESS;
            }
        }

        lob.rules = toset;
        return (status);
    }
}

export const rulesetHandler = new RulesetHandler();

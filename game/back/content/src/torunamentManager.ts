import { Lobby, Lobbys, LobbyAction, WsAction, Errors, GameSession, GameAction, GameResults, Ruleset, RulesState, changeErrors } from "./types";
import { WebSocketServer, WebSocket } from "ws";
import { gameManager } from "./gameManager";
import { rulesetHandler } from "./rulesetHandler";
import { stat } from "fs";
import { isNumberObject } from "util/types";

class TournamentManager {

}

export const tournamentManager = new TournamentManager();

export interface Lobby {
  id: string;
  hostId: string;
  players: string[];
  spectators: string[];
  status: "waiting" | "in-game";
  rules: Ruleset;
}

export interface Lobbys {
  all: Lobby[];
}

export interface alive {
  player: string;
  x: number;
  y: number;
  hitbox: number;
  speed: number;
}

export interface ball {
  x: number;
  y: number;
  angle: number; 
  hitbox: number;
  speed: number;
}

export interface Ruleset {
  waitingnewball: number; // 5000
  maxx: number; // 1000
  maxy: number;  // 750
  ballhitbox: number; // 50 -- prev 90
  playerhitbox: number; // 90
  ballspeed: number; // 10
  playerspeed: number; // 10
  speedrandom: number; // 10
  hitboxrandom: number; // 0 
  maxballs: number; // 0
}

export interface RulesState {
  waitingnewball: changeErrors; // 5000
  maxx: changeErrors; // 1000
  maxy: changeErrors;  // 750
  ballhitbox: changeErrors; // 50 -- prev 90
  playerhitbox: changeErrors; // 90
  ballspeed: changeErrors; // 10
  playerspeed: changeErrors; // 10
  speedrandom: changeErrors; // 10
  hitboxrandom: changeErrors; // 0 
  maxballs: changeErrors;
}

export interface GameSession {
  id: string;
  alive: alive[];
  dead: string[];
  ball: ball[];
  borderx: number;
  bordery: number;
  status: "in-game" | "finished";
}

export interface GameResults {
  first: string;
  second: string;
  third: string;
  fourth: string;
}

export enum LobbyAction {
  JOIN = "JOIN",
  SPECTATOR = "SPECTATOR",
  LEAVE = "LEAVE",
  HOST = "HOST",
  SWITCHTOPLAYER = "SWITCHTOPLAYER",
  LEAVESPECTATOR = "LEAVESPECTATOR",
  STARTGAME = "STARTGAME",
  UPDATERULESET = "UPDATERULESET",
}

export enum GameAction {
  START = "START",
  END = "END",
  STATE = "STATE",
}

export enum GameResult {
  WIN = "WIN",
  LOSE = "LOSE",
}

export enum GamePlacement {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD",
  FOURTH = "FOURTH",
}

export enum WsAction {
    LOBBYUPDATE = "LOBBYUPDATE",
    GAMESTATE = "GAMESTATE",
    GAMERESULT = "GAMERESULT",
}

export enum Errors {
    NOTHOST = "NOTHOST",
    NOLOBBY = "NOLOBBY",
    NOPLAYERS = "NOTENOUGHPLAYERS",
    INGAME = "INGAME",
}

export enum changeErrors {
    TOOLOW = "TOOLOW",
    SUCCESS= "SUCCESS",
    UNKNOWN = "UNKNOWN",
    TOOHIGH = "TOOHIGH",
    NOCHANGE = "NOCHANGE",
    NOTNUMBER = "NOTNUMBER",
}

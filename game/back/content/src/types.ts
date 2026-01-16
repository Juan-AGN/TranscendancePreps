export interface Lobby {
  id: string;
  hostId: string;
  players: string[];
  spectators: string[];
  status: "waiting" | "in-game";
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

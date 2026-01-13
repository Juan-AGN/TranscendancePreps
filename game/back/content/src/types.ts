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
}

export enum LobbyAction {
    JOIN = "JOIN",
    SPECTATOR = "SPECTATOR",
    LEAVE = "LEAVE",
    HOST = "HOST",
    SWITCHTOPLAYER = "SWITCHTOPLAYER",
    LEAVESPECTATOR = "LEAVESPECTATOR"
}

export enum WsAction {
    LOBBYUPDATE = "LOBBYUPDATE"
}

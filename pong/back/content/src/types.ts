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

export interface GameSession {
  id: string;
  players: string[];
  state: any;
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

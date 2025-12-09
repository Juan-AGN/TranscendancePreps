export interface Lobby {
  id: string;
  hostId: string;
  players: string[];
  status: "waiting" | "in-game";
}

export interface GameSession {
  id: string;
  players: string[];
  state: any;
}
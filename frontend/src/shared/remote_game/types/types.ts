export interface Lobby {
  id: string;
  hostId: number;
  players: number[];
  spectators: number[];
  status: "waiting" | "in-game";
  rules: Ruleset;
}

export interface Lobbys {
  all: Lobby[];
}

export interface alive {
  player: number;
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
  collision: boolean; // true
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
  collision: changeErrors;
}

export interface GameSession {
  id: string;
  alive: alive[];
  dead: number[];
  ball: ball[];
  borderx: number;
  bordery: number;
  status: "in-game" | "finished";
  rules: Ruleset;
}

export interface GameResults {
  first: number;
  second: number;
  third: number;
  fourth: number;
}

export interface UserData{
  id: number,
  name: string,
  email: string,
  avatar: string,
  onlineStatus: boolean,
  lastConnection: Date,
  createdAt: Date
}

export const LobbyAction = {
  JOIN : "JOIN",
  SPECTATOR : "SPECTATOR",
  LEAVE : "LEAVE",
  HOST : "HOST",
  SWITCHTOPLAYER : "SWITCHTOPLAYER",
  SWITCHTOSPECTATOR : "SWITCHTOSPECTATOR",
  LEAVESPECTATOR : "LEAVESPECTATOR",
  STARTGAME : "STARTGAME",
  UPDATERULESET : "UPDATERULESET",
} as const;

export const GameAction = {
  START : "START",
  END : "END",
  STATE : "STATE",
} as const;

export const GameResult = {
  WIN : "WIN",
  LOSE : "LOSE",
} as const;

export const GamePlacement = {
  FIRST : "FIRST",
  SECOND : "SECOND",
  THIRD : "THIRD",
  FOURTH : "FOURTH",
} as const;

export const WsAction = {
  LOBBYUPDATE : "LOBBYUPDATE",
  GAMESTATE : "GAMESTATE",
  GAMERESULT : "GAMERESULT",
} as const;

export const Errors = {
  NOTHOST : "NOTHOST",
  NOLOBBY : "NOLOBBY",
  NOPLAYERS : "NOTENOUGHPLAYERS",
  INGAME : "INGAME",
} as const;

export const changeErrors = {
  TOOLOW : "TOOLOW",
  SUCCESS: "SUCCESS",
  UNKNOWN : "UNKNOWN",
  TOOHIGH : "TOOHIGH",
  NOCHANGE : "NOCHANGE",
  NOTNUMBER : "NOTNUMBER",
} as const;
export type changeErrors = typeof changeErrors[keyof typeof changeErrors];

export const generalErrors = {
  WORKED : 0,

  ALREADYINTHELOBBY : 1001,
  ALREADYINALOBBY : 1002,

  LOBBYDOESNTEXIST : 1003,
  LOBBYALREADYEXIST : 1006,

  INVALIDNAME : 1004,
  RULESNOTPROVIDED : 1005,

  NOTANEXPECTATOR : 2001,
  NOTAPLAYER : 2002,
  NOTINALOBBY : 2003,
  NOTHOST : 2004,

  NOWS : 3001,
  LOBBYINGAME : 3002,

  NOTINTHELOBBY : 3003,
  PLAYERSFULL : 3004,
  NOTENOUGHPLAYERS : 3005,

  RULESERROR : 4001
} as const;


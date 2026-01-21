# **GAME GUIDE**

## — What's this all about? —

This README is a small guide on the game for our **ft_transcendence**.  
Here you will find:

1. How it works
2. Interfaces
3. ENUMs
4. Endpoints
5. WebSockets
6. Cases of possible errors

All of this is for using the game backend to have your own games.

---

##  — How it works —

The game backend consists of:
- a **Lobby Manager** for the creation of games,
- a **Game Manager** to handle all game logic,
- and a **Rules Manager** to check and apply the rules passed.

Below is a more detailed explanation of each manager.

---

###  Lobby Manager 

This is the core of the backend. This class stores all of the:

- Lobbies
- Connected users
- WebSockets
- HashMaps

This is also where broadcasting to WebSockets is handled.  
Inputs are related to their users, and lobbies can be created, joined, spectated, and used.

---

###  Game Manager 

This class applies the rules of the game.  
It stores no information and only operates over the `Game` interface, returning the updated state.

As mentioned, this class does not store data.  
It only contains methods which are called by the Lobby Manager with an ongoing game as a parameter.

---

###  Rules Manager 

This class contains all default rule parameters, their limits, and the logic to apply them.

It contains two methods:
- One for creating a rules instance with default values
- Another for modifying rules

These methods are always called by the Lobby Manager.

---

## — Interfaces —
---
###  Lobby 

```ts
export interface Lobby {
  id: string;
  hostId: string;
  players: string[];
  spectators: string[];
  status: "waiting" | "in-game";
  rules: Ruleset;
}
```
This is the lobby, the one that represent a game with players and will be associated to the game, its only deleted when there are no users left.


Field descriptions:

- **id:** The lobby’s name.

- **hostId:** The name of the admin user of the lobby.

- **players:** An array of users currently in the lobby.

- **spectators:** An array of spectators currently in the lobby.

- **status:** Indicates whether a game is running or not.

- **rules:** The rules used in the lobby.
---
###  Lobbys

```ts
export interface Lobbys {
  all: Lobby[];
}
```

This is an array of lobbys containing all of the current lobbys, nothing else.


Field descriptions:

- **all:** The lobbys in an array.
---
###  GameSession

```ts
export interface GameSession {
  id: string;
  alive: alive[];
  dead: string[];
  ball: ball[];
  borderx: number;
  bordery: number;
  status: "in-game" | "finished";
}
```

This is an representation of an ongoing game,it will always be associated with a lobby.


Field descriptions:

- **id:** The name of the lobby that contains the game.

- **alive:** An array that contains the players that are still alive.

- **dead:** An array that contains the name of the dead players (the first one in the array is the first one that died).

- **ball:** An array that contains all balls currently in game.

- **borderx:** The x border of the game.

- **bordery:** The y border of the game.

- **status:** The game status (is it still running or did it finish?).
---
###  Alive

```ts
export interface alive {
  player: string;
  x: number;
  y: number;
  hitbox: number;
  speed: number;
}
```

This is an representation of an live player in a game, it contains all of the relevant info for the game.


Field descriptions:

- **player:** The player’s name.

- **x:** Its x´s coordenates.

- **y:** Its y´s coordenates.

- **hitbox:** An number representing the distance from the mos left to the most left of the player hitbox (the players are spheres, so to get the rai¡dious is hitbox / 2).

- **speed:** The player´s speed.
---
###  Ball

```ts
export interface ball {
  x: number;
  y: number;
  angle: number; 
  hitbox: number;
  speed: number;
}
```

This is an representation of an ball thats currently in game, it contains all of the relevant info for the game.


Field descriptions:

- **x:** Its x´s coordenates.

- **y:** Its y´s coordenates.

- **angle:** The angle that the ball’s facing.

- **hitbox:** An number representing the distance from the most left to the most left of the ball´s hitbox (the players are spheres, so to get the radious is hitbox / 2).

- **speed:** The ball´s speed.
---
###  Ruleset

```ts
export interface Ruleset {
  waitingnewball: number;
  maxx: number;
  maxy: number;
  ballhitbox: number;
  playerhitbox: number;
  ballspeed: number;
  playerspeed: number;
  speedrandom: number;
  hitboxrandom: number;
  maxballs: number;
}
```

The rules of a game.


Field descriptions:

- **waitingnewball:** The cooldown in miliseconds for a ball to spawn, in the default ruleset a new ball spawns every 5 seconds (5000 / 1000).

- **maxx:** How wide is the game, representing the wall at the right of the game, in the default ruleset the width is 1000.

- **maxx:** How high is the game, representing the wall at the bottom of the game, in the default ruleset the height is 750.

- **ballhitbox:** The balls standard hitbox, in the default ruleset this is set to 50.

- **playerhitbox:** The players standard hitbox, in the default ruleset this is set to 90.

- **ballspeed:** The balls standard speed, in the default ruleset this is set to 10.

- **playerhitbox:** The players standard speed, in the default ruleset this is set to 10.

- **speedrandom:** An modifier to the ball speed affecting only new balls making it so the speed can be a number between ballspeed - speedrandom (if lower than cero, sets to 0) and ballspeed + speedrandom, in the default ruleset this is set to 10 (speed between 0 and 20).

- **hitboxrandom:** An modifier to the ball hitbox affecting only new balls making it so the hitbox can be a number between ballhitbox - hitboxrandom and ballhitbox + hitboxrandom, in the default ruleset this is set to 0 (hitbox between 50 and 50).

- **maxballs:** the maximun of balls that can spawn (if 0, there is no maximun), the default vlue is 0 (infinite balls).
---
###  RulesetState

```ts
export interface RulesState {
  waitingnewball: changeErrors;
  maxx: changeErrors;
  maxy: changeErrors;
  ballhitbox: changeErrors;
  playerhitbox: changeErrors;
  ballspeed: changeErrors;
  playerspeed: changeErrors;
  speedrandom: changeErrors;
  hitboxrandom: changeErrors;
  maxballs: changeErrors;
}
```

This mirrors the Ruleset class, it contains if a rule is changed or ifit had an error changing via an Enum (changeErrors is an enum for easy change of the text if needed on a future).

---
###  GameResults

```ts
export interface GameResults {
  first: string;
  second: string;
  third: string;
  fourth: string;
}
```

The results of a game, if there is no fourth palce or third place thos fields will be set to "".

---

## — ENUMs —
---
###  changeErrors

```ts
export enum changeErrors {
    TOOLOW = "TOOLOW",
    SUCCESS= "SUCCESS",
    UNKNOWN = "UNKNOWN",
    TOOHIGH = "TOOHIGH",
    NOCHANGE = "NOCHANGE",
    NOTNUMBER = "NOTNUMBER",
}
```

An enum for the possible errors or ssuccess when changing the rules.

---
###  Errors

```ts
export enum Errors {
    NOTHOST = "NOTHOST",
    NOLOBBY = "NOLOBBY",
    NOPLAYERS = "NOTENOUGHPLAYERS",
    INGAME = "INGAME",
}
```

An enum for the possible lobby errrors when trying to start the game.

---
###  WsAction

```ts
export enum WsAction {
    LOBBYUPDATE = "LOBBYUPDATE",
    GAMESTATE = "GAMESTATE",
    GAMERESULT = "GAMERESULT",
}
```

An enum for the possible websocket actions, it will be sent by the server to a websocket connected to send an update about something.

---
###  LobbyAction

```ts
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
```

An enum for the possible lobbys actions, it will be sent when an action is done toa lobby to all the websockets connected.

---
###  GameAction

```ts
export enum GameAction {
  START = "START",
  END = "END",
  STATE = "STATE",
}
```

An enum for the possible game updates, it will be sent to all players in game with websockets connected.

---
###  GameResult

```ts
export enum GameResult {
  WIN = "WIN",
  LOSE = "LOSE",
}
```

An enum for your result in the game, you win or you lose, just that.

---
###  GameResult

```ts
export enum GamePlacement {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD",
  FOURTH = "FOURTH",
}
```

An enum for your placement in the game.

---
##  — Endpoints —
###  /

Returns the service state ({ message: "Game Service Running" }).

###  /lobbies

Returns the interface lobbys, containing all existing lobbys.

###  /lobbies/create

Tryes to create an lobby, requires lobbyId(the name of the lobby) and hostId(the name of the user creating the lobby).

If succesfull creates the lobby

###  /lobbies/checkout

Tryes to create an lobby, requires lobbyId(the name of the lobbyor "") and hostId(the name of the user in a lobby or "").

If lobbyId is not set to "", it will return the lobby lobbyId, else it will return the lobby containing player hostId.

###  /lobbies/join

Tryes to join an lobby, requires lobbyId(the name of the lobby) and hostId(the name of the user joining the lobby).

If succesfull, returns the lobby joined.

###  /lobbies/leave

Tryes to leave an lobby, requires lobbyId(the name of the lobby) and hostId(the name of the user leaving the lobby).

If succesfull, it will return the interface lobbys, containing all existing lobbys.

###  /lobbies/ruleset

Tryes to change an lobby´s ruleset, requires lobbyId(the name of the lobby), hostId(the name of the user changing the ruleset) and ruleset(an interface Ruleset containing the desires changes).

If succesfull, it will return:

message: changeErrors.SUCCESS

and

status: an RulesetState containing if each field was succesfull or had an error.

###  /lobbies/start

Tryes to start a game, requires lobbyId(the name of the lobby starting) and hostId(the name of the user creating the starting the game).

If succesfull, it will return "starting".

##  — Websockets—

### Connection to server:
The server, upon ws connection, will only accept the connection if it contains an **userId** as an parameter, else, the connection attemp will be vlosed.

### Server sending:
Thse server will always send action: WsAction enum, and depending on the action, you will able to know the rest of the package.

these packages are also sneded to the spectators.


#### -- LOBBYUPDATE
({type: WsAction.LOBBYUPDATE, lobby: id, user: player, action: action})

This is an update on whats happening in the lobby, it will send:


--**lobby:** The name of the lobby that received a change.

--**user:** The name of the lobby that received a change.

--**action:** An LobbyAction enum containing the action that happened.

---

#### -- GAMESTATE
({type: WsAction.GAMESTATE, context: action, game: game})

This is an update on whats happening in the lobby, it will send:


--**context:** If the game started, if its an update on the game state or if the game ended via an GameAction, the most common one will be GAMESTATE to send the next frame of game.

--**game:** GameState interface containing the game itself.

---

#### -- GAMERESULT
({type: WsAction.GAMERESULT, results: result})

This is the result of the game, containing an GameResults interface:


--**result:** The GameResults interface of the played (or spectated) game.

### User sending:
Thse server expects either **"W"**, **"A"**, **"S"** and **"D"** for the player´s movement.

# **GAME GUIDE**

## — What's this all about? —

This README is a small guide on the game for our **ft_transcendence**.  
Here you will find:

1. How it works
2. Authentication
3. Interfaces
4. ENUMs
5. Endpoints
6. WebSockets
7. Cases of possible errors

All of this is for using the game backend to have your own games.

---

## — How it works —

The game backend consists of:
- a **Lobby Manager** for the creation of games,
- a **Game Manager** to handle all game logic,
- and a **Rules Manager** to check and apply the rules passed.

Below is a more detailed explanation of each manager.

---

### Lobby Manager

This is the core of the backend. This class stores all of the:

- Lobbies
- Connected users
- WebSockets
- HashMaps

This is also where broadcasting to WebSockets is handled.  
Inputs are related to their users, and lobbies can be created, joined, spectated, and used.

---

### Game Manager

This class applies the rules of the game.  
It stores no information and only operates over the `Game` interface, returning the updated state.

As mentioned, this class does not store data.  
It only contains methods which are called by the Lobby Manager with an ongoing game as a parameter.

---

### Rules Manager

This class contains all default rule parameters, their limits, and the logic to apply them.

It contains two methods:
- One for creating a rules instance with default values
- Another for modifying rules

These methods are always called by the Lobby Manager.

---

## — Authentication —

This version of the game backend no longer identifies users by a freely chosen name (`hostId` as a string). Instead, users are identified by a **numeric user id** (`id: number`) taken from a verified JWT.

### HTTP requests

Every HTTP endpoint (except `/` and `/lobbies`) is protected by an auth middleware. You must send:

```
Authorization: Bearer <token>
```

The middleware verifies the token (using the `JWT_SECRET` environment variable, falling back to a default secret if unset), and on success attaches the decoded payload to the request as:

```ts
req.user = {
  id: number;
  email: string;
};
```

From then on, **`req.user.id` is used as the player/host identifier everywhere** — you no longer send a `hostId` in the body for this purpose; it is taken straight from your token.

If the token is missing, malformed, or expired, the request is rejected with a `401` and an error message.

### WebSocket connections

The WebSocket server expects the JWT to be passed as a **query parameter** named `token`:

```
ws://<host>:8888/?token=<your-jwt>
```

If the token is missing or invalid, the connection is closed (code `4001`, "Unauthorized"). If the decoded token has no `id`, the connection is closed as well (code `1008`). On success, the numeric `id` from the token is used as your `userId` for the rest of the connection (movement packets, lobby/game updates, etc.).

---

## — Interfaces —
---
### Lobby

```ts
export interface Lobby {
  id: string;
  hostId: number;
  players: number[];
  spectators: number[];
  status: "waiting" | "in-game";
  rules: Ruleset;
}
```

This is the lobby, the one that represents a game with players, and it will be associated to the game. It's only deleted when there are no users left.

Field descriptions:

- **id:** The lobby's name.
- **hostId:** The numeric user id of the admin user of the lobby.
- **players:** An array of user ids currently in the lobby.
- **spectators:** An array of spectator user ids currently in the lobby.
- **status:** Indicates whether a game is running or not.
- **rules:** The rules used in the lobby.

---
### Lobbys

```ts
export interface Lobbys {
  all: Lobby[];
}
```

This is an array of lobbys containing all of the current lobbys, nothing else.

Field descriptions:

- **all:** The lobbys in an array.

---
### GameSession

```ts
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
```

This is a representation of an ongoing game. It will always be associated with a lobby.

Field descriptions:

- **id:** The name of the lobby that contains the game.
- **alive:** An array that contains the players that are still alive.
- **dead:** An array that contains the user ids of the dead players (the first one in the array is the first one that died).
- **ball:** An array that contains all balls currently in game.
- **borderx:** The x border of the game.
- **bordery:** The y border of the game.
- **status:** The game status (is it still running or did it finish?).
- **rules:** The ruleset this game session is running with.

---
### Alive

```ts
export interface alive {
  player: number;
  x: number;
  y: number;
  hitbox: number;
  speed: number;
}
```

This is a representation of a live player in a game, it contains all of the relevant info for the game.

Field descriptions:

- **player:** The player's numeric user id.
- **x:** Its x coordinate.
- **y:** Its y coordinate.
- **hitbox:** A number representing the distance from the most left to the most right of the player's hitbox (the players are spheres, so to get the radius is hitbox / 2).
- **speed:** The player's speed.

---
### Ball

```ts
export interface ball {
  x: number;
  y: number;
  angle: number; 
  hitbox: number;
  speed: number;
}
```

This is a representation of a ball that's currently in game, it contains all of the relevant info for the game.

Field descriptions:

- **x:** Its x coordinate.
- **y:** Its y coordinate.
- **angle:** The angle that the ball's facing.
- **hitbox:** A number representing the distance from the most left to the most right of the ball's hitbox (the balls are spheres, so to get the radius is hitbox / 2).
- **speed:** The ball's speed.

---
### Ruleset

```ts
export interface Ruleset {
  waitingnewball: number; // 5000
  maxx: number; // 1000
  maxy: number;  // 750
  ballhitbox: number; // 50
  playerhitbox: number; // 90
  ballspeed: number; // 10
  playerspeed: number; // 10
  speedrandom: number; // 10
  hitboxrandom: number; // 0 
  maxballs: number; // 0
  collision: boolean; // true
}
```

The rules of a game.

Field descriptions:

- **waitingnewball:** The cooldown in milliseconds for a ball to spawn, in the default ruleset a new ball spawns every 5 seconds (5000 / 1000).
- **maxx:** How wide the game is, representing the wall at the right of the game, in the default ruleset the width is 1000.
- **maxy:** How high the game is, representing the wall at the bottom of the game, in the default ruleset the height is 750.
- **ballhitbox:** The ball's standard hitbox, in the default ruleset this is set to 50.
- **playerhitbox:** The player's standard hitbox, in the default ruleset this is set to 90.
- **ballspeed:** The ball's standard speed, in the default ruleset this is set to 10.
- **playerspeed:** The player's standard speed, in the default ruleset this is set to 10.
- **speedrandom:** A modifier to the ball speed affecting only new balls, making it so the speed can be a number between ballspeed - speedrandom (if lower than zero, sets to 0) and ballspeed + speedrandom, in the default ruleset this is set to 10 (speed between 0 and 20).
- **hitboxrandom:** A modifier to the ball hitbox affecting only new balls, making it so the hitbox can be a number between ballhitbox - hitboxrandom and ballhitbox + hitboxrandom, in the default ruleset this is set to 0 (hitbox between 50 and 50).
- **maxballs:** The maximum amount of balls that can spawn (if 0, there is no maximum), the default value is 0 (infinite balls).
- **collision:** Whether player-vs-player collision is enabled, in the default ruleset this is set to `true`. When `false`, players can pass through each other and only ball collisions are checked.

---
### RulesState

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
  collision: changeErrors;
}
```

This mirrors the `Ruleset` interface, including the new **collision** field. It contains whether each rule was changed, or if it had an error changing, via the `changeErrors` enum (an enum is used for easy change of the text if needed in the future).

---
### GameResults

```ts
export interface GameResults {
  first: number;
  second: number;
  third: number;
  fourth: number;
}
```

The results of a game, expressed as the numeric user ids of the placed players. If there is no third or fourth place, those fields will be set to `0` instead of an empty string (since the fields are now numeric, not strings).

---

## — ENUMs —
---
### changeErrors

```ts
export enum changeErrors {
    TOOLOW = "TOOLOW",
    SUCCESS = "SUCCESS",
    UNKNOWN = "UNKNOWN",
    TOOHIGH = "TOOHIGH",
    NOCHANGE = "NOCHANGE",
    NOTNUMBER = "NOTNUMBER",
}
```

An enum for the possible errors or success when changing the rules.

---
### Errors

```ts
export enum Errors {
    NOTHOST = "NOTHOST",
    NOLOBBY = "NOLOBBY",
    NOPLAYERS = "NOTENOUGHPLAYERS",
    INGAME = "INGAME",
}
```

A legacy enum for lobby errors when trying to start the game. Endpoint responses now use the more detailed `generalErrors` enum below instead.

---
### generalErrors

```ts
export enum generalErrors {
  WORKED = 0,

  ALREADYINTHELOBBY = 1001,
  ALREADYINALOBBY = 1002,

  LOBBYDOESNTEXIST = 1003,
  LOBBYALREADYEXIST = 1006,

  INVALIDNAME = 1004,
  RULESNOTPROVIDED = 1005,

  NOTANEXPECTATOR = 2001,
  NOTAPLAYER = 2002,
  NOTINALOBBY = 2003,
  NOTHOST = 2004,

  NOWS = 3001,
  LOBBYINGAME = 3002,

  NOTINTHELOBBY = 3003,
  PLAYERSFULL = 3004,
  NOTENOUGHPLAYERS = 3005,
}
```

This is the main error enum returned by HTTP endpoints. `WORKED` (`0`) means the action succeeded; any other value identifies what went wrong. See the [Cases of possible errors](#--cases-of-possible-errors--) section for the HTTP status code mapping.

---
### WsAction

```ts
export enum WsAction {
    LOBBYUPDATE = "LOBBYUPDATE",
    GAMESTATE = "GAMESTATE",
    GAMERESULT = "GAMERESULT",
}
```

An enum for the possible websocket actions, it will be sent by the server to a websocket connected to send an update about something.

---
### LobbyAction

```ts
export enum LobbyAction {
  JOIN = "JOIN",
  SPECTATOR = "SPECTATOR",
  LEAVE = "LEAVE",
  HOST = "HOST",
  SWITCHTOPLAYER = "SWITCHTOPLAYER",
  SWITCHTOSPECTATOR = "SWITCHTOSPECTATOR",
  LEAVESPECTATOR = "LEAVESPECTATOR",
  STARTGAME = "STARTGAME",
  UPDATERULESET = "UPDATERULESET",
}
```

An enum for the possible lobby actions, it will be sent when an action is done to a lobby to all the websockets connected. **`SWITCHTOSPECTATOR` is new** in this version, complementing `SWITCHTOPLAYER`, and is broadcast when a player switches to being a spectator (see `/lobbies/change/player` below).

---
### GameAction

```ts
export enum GameAction {
  START = "START",
  END = "END",
  STATE = "STATE",
}
```

An enum for the possible game updates, it will be sent to all players in game with websockets connected.

---
### GameResult

```ts
export enum GameResult {
  WIN = "WIN",
  LOSE = "LOSE",
}
```

An enum for your result in the game, you win or you lose, just that.

---
### GamePlacement

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
## — Endpoints —

All endpoints below other than `/` and `/lobbies` require the `Authorization: Bearer <token>` header described in [Authentication](#--authentication--). The user id is always taken from the verified token (`req.user.id`), **not** from the request body.

### /

Returns the service state (`{ message: "Game Service Running" }`).

### /lobbies

Returns the `Lobbys` interface, containing all existing lobbys.

### /lobbies/create

**POST**, requires `lobbyId` in the body (the name of the lobby). The host id is taken from your token.

The lobby name must be non-empty, not just whitespace, and at most 20 characters long, otherwise it returns a `422` with a "Bad lobby name." message.

If successful, creates the lobby and returns it.

### /lobbies/checkout

**POST**, requires `lobbyId` in the body (the name of the lobby, or `""`). Your user id is taken from your token.

- If `lobbyId` is not `""`, it checks whether that lobby exists. If it doesn't, it responds `{ message: "Not a lobby." }`; otherwise it responds `{ lobby: <Lobby>, message: "true" }`.
- If `lobbyId` is `""`, it checks whether you're currently in a lobby. If you're not, it responds `{ message: "Not in lobby." }`; otherwise it responds `{ lobby: <Lobby you're in>, message: "true" }`.

### /lobbies/join

**POST**, requires `lobbyId` in the body. Your user id (from the token) is added to the lobby's players.

If successful, returns the lobby joined.

### /lobbies/leave

**POST**, requires `lobbyId` in the body. Removes you (your token's user id) from the lobby.

If successful, it will return the `Lobbys` interface, containing all existing lobbys.

### /lobbies/change/spectator

**POST**, requires `lobbyId` in the body. Switches you from a player to a spectator in that lobby (broadcasts `LobbyAction.SWITCHTOPLAYER`... actually moves you into the spectator list).

If successful, returns the updated lobby.

### /lobbies/change/player

**POST**, requires `lobbyId` in the body. Switches you from a spectator back to a player in that lobby (broadcasts `LobbyAction.SWITCHTOSPECTATOR`/`SWITCHTOPLAYER` as appropriate).

If successful, returns the updated lobby.

### /lobbies/ruleset

**POST**, requires `lobbyId` and `ruleset` (a `Ruleset` object containing the desired changes) in the body. Only the host (your token's user id must match the lobby's `hostId`) may change the ruleset, and not while a game is in progress.

If successful, it will return:

```json
{
  "message": "SUCCESS",
  "status": "<RulesState>"
}
```

where `status` is a `RulesState` (now including the `collision` field) describing whether each individual field change succeeded or failed.

If the request fails outright (no rules provided, lobby already in-game, you're not the host, you're not in the lobby, or the lobby doesn't exist) it instead returns the matching `generalErrors` error.

### /lobbies/start

**POST**, requires `lobbyId` in the body. Only the host may start the game.

If successful, the endpoint immediately responds `{ message: "SUCCESS" }`, and the game setup is then kicked off asynchronously afterwards.

---

## — Websockets —

### Connection to server:

See [Authentication](#--authentication--). The server, upon ws connection, will only accept the connection if it contains a valid **token** query parameter that resolves to a numeric user id; otherwise the connection attempt is closed.

### Server sending:

The server will always send `action: WsAction` enum, and depending on the action, you will be able to know the rest of the package.

These packages are also sent to the spectators.

#### -- LOBBYUPDATE

`({ type: WsAction.LOBBYUPDATE, lobby: id, user: player, action: action })`

This is an update on what's happening in the lobby, it will send:

- **lobby:** The name of the lobby that received a change.
- **user:** The numeric user id of the user that triggered the change.
- **action:** A `LobbyAction` enum containing the action that happened (now including `SWITCHTOSPECTATOR`).

---

#### -- GAMESTATE

`({ type: WsAction.GAMESTATE, context: action, game: game })`

This is an update on what's happening in the game, it will send:

- **context:** Whether the game started, whether it's a mid-game update, or whether the game ended, via a `GameAction` enum. The most common one will be `STATE`, sent to broadcast the next frame of the game.
- **game:** A `GameSession` interface containing the game itself (now also carrying the `rules` it's running with).

---

#### -- GAMERESULT

`({ type: WsAction.GAMERESULT, results: result })`

This is the result of the game, containing a `GameResults` interface:

- **result:** The `GameResults` of the played (or spectated) game, now expressed as numeric user ids rather than strings (with `0` used in place of an empty string for unfilled placements).

### User sending:

The server expects either **"W"**, **"A"**, **"S"**, or **"D"** for the player's movement, sent as plain text WebSocket messages.

---

## — Cases of possible errors —

HTTP endpoints reply with a `generalErrors` value in the `message` field of their JSON body, mapped to an HTTP status code as follows:

| Status | `generalErrors` values |
|---|---|
| **200** | `WORKED` |
| **404** | `LOBBYDOESNTEXIST` |
| **409** | `NOTINTHELOBBY`, `ALREADYINTHELOBBY`, `ALREADYINALOBBY`, `NOWS`, `LOBBYINGAME`, `PLAYERSFULL`, `NOTENOUGHPLAYERS`, `LOBBYALREADYEXIST` |
| **403** | `NOTHOST`, `NOTANEXPECTATOR`, `NOTAPLAYER`, `NOTINALOBBY` |
| **400** | anything else (e.g. `INVALIDNAME`, `RULESNOTPROVIDED`, or an unrecognized value) |
| **401** | missing/invalid/expired auth token (`Authorization` header or ws `token` param) |
| **422** | invalid lobby name on `/lobbies/create` |

For WebSocket connections, a missing or invalid `token` query parameter closes the connection with code `4001` ("Unauthorized"), and a token that decodes without a usable `id` closes it with code `1008` ("User ID required").
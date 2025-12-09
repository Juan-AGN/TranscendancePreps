import express, { NextFunction, Request, Response } from "express";
import { lobbyManager } from "./lobbyManager";
import { gameManager } from "./gameManager";

const app = express();
const port = 8888;

app.use(express.json());

/**
 * Health check
 */
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Game Service Running" });
});

/**
 * ─── LOBBY ROUTES ───────────────────────────────
 */

app.get("/lobbies", (req: Request, res: Response) => {
  res.send(lobbyManager.getLobbies());
});

app.post("/lobbies/create", (req: Request, res: Response) => {
  const { hostId } = req.body;
  const lobby = lobbyManager.createLobby(hostId);
  res.send(lobby);
});

app.post("/lobbies/join", (req: Request, res: Response) => {
  const { lobbyId, playerId } = req.body;
  const lobby = lobbyManager.joinLobby(lobbyId, playerId);
  res.send(lobby);
});

app.post("/lobbies/leave", (req: Request, res: Response) => {
  const { lobbyId, playerId } = req.body;
  res.send(lobbyManager.leaveLobby(lobbyId, playerId));
});

/**
 * ─── GAME SESSION ROUTES ────────────────────────
 */

app.post("/game/start", (req: Request, res: Response) => {
  const { lobbyId } = req.body;
  const session = gameManager.startGame(lobbyId);
  res.send(session);
});

app.get("/game/state/:sessionId", (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  res.send(gameManager.getState(sessionId));
});

/**
 * ─── ERROR HANDLING ─────────────────────────────
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send({ error: err.message });
});

/**
 * ─── START SERVER ───────────────────────────────
 */
app.listen(port, () => {
  console.log(`Game service running on port ${port}`);
});
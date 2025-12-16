import express, { NextFunction, Request, Response } from "express";
import { lobbyManager } from "./lobbyManager";
import { gameManager } from "./gameManager";
var cors = require('cors');

const app = express();
const port = 8888;

app.use(express.json());

app.use(cors());

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
	res.send(lobbyManager.getlobbies());
});

app.post("/lobbies/create", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.add(lobbyId, hostId))
		res.status(500).json({ message: "Couldn't create lobby." });
	res.send(lobbyManager.get(lobbyId));
});

app.post("/lobbies/join", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.addplayer(lobbyId, hostId))
		res.status(500).json({ message: "Couldn't join lobby." });
	res.send(lobbyManager.get(lobbyId));
});

app.post("/lobbies/leave", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.leaveplayer(lobbyId, hostId))
		res.status(500).json({ message: "Couldn't leave lobby." });
	res.send(lobbyManager.get(lobbyId));
});

/*
app.post("/game/start", (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const session = gameManager.startGame(lobbyId);
	res.send(session);
});

app.get("/game/state/:sessionId", (req: Request, res: Response) => {
	const sessionId = req.params.sessionId;
	res.send(gameManager.getState(sessionId));
});
*/

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	res.status(500).send({ error: err.message });
});

app.listen(port, () => {
	console.log(`Game service running on port ${port}`);
});
import express, { NextFunction, Request, Response } from "express";
import { lobbyManager } from "./lobbyManager";
import { gameManager } from "./gameManager";
import http from "http";
import url from "url";
import { WebSocketServer, WebSocket } from "ws";
import { Errors, changeErrors } from "./types";
var cors = require('cors');

const app = express();
const port = 8888;

const server = http.createServer(app);

const wss = new WebSocketServer({ server })

app.use(express.json());

app.use(cors());

app.get("/", (req: Request, res: Response) => {
	return (res.send({ message: "Game Service Running" }));
});

app.get("/lobbies", (req: Request, res: Response) => {
	return (res.send(lobbyManager.getlobbies()));
});

app.post("/lobbies/create", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.add(lobbyId, hostId))
		return (res.status(500).json({ message: "Couldn't create lobby." }));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/checkout", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;

	if (lobbyId != "")
	{
		if (!lobbyManager.has(lobbyId))
			return (res.status(500).json({ message: "Couldn't get lobby." }));
		return (res.send(lobbyManager.get(lobbyId)));
	}
	else
	{
		if (!lobbyManager.hasplayer(hostId))
			return (res.status(500).json({ message: "Couldn't get lobby." }));
		return (res.send(lobbyManager.whereis(hostId)));
	}
});

app.post("/lobbies/join", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.addplayer(lobbyId, hostId))
		return (res.status(500).json({ message: "Couldn't join lobby." }));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/leave", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.leaveplayer(lobbyId, hostId))
		return (res.status(500).json({ message: "Couldn't leave lobby." }));
	return (res.send(lobbyManager.getlobbies()));
});

app.post("/lobbies/change/spectator", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.spectToPlayerEndp(lobbyId, hostId))
		return (res.status(500).json({ message: "Couldn't change to player." }));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/change/player", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	if (!lobbyManager.playerToSpectEndp(lobbyId, hostId))
		return (res.status(500).json({ message: "Couldn't change to spectator." }));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/ruleset", (req: Request, res: Response) => {
	const { lobbyId, hostId, ruleset } = req.body;

	let toret = lobbyManager.changeruleset(lobbyId, hostId, ruleset);
	if (toret == false)
		return (res.status(500).json({ message: "Couldn't change lobby ruleset." }));
	return (res.send({message: changeErrors.SUCCESS, status: toret}));
});


app.post("/lobbies/start", (req: Request, res: Response) => {
	const { lobbyId, hostId } = req.body;
	const result = lobbyManager.able(lobbyId, hostId);

	if (result !== null) 
		return res.status(400).send({ message: result });

	res.send("starting");

	lobbyManager.setupgame(lobbyId, hostId);
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

wss.on("connection", (ws: WebSocket, req) => {
	const parsedUrl = url.parse(req.url || "", true);
	const userId = parsedUrl.query.userId as string;

	if (!userId) {
		ws.close(1008, "User ID required");
		return;
	}

	lobbyManager.newws(userId, ws);

	console.log(`User ${userId} connected`);

	ws.on("message", (data) => {
		const message = data.toString();

		if (message === "W" || message === "A" || message === "S" || message === "D")
			lobbyManager.playermovement(message, userId);
	});

	ws.on("close", () => {
		lobbyManager.deletews(userId, ws);
		console.log(`User ${userId} disconnected`);
	});
});

server.listen(port, () => {
	console.log(`Game service running on port ${port}`);
});

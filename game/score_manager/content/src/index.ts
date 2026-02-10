import express, { NextFunction, Request, Response } from "express";
import http from "http";
import url from "url";
import { Errors } from "./types";
var cors = require('cors');

const app = express();
const port = 9999;

const server = http.createServer(app);

app.use(express.json());

app.use(cors());

app.get("/", (req: Request, res: Response) => {
	return (res.send({ message: "Game Service Running" }));
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

server.listen(port, () => {
	console.log(`Game service running on port ${port}`);
});

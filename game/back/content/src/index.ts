import express, { NextFunction, Request, Response } from "express";
import { lobbyManager } from "./lobbyManager";
import { gameManager } from "./gameManager";
import http from "http";
import url from "url";
import { WebSocketServer, WebSocket } from "ws";
import { Errors, changeErrors, generalErrors } from "./types";
var cors = require('cors');
import jwt from 'jsonwebtoken';

const app = express();
const port = 8888;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.use(express.json());

app.use(cors());

export function sendError(res: Response, error: generalErrors) {
    switch (error) {
        case generalErrors.WORKED:
            return res.status(200).json({ message: "OK" });

        case generalErrors.LOBBYDOESNTEXIST:
            return res.status(404).json({ message: error });

        case generalErrors.NOTINTHELOBBY:
        case generalErrors.ALREADYINTHELOBBY:
        case generalErrors.ALREADYINALOBBY:
        case generalErrors.NOWS:
        case generalErrors.LOBBYINGAME:
        case generalErrors.PLAYERSFULL:
        case generalErrors.NOTENOUGHPLAYERS:
		case generalErrors.LOBBYALREADYEXIST:
            return res.status(409).json({ message: error });

        case generalErrors.NOTHOST:
        case generalErrors.NOTANEXPECTATOR:
        case generalErrors.NOTAPLAYER:
        case generalErrors.NOTINALOBBY:
            return res.status(403).json({ message: error });

        default:
            return res.status(400).json({ message: "Unknown error" });
    }
}

function authmiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
	try {
		if (!authHeader) {
		return res.status(401).send({
			error: 'Authentication token not provided'
		});
		}

		const token = authHeader.replace('Bearer ', '');
		
		if (!token) {
		return res.status(401).send({
			error: 'Invalid token'
		});
		}
		
		const secret = process.env.JWT_SECRET || 'super-secure-secret';
		
		const decoded = jwt.verify(token, secret) as {
			id: number;
			email: string;
		};
		
		req.user = {
			id: decoded.id,
			email: decoded.email
		};
		next();
	} catch (error) {
		return res.status(401).send({
			error: 'Invalid or expired token'
		});
	}
};

app.get("/", (req: Request, res: Response) => {
	return (res.send({ message: "Game Service Running" }));
});

app.get("/lobbies", (req: Request, res: Response) => {
	return (res.send(lobbyManager.getlobbies()));
});

app.post("/lobbies/create", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;

	if (lobbyId === "" || lobbyId.trim().length === 0)
		return (res.status(422).json({ message: "Bad lobby name." }));

	const error = lobbyManager.add(lobbyId, hostId);
	if (error != generalErrors.WORKED)
		return (sendError(res, error));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/checkout", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;

	if (lobbyId && lobbyId != "")
	{
		if (!lobbyManager.has(lobbyId))
			return (res.send({ message: "Not a lobby." }));
		return (res.send({lobby: lobbyManager.get(lobbyId), message: "true"}));
	}
	else
	{
		if (!lobbyManager.hasplayer(hostId))
			return (res.send({ message: "Not in lobby." }));
		return (res.send({ lobby: lobbyManager.whereis(hostId), message: "true" }));
	}
});

app.post("/lobbies/join", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;
	const error = lobbyManager.addplayer(lobbyId, hostId);
	if (error != generalErrors.WORKED)
		return (sendError(res, error));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/leave", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;
	const error = lobbyManager.leaveplayer(lobbyId, hostId);
	if (error != generalErrors.WORKED)
		return (sendError(res, error));
	return (res.send(lobbyManager.getlobbies()));
});

app.post("/lobbies/change/spectator", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;
	const error = lobbyManager.spectToPlayerEndp(lobbyId, hostId)
	if (error != generalErrors.WORKED)
		return (sendError(res, error));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/change/player", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;
	const error = lobbyManager.playerToSpectEndp(lobbyId, hostId);
	if (error != generalErrors.WORKED)
		return (sendError(res, error));
	return (res.send(lobbyManager.get(lobbyId)));
});

app.post("/lobbies/ruleset", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId, ruleset } = req.body;
	const hostId = req.user!.id;

	let toret = lobbyManager.changeruleset(lobbyId, hostId, ruleset);
	if (toret === generalErrors.RULESNOTPROVIDED || toret === generalErrors.LOBBYINGAME || toret === generalErrors.NOTHOST || toret === generalErrors.NOTINALOBBY || toret === generalErrors.LOBBYDOESNTEXIST)
		return (sendError(res, toret));
	return (res.send({message: changeErrors.SUCCESS, status: toret}));
});


app.post("/lobbies/start", authmiddleware, (req: Request, res: Response) => {
	const { lobbyId } = req.body;
	const hostId = req.user!.id;
	const error = lobbyManager.able(lobbyId, hostId);

	if (error != generalErrors.WORKED)
		return (sendError(res, error));

	res.send({message: changeErrors.SUCCESS});

	lobbyManager.setupgame(lobbyId, hostId);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	res.status(400).send({ error: err.message });
});

wss.on("connection", (ws: WebSocket, req) => {
	try {
		const url = new URL(req.url || "", "http://localhost");

		const token = url.searchParams.get("token");

		if (!token) {
			ws.close(4001, "Unauthorized");
			return;
		}

		const secret = process.env.JWT_SECRET || "super-secure-secret";

		const decoded = jwt.verify(token, secret) as {
			id: number;
			email: string;
		};

		const userId = decoded.id;

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
	} catch (err) {
		ws.close(4001, "Unauthorized");
		return;
	}
});

server.listen(port, () => {
	console.log(`Game service running on port ${port}`);
});

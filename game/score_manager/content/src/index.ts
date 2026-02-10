import express, { NextFunction, Request, Response } from "express";
import http from "http";
import url from "url";
import { Errors, GameResults, SubmitGameRequest } from "./types";

var cors = require('cors');

const getenv = require('getenv');

import { PrismaClient } from "./generated/prisma/client";
import { match } from "assert";

const prisma = new PrismaClient();

const app = express();
const port = 9999;

const connectPassword = getenv('PASSWORD');

const server = http.createServer(app);

export async function getuser(who: string) {
	let user = await prisma.user.findFirst({where: { name: who }});

	return (user);
}

export async function getmatches(who: string) {
	let user = await getuser(who);
	if (user == undefined)
		return (undefined);

	let match = await prisma.match.findMany({where: { OR: [ { firstId: user.id }, { secondId: user.id }, { thirdId: user.id }, { fourthId: user.id }] }});

	return (match);
}

app.use(express.json());

app.use(cors());

app.get("/", (req: Request, res: Response) => {
	return (res.send({ message: "Scores Service Running" }));
});

app.post("/create/user", async (req: Request, res: Response) => {
	const { password, who } = req.body;

	if (password != connectPassword || who == undefined || who == "")
		return (res.end());
	try {
		const existingUser = await getuser(who);

		if (!existingUser)
			await prisma.user.create({data: { name: who, score: 0 },});
	} catch (err) {
		console.error("Error creating user:", err);
	}
	return (res.end());
});

app.post("/create/match", async (req: Request, res: Response) => {
	const body = req.body as SubmitGameRequest;
	let data;

	if (body == undefined || body.password != connectPassword || body.results == undefined || body.results.first == undefined || body.results.first == "" || body.results.second == undefined || body.results.second == "")
		return ;

	try {
		const first = await getuser(body.results.first);
		const second = await getuser(body.results.second);
		const third = body.results.third ? await getuser(body.results.third) : null;
		const fourth = body.results.fourth ? await getuser(body.results.fourth) : null;

		const players = 2 + (third ? 1 : 0) + (fourth ? 1 : 0);

		if (!first || !second) {
			console.error("First or second user not found, match not created");
			return (res.end());
		}

		await prisma.user.update({where: {id: first.id}, data: { score: {increment: (6 * (players - 1))}}})
		await prisma.user.update({where: {id: second.id}, data: { score: {increment: (4 * (players - 1))}}})
		if (third)
			await prisma.user.update({where: {id: third.id}, data: { score: {increment: (2 * (players - 1))}}})
		if (fourth)
			await prisma.user.update({where: {id: fourth.id}, data: { score: {increment: (1 * (players - 1))}}})

		data = { firstId: first!.id, secondId: second!.id, thirdId: third?.id, fourthId: fourth?.id, players: players};
		await prisma.match.create({data: data});
	} catch (err) {
		console.error("Error creating match:", err);
	}
	return (res.end());
});

app.get("/matches/:user", async (req: Request, res: Response) => {
	let who: string = req.params.user;

	try {
		let tmatch = await getmatches(who);

		if (tmatch == undefined)
			return (res.send({ status: 'error', error: 'No user' }));
		return (res.send({status: 'ok', matches: tmatch}));
	} catch (err) {
		return (res.send({ status: 'error', error: err }));
	}
});

app.get("/users/:user", async (req: Request, res: Response) => {
	let who: string = req.params.user;

	try {
		let tuser = await getuser(who);

		if (tuser == undefined)
			return (res.send({ status: 'error', error: 'No user' }));
		return (res.send({status: 'ok', user: { name: tuser.name, score: tuser.score }}));
	} catch (err) {
		return (res.send({ status: 'error', error: err }));
	}
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
var cors = require('cors');
const app = (0, express_1.default)();
const port = 9999;
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use(cors());
app.get("/", (req, res) => {
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
app.use((err, req, res, next) => {
    res.status(500).send({ error: err.message });
});
server.listen(port, () => {
    console.log(`Game service running on port ${port}`);
});
//# sourceMappingURL=index.js.map
import express from "express";
import cors from "cors";
import http from "http";
import { chatRouter } from "./routes/chat.routes";
import { requireAuth } from "./middleware/auth";
import { setupWebSocket } from "./wsHub";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/chat/ping", (_req, res) => {
  res.json({ ok: true, service: "social-chat" });
});

// Todas las rutas del chat protegidas por JWT
app.use("/chat", requireAuth, chatRouter);

// HTTP server necesario para enganchar WebSocket
const server = http.createServer(app);

// WebSocket en /chat/ws
setupWebSocket(server);

const port = Number(process.env.PORT) || 8890;

server.listen(port, () => {
  console.log(`Social chat service running on port ${port}`);
});
import http from "http";
import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";

const clients = new Map<string, Set<WebSocket>>();

function addClient(userId: string, ws: WebSocket) {
  let set = clients.get(userId);

  if (!set) {
    set = new Set<WebSocket>();
    clients.set(userId, set);
  }

  set.add(ws);
}

function removeClient(userId: string, ws: WebSocket) {
  const set = clients.get(userId);
  if (!set) return;

  set.delete(ws);

  if (set.size === 0) {
    clients.delete(userId);
  }
}

export function sendToUser(userId: string, payload: unknown) {
  const set = clients.get(userId);
  if (!set) return;

  const message = JSON.stringify(payload);

  for (const ws of set) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export function setupWebSocket(server: http.Server) {
  const wss = new WebSocketServer({
    server,
    path: "/chat/ws",
  });

  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url || "", "http://localhost");
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close();
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "super-secure-secret"
      ) as { id: number; email: string };

      const userId = String(decoded.id);

      addClient(userId, ws);

      ws.send(JSON.stringify({
        type: "connected",
        userId,
      }));

      ws.on("close", () => {
        removeClient(userId, ws);
      });

      ws.on("error", () => {
        removeClient(userId, ws);
      });
    } catch {
      ws.close();
    }
  });
}
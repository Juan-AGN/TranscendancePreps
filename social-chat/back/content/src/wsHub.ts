import type { Server } from "http";
import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";
import { ChatErrorCode } from "./types";

const clients = new Map<string, Set<WebSocket>>();
const WS_AUTH_ERROR_CLOSE_CODE = 4401;

function addClient(userId: string, socket: WebSocket): void {
  let userSockets = clients.get(userId);

  if (!userSockets) {
    userSockets = new Set<WebSocket>();
    clients.set(userId, userSockets);
  }

  userSockets.add(socket);
}

function removeClient(userId: string, socket: WebSocket): void {
  const userSockets = clients.get(userId);

  if (!userSockets) {
    return;
  }

  userSockets.delete(socket);

  if (userSockets.size === 0) {
    clients.delete(userId);
  }
}

export function sendToUser(userId: string, payload: unknown): void {
  const userSockets = clients.get(userId);

  if (!userSockets) {
    return;
  }

  const serializedPayload = JSON.stringify(payload);

  for (const socket of userSockets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(serializedPayload);
    }
  }
}

export function setupWebSocket(server: Server): void {
  const webSocketServer = new WebSocketServer({
    server,
    path: "/chat/ws",
  });

  webSocketServer.on("connection", (socket, request) => {
    try {
      const requestUrl = new URL(request.url ?? "", "http://localhost");
      const token = requestUrl.searchParams.get("token");

      if (!token) {
        socket.close(
          WS_AUTH_ERROR_CLOSE_CODE,
          String(ChatErrorCode.AUTH_TOKEN_MISSING),
        );
        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "super-secure-secret",
      ) as { id: number | string; email?: string };

      const userId = String(decoded.id);
      addClient(userId, socket);

      socket.send(
        JSON.stringify({
          type: "connected",
          userId,
        }),
      );

      fetch(`http://backend:3000/users/${decoded.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ onlineStatus: true })
      }).catch(() => {
	    }).then(() => {});

      socket.on("close", () => {
        removeClient(userId, socket);
      });

      socket.on("error", () => {
        removeClient(userId, socket);
      });
    } catch {
      socket.close(
        WS_AUTH_ERROR_CLOSE_CODE,
        String(ChatErrorCode.AUTH_TOKEN_INVALID),
      );
    }
  });
}

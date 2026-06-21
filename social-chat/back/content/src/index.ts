import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import http from "http";
import { chatRouter } from "./routes/chat.routes";
import { requireAuth } from "./middleware/auth";
import { setupWebSocket } from "./wsHub";
import {
  CHAT_JSON_BODY_LIMIT,
  CHAT_MESSAGE_MAX_LENGTH,
  ChatErrorCode,
} from "./types";
import {
  handleChatError,
  isInvalidJsonError,
  isPayloadTooLargeError,
  sendChatError,
} from "./utils/chatError";

const app = express();

// Reject unexpectedly large JSON bodies before they can consume excessive memory.
app.use(express.json({ limit: CHAT_JSON_BODY_LIMIT }));
app.use(cors());

app.get("/chat/ping", (_req, res) => {
  res.json({ ok: true, service: "social-chat" });
});

app.use("/chat", requireAuth, chatRouter);

// Express JSON/body errors happen before the route handler, so they need a
// dedicated error middleware to preserve the same numeric error contract.
app.use(
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (isPayloadTooLargeError(error)) {
      return sendChatError(res, ChatErrorCode.PAYLOAD_TOO_LARGE, {
        maxMessageLength: CHAT_MESSAGE_MAX_LENGTH,
        bodyLimit: CHAT_JSON_BODY_LIMIT,
      });
    }

    if (isInvalidJsonError(error)) {
      return sendChatError(res, ChatErrorCode.INVALID_JSON);
    }

    return handleChatError(res, error);
  },
);

const server = http.createServer(app);
setupWebSocket(server);

const port = Number(process.env.PORT) || 8890;

server.listen(port, () => {
  console.log(`Social chat service running on port ${port}`);
});

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ChatErrorCode } from "../types";
import { sendChatError } from "../utils/chatError";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendChatError(res, ChatErrorCode.AUTH_TOKEN_MISSING);
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return sendChatError(res, ChatErrorCode.AUTH_TOKEN_INVALID);
  }

  try {
    const secret = process.env.JWT_SECRET || "super-secure-secret";
    const decoded = jwt.verify(token, secret) as { id: number; email: string };

    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch {
    return sendChatError(res, ChatErrorCode.AUTH_TOKEN_INVALID);
  }
}

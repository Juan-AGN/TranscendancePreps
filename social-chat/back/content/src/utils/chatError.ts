import type { Response } from "express";
import {
  ChatErrorCode,
  type ChatErrorDetails,
  type ChatErrorResponse,
} from "../types";

const HTTP_STATUS_BY_ERROR: Record<ChatErrorCode, number> = {
  [ChatErrorCode.WORKED]: 200,

  [ChatErrorCode.AUTH_TOKEN_MISSING]: 401,
  [ChatErrorCode.AUTH_TOKEN_INVALID]: 401,

  [ChatErrorCode.OTHER_USER_ID_REQUIRED]: 400,
  [ChatErrorCode.SELF_DM_NOT_ALLOWED]: 400,

  [ChatErrorCode.INVALID_CONVERSATION_ID]: 400,
  [ChatErrorCode.CONVERSATION_NOT_FOUND]: 404,
  [ChatErrorCode.CONVERSATION_UNAVAILABLE]: 403,

  [ChatErrorCode.MESSAGE_ID_REQUIRED]: 400,
  [ChatErrorCode.MESSAGE_CONTENT_REQUIRED]: 400,
  [ChatErrorCode.MESSAGE_EMPTY]: 400,
  [ChatErrorCode.MESSAGE_TOO_LONG]: 400,
  [ChatErrorCode.MESSAGE_NOT_FOUND]: 404,

  [ChatErrorCode.OTHER_USER_NOT_AVAILABLE]: 409,
  [ChatErrorCode.OTHER_USER_DELETED_CONVERSATION]: 409,

  [ChatErrorCode.USER_IDS_REQUIRED]: 400,
  [ChatErrorCode.TOO_MANY_USER_IDS]: 400,
  [ChatErrorCode.USERS_SERVICE_NOT_CONFIGURED]: 503,

  [ChatErrorCode.PAYLOAD_TOO_LARGE]: 413,
  [ChatErrorCode.INVALID_JSON]: 400,

  [ChatErrorCode.INTERNAL_ERROR]: 500,
};

export class ChatServiceError extends Error {
  readonly code: ChatErrorCode;
  readonly details?: ChatErrorDetails;

  constructor(code: ChatErrorCode, details?: ChatErrorDetails) {
    super(ChatErrorCode[code] ?? "CHAT_ERROR");
    this.name = "ChatServiceError";
    this.code = code;
    this.details = details;
  }
}

export function sendChatError(
  response: Response,
  code: ChatErrorCode,
  details?: ChatErrorDetails,
): Response {
  const payload: ChatErrorResponse = {
    code,
    error: ChatErrorCode[code] ?? "UNKNOWN_CHAT_ERROR",
  };

  if (details) {
    payload.details = details;
  }

  return response.status(HTTP_STATUS_BY_ERROR[code]).json(payload);
}

export function handleChatError(response: Response, error: unknown): Response {
  if (error instanceof ChatServiceError) {
    return sendChatError(response, error.code, error.details);
  }

  console.error("Unhandled chat error:", error);
  return sendChatError(response, ChatErrorCode.INTERNAL_ERROR);
}

export function isPayloadTooLargeError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { type?: unknown; status?: unknown };
  return candidate.type === "entity.too.large" || candidate.status === 413;
}

export function isInvalidJsonError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { type?: unknown; status?: unknown };
  return candidate.type === "entity.parse.failed" || candidate.status === 400;
}

/**
 * Shared chat-domain constants and numeric error codes.
 *
 * Keep the numeric values in sync with:
 * frontend/src/shared/components/chat/chatErrors.ts
 */
export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const CHAT_JSON_BODY_LIMIT = "16kb";
export const CHAT_MAX_RESOLVE_USER_IDS = 50;

/**
 * Persisted chat event format. System events are stored in the Message table
 * so that they survive reloads without requiring an additional Prisma model.
 */
export const CHAT_SYSTEM_SENDER_ID = "__chat_system__";
export const CHAT_MEMBER_LEFT_EVENT_PREFIX = "member-left:";

export enum ChatErrorCode {
  WORKED = 0,

  AUTH_TOKEN_MISSING = 5001,
  AUTH_TOKEN_INVALID = 5002,

  OTHER_USER_ID_REQUIRED = 5101,
  SELF_DM_NOT_ALLOWED = 5102,

  INVALID_CONVERSATION_ID = 5201,
  CONVERSATION_NOT_FOUND = 5202,
  CONVERSATION_UNAVAILABLE = 5203,

  MESSAGE_ID_REQUIRED = 5301,
  MESSAGE_CONTENT_REQUIRED = 5302,
  MESSAGE_EMPTY = 5303,
  MESSAGE_TOO_LONG = 5304,
  MESSAGE_NOT_FOUND = 5305,

  OTHER_USER_NOT_AVAILABLE = 5401,
  OTHER_USER_DELETED_CONVERSATION = 5402,

  USER_IDS_REQUIRED = 5501,
  TOO_MANY_USER_IDS = 5502,
  USERS_SERVICE_NOT_CONFIGURED = 5503,

  PAYLOAD_TOO_LARGE = 5601,
  INVALID_JSON = 5602,

  INTERNAL_ERROR = 5999,
}

export type ChatErrorDetails = Record<string, unknown>;

export type ChatErrorResponse = {
  code: ChatErrorCode;
  error: string;
  details?: ChatErrorDetails;
};

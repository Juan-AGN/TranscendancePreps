/**
 * Frontend mirror of the backend chat error contract.
 *
 * Keep these numeric values in sync with:
 * social-chat/back/content/src/types.ts
 */
export const CHAT_MESSAGE_MAX_LENGTH = 1000;

export const ChatErrorCode = {
  WORKED: 0,

  AUTH_TOKEN_MISSING: 5001,
  AUTH_TOKEN_INVALID: 5002,

  OTHER_USER_ID_REQUIRED: 5101,
  SELF_DM_NOT_ALLOWED: 5102,

  INVALID_CONVERSATION_ID: 5201,
  CONVERSATION_NOT_FOUND: 5202,
  CONVERSATION_UNAVAILABLE: 5203,

  MESSAGE_ID_REQUIRED: 5301,
  MESSAGE_CONTENT_REQUIRED: 5302,
  MESSAGE_EMPTY: 5303,
  MESSAGE_TOO_LONG: 5304,
  MESSAGE_NOT_FOUND: 5305,

  OTHER_USER_NOT_AVAILABLE: 5401,
  OTHER_USER_DELETED_CONVERSATION: 5402,

  USER_IDS_REQUIRED: 5501,
  TOO_MANY_USER_IDS: 5502,
  USERS_SERVICE_NOT_CONFIGURED: 5503,

  PAYLOAD_TOO_LARGE: 5601,
  INVALID_JSON: 5602,

  INTERNAL_ERROR: 5999,
} as const;

export type ChatErrorCodeValue = typeof ChatErrorCode[keyof typeof ChatErrorCode];
export type ChatErrorDetails = Record<string, unknown>;

export class ChatApiError extends Error {
  readonly code: number;
  readonly status: number;
  readonly details?: ChatErrorDetails;

  constructor(
    code: number,
    status: number,
    backendName: string,
    details?: ChatErrorDetails,
  ) {
    super(backendName);
    this.name = "ChatApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const TRANSLATION_KEY_BY_ERROR: Record<number, string> = {
  [ChatErrorCode.AUTH_TOKEN_MISSING]: "chat.errors.authTokenMissing",
  [ChatErrorCode.AUTH_TOKEN_INVALID]: "chat.errors.authTokenInvalid",

  [ChatErrorCode.OTHER_USER_ID_REQUIRED]: "chat.errors.otherUserIdRequired",
  [ChatErrorCode.SELF_DM_NOT_ALLOWED]: "chat.errors.selfDmNotAllowed",

  [ChatErrorCode.INVALID_CONVERSATION_ID]: "chat.errors.invalidConversationId",
  [ChatErrorCode.CONVERSATION_NOT_FOUND]: "chat.errors.conversationNotFound",
  [ChatErrorCode.CONVERSATION_UNAVAILABLE]: "chat.errors.conversationUnavailable",

  [ChatErrorCode.MESSAGE_ID_REQUIRED]: "chat.errors.messageIdRequired",
  [ChatErrorCode.MESSAGE_CONTENT_REQUIRED]: "chat.errors.messageContentRequired",
  [ChatErrorCode.MESSAGE_EMPTY]: "chat.errors.messageEmpty",
  [ChatErrorCode.MESSAGE_TOO_LONG]: "chat.errors.messageTooLong",
  [ChatErrorCode.MESSAGE_NOT_FOUND]: "chat.errors.messageNotFound",

  [ChatErrorCode.OTHER_USER_NOT_AVAILABLE]: "chat.errors.otherUserNotAvailable",
  [ChatErrorCode.OTHER_USER_DELETED_CONVERSATION]: "chat.errors.otherUserDeletedConversation",

  [ChatErrorCode.USER_IDS_REQUIRED]: "chat.errors.userIdsRequired",
  [ChatErrorCode.TOO_MANY_USER_IDS]: "chat.errors.tooManyUserIds",
  [ChatErrorCode.USERS_SERVICE_NOT_CONFIGURED]: "chat.errors.usersServiceUnavailable",

  [ChatErrorCode.PAYLOAD_TOO_LARGE]: "chat.errors.payloadTooLarge",
  [ChatErrorCode.INVALID_JSON]: "chat.errors.invalidJson",
  [ChatErrorCode.INTERNAL_ERROR]: "chat.errors.internal",
};

export function getChatErrorTranslationKey(code: number): string {
  return TRANSLATION_KEY_BY_ERROR[code] ?? "chat.errors.unknown";
}

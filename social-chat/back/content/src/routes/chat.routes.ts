import { Request, Response, Router } from "express";
import { prisma } from "../prisma";
import {
  CHAT_MAX_RESOLVE_USER_IDS,
  CHAT_MEMBER_LEFT_EVENT_PREFIX,
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_SYSTEM_SENDER_ID,
  ChatErrorCode,
} from "../types";
import { getUserId } from "../utils/getUserId";
import {
  ChatServiceError,
  handleChatError,
  sendChatError,
} from "../utils/chatError";
import { sendToUser } from "../wsHub";

export const chatRouter = Router();

type CandidateConversation = {
  id: number;
  members: Array<{ userId: string }>;
};

type ConversationMembershipRow = {
  lastReadMessageId: number | null;
  conversation: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    members: Array<{ userId: string; hiddenAt: Date | null }>;
    messages: Array<{
      id: number;
      senderId: string;
      content: string;
      createdAt: Date;
    }>;
  };
};

type ConversationDetail = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{ userId: string; hiddenAt: Date | null; createdAt: Date }>;
};

type ChatMember = {
  userId: string;
  hiddenAt: Date | null;
};

function toPositiveInt(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseLimit(value: unknown, fallback = 50, maximum = 100): number {
  const parsed = toPositiveInt(value);

  if (!parsed) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

async function getActiveMembership(conversationId: number, userId: string) {
  return prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId,
      hiddenAt: null,
    },
    select: {
      id: true,
      lastReadMessageId: true,
    },
  });
}

async function requireActiveMembership(conversationId: number, userId: string) {
  const membership = await getActiveMembership(conversationId, userId);

  if (!membership) {
    throw new ChatServiceError(ChatErrorCode.CONVERSATION_UNAVAILABLE);
  }

  return membership;
}

/**
 * POST /chat/dm
 * Creates or restores a one-to-one conversation.
 * Body: { otherUserId: "2" }
 */
chatRouter.post("/dm", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const rawOtherUserId = (req.body as { otherUserId?: unknown }).otherUserId;

    if (typeof rawOtherUserId !== "string" || rawOtherUserId.trim().length === 0) {
      return sendChatError(res, ChatErrorCode.OTHER_USER_ID_REQUIRED);
    }

    const otherUserId = rawOtherUserId.trim();

    if (otherUserId === me) {
      return sendChatError(res, ChatErrorCode.SELF_DM_NOT_ALLOWED);
    }

    const candidates = await prisma.conversation.findMany({
      where: {
        members: { some: { userId: me } },
        AND: [{ members: { some: { userId: otherUserId } } }],
      },
      select: {
        id: true,
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    const existing = (candidates as CandidateConversation[]).find((conversation) => {
      if (conversation.members.length !== 2) {
        return false;
      }

      const memberIds = new Set(conversation.members.map((member) => member.userId));
      return memberIds.has(me) && memberIds.has(otherUserId);
    });

    if (existing) {
      await prisma.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId: existing.id,
            userId: me,
          },
        },
        data: {
          hiddenAt: null,
        },
      });

      sendToUser(otherUserId, {
        type: "conversation:member-restored",
        conversationId: existing.id,
        userId: me,
      });

      return res.json({ conversationId: existing.id, created: false, restored: true });
    }

    const conversationId = await prisma.$transaction(async (transaction: any) => {
      const conversation = await transaction.conversation.create({
        data: {},
        select: { id: true },
      });

      await transaction.conversationMember.createMany({
        data: [
          { conversationId: conversation.id, userId: me },
          { conversationId: conversation.id, userId: otherUserId },
        ],
      });

      return conversation.id;
    });

    sendToUser(otherUserId, {
      type: "conversation:new",
      conversationId,
      userId: me,
    });

    return res.status(201).json({ conversationId, created: true, restored: false });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * DELETE /chat/conversations/:id
 * Hides the conversation only for the current user.
 */
chatRouter.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);

    if (!conversationId) {
      return sendChatError(res, ChatErrorCode.INVALID_CONVERSATION_ID);
    }

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: me,
        },
      },
      select: {
        id: true,
        hiddenAt: true,
      },
    });

    if (!membership || membership.hiddenAt) {
      return sendChatError(res, ChatErrorCode.CONVERSATION_NOT_FOUND);
    }

    const systemMessage = await prisma.$transaction(async (transaction: any) => {
      await transaction.conversationMember.update({
        where: { id: membership.id },
        data: { hiddenAt: new Date() },
      });

      const createdMessage = await transaction.message.create({
        data: {
          conversationId,
          senderId: CHAT_SYSTEM_SENDER_ID,
          content: `${CHAT_MEMBER_LEFT_EVENT_PREFIX}${me}`,
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      });

      await transaction.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Do not count the leave event as unread for the user who hid the chat.
      await transaction.conversationMember.update({
        where: { id: membership.id },
        data: { lastReadMessageId: createdMessage.id },
      });

      return createdMessage;
    });

    const otherMembers = await prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: { not: me },
      },
      select: {
        userId: true,
      },
    });

    // Persist and broadcast the informational leave message to the participant
    // who remains in the conversation.
    for (const member of otherMembers) {
      sendToUser(member.userId, {
        type: "message:new",
        conversationId,
        message: systemMessage,
      });
    }

    return res.json({
      conversationId,
      hiddenForUser: me,
      systemMessageId: systemMessage.id,
    });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * GET /chat/conversations
 * Returns visible DMs, persistent unread counts and the other participant state.
 */
chatRouter.get("/conversations", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);

    const memberships = await prisma.conversationMember.findMany({
      where: {
        userId: me,
        hiddenAt: null,
      },
      select: {
        lastReadMessageId: true,
        conversation: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            members: {
              select: {
                userId: true,
                hiddenAt: true,
              },
            },
            messages: {
              orderBy: { id: "desc" },
              take: 1,
              select: {
                id: true,
                senderId: true,
                content: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    const conversations = await Promise.all(
      (memberships as ConversationMembershipRow[]).map(async (membership) => {
        const conversation = membership.conversation;
        const otherMember = conversation.members.find((member) => member.userId !== me);
        const lastMessage = conversation.messages[0] ?? null;
        const lastReadMessageId = membership.lastReadMessageId ?? 0;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: me },
            id: { gt: lastReadMessageId },
          },
        });

        return {
          id: conversation.id,
          members: conversation.members.map((member) => member.userId),
          otherUserIds: otherMember ? [otherMember.userId] : [],
          otherUserDeleted: Boolean(otherMember?.hiddenAt),
          unreadCount,
          lastMessage,
          updatedAt: conversation.updatedAt,
          createdAt: conversation.createdAt,
        };
      }),
    );

    conversations.sort((first, second) => {
      const firstDate = first.lastMessage?.createdAt ?? first.createdAt;
      const secondDate = second.lastMessage?.createdAt ?? second.createdAt;
      return secondDate.getTime() - firstDate.getTime();
    });

    return res.json({ conversations });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * GET /chat/conversations/:id
 */
chatRouter.get("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);

    if (!conversationId) {
      return sendChatError(res, ChatErrorCode.INVALID_CONVERSATION_ID);
    }

    await requireActiveMembership(conversationId, me);

    const limit = parseLimit(req.query.limit, 50, 100);
    const cursorId = toPositiveInt(req.query.cursor);

    const conversation = (await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            userId: true,
            hiddenAt: true,
            createdAt: true,
          },
        },
      },
    })) as ConversationDetail | null;

    if (!conversation) {
      return sendChatError(res, ChatErrorCode.CONVERSATION_NOT_FOUND);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { id: "desc" },
      take: limit,
      ...(cursorId
        ? {
            cursor: { id: cursorId },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        createdAt: true,
      },
    });

    const otherMember = conversation.members.find((member) => member.userId !== me);
    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    return res.json({
      conversation: {
        id: conversation.id,
        members: conversation.members.map((member) => member.userId),
        otherUserIds: otherMember ? [otherMember.userId] : [],
        otherUserDeleted: Boolean(otherMember?.hiddenAt),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages,
      nextCursor,
    });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * GET /chat/conversations/:id/members
 */
chatRouter.get("/conversations/:id/members", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);

    if (!conversationId) {
      return sendChatError(res, ChatErrorCode.INVALID_CONVERSATION_ID);
    }

    await requireActiveMembership(conversationId, me);

    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      orderBy: { id: "asc" },
      select: {
        userId: true,
        createdAt: true,
        hiddenAt: true,
      },
    });

    return res.json({ conversationId, members });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * POST /chat/conversations/:id/messages
 * The sender gets the message through HTTP. The other member gets it by WS.
 */
chatRouter.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);

    if (!conversationId) {
      return sendChatError(res, ChatErrorCode.INVALID_CONVERSATION_ID);
    }

    const rawContent = (req.body as { content?: unknown }).content;

    if (typeof rawContent !== "string") {
      return sendChatError(res, ChatErrorCode.MESSAGE_CONTENT_REQUIRED);
    }

    const content = rawContent.trim();

    if (content.length === 0) {
      return sendChatError(res, ChatErrorCode.MESSAGE_EMPTY);
    }

    if (content.length > CHAT_MESSAGE_MAX_LENGTH) {
      return sendChatError(res, ChatErrorCode.MESSAGE_TOO_LONG, {
        maxLength: CHAT_MESSAGE_MAX_LENGTH,
        actualLength: content.length,
      });
    }

    await requireActiveMembership(conversationId, me);

    const members = (await prisma.conversationMember.findMany({
      where: { conversationId },
      select: {
        userId: true,
        hiddenAt: true,
      },
    })) as ChatMember[];

    const otherMember = members.find((member) => member.userId !== me);

    if (!otherMember) {
      return sendChatError(res, ChatErrorCode.OTHER_USER_NOT_AVAILABLE);
    }

    const message = await prisma.$transaction(async (transaction: any) => {
      const createdMessage = await transaction.message.create({
        data: {
          conversationId,
          senderId: me,
          content,
        },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      });

      await transaction.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      await transaction.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: me,
          },
        },
        data: {
          lastReadMessageId: createdMessage.id,
        },
      });

      // A new message makes the recipient's hidden conversation visible again.
      // Hiding a conversation is not equivalent to blocking its participant.
      await transaction.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: otherMember.userId,
          },
        },
        data: {
          hiddenAt: null,
        },
      });

      return createdMessage;
    });

    sendToUser(otherMember.userId, {
      type: "message:new",
      conversationId,
      message,
    });

    return res.status(201).json(message);
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * GET /chat/conversations/:id/messages?limit=50&cursor=123
 */
chatRouter.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);

    if (!conversationId) {
      return sendChatError(res, ChatErrorCode.INVALID_CONVERSATION_ID);
    }

    await requireActiveMembership(conversationId, me);

    const limit = parseLimit(req.query.limit, 50, 100);
    const cursorId = toPositiveInt(req.query.cursor);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { id: "desc" },
      take: limit,
      ...(cursorId
        ? {
            cursor: { id: cursorId },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        createdAt: true,
      },
    });

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    return res.json({ messages, nextCursor });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * PATCH /chat/conversations/:id/read
 * Body: { messageId: 123 }
 */
chatRouter.patch("/conversations/:id/read", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);

    if (!conversationId) {
      return sendChatError(res, ChatErrorCode.INVALID_CONVERSATION_ID);
    }

    const messageId = toPositiveInt((req.body as { messageId?: unknown }).messageId);

    if (!messageId) {
      return sendChatError(res, ChatErrorCode.MESSAGE_ID_REQUIRED);
    }

    await requireActiveMembership(conversationId, me);

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
      select: { id: true },
    });

    if (!message) {
      return sendChatError(res, ChatErrorCode.MESSAGE_NOT_FOUND);
    }

    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: me,
        },
      },
      data: {
        lastReadMessageId: message.id,
      },
    });

    return res.json({ conversationId, lastReadMessageId: message.id });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

/**
 * GET /chat/users/resolve?ids=1,2,3
 * Resolves display information through the Users HTTP API.
 * The chat never connects to the Users database.
 */
chatRouter.get("/users/resolve", async (req: Request, res: Response) => {
  try {
    const rawIds = req.query.ids;
    let ids: string[] = [];

    if (typeof rawIds === "string") {
      ids = rawIds.split(",");
    } else if (Array.isArray(rawIds)) {
      ids = rawIds.flatMap((value) => (typeof value === "string" ? value.split(",") : []));
    }

    ids = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

    if (ids.length === 0) {
      return sendChatError(res, ChatErrorCode.USER_IDS_REQUIRED);
    }

    if (ids.length > CHAT_MAX_RESOLVE_USER_IDS) {
      return sendChatError(res, ChatErrorCode.TOO_MANY_USER_IDS, {
        maxIds: CHAT_MAX_RESOLVE_USER_IDS,
        actualIds: ids.length,
      });
    }

    const usersUrl = process.env.USERS_INTERNAL_URL;

    if (!usersUrl) {
      return sendChatError(res, ChatErrorCode.USERS_SERVICE_NOT_CONFIGURED);
    }

    const authorization = req.headers.authorization ?? "";

    type UserResponse = {
      id: number | string;
      name?: string;
      avatar?: string | null;
    };

    type ResolvedUser = {
      id: string;
      name: string;
      avatar: string | null;
      avatarUrl: string;
    };

    const resolvedUsers = await Promise.all(
      ids.map(async (id): Promise<ResolvedUser | null> => {
        try {
          const response = await fetch(`${usersUrl}/users/${encodeURIComponent(id)}`, {
            headers: authorization ? { authorization } : {},
          });

          if (!response.ok) {
            return null;
          }

          const user = (await response.json()) as UserResponse;
          const avatar = typeof user.avatar === "string" ? user.avatar : null;

          return {
            id: String(user.id),
            name:
              typeof user.name === "string" && user.name.trim()
                ? user.name
                : "Usuario no disponible",
            avatar,
            avatarUrl: avatar ?? "default-avatar.svg",
          };
        } catch {
          return null;
        }
      }),
    );

    return res.json({
      users: resolvedUsers.filter((user): user is ResolvedUser => user !== null),
    });
  } catch (error: unknown) {
    return handleChatError(res, error);
  }
});

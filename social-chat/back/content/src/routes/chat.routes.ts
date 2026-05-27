// social-chat/back/content/src/routes/chat.routes.ts
// ============================================================================
// SOCIAL CHAT ROUTES (Express + Prisma)
// - DM (1-1) creation/reuse
// - GROUP creation + manage members + rename
// - Send/read messages (cursor pagination)
// - List conversations (sidebar)
// - Helper: resolve user ids -> name/avatar by calling Users service
// ============================================================================

import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { getUserId } from "../utils/getUserId";

export const chatRouter = Router();

// ============================================================================
// Small helpers (typing + validation)
// ============================================================================

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : (typeof value === "number" ? value : NaN);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function parseLimit(raw: unknown, fallback = 50, max = 100): number {
  const n = toPositiveInt(raw);
  if (!n) return fallback;
  return Math.min(n, max);
}

function parseCursor(raw: unknown): number | null {
  const n = toPositiveInt(raw);
  return n ?? null;
}

function uniqueStrings(list: string[]): string[] {
  return Array.from(new Set(list));
}

/**
 * Helper: ensure current user is a member of a conversation.
 * Throws an Error if not a member (the caller catches and returns 403).
 */
async function assertMember(conversationId: number, userId: string): Promise<void> {
  const member = await prisma.conversationMember.findFirst({
    where: { conversationId, userId },
    select: { id: true },
  });
  if (!member) throw new Error("Not a member");
}

/**
 * Helper: ensure a conversation exists and is GROUP.
 * Returns basic conversation data needed by callers.
 */
async function assertGroup(conversationId: number): Promise<{ id: number; type: "GROUP" | "DM"; title: string | null }> {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, type: true, title: true },
  });

  if (!conv) throw new Error("Conversation not found");
  if (conv.type !== "GROUP") throw new Error("Not a GROUP conversation");

  return { id: conv.id, type: conv.type, title: conv.title ?? null };
}

// ============================================================================
// Public endpoint (no auth required if your index.ts mounts it before middleware)
// If you mount auth middleware globally on /chat, then this becomes protected too.
// ============================================================================

/**
 * GET /chat/ping
 * Quick health check
 */
chatRouter.get("/ping", (_req: Request, res: Response) => {
  return res.json({ ok: true, service: "social-chat" });
});

// ============================================================================
// DM (1-1)
// ============================================================================

/**
 * POST /chat/dm
 * Create or reuse a DM conversation between me and otherUserId.
 * Body: { otherUserId: "2" }
 */
chatRouter.post("/dm", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const { otherUserId } = req.body as { otherUserId?: unknown };

    if (typeof otherUserId !== "string" || otherUserId.trim().length === 0) {
      return res.status(400).json({ error: "otherUserId is required" });
    }
    if (otherUserId === me) {
      return res.status(400).json({ error: "Cannot create DM with yourself" });
    }

    // Search existing DM where both users are members
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "DM",
        members: { some: { userId: me } },
        AND: [{ members: { some: { userId: otherUserId } } }],
      },
      select: { id: true },
    });

    if (existing) {
      return res.json({ conversationId: existing.id, created: false });
    }

    // Create conversation + members in a single transaction
    const conversationId = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: { type: "DM" },
        select: { id: true },
      });

      await tx.conversationMember.createMany({
        data: [
          { conversationId: conv.id, userId: me },
          { conversationId: conv.id, userId: otherUserId },
        ],
      });

      return conv.id;
    });

    return res.status(201).json({ conversationId, created: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

chatRouter.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const result = await prisma.conversationMember.deleteMany({
      where: {
        conversationId,
        userId: me,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Conversation not found for this user" });
    }

    return res.json({
      conversationId,
      removedForUser: me,
      deleted: result.count,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
// ============================================================================
// Conversations (sidebar)
// ============================================================================

/**
 * GET /chat/conversations
 * List conversations where I am a member.
 * Returns members + otherUserIds (for DM) + lastMessage preview.
 */
chatRouter.get("/conversations", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);

    const memberships = await prisma.conversationMember.findMany({
      where: { userId: me },
      select: {
        conversation: {
          select: {
            id: true,
            type: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            members: { select: { userId: true } },
            messages: {
              orderBy: { id: "desc" },
              take: 1,
              select: { id: true, senderId: true, content: true, createdAt: true },
            },
          },
        },
      },
      orderBy: { conversationId: "desc" },
    });

    type LastMessage = { id: number; senderId: string; content: string; createdAt: Date };
    type ConversationItem = {
      id: number;
      type: "DM" | "GROUP";
      title: string | null;
      members: string[];
      otherUserIds: string[];
      lastMessage: LastMessage | null;
      updatedAt: Date;
      createdAt: Date;
    };

    const conversations: ConversationItem[] = memberships.map((m) => {
      const c = m.conversation;
      const last = c.messages[0] ?? null;

      const memberIds = c.members.map((mm) => mm.userId);
      const otherUserIds = memberIds.filter((id) => id !== me);

      return {
        id: c.id,
        type: c.type,
        title: c.title ?? null,
        members: memberIds,
        otherUserIds,
        lastMessage: last
          ? { id: last.id, senderId: last.senderId, content: last.content, createdAt: last.createdAt }
          : null,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
      };
    });

    // Sort by last activity (lastMessage.createdAt if exists, else createdAt)
    conversations.sort((a, b) => {
      const aTime = a.lastMessage ? a.lastMessage.createdAt.getTime() : a.createdAt.getTime();
      const bTime = b.lastMessage ? b.lastMessage.createdAt.getTime() : b.createdAt.getTime();
      return bTime - aTime;
    });

    return res.json({ conversations });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

// ============================================================================
// Conversation detail (info + messages page)
// ============================================================================

/**
 * GET /chat/conversations/:id
 * Returns conversation info + members + a page of messages (DESC).
 * Query:
 *  - limit=50 (max 100)
 *  - cursor=<messageId>  (fetch older messages)
 */
chatRouter.get("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    // Permission check
    try {
      await assertMember(conversationId, me);
    } catch {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const limit = parseLimit(req.query.limit, 50, 100);
    const cursorId = parseCursor(req.query.cursor);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        type: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        members: { select: { userId: true, createdAt: true } },
      },
    });

    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { id: "desc" },
      take: limit,
      ...(cursorId
        ? {
            cursor: { id: cursorId },
            skip: 1, // avoid repeating cursor item
          }
        : {}),
      select: { id: true, conversationId: true, senderId: true, content: true, createdAt: true },
    });

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    const memberIds = conversation.members.map((m) => m.userId);
    const otherUserIds = memberIds.filter((id) => id !== me);

    return res.json({
      conversation: {
        id: conversation.id,
        type: conversation.type,
        title: conversation.title ?? null,
        members: memberIds,
        otherUserIds,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages,
      nextCursor,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

// ============================================================================
// Members
// ============================================================================

/**
 * GET /chat/conversations/:id/members
 * Only members can view members.
 */
chatRouter.get("/conversations/:id/members", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    try {
      await assertMember(conversationId, me);
    } catch {
      return res.status(403).json({ error: "Not a member" });
    }

    const members = await prisma.conversationMember.findMany({
      where: { conversationId },
      orderBy: { id: "asc" },
      select: { userId: true, createdAt: true },
    });

    return res.json({ conversationId, members });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

// ============================================================================
// Messages
// ============================================================================

/**
 * POST /chat/conversations/:id/messages
 * Send a message to a conversation.
 * Body: { content: "hello" }
 */
chatRouter.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    const contentRaw = (req.body as { content?: unknown }).content;
    if (typeof contentRaw !== "string") return res.status(400).json({ error: "content is required" });

    const content = contentRaw.trim();
    if (content.length === 0) return res.status(400).json({ error: "content cannot be empty" });
    if (content.length > 2000) return res.status(400).json({ error: "content too long (max 2000)" });

    try {
      await assertMember(conversationId, me);
    } catch {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const msg = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: { conversationId, senderId: me, content },
        select: { id: true, conversationId: true, senderId: true, content: true, createdAt: true },
      });

      // Touch conversation to update updatedAt (useful for sorting on sidebar)
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
        select: { id: true },
      });

      return created;
    });

    return res.status(201).json(msg);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

/**
 * GET /chat/conversations/:id/messages?limit=50&cursor=123
 * Read messages (DESC) with cursor pagination.
 */
chatRouter.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    try {
      await assertMember(conversationId, me);
    } catch {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const limit = parseLimit(req.query.limit, 50, 100);
    const cursorId = parseCursor(req.query.cursor);

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
      select: { id: true, conversationId: true, senderId: true, content: true, createdAt: true },
    });

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    return res.json({ messages, nextCursor });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

// ============================================================================
// Groups
// ============================================================================

/**
 * POST /chat/groups
 * Create a GROUP conversation.
 * Body: { title: "My group", memberIds: ["2","3"] }
 *
 * The creator (me) is always included.
 */
chatRouter.post("/groups", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);

    const titleRaw = (req.body as { title?: unknown }).title;
    const memberIdsRaw = (req.body as { memberIds?: unknown }).memberIds;

    if (typeof titleRaw !== "string" || titleRaw.trim().length === 0) {
      return res.status(400).json({ error: "title is required" });
    }
    const title = titleRaw.trim();
    if (title.length > 80) return res.status(400).json({ error: "title too long (max 80)" });

    if (!Array.isArray(memberIdsRaw)) {
      return res.status(400).json({ error: "memberIds is required (array)" });
    }

    const memberIds = memberIdsRaw.filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0);
    const uniqueMembers = uniqueStrings([me, ...memberIds.map((s) => s.trim())]);

    if (uniqueMembers.length < 2) {
      return res.status(400).json({ error: "Group must contain at least 2 members" });
    }
    if (uniqueMembers.length > 100) {
      return res.status(400).json({ error: "Too many members (max 100)" });
    }

    const created = await prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: { type: "GROUP", title },
        select: { id: true, type: true, title: true, createdAt: true, updatedAt: true },
      });

      await tx.conversationMember.createMany({
        data: uniqueMembers.map((uid) => ({ conversationId: conv.id, userId: uid })),
      });

      return conv;
    });

    return res.status(201).json({
      conversation: {
        id: created.id,
        type: created.type,
        title: created.title ?? null,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      members: uniqueMembers,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

/**
 * POST /chat/groups/:id/members
 * Add members to a GROUP conversation.
 * Body: { memberIds: ["4","5"] }
 */
chatRouter.post("/groups/:id/members", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    const memberIdsRaw = (req.body as { memberIds?: unknown }).memberIds;
    if (!Array.isArray(memberIdsRaw)) {
      return res.status(400).json({ error: "memberIds is required (array)" });
    }

    // Must be member + must be GROUP
    try {
      await assertMember(conversationId, me);
      await assertGroup(conversationId);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "Not a member") return res.status(403).json({ error: "Not a member" });
      if (msg === "Not a GROUP conversation") return res.status(400).json({ error: "Not a GROUP conversation" });
      if (msg === "Conversation not found") return res.status(404).json({ error: "Conversation not found" });
      return res.status(400).json({ error: msg || "Invalid request" });
    }

    const memberIds = memberIdsRaw
      .filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s: string) => s.trim());

    const uniqueToAdd = uniqueStrings(memberIds).filter((id) => id !== me);
    if (uniqueToAdd.length === 0) return res.json({ conversationId, added: [] });

    await prisma.conversationMember.createMany({
      data: uniqueToAdd.map((uid) => ({ conversationId, userId: uid })),
      skipDuplicates: true,
    });

    return res.json({ conversationId, added: uniqueToAdd });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

/**
 * PATCH /chat/groups/:id
 * Rename a group.
 * Body: { title: "New title" }
 */
chatRouter.patch("/groups/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    const titleRaw = (req.body as { title?: unknown }).title;
    if (typeof titleRaw !== "string" || titleRaw.trim().length === 0) {
      return res.status(400).json({ error: "title is required" });
    }
    const title = titleRaw.trim();
    if (title.length > 80) return res.status(400).json({ error: "title too long (max 80)" });

    // Must be member + must be GROUP
    try {
      await assertMember(conversationId, me);
      await assertGroup(conversationId);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "Not a member") return res.status(403).json({ error: "Not a member" });
      if (msg === "Not a GROUP conversation") return res.status(400).json({ error: "Not a GROUP conversation" });
      if (msg === "Conversation not found") return res.status(404).json({ error: "Conversation not found" });
      return res.status(400).json({ error: msg || "Invalid request" });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title, updatedAt: new Date() },
      select: { id: true, type: true, title: true, updatedAt: true },
    });

    return res.json({ conversation: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

/**
 * DELETE /chat/groups/:id/members/:userId
 * Remove a member from a group (simple permission: must be a member).
 */
chatRouter.delete("/groups/:id/members/:userId", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = toPositiveInt(req.params.id);
    if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

    const rawTarget = req.params.userId as unknown;
    const targetUserId = typeof rawTarget === "string" ? rawTarget : "";

    if (!targetUserId) return res.status(400).json({ error: "Invalid userId" });

    // Must be member + must be GROUP
    try {
      await assertMember(conversationId, me);
      await assertGroup(conversationId);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg === "Not a member") return res.status(403).json({ error: "Not a member" });
      if (msg === "Not a GROUP conversation") return res.status(400).json({ error: "Not a GROUP conversation" });
      if (msg === "Conversation not found") return res.status(404).json({ error: "Conversation not found" });
      return res.status(400).json({ error: msg || "Invalid request" });
    }

    const result = await prisma.conversationMember.deleteMany({
      where: { conversationId, userId: targetUserId },
    });

    return res.json({ conversationId, removed: targetUserId, deleted: result.count });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

// ============================================================================
// Helper endpoint: resolve user IDs -> name/avatar (calls Users service)
// ============================================================================

/**
 * GET /chat/users/resolve?ids=1,2,3
 * Returns: { users: [{ id, name, avatar, avatarUrl }, ...] }
 *
 * NOTES:
 * - USERS_INTERNAL_URL must be set (example: http://backend:3000)
 * - This implementation calls /users/:id in parallel.
 *   If your Users service later supports /users/resolve, switch to that for efficiency.
 */
chatRouter.get("/users/resolve", async (req: Request, res: Response) => {
  try {
    const idsParam = req.query.ids;

    let ids: string[] = [];

    if (typeof idsParam === "string") {
      ids = idsParam.split(",").map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(idsParam)) {
      ids = idsParam
        .flatMap((v: unknown) => (typeof v === "string" ? v.split(",") : []))
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else {
      ids = [];
    }

    if (ids.length === 0) return res.status(400).json({ error: "ids is required" });
    if (ids.length > 50) return res.status(400).json({ error: "too many ids (max 50)" });

    const base = process.env.USERS_INTERNAL_URL;
    if (!base) return res.status(500).json({ error: "USERS_INTERNAL_URL not configured" });

    // Forward auth header to users service if needed
    const auth = req.headers.authorization ?? "";

    type ResolvedUser = { id: string; name: string; avatar: string | null; avatarUrl: string };

    const results: Array<ResolvedUser | null> = await Promise.all(
      ids.map(async (id: string) => {
        const r = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
          headers: auth ? { authorization: auth } : {},
        });

        if (!r.ok) return null;

        const u = (await r.json()) as { id: number | string; name?: string; avatar?: string | null };

        return {
          id: String(u.id),
          name: String(u.name ?? ""),
          avatar: u.avatar ?? null,
          avatarUrl: typeof u.avatar === "string" ? u.avatar : "default-avatar.svg",
        };
      })
    );

    const users = results.filter((u): u is ResolvedUser => u !== null);

    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
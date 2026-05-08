import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { getUserId } from "../utils/getUserId";

export const chatRouter = Router();

/**
 * GET /chat/ping
 */
chatRouter.get("/ping", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "social-chat" });
});

/**
 * Helper: comprueba si el usuario es miembro de la conversación
 */
async function assertMember(conversationId: number, userId: string): Promise<boolean> {
  const member = await prisma.conversationMember.findFirst({
    where: { conversationId, userId },
    select: { id: true },
  });
  return !!member;
}

/**
 * POST /chat/dm
 * Body: { otherUserId: "2" }
 * Header: x-user-id: "1"
 */
chatRouter.post("/dm", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const { otherUserId } = req.body as { otherUserId?: string };

    if (!otherUserId || typeof otherUserId !== "string") {
      return res.status(400).json({ error: "otherUserId is required" });
    }
    if (otherUserId === me) {
      return res.status(400).json({ error: "Cannot create DM with yourself" });
    }

    // Buscar DM existente con ambos usuarios
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

    // Crear Conversation + 2 members en transacción
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

/**
 * GET /chat/conversations
 * Header: x-user-id
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
            title: true, // <- si añadiste title
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
    });

    const conversations = memberships.map((m) => {
      const c = m.conversation;
      const last = c.messages[0] || null;

      const memberIds = c.members.map((mm) => mm.userId);
      const otherUserIds = c.type === "DM" ? memberIds.filter((id) => id !== me) : [];

      return {
        id: c.id,
        type: c.type, // DM | GROUP
        title: c.title ?? null, // útil en GROUP
        members: memberIds,
        otherUserIds,
        lastMessage: last
          ? { id: last.id, senderId: last.senderId, content: last.content, createdAt: last.createdAt }
          : null,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
      };
    });

    // Ordenar por actividad (updatedAt ya se tocará al enviar mensajes)
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.json({ conversations });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});

/**
 * GET /chat/conversations/:id
 * Header: x-user-id
 * Query: ?limit=50&cursor=123
 */
chatRouter.get("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    if (!(await assertMember(conversationId, me))) {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    // Paginación
    const limitRaw = req.query.limit as string | undefined;
    const cursorRaw = req.query.cursor as string | undefined;

    let limit = limitRaw ? Number(limitRaw) : 50;
    if (!Number.isInteger(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;

    const cursorId = cursorRaw ? Number(cursorRaw) : undefined;
    const useCursor = Number.isInteger(cursorId) && (cursorId as number) > 0;

    // Conversación + miembros
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        type: true,
        title: true, // <- si añadiste title
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
      ...(useCursor ? { cursor: { id: cursorId as number }, skip: 1 } : {}),
      select: { id: true, conversationId: true, senderId: true, content: true, createdAt: true },
    });

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    const memberIds = conversation.members.map((m) => m.userId);
    const otherUserIds = conversation.type === "DM" ? memberIds.filter((id) => id !== me) : [];

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

/**
 * GET /chat/conversations/:id/members
 * Header: x-user-id
 */
chatRouter.get("/conversations/:id/members", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    if (!(await assertMember(conversationId, me))) {
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

/**
 * POST /chat/conversations/:id/messages
 * Body: { content: "hola" }
 * Header: x-user-id
 */
chatRouter.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    const contentRaw = (req.body as { content?: string })?.content;
    if (typeof contentRaw !== "string") {
      return res.status(400).json({ error: "content is required" });
    }
    const content = contentRaw.trim();
    if (content.length === 0) return res.status(400).json({ error: "content cannot be empty" });
    if (content.length > 2000) return res.status(400).json({ error: "content too long (max 2000)" });

    if (!(await assertMember(conversationId, me))) {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    // Transacción: crear mensaje + tocar Conversation.updatedAt para ordenar por actividad
    const msg = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: { conversationId, senderId: me, content },
        select: { id: true, conversationId: true, senderId: true, content: true, createdAt: true },
      });

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
 * Header: x-user-id
 */
chatRouter.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }

    if (!(await assertMember(conversationId, me))) {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const limitRaw = req.query.limit as string | undefined;
    const cursorRaw = req.query.cursor as string | undefined;

    let limit = limitRaw ? Number(limitRaw) : 50;
    if (!Number.isInteger(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;

    const cursorId = cursorRaw ? Number(cursorRaw) : undefined;
    const useCursor = Number.isInteger(cursorId) && (cursorId as number) > 0;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { id: "desc" },
      take: limit,
      ...(useCursor ? { cursor: { id: cursorId as number }, skip: 1 } : {}),
      select: { id: true, conversationId: true, senderId: true, content: true, createdAt: true },
    });

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;

    return res.json({ messages, nextCursor });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
chatRouter.post("/groups", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const { title, memberIds } = req.body as { title?: string; memberIds?: string[] };

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "title is required" });
    }

    // members opcional; siempre incluimos al creador
    const members = Array.isArray(memberIds) ? memberIds.filter((x) => typeof x === "string") : [];
    const uniqueMembers = Array.from(new Set([me, ...members]));

    const conv = await prisma.$transaction(async (tx) => {
      // Crea conversación GROUP con title
      const created = await tx.conversation.create({
        data: { type: "GROUP", title: title.trim() },
        select: { id: true, type: true, title: true, createdAt: true, updatedAt: true },
      });

      // Añade miembros
      await tx.conversationMember.createMany({
        data: uniqueMembers.map((userId) => ({ conversationId: created.id, userId })),
      });

      return created;
    });

    return res.status(201).json({ conversation: conv, members: uniqueMembers });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
chatRouter.post("/groups/:id/members", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);
    const { memberIds } = req.body as { memberIds?: string[] };

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "memberIds is required (array)" });
    }

    // Permiso simple: debes ser miembro del grupo
    const isMember = await prisma.conversationMember.findFirst({
      where: { conversationId, userId: me },
      select: { id: true },
    });
    if (!isMember) return res.status(403).json({ error: "Not a member" });

    // Asegurar que es GROUP
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, type: true },
    });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (conv.type !== "GROUP") return res.status(400).json({ error: "Not a GROUP conversation" });

    const clean = Array.from(new Set(memberIds.filter((x) => typeof x === "string")));

    await prisma.conversationMember.createMany({
      data: clean.map((userId) => ({ conversationId, userId })),
      skipDuplicates: true,
    });

    return res.json({ conversationId, added: clean });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
chatRouter.patch("/groups/:id", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);
    const { title } = req.body as { title?: string };

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "title is required" });
    }

    // Permiso simple: debes ser miembro
    const isMember = await prisma.conversationMember.findFirst({
      where: { conversationId, userId: me },
      select: { id: true },
    });
    if (!isMember) return res.status(403).json({ error: "Not a member" });

    // Asegurar que es GROUP
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, type: true },
    });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (conv.type !== "GROUP") return res.status(400).json({ error: "Not a GROUP conversation" });

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: title.trim() },
      select: { id: true, type: true, title: true, updatedAt: true },
    });

    return res.json({ conversation: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
chatRouter.delete("/groups/:id/members/:userId", async (req: Request, res: Response) => {
  try {
    const me = getUserId(req);
    const conversationId = Number(req.params.id);

    // 👇 Normalizamos el param para que SIEMPRE sea string
    const rawTarget = req.params.userId;
    const targetUserId = Array.isArray(rawTarget) ? rawTarget[0] : rawTarget;

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ error: "Invalid conversation id" });
    }
    if (!targetUserId || typeof targetUserId !== "string") {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const isMember = await prisma.conversationMember.findFirst({
      where: { conversationId, userId: me },
      select: { id: true },
    });
    if (!isMember) return res.status(403).json({ error: "Not a member" });

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, type: true },
    });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (conv.type !== "GROUP") return res.status(400).json({ error: "Not a GROUP conversation" });

    const result = await prisma.conversationMember.deleteMany({
      where: { conversationId, userId: targetUserId },
    });

    return res.json({ conversationId, removed: targetUserId, deleted: result.count });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Unknown error" });
  }
});
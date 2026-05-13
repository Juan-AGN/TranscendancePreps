import type { Request } from "express";

export function getUserId(req: Request): string {
  if (!req.user) throw new Error("Unauthenticated");
  return String(req.user.id);
}
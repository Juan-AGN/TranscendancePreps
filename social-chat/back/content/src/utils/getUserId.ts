import { Request } from "express";

export function getUserId(req: Request): string {
  const userId = req.header("x-user-id");
  if (!userId) {
    throw new Error("Missing x-user-id header");
  }
  return userId;
}
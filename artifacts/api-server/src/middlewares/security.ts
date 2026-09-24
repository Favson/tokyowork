import type { NextFunction, Request, Response } from "express";

function allowedOrigins(): Set<string> {
  const origins = [
    process.env.APP_ORIGIN,
    ...(process.env.ALLOWED_ORIGINS ?? "").split(","),
    process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
    "http://localhost:5173",
  ];
  return new Set(origins.filter((origin): origin is string => Boolean(origin)).map((origin) => origin.replace(/\/$/, "")));
}

export function originGuard(req: Request, res: Response, next: NextFunction): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (!origin || allowedOrigins().has(origin.replace(/\/$/, ""))) {
    next();
    return;
  }

  req.log.warn({ origin }, "Rejected request from disallowed origin");
  res.status(403).json({ error: "Request origin is not allowed." });
}
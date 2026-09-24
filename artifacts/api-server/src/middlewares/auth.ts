import type { NextFunction, Request, Response } from "express";
import { createClient, type User } from "@supabase/supabase-js";

export type RequestAuth = {
  user: User;
  aal: string | null;
};

declare global {
  namespace Express {
    interface Request {
      auth?: RequestAuth;
    }
  }
}

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  supabaseClient ??= createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return supabaseClient;
}

function getBearerToken(req: Request): string | null {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

function configuredAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getBearerToken(req);
  const client = getSupabaseServerClient();
  if (!client) {
    res.status(503).json({ error: "Authentication is not configured." });
    return;
  }
  if (!token) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }

  const [{ data: userData, error: userError }, { data: claimsData }] = await Promise.all([
    client.auth.getUser(token),
    client.auth.getClaims(token),
  ]);

  if (userError || !userData.user) {
    req.log.warn({ err: userError?.message }, "Rejected invalid access token");
    res.status(401).json({ error: "Your session is invalid or has expired." });
    return;
  }

  req.auth = {
    user: userData.user,
    aal: typeof claimsData?.claims?.aal === "string" ? claimsData.claims.aal : null,
  };
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const email = req.auth?.user.email?.trim().toLowerCase();
  if (!email || !configuredAdminEmails().has(email)) {
    res.status(403).json({ error: "Staff access is required." });
    return;
  }
  next();
}

export function requireAdminMfa(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.aal !== "aal2") {
    res.status(403).json({ error: "Multi-factor authentication is required for staff actions." });
    return;
  }
  next();
}

export function getAuthenticatedUser(req: Request): NonNullable<RequestAuth> {
  if (!req.auth) throw new Error("requireAuth must run before reading request auth");
  return req.auth;
}
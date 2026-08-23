import type { NextFunction, Request, Response } from "express";
import { verifyCredentials, createContextClient } from "@supabase/server/core";
import type { AuthResult } from "@supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      supabaseAuth?: AuthResult;
      supabase?: SupabaseClient;
    }
  }
}

function extractHeader(req: Request, name: string): string | null {
  const value = req.headers[name];
  return typeof value === "string" ? value : null;
}

function bearerToken(req: Request): string | null {
  const header = extractHeader(req, "authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export function requireUser() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const credentials = {
      token: bearerToken(req),
      apikey: extractHeader(req, "apikey"),
    };

    const { data: auth, error } = await verifyCredentials(credentials, {
      auth: "user",
    });

    if (error) {
      res.status(error.status).json({ message: error.message, code: error.code });
      return;
    }

    req.supabaseAuth = auth;
    req.supabase = createContextClient({
      auth: { token: auth.token, keyName: auth.keyName },
    });
    next();
  };
}

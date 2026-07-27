import { createHash, randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SESSION_DAYS = 30;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin.from("app_sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt
  });
  if (error) throw error;
  return { token, expiresAt };
}

export async function requireSession(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await supabaseAdmin
    .from("app_sessions")
    .select("user_id, expires_at")
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;
  return data.user_id as string;
}

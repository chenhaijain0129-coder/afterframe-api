import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const { code } = await request.json().catch(() => ({}));
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Missing WeChat login code." }, { status: 400 });
  }

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.json({ error: "Server login is not configured." }, { status: 503 });
  }

  const exchange = new URL("https://api.weixin.qq.com/sns/jscode2session");
  exchange.searchParams.set("appid", appId);
  exchange.searchParams.set("secret", appSecret);
  exchange.searchParams.set("js_code", code);
  exchange.searchParams.set("grant_type", "authorization_code");
  const wechat = await fetch(exchange, { cache: "no-store" });
  const payload = await wechat.json();
  if (!wechat.ok || !payload.openid) {
    return NextResponse.json({ error: "WeChat login failed.", detail: payload.errmsg }, { status: 401 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("app_users")
    .upsert({ wechat_openid: payload.openid }, { onConflict: "wechat_openid" })
    .select("id")
    .single();
  if (error || !user) return NextResponse.json({ error: "Could not create user." }, { status: 500 });

  const session = await createSession(user.id);
  return NextResponse.json({ userId: user.id, ...session });
}

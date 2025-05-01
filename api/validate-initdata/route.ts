// src/app/api/validate-initdata/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

// Секретный токен Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export async function POST(req: Request) {
  const { initData } = await req.json();

  if (!initData) {
    return NextResponse.json({ ok: false, error: "No initData" }, { status: 400 });
  }

  try {
    const searchParams = new URLSearchParams(initData);
    const hash = searchParams.get("hash");
    if (!hash) return NextResponse.json({ ok: false, error: "Missing hash" }, { status: 400 });

    // Удалим хэш из строки
    searchParams.delete("hash");

    // Отсортируем по ключам
    const dataCheckString = Array.from(searchParams.entries())
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join("\n");

    const secret = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
    const hmac = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

    if (hmac !== hash) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Validation error:", err);
    return NextResponse.json({ ok: false, error: "Validation failed" }, { status: 500 });
  }
}

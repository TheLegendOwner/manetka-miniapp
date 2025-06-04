// src/pages/api/validate-initdata.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { initData } = req.body;
  if (!initData || typeof initData !== "string") {
    return res.status(400).json({ ok: false, error: "Invalid initData" });
  }

  try {
    // Разбираем initData, декодируя ключи и значения
    const kvPairs = initData.split("&").map((pair) => {
      const [rawKey, rawValue] = pair.split("=");
      const key = decodeURIComponent(rawKey);
      const value = decodeURIComponent(rawValue || "");
      return [key, value] as [string, string];
    });
    const data: Record<string, string> = {};
    for (const [key, value] of kvPairs) {
      data[key] = value;
    }

    // Строим data_check_string: все ключи, кроме "hash", в алфавитном порядке, через "\n"
    const dataCheckArray = Object.keys(data)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${k}=${data[k]}`);
    const dataCheckString = dataCheckArray.join("\n");

    // Получаем секретный ключ: sha256(TELEGRAM_BOT_TOKEN)
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN is not set");
      return res.status(500).json({ ok: false, error: "Server misconfiguration" });
    }
    const secretKey = crypto.createHash("sha256").update(botToken).digest();

    // Вычисляем hmac sha256
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // Сравниваем с полученным hash, защищённо по времени
    const receivedHash = data.hash;
    if (!receivedHash) {
      return res.status(403).json({ ok: false, error: "Missing hash" });
    }
    const hmacBuffer = Buffer.from(hmac, "hex");
    const receivedBuffer = Buffer.from(receivedHash, "hex");
    if (
      hmacBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(hmacBuffer, receivedBuffer)
    ) {
      return res.status(403).json({ ok: false, error: "Invalid data hash" });
    }

    // Если всё совпало
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("validate-initdata error:", error);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}

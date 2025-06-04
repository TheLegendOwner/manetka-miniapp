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
    // __1. Разбираем initData в пары key=value__
    //     (initData – это строка вида "user=...&chat_instance=...&chat_type=...&auth_date=...&signature=...&hash=...")
    const kvPairs = initData.split("&").map((pair) => {
      const [key, ...rest] = pair.split("=");
      // Соединяем обратно на случай, если в значении был символ "="
      const value = rest.join("=");
      return [key, value];
    });

    const data: Record<string, string> = {};
    for (const [key, value] of kvPairs) {
      data[key] = value;
    }

    // __2. Строим data_check_array: 
    //     все ключи кроме "hash" и "signature", 
    //     отсортированные в алфавитном порядке, 
    //     затем "key=value" -> join("\n")__
    const dataCheckArray = Object.keys(data)
      .filter((k) => k !== "hash" && k !== "signature")
      .sort()
      .map((k) => `${k}=${data[k]}`);

    const dataCheckString = dataCheckArray.join("\n");

    // __3. Берём TELEGRAM_BOT_TOKEN из окружения и вычисляем secretKey = SHA256(botToken)__
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    if (!botToken) {
      console.error("validate-initdata: TELEGRAM_BOT_TOKEN is not set");
      return res.status(500).json({ ok: false, error: "Server configuration error" });
    }
    const secretKey = crypto.createHash("sha256").update(botToken).digest();

    // __4. Считаем HMAC SHA256 от dataCheckString с ключом secretKey__
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // __5. Сравниваем полученный hmac с тем, что пришёл в data.hash__
    const receivedHash = data.hash;
    if (typeof receivedHash !== "string") {
      return res.status(400).json({ ok: false, error: "Hash missing" });
    }

    // Временное преобразование в Buffer для безопасного сравнения
    const hmacBuffer = Buffer.from(hmac, "hex");
    const receivedBuffer = Buffer.from(receivedHash, "hex");
    if (hmacBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(hmacBuffer, receivedBuffer)) {
      // Если хеши не совпадают
      console.warn("validate-initdata: invalid data hash", {
        dataCheckString,
        computedHmac: hmac,
        receivedHash,
      });
      return res.status(403).json({ ok: false, error: "Invalid data hash" });
    }

    // Если всё совпало
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("validate-initdata error:", error);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { initData } = req.body;

  if (!initData || typeof initData !== "string") {
    return res.status(400).json({ ok: false, error: "Invalid initData" });
  }

  try {
    // Здесь могла бы быть настоящая валидация initData
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ticker, price, condition } = req.body || {};

    if (!ticker || !price || !condition) {
      return res.status(400).json({ error: "Brak danych alarmu" });
    }

    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({ error: "Brak TELEGRAM_TOKEN lub CHAT_ID" });
    }

    const text =
      `🚨 ALERT CENOWY\n\n` +
      `Ticker: ${ticker}\n` +
      `Warunek: ${condition === "above" ? "powyżej" : "poniżej"} ${price}\n` +
      `Status: test wysyłki działa`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    });

    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      return res.status(500).json({ error: "Telegram error", details: tgData });
    }

    return res.status(200).json({ ok: true, telegram: tgData });
  } catch (err) {
    return res.status(500).json({
      error: "Błąd serwera",
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

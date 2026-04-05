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
    const { ticker, target_price, condition } = req.body || {};

    if (!ticker || target_price === undefined || !condition) {
      return res.status(400).json({ error: "Brak danych alertu" });
    }

    const url = `${process.env.SUPABASE_URL}/rest/v1/alerts`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify([
        {
          ticker,
          target_price,
          condition,
          triggered: false
        }
      ])
    });

    const raw = await response.text();

    return res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      supabase_url_exists: !!process.env.SUPABASE_URL,
      supabase_key_exists: !!process.env.SUPABASE_KEY,
      raw
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

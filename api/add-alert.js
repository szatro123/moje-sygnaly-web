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

    if (!ticker || target_price === undefined || !condition)
      return res.status(400).json({ error: "Brak danych alertu" });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/alerts`,
      {
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ success: true, alert: data[0] });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

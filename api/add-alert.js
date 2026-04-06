export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { ticker, target_price, condition } = req.body || {};

    if (!ticker || target_price === undefined || !condition) {
      return res.status(400).json({ ok: false, error: "Brak danych" });
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

    const text = await response.text();

    return res.status(response.status).json({
      ok: response.ok,
      raw: text
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err)
    });
  }
}

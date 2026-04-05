export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { ticker, target_price, condition } = req.body;

    if (!ticker || target_price === undefined || !condition) {
      return res.status(400).json({ error: "Brak danych" });
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

    const data = await response.text();

    return res.status(200).json({
      ok: true,
      supabase_response: data
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

const SUPABASE_URL = "https://woetuzltrenmhmhitzbi.supabase.co";
const SUPABASE_KEY = "TU_WKLEJ_SB_PUBLISHABLE";

export default async function handler(req, res) {
  // CORS (dla pewności)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { ticker, target_price, condition } = req.body;

    if (!ticker || !target_price || !condition) {
      return res.status(400).json({ error: "Brak danych" });
    }

    const response = await fetch(SUPABASE_URL + "/rest/v1/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=representation"
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

    const text = await response.text();

    return res.status(200).json({
      ok: true,
      supabase: text
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

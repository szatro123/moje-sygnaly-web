const SUPABASE_URL = "https://woetuzltrenmhmhitzbi.supabase.co";
const SUPABASE_KEY = "TU_WKLEJ_SWÓJ_KLUCZ";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { ticker, target_price, condition } = req.body;

    const response = await fetch(SUPABASE_URL + "/rest/v1/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      },
      body: JSON.stringify([{
        ticker,
        target_price,
        condition,
        triggered: false
      }])
    });

    const data = await response.text();
    return res.status(200).json({ ok: true, data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

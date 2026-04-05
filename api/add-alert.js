
const SUPABASE_URL = "https://woetuzltrenmhmhitzbi.supabase.co";
const SUPABASE_KEY = "sb_publishable_1nIYzQLSklZzvAuI2QhrlQ_I7zCNLmR";

module.exports = async (req, res) => {
  // Ustaw CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { ticker, price, condition } = req.body;

    const response = await fetch(SUPABASE_URL + "/rest/v1/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=representation"
      },
      body: JSON.stringify([{ ticker, target_price: price, condition, triggered: false }])
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({ ok: false, error: "Brak id" });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/alerts?id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
          Prefer: "return=representation"
        }
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

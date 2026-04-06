export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Only GET allowed" });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/alerts?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`
        }
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: text
      });
    }

    const alerts = JSON.parse(text);

    return res.status(200).json({
      ok: true,
      alerts
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err)
    });
  }
}

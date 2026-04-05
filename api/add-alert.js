export default async function handler(req, res) {
  try {
    const testUrl = `${process.env.SUPABASE_URL}/rest/v1/alerts?select=*`;

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`
      }
    });

    const raw = await response.text();

    return res.status(200).json({
      testUrl,
      ok: response.ok,
      status: response.status,
      raw
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

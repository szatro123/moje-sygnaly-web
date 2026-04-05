export const config = {
  runtime: "nodejs18.x"
};

export default async function handler(req, res) {
  try {
    const url = process.env.SUPABASE_URL + "/rest/v1/alerts";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      },
    });

    const text = await response.text();

    return res.status(200).json({
      status: response.status,
      body: text
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

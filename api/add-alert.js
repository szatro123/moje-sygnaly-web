import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from("alerts")
      .select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

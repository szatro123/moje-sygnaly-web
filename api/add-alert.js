export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    supabaseUrl: process.env.SUPABASE_URL || null,
    hasSupabaseKey: !!process.env.SUPABASE_KEY
  });
}

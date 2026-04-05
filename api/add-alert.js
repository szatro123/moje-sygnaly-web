export default async function handler(req, res) {
  return res.status(200).json({
    url: process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_KEY
  });
}

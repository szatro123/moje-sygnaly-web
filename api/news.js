export default async function handler(req, res) {
  const ticker = req.query.ticker;

  if (!ticker) {
    return res.status(400).json({ error: "Brak tickera" });
  }

  try {
    const url = `https://news.google.com/rss/search?q=${ticker}+stock&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url);
    const text = await response.text();

    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);

    const news = items.map(item => {
      const title = item[1].match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item[1].match(/<link>(.*?)<\/link>/)?.[1] || "";

      return { title, link };
    });

    res.status(200).json({ news });

  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania newsów" });
  }
}

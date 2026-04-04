export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Brak tickera" });
  }

  try {
    const url = `https://news.google.com/rss/search?q=${ticker}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url);
    const text = await response.text();

    const items = text.split("<item>").slice(1);

    const news = items.map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

      const now = new Date();
      const newsDate = new Date(pubDate);
      const diffHours = (now - newsDate) / (1000 * 60 * 60);

      if (diffHours > 6) return null;

      const lower = title.toLowerCase();

      let strength = "średni";

      if (
        lower.includes("earnings") ||
        lower.includes("guidance") ||
        lower.includes("upgrade") ||
        lower.includes("downgrade") ||
        lower.includes("breaking") ||
        lower.includes("sec") ||
        lower.includes("lawsuit")
      ) {
        strength = "mocny";
      }

      if (
        lower.includes("shares") ||
        lower.includes("stake") ||
        lower.includes("llc") ||
        lower.includes("advisors")
      ) {
        return null;
      }

      return { title, link, pubDate, strength };
    }).filter(Boolean);

    res.status(200).json({ ticker, news });

  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
}

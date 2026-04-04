export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const ticker = (req.query.ticker || "").toUpperCase().trim();

  if (!ticker) {
    return res.status(400).json({ error: "Brak tickera" });
  }

  try {
    const rssUrl =
      `https://news.google.com/rss/search?q=${encodeURIComponent(ticker + " stock")}` +
      `&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: `Google News RSS error: ${response.status}` });
    }

    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 10);

    const news = items.map((item) => {
      const block = item[1];

      const title =
        block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        block.match(/<title>(.*?)<\/title>/)?.[1] ||
        "";

      const link =
        block.match(/<link>(.*?)<\/link>/)?.[1] ||
        "";

      const pubDate =
        block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ||
        "";

      return {
        title: decodeHtml(title),
        link,
        pubDate
      };
    });

    return res.status(200).json({ ticker, news });
  } catch (err) {
    return res.status(500).json({
      error: "Błąd pobierania newsów",
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

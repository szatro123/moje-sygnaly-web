const REJECT_KEYWORDS = [
  "top stocks",
  "best stocks",
  "stocks to buy",
  "watchlist",
  "market overview",
  "market close",
  "market open",
  "prediction",
  "price prediction",
  "why the market",
  "analyst says",
  "opinion",
  "etf",
  "fund",
  "index",
  "dow jones",
  "s&p 500",
  "nasdaq today",
  "crypto",
  "bitcoin",
  "ethereum",
  "how to invest",
  "beginner",
  "explained",
  "recap",
  "roundup"
];

const CATALYST_KEYWORDS = [
  "earnings",
  "revenue",
  "eps",
  "guidance",
  "raised",
  "cut",
  "forecast",
  "approval",
  "approved",
  "fda",
  "trial",
  "phase 1",
  "phase 2",
  "phase 3",
  "contract",
  "award",
  "awarded",
  "deal",
  "partnership",
  "collaboration",
  "acquisition",
  "acquire",
  "merger",
  "buyout",
  "takeover",
  "upgrade",
  "downgrade",
  "price target",
  "dividend",
  "buyback",
  "lawsuit",
  "settlement",
  "investigation",
  "launch",
  "launches",
  "results"
];

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
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 30);

    const now = new Date();

    const news = items
      .map((item) => {
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
      })
      .filter((item) => isRelevantNews(item.title, ticker))
      .filter((item) => isTodayNews(item.pubDate, now))
      .slice(0, 8);

    return res.status(200).json({ ticker, news });
  } catch (err) {
    return res.status(500).json({
      error: "Błąd pobierania newsów",
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

function isRelevantNews(title, ticker) {
  const t = title.toLowerCase();
  const tk = ticker.toLowerCase();

  const mentionsTicker =
    t.includes(tk) ||
    t.includes(`(${tk})`) ||
    t.includes(`:${tk}`);

  if (!mentionsTicker) return false;

  if (REJECT_KEYWORDS.some((kw) => t.includes(kw))) {
    return false;
  }

  const hasCatalyst = CATALYST_KEYWORDS.some((kw) => t.includes(kw));
  return hasCatalyst || mentionsTicker;
}

function isTodayNews(pubDate, now = new Date()) {
  if (!pubDate) return false;

  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return false;

  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

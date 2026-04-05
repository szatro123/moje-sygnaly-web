export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const rawTicker = (req.query.ticker || "").toUpperCase().trim();

  if (!rawTicker) {
    return res.status(400).json({ error: "Brak tickera" });
  }

  const ticker = rawTicker.includes(":")
    ? rawTicker.split(":")[1]
    : rawTicker;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d&includePrePost=true`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;

    if (!meta) {
      return res.status(404).json({ error: "Brak danych ceny" });
    }

    const price =
      meta.regularMarketPrice ??
      meta.previousClose ??
      null;

    return res.status(200).json({
      ticker: rawTicker,
      symbol: ticker,
      price
    });
  } catch (err) {
    return res.status(500).json({
      error: "Błąd pobierania ceny",
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

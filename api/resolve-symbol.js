export default async function handler(req, res) {
  try {
    const ticker = String(req.query.ticker || "").trim().toUpperCase();

    if (!ticker) {
      return res.status(400).json({
        ok: false,
        error: "Brak tickera"
      });
    }

    if (ticker.includes(":")) {
      return res.status(200).json({
        ok: true,
        symbol: ticker
      });
    }

    const response = await fetch(
      `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(ticker)}`
    );

    const text = await response.text();

    let data = [];
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "Błąd parsowania odpowiedzi TradingView",
        raw: text
      });
    }

    const exact = (data || []).filter(
      (s) => String(s.symbol || "").toUpperCase() === ticker
    );

    const priority = ["NYSE", "NASDAQ", "AMEX", "ARCA", "BATS"];
    let chosen = null;

    for (const ex of priority) {
      chosen = exact.find(
        (s) => String(s.exchange || "").toUpperCase() === ex
      );
      if (chosen) break;
    }

    if (!chosen && exact.length > 0) {
      chosen = exact[0];
    }

    if (!chosen) {
      return res.status(404).json({
        ok: false,
        error: "Nie znaleziono symbolu"
      });
    }

    return res.status(200).json({
      ok: true,
      symbol: `${String(chosen.exchange).toUpperCase()}:${String(chosen.symbol).toUpperCase()}`,
      name: chosen.description || chosen.name || ""
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err)
    });
  }
}

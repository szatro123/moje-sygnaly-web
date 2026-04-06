export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Only GET allowed" });
  }

  try {
    const raw = String(req.query.ticker || "").trim().toUpperCase();

    if (!raw) {
      return res.status(400).json({ ok: false, error: "Brak tickera" });
    }

    if (raw.includes(":")) {
      return res.status(200).json({ ok: true, symbol: raw });
    }

    const response = await fetch(
      `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(raw)}`
    );

    const data = await response.json();
    const rows = Array.isArray(data) ? data : [];

    const exact = rows.filter(
      (r) => String(r.symbol || "").toUpperCase() === raw
    );

    const priority = ["NYSE", "NASDAQ", "AMEX", "ARCA"];

    let chosen = null;

    for (const ex of priority) {
      chosen = exact.find(
        (r) => String(r.exchange || "").toUpperCase() === ex
      );
      if (chosen) break;
    }

    if (!chosen && exact.length > 0) {
      chosen = exact[0];
    }

    if (!chosen) {
      return res.status(404).json({
        ok: false,
        error: `Nie znaleziono symbolu dla ${raw}`
      });
    }

    return res.status(200).json({
      ok: true,
      symbol: `${String(chosen.exchange).toUpperCase()}:${String(chosen.symbol).toUpperCase()}`
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err)
    });
  }
}

// ── NEWS ──────────────────────────────────────────────────────────────

async function search() {
  const ticker = document.getElementById("ticker").value.trim().toUpperCase();
  const resultEl = document.getElementById("result");

  if (!ticker) {
    resultEl.innerHTML = '<span class="state-msg">⚠ Wpisz ticker (np. NVDA)</span>';
    return;
  }

  resultEl.innerHTML = `
    <div class="chart-loading">
      <div class="spinner"></div> Pobieranie newsów…
    </div>`;

  try {
    const res  = await fetch(`https://moje-sygnaly-web.vercel.app/api/news?ticker=${ticker}`);
    const data = await res.json();

    if (!data.news || data.news.length === 0) {
      resultEl.innerHTML = '<span class="state-msg">📭 Brak świeżych newsów (6h)</span>';
      return;
    }

    const badgeColors = {
      "mocny":  "#00d4aa",
      "średni": "#f59e0b",
    };

    const html = data.news.map(n => {
      const color = badgeColors[n.strength] ?? "#6b7280";
      const date  = n.pubDate
        ? new Date(n.pubDate).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })
        : "";

      return `
        <div class="news-card">
          <span class="news-badge" style="background:${color}">${n.strength ?? "—"}</span>
          <a class="news-title" href="${n.link}" target="_blank" rel="noopener">${n.title}</a>
          ${date ? `<span class="news-date">${date}</span>` : ""}
        </div>`;
    }).join("");

    resultEl.innerHTML = html;

  } catch (err) {
    console.error(err);
    resultEl.innerHTML = '<span class="state-msg">❌ Błąd pobierania danych</span>';
  }
}

// Allow Enter key in news input
document.getElementById("ticker").addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

// ── CHART ─────────────────────────────────────────────────────────────

function loadChart() {
  let symbol = document.getElementById("chartTicker").value.trim().toUpperCase() || "NASDAQ:NVDA";

  // auto-dodaj giełdę jeśli brak dwukropka
  if (!symbol.includes(":")) {
    symbol = "NASDAQ:" + symbol;
    document.getElementById("chartTicker").value = symbol;
  }

  const container = document.getElementById("tvchart");
  container.innerHTML = "";

  const inner = document.createElement("div");
  inner.id = "tv_" + Date.now();
  inner.style.height = "100%";
  inner.style.width  = "100%";
  container.appendChild(inner);

  const tryInit = setInterval(() => {
    if (typeof TradingView !== "undefined") {
      clearInterval(tryInit);
      new TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: "15",
        timezone: "Europe/Warsaw",
        theme: "dark",
        style: "1",
        locale: "pl",
        allow_symbol_change: true,
        container_id: inner.id,
        support_host: "https://www.tradingview.com"
      });
    }
  }, 200);
}

// Allow Enter key in chart input
document.getElementById("chartTicker").addEventListener("keydown", e => {
  if (e.key === "Enter") loadChart();
});

// ── INIT ──────────────────────────────────────────────────────────────

window.addEventListener("load", () => {
  setTimeout(loadChart, 400);
});

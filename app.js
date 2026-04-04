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
      "sredni": "#f59e0b",
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

document.getElementById("ticker").addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

// ── CHART ─────────────────────────────────────────────────────────────

function loadChart() {
  let symbol = document.getElementById("chartTicker").value.trim().toUpperCase() || "NASDAQ:NVDA";

  // auto-dodaj gielde jesli brak dwukropka
  if (!symbol.includes(":")) {
    symbol = "NASDAQ:" + symbol;
    document.getElementById("chartTicker").value = symbol;
  }

  const container = document.getElementById("tvchart");

  // Oficjalny iframe embed - jedyny sposob dzialajacy na GitHub Pages
  const src = "https://www.tradingview.com/widgetembed/?" +
    "symbol="             + encodeURIComponent(symbol) +
    "&interval=15" +
    "&timezone=Europe%2FWarsaw" +
    "&theme=dark" +
    "&style=1" +
    "&locale=pl" +
    "&allow_symbol_change=true" +
    "&hide_top_toolbar=false" +
    "&save_image=false" +
    "&backgroundColor=rgba(8%2C12%2C20%2C1)";

  container.innerHTML =
    '<iframe' +
    ' src="' + src + '"' +
    ' style="width:100%;height:100%;border:none;"' +
    ' allowtransparency="true"' +
    ' frameborder="0"' +
    ' scrolling="no"' +
    ' allowfullscreen' +
    '></iframe>';
}

document.getElementById("chartTicker").addEventListener("keydown", e => {
  if (e.key === "Enter") loadChart();
});

// ── INIT ──────────────────────────────────────────────────────────────

window.addEventListener("load", () => {
  loadChart();
});
let alerts = JSON.parse(localStorage.getItem("priceAlerts") || "[]");

function addAlert() {
  const tickerInput = document.getElementById("alertTicker");
  const priceInput = document.getElementById("alertPrice");
  const conditionInput = document.getElementById("alertCondition");

  let ticker = tickerInput.value.trim().toUpperCase();
  const price = Number(priceInput.value);
  const condition = conditionInput.value;

  if (!ticker) {
    ticker = document.getElementById("chartTicker").value.trim().toUpperCase();
  }

  if (ticker && !ticker.includes(":")) {
    ticker = "NASDAQ:" + ticker;
  }

  if (!ticker || !price || price <= 0) {
    alert("Wpisz ticker i poprawną cenę alarmu");
    return;
  }

  const newAlert = {
    id: Date.now(),
    ticker,
    price,
    condition,
    createdAt: new Date().toISOString()
  };

  alerts.unshift(newAlert);
  saveAlerts();
  renderAlerts();

  tickerInput.value = ticker;
  priceInput.value = "";
}

function removeAlert(id) {
  alerts = alerts.filter(a => a.id !== id);
  saveAlerts();
  renderAlerts();
}

function saveAlerts() {
  localStorage.setItem("priceAlerts", JSON.stringify(alerts));
}

function renderAlerts() {
  const box = document.getElementById("alertsList");
  if (!box) return;

  if (alerts.length === 0) {
    box.innerHTML = `<span class="placeholder-text">Tu pojawią się alarmy...</span>`;
    return;
  }

  box.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <div class="alert-top">
        <span class="alert-ticker">${a.ticker}</span>
        <button class="alert-remove" onclick="removeAlert(${a.id})">Usuń</button>
      </div>
      <div class="alert-meta">
        Warunek: ${a.condition === "above" ? "cena powyżej" : "cena poniżej"} ${a.price}
      </div>
      <div class="alert-meta">
        Dodano: ${new Date(a.createdAt).toLocaleString("pl-PL")}
      </div>
    </div>
  `).join("");
}

window.addEventListener("load", () => {
  renderAlerts();
});
async function testTelegramAlert() {
  try {
    const ticker = document.getElementById("alertTicker").value.trim().toUpperCase() || "NASDAQ:NVDA";
    const price = document.getElementById("alertPrice").value || "180";
    const condition = document.getElementById("alertCondition").value || "above";

    const res = await fetch("https://moje-sygnaly-web.vercel.app/api/send-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ticker, price, condition }),
      mode: "cors"
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Błąd wysyłki alertu");
      console.log(data);
      return;
    }

    alert("Alert testowy wysłany na Telegram");
  } catch (err) {
    alert("Błąd połączenia z backendem");
  }
}

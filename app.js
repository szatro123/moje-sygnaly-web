//
// — NEWS —
//

async function search() {
  const ticker = document.getElementById("ticker")?.value.trim().toUpperCase();
  const resultEl = document.getElementById("result");

  if (!resultEl) return;

  if (!ticker) {
    resultEl.innerHTML = '<span class="state-msg">⚠️ Wpisz ticker (np. NVDA)</span>';
    return;
  }

  resultEl.innerHTML = `
    <div class="chart-loading">
      <div class="spinner"></div> Pobieranie newsów…
    </div>
  `;

  try {
    const res = await fetch(`/api/news?ticker=${encodeURIComponent(ticker)}`);
    const data = await res.json();

    if (!data.news || data.news.length === 0) {
      resultEl.innerHTML = '<span class="state-msg">📰 Brak świeżych newsów (6h)</span>';
      return;
    }

    const badgeColors = {
      mocny: "#00d4aa",
      sredni: "#ff59e0b0"
    };

    const html = data.news
      .map((n) => {
        const color = badgeColors[n.strength] ?? "#6b7280";
        const date = n.pubDate
          ? new Date(n.pubDate).toLocaleString("pl-PL", {
              dateStyle: "short",
              timeStyle: "short"
            })
          : "";

        return `
          <div class="news-card">
            <span class="news-badge" style="background:${color}">${n.strength ?? "-"}</span>
            <a class="news-title" href="${n.link}" target="_blank" rel="noopener">${n.title}</a>
            ${date ? `<span class="news-date">${date}</span>` : ""}
          </div>
        `;
      })
      .join("");

    resultEl.innerHTML = html;
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = '<span class="state-msg">❌ Błąd pobierania danych</span>';
  }
}

document.getElementById("ticker")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
});

//
// — WSPÓLNE ROZPOZNAWANIE TICKERA —
//
async function resolveTicker(rawTicker) {
  const raw = String(rawTicker || "").trim().toUpperCase();

  if (!raw) return "NASDAQ:NVDA";
  if (raw.includes(":")) return raw;

  try {
    const res = await fetch(`/api/resolve-symbol?ticker=${encodeURIComponent(raw)}`);
    const data = await res.json();

    if (res.ok && data.ok && data.symbol) {
      return String(data.symbol).toUpperCase();
    }

    console.log("resolveTicker backend error:", data);
    return raw;
  } catch (err) {
    console.log("resolveTicker error:", err);
    return raw;
  }
}

//
// — CHART —
//

async function loadChart() {
  const inputEl = document.getElementById("chartTicker");
  const container = document.getElementById("tvchart");
  const alertTickerEl = document.getElementById("alertTicker");

  if (!inputEl || !container) return;

  let input = inputEl.value.trim().toUpperCase();
  if (!input) input = "NVDA";

  const symbol = await resolveTicker(input);

inputEl.value = symbol;

if (alertTickerEl) {
  alertTickerEl.value = symbol;
}

  const src =
    "https://www.tradingview.com/widgetembed/?" +
    "symbol=" + encodeURIComponent(symbol) +
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
    '<iframe src="' +
    src +
    '" style="width:100%;height:100%;border:none;" allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen></iframe>';
}

document.getElementById("chartTicker")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadChart();
});

//
// — ALERTY —
//

async function addAlert() {
  const tickerInput = document.getElementById("alertTicker");
  const priceInput = document.getElementById("alertPrice");
  const conditionInput = document.getElementById("alertCondition");

  if (!tickerInput || !priceInput || !conditionInput) return;

  let ticker = tickerInput.value.trim().toUpperCase();
  const price = Number(priceInput.value);
  const condition = conditionInput.value;

  if (!ticker || !price || price <= 0) {
    alert("Wpisz ticker i poprawną cenę alarmu");
    return;
  }

  const resolvedTicker = await resolveTicker(ticker);

  try {
    const res = await fetch("/api/add-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticker: resolvedTicker,
        target_price: price,
        condition
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert("Błąd zapisu alertu");
      console.log(data);
      return;
    }

    alert("Alert zapisany");

    tickerInput.value = resolvedTicker;
    priceInput.value = "";

    await loadAlerts();
  } catch (err) {
    alert("Błąd połączenia");
    console.log(err);
  }
}

async function removeAlert(id) {
  if (!confirm("Usunąć alert?")) return;

  try {
    const res = await fetch("/api/delete-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert("Błąd usuwania alertu");
      console.log(data);
      return;
    }

    await loadAlerts();
  } catch (err) {
    alert("Błąd połączenia przy usuwaniu");
    console.log(err);
  }
}

async function loadAlerts() {
  const box = document.getElementById("alertsList");
  if (!box) return;

  box.innerHTML = '<span class="placeholder-text">Ładowanie alarmów...</span>';

  try {
    const res = await fetch("/api/list-alerts");
    const data = await res.json();

    if (!res.ok || !data.ok) {
      box.innerHTML = '<span class="placeholder-text">Błąd ładowania alarmów</span>';
      console.log(data);
      return;
    }

    const alerts = data.alerts || [];

    if (alerts.length === 0) {
      box.innerHTML = '<span class="placeholder-text">Tu pojawią się alarmy...</span>';
      return;
    }

    box.innerHTML = alerts
      .map((a) => {
        const added = a.created_at
          ? new Date(a.created_at).toLocaleString("pl-PL")
          : "-";

        const conditionLabel =
          a.condition === "above" ? "cena powyżej" : "cena poniżej";

        const statusLabel = a.triggered ? "zrealizowany" : "aktywny";

        return `
          <div class="alert-item">
            <div class="alert-top">
              <span class="alert-ticker">${a.ticker}</span>
              <button class="alert-remove" onclick="removeAlert(${a.id})">Usuń</button>
            </div>
            <div class="alert-meta">Warunek: ${conditionLabel} ${a.target_price}</div>
            <div class="alert-meta">Status: ${statusLabel}</div>
            <div class="alert-meta">Dodano: ${added}</div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    box.innerHTML = '<span class="placeholder-text">Błąd połączenia z bazą</span>';
    console.log(err);
  }
}

//
// — TEST TELEGRAM —
//

async function testTelegramAlert() {
  const tickerInput = document.getElementById("alertTicker");
  const priceInput = document.getElementById("alertPrice");
  const conditionInput = document.getElementById("alertCondition");

  if (!tickerInput || !priceInput || !conditionInput) return;

  let ticker = tickerInput.value.trim().toUpperCase();
  const price = priceInput.value || "180";
  const condition = conditionInput.value || "above";

  if (!ticker) ticker = "NVDA";

  const resolvedTicker = await resolveTicker(ticker);
  tickerInput.value = resolvedTicker;

  try {
    const res = await fetch("/api/send-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticker: resolvedTicker,
        price,
        condition
      })
    });

    const raw = await res.text();
    alert("STATUS: " + res.status + "\n\nODPOWIEDŹ:\n" + raw);
  } catch (err) {
    alert("FETCH ERROR:\n" + (err?.message || err));
  }
}

//
// — START —
//

setInterval(() => {
  loadAlerts();
}, 15000);

window.addEventListener("load", () => {
  loadChart();
  loadAlerts();
});

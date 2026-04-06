// — NEWS —

async function search() {
  const ticker = document.getElementById("ticker").value.trim().toUpperCase();
  const resultEl = document.getElementById("result");

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
      sredni: "#f59e0b",
    };

    const html = data.news
      .map((n) => {
        const color = badgeColors[n.strength] ?? "#6b7280";
        const date = n.pubDate
          ? new Date(n.pubDate).toLocaleString("pl-PL", {
              dateStyle: "short",
              timeStyle: "short",
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

// — CHART —

function loadChart() {
  let symbol =
    document.getElementById("chartTicker").value.trim().toUpperCase() || "NASDAQ:NVDA";

  if (!symbol.includes(":")) {
    symbol = "NASDAQ:" + symbol;
    document.getElementById("chartTicker").value = symbol;
  }

  const container = document.getElementById("tvchart");

  const src =
    "https://www.tradingview.com/widgetembed/?" +
    "symbol=" +
    encodeURIComponent(symbol) +
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
    '<iframe ' +
    'src="' +
    src +
    '" ' +
    'style="width:100%;height:100%;border:none;" ' +
    'allowtransparency="true" ' +
    'frameborder="0" ' +
    'scrolling="no" ' +
    'allowfullscreen' +
    '></iframe>';
}

document.getElementById("chartTicker")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadChart();
});

// — ALERTY —

async function addAlert() {
  const tickerInput = document.getElementById("alertTicker");
  const priceInput = document.getElementById("alertPrice");
  const conditionInput = document.getElementById("alertCondition");

  let ticker = tickerInput.value.trim().toUpperCase();
  const price = Number(priceInput.value);
  const condition = conditionInput.value;

  if (!ticker) {
    const chartTicker = document.getElementById("chartTicker");
    if (chartTicker) {
      ticker = chartTicker.value.trim().toUpperCase();
    }
  }

  if (ticker && !ticker.includes(":")) {
    ticker = "NASDAQ:" + ticker;
  }

  if (!ticker || !price || price <= 0) {
    alert("Wpisz ticker i poprawną cenę alarmu");
    return;
  }

  try {
    const res = await fetch("/api/add-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticker,
        target_price: price,
        condition,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert("Błąd zapisu alertu");
      console.log(data);
      return;
    }

    alert("Alert zapisany do bazy");

    tickerInput.value = ticker;
    priceInput.value = "";

    loadAlerts();
  } catch (err) {
    alert("Błąd połączenia z backendem");
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
      .map(
        (a) => `
      <div class="alert-item">
        <div class="alert-top">
          <span class="alert-ticker">${a.ticker}</span>
        </div>
        <div class="alert-meta">
          Warunek: ${a.condition === "above" ? "cena powyżej" : "cena poniżej"} ${a.target_price}
        </div>
        <div class="alert-meta">
          Status: ${a.triggered ? "zrealizowany" : "aktywny"}
        </div>
        <div class="alert-meta">
          Dodano: ${a.created_at ? new Date(a.created_at).toLocaleString("pl-PL") : "-"}
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    box.innerHTML = '<span class="placeholder-text">Błąd połączenia z bazą</span>';
    console.log(err);
  }
}

// — TEST TELEGRAM —

async function testTelegramAlert() {
  const ticker =
    document.getElementById("alertTicker").value.trim().toUpperCase() || "NASDAQ:NVDA";
  const price = document.getElementById("alertPrice").value || "180";
  const condition = document.getElementById("alertCondition").value || "above";

  try {
    const res = await fetch("/api/send-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticker, price, condition }),
    });

    const raw = await res.text();
    alert("STATUS: " + res.status + "\n\nODPOWIEDŹ:\n" + raw);
  } catch (err) {
    alert("FETCH ERROR:\n" + (err?.message || err));
  }
}

// — START —

window.addEventListener("load", () => {
  loadChart();
  loadAlerts();
});

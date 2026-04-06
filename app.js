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

async function loadChart() {
  const inputEl = document.getElementById("chartTicker");
  const container = document.getElementById("tvchart");

  let input = inputEl.value.trim().toUpperCase();
  if (!input) input = "NVDA";

  let symbol = input;

  // jeśli nie ma giełdy → szukamy automatycznie
  if (!input.includes(":")) {
    try {
      const res = await fetch(
        `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(input)}`
      );

      const data = await res.json();

      const exact = (data || []).filter(
        (s) => (s.symbol || "").toUpperCase() === input
      );

      const priority = ["NYSE", "NASDAQ", "AMEX"];

      let chosen = null;

      for (const ex of priority) {
        chosen = exact.find(
          (s) => (s.exchange || "").toUpperCase() === ex
        );
        if (chosen) break;
      }

      if (!chosen && exact.length > 0) {
        chosen = exact[0];
      }

      if (chosen) {
        symbol = `${chosen.exchange}:${chosen.symbol}`;
      } else {
        symbol = input;
      }

    } catch (err) {
      console.log("search error", err);
    }
  }

  // pokaż co znalazł
  inputEl.value = symbol;

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

// — ALERTY —

async function addAlert() {
  const tickerInput = document.getElementById("alertTicker");
  const priceInput = document.getElementById("alertPrice");
  const conditionInput = document.getElementById("alertCondition");

  let ticker = tickerInput.value.trim().toUpperCase();
  const price = Number(priceInput.value);
  const condition = conditionInput.value;

  if (!ticker || !price || price <= 0) {
    alert("Wpisz ticker i poprawną cenę alarmu");
    return;
  }

  let resolvedTicker = ticker;

  // 🔥 AUTOMATYCZNE WYSZUKANIE GIEŁDY
  if (!ticker.includes(":")) {
    try {
      const res = await fetch(
        `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(ticker)}`
      );
      const data = await res.json();

      const exact = (data || []).filter(
        (s) => (s.symbol || "").toUpperCase() === ticker
      );

      const priority = ["NYSE", "NASDAQ", "AMEX"];
      let chosen = null;

      for (const ex of priority) {
        chosen = exact.find(
          (s) => (s.exchange || "").toUpperCase() === ex
        );
        if (chosen) break;
      }

      if (!chosen && exact.length > 0) {
        chosen = exact[0];
      }

      if (chosen) {
        resolvedTicker = `${chosen.exchange}:${chosen.symbol}`;
      }
    } catch (err) {
      console.log("Błąd wyszukiwania tickera:", err);
    }
  }

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
      return;
    }

    alert("Alert zapisany");

    tickerInput.value = resolvedTicker;
    priceInput.value = "";

    loadAlerts();

  } catch (err) {
    alert("Błąd połączenia");
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ticker, price, condition })
    });

    const raw = await res.text();
    alert("STATUS: " + res.status + "\n\nODPOWIEDŹ:\n" + raw);
  } catch (err) {
    alert("FETCH ERROR:\n" + (err?.message || err));
  }
}
setInterval(() => {
  loadAlerts();
}, 15000);
// — START —

window.addEventListener("load", () => {
  loadChart();
  loadAlerts();
});

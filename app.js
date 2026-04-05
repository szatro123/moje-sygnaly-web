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
    </div>`;

  try {
    fetch(`https://moje-sygnaly-web.vercel.app/api/news?ticker=${ticker}`)
    const data = await res.json();

    if (!data.news || data.news.length === 0) {
      resultEl.innerHTML = '<span class="state-msg">ℹ️ Brak świeżych newsów</span>';
      return;
    }

    const html = data.news.map(n => `
      <div class="news-card">
        <a class="news-title" href="${n.link}" target="_blank">${n.title}</a>
      </div>
    `).join("");

    resultEl.innerHTML = html;

  } catch (err) {
    resultEl.innerHTML = '<span class="state-msg">❌ Błąd pobierania danych</span>';
  }
}

document.getElementById("ticker").addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

// ================= ALERTY =================

async function addAlert() {
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

  try {
    const res = await fetch("https://moje-sygnaly-web.vercel.app/api/add-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticker,
        target_price: price,
        condition
      })
    });

    const data = await res.json();

    alert(JSON.stringify(data));
if (!res.ok) {
  return;
}

    alert("Alert zapisany do bazy");

    tickerInput.value = ticker;
    priceInput.value = "";

  } catch (err) {
    alert("Błąd połączenia z bazą: " + (err?.message || err));
    console.log(err);
  }
}

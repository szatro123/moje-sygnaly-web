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

  const alerts = JSON.parse(localStorage.getItem("priceAlerts") || "[]");

  const newAlert = {
    id: Date.now(),
    ticker,
    price,
    condition,
    createdAt: new Date().toISOString()
  };

  alerts.unshift(newAlert);
  localStorage.setItem("priceAlerts", JSON.stringify(alerts));

  if (typeof renderAlerts === "function") {
    renderAlerts();
  }

  alert("Alert zapisany lokalnie na stronie");

  tickerInput.value = ticker;
  priceInput.value = "";
}

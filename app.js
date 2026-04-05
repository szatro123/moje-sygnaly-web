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

  const SUPABASE_URL = "https://woetuzltrenmhmhitzbi.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "TU_WKLEJ_SWOJ_SB_PUBLISHABLE_KEY";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify([
        {
          ticker,
          target_price: price,
          condition,
          triggered: false
        }
      ])
    });

    const text = await res.text();

    if (!res.ok) {
      alert("Błąd zapisu do Supabase: " + text);
      return;
    }

    alert("Alert zapisany do Supabase");

    tickerInput.value = ticker;
    priceInput.value = "";

  } catch (err) {
    alert("Błąd połączenia z Supabase: " + (err?.message || err));
    console.log(err);
  }
}

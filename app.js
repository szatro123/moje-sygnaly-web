async function addAlert() {
  const ticker = document.getElementById("alertTicker").value.trim().toUpperCase();
  const price = Number(document.getElementById("alertPrice").value);
  const condition = document.getElementById("alertCondition").value;

  if (!ticker || !price) {
    alert("Wpisz dane");
    return;
  }

  const SUPABASE_URL = "https://woetuzltrenmhmhitzbi.supabase.co";
  const SUPABASE_KEY = "sb_publishable_1nIYzQLSklZzvAuI2QhrlQ_I7zCNLmR";

  try {
    const res = await fetch(SUPABASE_URL + "/rest/v1/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      },
      body: JSON.stringify([{
        ticker: ticker,
        target_price: price,
        condition: condition,
        triggered: false
      }])
    });

    const text = await res.text();

    alert(text);

  } catch (err) {
    alert("Błąd: " + err.message);
    console.log(err);
  }
}

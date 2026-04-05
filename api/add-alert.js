try {
  const SUPABASE_URL = "https://woetuzltrenmhmhitzbi.supabase.co";
  const SUPABASE_KEY = "sb_publishable_1nIYzQLSklZzvAuI2QhrlQ_I7zCNLmR";

  const fullUrl = SUPABASE_URL + "/rest/v1/alerts";

  alert("URL: " + fullUrl);

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Prefer": "return=representation"
    },
    body: JSON.stringify([
      {
        ticker: ticker,
        target_price: price,
        condition: condition,
        triggered: false
      }
    ])
  });

  const text = await res.text();

  alert("STATUS: " + res.status + "\nODPOWIEDŹ:\n" + text);

} catch (err) {
  alert(
    "BŁĄD FETCH\n\n" +
    "message: " + (err?.message || err) + "\n\n" +
    "name: " + (err?.name || "brak")
  );
}

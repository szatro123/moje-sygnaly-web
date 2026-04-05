async function addAlert() {
  const ticker = document.getElementById("alertTicker").value.trim().toUpperCase();
  const price = Number(document.getElementById("alertPrice").value);
  const condition = document.getElementById("alertCondition").value;

  if (!ticker || !price) {
    alert("Wpisz dane");
    return;
  }

  try {
    const res = await fetch("/api/add-alert", {
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

  } catch (err) {
    alert("Błąd: " + err.message);
  }
}

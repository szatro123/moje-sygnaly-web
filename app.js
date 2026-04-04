async function search() {
  const ticker = document.getElementById("ticker").value;

  if (!ticker) {
    document.getElementById("result").innerText = "Wpisz ticker";
    return;
  }

  document.getElementById("result").innerText = "Ładowanie...";

  try {
    const res = await fetch(`https://moje-sygnaly-web.vercel.app/api/news?ticker=${ticker}`);
    const data = await res.json();

    if (!data.news || data.news.length === 0) {
      document.getElementById("result").innerText = "Brak newsów";
      return;
    }

    const html = data.news.map(n => 
      `<div style="margin-bottom:10px">
        <a href="${n.link}" target="_blank">${n.title}</a>
      </div>`
    ).join("");

    document.getElementById("result").innerHTML = html;

  } catch (err) {
    document.getElementById("result").innerText = "Błąd pobierania danych";
  }
}

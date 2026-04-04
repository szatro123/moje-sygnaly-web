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
      document.getElementById("result").innerText = "Brak świeżych newsów z ostatnich 6h";
      return;
    }

    const html = data.news.map(n => {
      const badgeColor =
        n.strength === "mocny" ? "#16a34a" :
        n.strength === "średni" ? "#f59e0b" :
        "#6b7280";

      return `
        <div style="margin-bottom:16px; padding:12px; border:1px solid #334155; border-radius:10px; background:#111827;">
          <div style="margin-bottom:8px;">
            <span style="background:${badgeColor}; color:white; padding:4px 8px; border-radius:999px; font-size:12px;">
              ${n.strength}
            </span>
          </div>

          <a href="${n.link}" target="_blank" style="color:#4da3ff; font-size:16px; text-decoration:none;">
            ${n.title}
          </a>

          <div style="font-size:12px; color:gray; margin-top:8px;">
            ${n.pubDate || ""}
          </div>
        </div>
      `;
    }).join("");

    document.getElementById("result").innerHTML = html;

  } catch (err) {
    document.getElementById("result").innerText = "Błąd pobierania danych";
  }
}

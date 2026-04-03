function search() {
  const ticker = document.getElementById("ticker").value;

  if (!ticker) {
    document.getElementById("result").innerText = "Wpisz ticker";
    return;
  }

  document.getElementById("result").innerHTML =
    "Szukasz: " + ticker + "<br>Za chwilę podłączymy newsy 🔥";
}

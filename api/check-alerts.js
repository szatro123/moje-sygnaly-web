const APP_URL = "https://moje-sygnaly-web.vercel.app";

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Brak SUPABASE_URL albo SUPABASE_KEY w Vercel"
      });
    }

    const alertsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/alerts?select=*&triggered=eq.false`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const alertsText = await alertsRes.text();

    if (!alertsRes.ok) {
      return res.status(500).json({
        ok: false,
        step: "read_alerts",
        error: alertsText
      });
    }

    const alerts = JSON.parse(alertsText);

    if (!Array.isArray(alerts) || alerts.length === 0) {
      return res.status(200).json({
        ok: true,
        message: "Brak aktywnych alertów",
        checked: 0,
        triggered: 0
      });
    }

    let checked = 0;
    let triggeredCount = 0;
    const results = [];

    for (const alert of alerts) {
      checked++;

      try {
        const priceRes = await fetch(
          `${APP_URL}/api/price?ticker=${encodeURIComponent(alert.ticker)}`
        );
        const priceData = await priceRes.json();

        if (!priceRes.ok || !priceData.price) {
          results.push({
            id: alert.id,
            ticker: alert.ticker,
            ok: false,
            step: "price",
            error: priceData.error || "Nie udało się pobrać ceny"
          });
          continue;
        }

        const livePrice = Number(priceData.price);
        const targetPrice = Number(alert.target_price);

        let shouldTrigger = false;

        if (alert.condition === "above") {
          shouldTrigger = livePrice >= targetPrice;
        }

        if (alert.condition === "below") {
          shouldTrigger = livePrice <= targetPrice;
        }

        if (!shouldTrigger) {
          results.push({
            id: alert.id,
            ticker: alert.ticker,
            ok: true,
            triggered: false,
            livePrice
          });
          continue;
        }

        const sendRes = await fetch(`${APP_URL}/api/send-alert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ticker: alert.ticker,
            price: `${targetPrice} | live: ${livePrice}`,
            condition: alert.condition
          })
        });

        const sendText = await sendRes.text();

        if (!sendRes.ok) {
          results.push({
            id: alert.id,
            ticker: alert.ticker,
            ok: false,
            step: "telegram",
            error: sendText
          });
          continue;
        }

        const updateRes = await fetch(
          `${SUPABASE_URL}/rest/v1/alerts?id=eq.${alert.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
              triggered: true
            })
          }
        );

        const updateText = await updateRes.text();

        if (!updateRes.ok) {
          results.push({
            id: alert.id,
            ticker: alert.ticker,
            ok: false,
            step: "update_alert",
            error: updateText
          });
          continue;
        }

        triggeredCount++;
        results.push({
          id: alert.id,
          ticker: alert.ticker,
          ok: true,
          triggered: true,
          livePrice
        });
      } catch (err) {
        results.push({
          id: alert.id,
          ticker: alert.ticker,
          ok: false,
          step: "loop_exception",
          error: err?.message || String(err)
        });
      }
    }

    return res.status(200).json({
      ok: true,
      checked,
      triggered: triggeredCount,
      results
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err)
    });
  }
}

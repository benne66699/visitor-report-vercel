export default async function handler(req, res) {
  // CORS headers for all responses
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  const TELEGRAM_BOT_TOKEN = "8041523727:AAGgdI57Th_vr_HyZuS3RmM0NEiJnhODhUw";
  const TELEGRAM_CHAT_ID = "-4690001414";

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let log = {};
  try {
    const info = req.body || {};
    log.info = info;
    let ip = req.headers["x-forwarded-for"]?.split(",")[0] || "";
    log.xForwardedFor = req.headers["x-forwarded-for"];
    let geo = { city: "", country: "", org: "", ip: "" };
    let data;
    if (ip && ip !== "::1" && !ip.startsWith("127.")) {
      const resp = await fetch(`https://ipinfo.io/${ip}/json`);
      data = await resp.json();
      geo = {
        city: data.city || "",
        country: data.country || "",
        org: data.org || "",
        ip: data.ip || ip
      };
    } else {
      const resp = await fetch("https://ipinfo.io/json");
      data = await resp.json();
      geo = {
        city: data.city || "",
        country: data.country || "",
        org: data.org || "",
        ip: data.ip || ""
      };
    }
    log.geo = geo;

    const browser = info.browser || "";
    const provider = geo.org || info.provider || "";
    const msg =
      `👋 New visitor:\n` +
      `IP: ${geo.ip}\n` +
      `City: ${geo.city}\n` +
      `Country: ${geo.country}\n` +
      `Provider: ${provider}\n` +
      `Browser: ${browser}`;
    log.msg = msg;

    const tgResp = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: msg,
        }),
      }
    );
    const tgRespJson = await tgResp.json();
    log.telegram = { status: tgResp.status, resp: tgRespJson };

    return res.status(200).json({ success: true, debug: log });
  } catch (e) {
    log.error = String(e);
    return res.status(500).json({ success: false, debug: log });
  }
}

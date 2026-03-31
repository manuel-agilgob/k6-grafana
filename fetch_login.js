const fetch = require('node-fetch');
const fs = require("fs");
const path = require("path");

const HAR_PATH =
  process.argv[2] ||
  "/home/manuel/Repos/k6-grafana/tmp/nilo.agilgob.com_dom_agilgob.demo_stats_get_procedures_status_Archive [26-03-31 12-21-24].har";

const URL_HINT = process.argv[3] || "get_procedures_status";

function pickHarEntry(har, hint) {
  const entries = har?.log?.entries || [];
  if (!entries.length) throw new Error("El HAR no tiene entries.");

  const byHint = entries.find((e) => e?.request?.url?.includes(hint));
  if (byHint) return byHint;

  console.warn(`No encontré URL con hint "${hint}". Uso la primera entry.`);
  return entries[0];
}

function buildHeaders(harHeaders = []) {
  const skip = new Set([
    "content-length",
    "host",
    "connection",
    "accept-encoding", // fetch lo maneja
    ":authority",
    ":method",
    ":path",
    ":scheme",
  ]);

  const headers = {};
  for (const h of harHeaders) {
    const key = String(h.name || "").toLowerCase();
    if (!key || skip.has(key)) continue;
    headers[h.name] = h.value;
  }
  return headers;
}

(async () => {
  const t0 = Date.now();

  const fullPath = path.resolve(HAR_PATH);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`No existe el HAR: ${fullPath}`);
  }

  const harRaw = fs.readFileSync(fullPath, "utf8");
  const har = JSON.parse(harRaw);

  const entry = pickHarEntry(har, URL_HINT);
  const req = entry.request;

  const method = req.method || "GET";
  const url = req.url;
  const headers = buildHeaders(req.headers || []);

  let body;
  if (req.postData?.text) {
    body = req.postData.text;
  }

  console.log("Replicando request:");
  console.log({ method, url });

  const res = await fetch(url, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  console.log("Status:", res.status, res.statusText);
  console.log("Content-Type:", contentType);
  console.log("Response bytes:", Buffer.byteLength(text, "utf8"));

  if (contentType.includes("application/json")) {
    try {
      console.log("JSON:", JSON.parse(text));
    } catch {
      console.log("Body (json inválido):", text.slice(0, 2000));
    }
  } else {
    console.log("Body:", text.slice(0, 2000));
  }

  console.log(`Execution time: ${Date.now() - t0} ms`);
})().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

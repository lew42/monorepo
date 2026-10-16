import fs from "node:fs"; import { strip } from "./strip.mjs";
const real = JSON.parse(fs.readFileSync(new URL("./real.json", import.meta.url), "utf8"));
const CPT = 2.9, PACK = 100000, FIXED = 2200, IN = 1e-6, OUT = 5e-6, OUT_PER = 300;
const items = [];
for (const r of real) {
  const t = strip(r.p).text.split("\n").map(l => l.startsWith("USER: Where you are") ? l.slice(0, 260) : l).join("\n");
  items.push({ id: r.id, chars: t.length, last: r.last, linked: r.linked });
}
const tiny = items.filter(i => i.chars < 2048), body = items.filter(i => i.chars >= 2048);
function cost(list) {
  let calls = 0, inTok = 0, outTok = 0, cur = 0; const big = list.filter(i => i.chars > PACK), small = list.filter(i => i.chars <= PACK).sort((a, b) => a.chars - b.chars);
  for (const i of big) { const n = Math.ceil(i.chars / PACK); calls += n + 1; inTok += i.chars / CPT + (n + 1) * FIXED; outTok += (n + 1) * OUT_PER; }
  for (const i of small) { if (cur + i.chars > PACK) { calls++; cur = 0; inTok += FIXED; } cur += i.chars; inTok += i.chars / CPT; outTok += OUT_PER; }
  if (cur) { calls++; inTok += FIXED; }
  return { sessions: list.length, calls, inMtok: +(inTok / 1e6).toFixed(2), usd: +(inTok * IN + outTok * OUT).toFixed(2) };
}
console.log("backlog all real >=2KB", JSON.stringify(cost(body)), "tiny(<2KB, script-tagged)", tiny.length, "chars", body.reduce((s, i) => s + i.chars, 0));
const unlinkedBody = body.filter(i => !i.linked); console.log("of which linked to a task", body.filter(i => i.linked).length, JSON.stringify(cost(body.filter(i => i.linked))));
const byDay = {}; for (const i of items) { const d = (i.last || "").slice(0, 10); (byDay[d] ??= []).push(i); }
const days = Object.keys(byDay).sort().slice(-14);
console.log("PER DAY (real sessions, >=2KB):", days.map(d => d.slice(5) + ":" + byDay[d].filter(i => i.chars >= 2048).length).join(" "));
const last7 = days.slice(-7).flatMap(d => byDay[d]).filter(i => i.chars >= 2048); const c7 = cost(last7);
console.log("last7days", JSON.stringify(c7), "per-day usd", +(c7.usd / 7).toFixed(2), "per-session usd", +(c7.usd / c7.sessions).toFixed(4), "per-30d", +(c7.usd / 7 * 30).toFixed(0));
const c1 = cost(body); console.log("per-session avg backlog usd", +(c1.usd / c1.sessions).toFixed(4));
// unpacked (one call per session) for comparison
const unp = body.reduce((s, i) => s + (i.chars / CPT + FIXED) * IN + OUT_PER * OUT, 0); console.log("unpacked one-call-each usd", +unp.toFixed(2));
const sz = body.map(i => i.chars).sort((a, b) => a - b); console.log("median chars", sz[Math.floor(sz.length / 2)], "p90", sz[Math.floor(sz.length * .9)], "max", sz.at(-1));

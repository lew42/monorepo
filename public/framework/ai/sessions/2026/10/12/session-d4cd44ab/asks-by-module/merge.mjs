// Merge Haiku tags into merged-asks.json (grouped by module+topic) and measure quote accuracy.
import fs from "fs";
const d = import.meta.dirname;
const cand = new Map(fs.readFileSync(d + "/candidates.jsonl", "utf8").trim().split("\n").map(l => { const c = JSON.parse(l); return [c.id, c]; }));
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
let tags = [], bad = 0, badline = 0;
for (const f of fs.readdirSync(d + "/tags")) for (const l of fs.readFileSync(d + "/tags/" + f, "utf8").replace(/^FEFF/, "").split("\n")) {
  if (!l.trim()) continue; try { tags.push(JSON.parse(l)); } catch { badline++; }
}
for (const t of tags) { const c = cand.get(t.id); t.src = c?.src; t.at = c?.at; t.quote_ok = !!(c && norm(c.text).includes(norm(t.quote || "").slice(0, 40))); if (!t.quote_ok) bad++; }
const groups = {};
for (const t of tags) { const k = t.module + "/" + t.topic; (groups[k] ||= { module: t.module, topic: t.topic, asks: [], ids: new Set(), dates: [] }); const g = groups[k]; g.asks.push(t.ask); g.ids.add(t.id); g.dates.push(t.at); }
const out = Object.values(groups).map(g => ({ module: g.module, topic: g.topic, count: g.ids.size, first: g.dates.sort()[0], last: g.dates.sort().at(-1), ask: g.asks[0], also: g.asks.slice(1, 4), sources: [...g.ids].map(i => cand.get(i)?.src) })).sort((a, b) => b.count - a.count);
fs.writeFileSync(d + "/merged-asks.json", JSON.stringify(out, null, 1));
const byMod = {}; for (const g of out) byMod[g.module] = (byMod[g.module] || 0) + 1;
console.log({ tags: tags.length, badline, quoteMismatch: bad, quoteAccuracy: ((1 - bad / tags.length) * 100).toFixed(1) + "%", topics: out.length, byMod });

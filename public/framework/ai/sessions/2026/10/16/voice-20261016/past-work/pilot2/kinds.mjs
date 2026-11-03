import fs from "node:fs"; import { strip } from "./strip.mjs";
const rows = JSON.parse(fs.readFileSync(new URL("./measure.json", import.meta.url), "utf8")).filter(r => r.stripped >= 0);
const heads = new Map();
const info = [];
for (const r of rows) {
  const s = strip(r.p); const first = (s.text.split("\n").find(l => l.startsWith("USER: ")) || "").slice(6);
  const key = first.replace(/\s+/g, " ").slice(0, 38);
  const h = heads.get(key) || { n: 0, kb: 0 }; h.n++; h.kb += r.stripped / 1024; heads.set(key, h);
  info.push({ id: r.id, p: r.p, kb: r.stripped / 1024, key, nuser: s.text.split("\n").filter(l => l.startsWith("USER: ")).length, nfiles: s.nfiles, last: r.last });
}
const top = [...heads.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 25);
for (const [k, v] of top) console.log(String(v.n).padStart(5), String(Math.round(v.kb)).padStart(6) + "KB", JSON.stringify(k));
fs.writeFileSync(new URL("./kinds.json", import.meta.url), JSON.stringify(info));

// Strip SDK transcripts to owner prompts + assistant text + file paths. Usage: node strip.mjs measure | node strip.mjs one <file>
import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const ROOT = path.join(os.homedir(), ".claude", "projects");
export function strip(file) {
  const out = []; let raw = 0, first = "", last = "";
  const files = new Set();
  const txt = fs.readFileSync(file, "utf8"); raw = txt.length;
  for (const line of txt.split("\n")) {
    if (!line.startsWith("{")) continue;
    let o; try { o = JSON.parse(line); } catch { continue; }
    const ts = o.timestamp; if (ts) { first ||= ts; last = ts; }
    const m = o.message; if (!m) continue;
    const c = m.content;
    if (o.type === "user") {
      const parts = typeof c === "string" ? [c] : (c || []).filter(b => b.type === "text").map(b => b.text);
      for (let t of parts) {
        t = t.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "").trim();
        if (!t || t.startsWith("<command-") || t.startsWith("<local-command") || t.startsWith("Caveat:")) continue;
        out.push("USER: " + (t.startsWith("Where you are") ? t.slice(0, 260) + " [readme-chain boilerplate cut]" : t.slice(0, 4000)));
      }
    } else if (o.type === "assistant" && Array.isArray(c)) {
      for (const b of c) {
        if (b.type === "text" && b.text.trim()) out.push("AI: " + b.text.trim().slice(0, 1200));
        else if (b.type === "tool_use") { const p = b.input?.file_path || b.input?.path; if (p && /^(Edit|Write|MultiEdit|NotebookEdit)$/.test(b.name)) files.add(String(p).replace(/\\/g, "/").replace(/^.*?monorepo\//, "")); }
      }
    }
  }
  if (files.size) out.push("FILES EDITED: " + [...files].join(", "));
  return { text: out.join("\n"), raw, first, last, nfiles: files.size };
}
if (process.argv[1].endsWith("strip.mjs")) {
  const mode = process.argv[2];
  if (mode === "one") { const r = strip(process.argv[3]); fs.writeFileSync(process.argv[4], r.text); console.log({ raw: r.raw, stripped: r.text.length, tok: Math.round(r.text.length / 3.8), first: r.first, last: r.last, nfiles: r.nfiles }); }
  else {
    const rows = [];
    for (const d of fs.readdirSync(ROOT)) {
      const dir = path.join(ROOT, d); let es; try { es = fs.readdirSync(dir); } catch { continue; }
      for (const f of es) if (f.endsWith(".jsonl")) { const p = path.join(dir, f); const st = fs.statSync(p); rows.push({ p, d, id: f.slice(0, -6), raw: st.size, mtime: st.mtimeMs }); }
    }
    const t0 = Date.now(); let tot = 0, totS = 0;
    for (const r of rows) { if (r.raw > 60e6) { r.stripped = -1; continue; } const s = strip(r.p); r.stripped = s.text.length; r.first = s.first; r.last = s.last; tot += r.raw; totS += r.stripped; }
    const q = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];
    const st = rows.map(r => r.stripped).filter(x => x >= 0).sort((a, b) => a - b);
    const rw = rows.map(r => r.raw).sort((a, b) => a - b);
    const day = n => rows.filter(r => r.mtime > Date.now() - n * 864e5);
    const sum = (a, k) => a.reduce((s, r) => s + Math.max(0, r[k]), 0);
    console.log(JSON.stringify({ sessions: rows.length, rawMB: +(tot / 1e6).toFixed(0), strippedMB: +(totS / 1e6).toFixed(1), secs: (Date.now() - t0) / 1000,
      rawMedianKB: Math.round(q(rw, .5) / 1024), rawP90KB: Math.round(q(rw, .9) / 1024), rawMaxMB: +(rw.at(-1) / 1e6).toFixed(0),
      stripMedianKB: +(q(st, .5) / 1024).toFixed(1), stripP90KB: Math.round(q(st, .9) / 1024), stripMaxKB: Math.round(st.at(-1) / 1024),
      last30d: { n: day(30).length, strippedMB: +(sum(day(30), "stripped") / 1e6).toFixed(1) }, last7d: { n: day(7).length, strippedMB: +(sum(day(7), "stripped") / 1e6).toFixed(1) }, last1d: { n: day(1).length, strippedMB: +(sum(day(1), "stripped") / 1e6).toFixed(1) },
      over190KB: st.filter(x => x > 190 * 1024).length, tiny_lt1KB: st.filter(x => x < 1024).length }, null, 1));
    fs.writeFileSync(path.join(path.dirname(process.argv[1]), "measure.json"), JSON.stringify(rows.map(({ p, d, id, raw, stripped, mtime, first, last }) => ({ p, d, id, raw, stripped, mtime, first, last }))));
  }
}

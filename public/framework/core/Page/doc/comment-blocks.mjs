// Lists every comment block of 4+ lines in Page.class.js with a first-guess class and destination doc.
// usage: node public/framework/core/Page/doc/comment-blocks.mjs [--md]
import fs from "node:fs"; import path from "node:path";
const L = fs.readFileSync(path.join(import.meta.dirname, "../Page.class.js"), "utf8").split("\n");
const DOC = [[1,72,"jsonl.md"],[72,542,"jsonl.md"],[542,650,"loading.md"],[650,805,"words.md"],[805,907,"roles.md"],[907,1027,"open.md"],[1027,1238,"api.md"],[1238,1474,"content.md"],[1474,1526,"property/related.md"],[1526,1823,"columns.md"],[1823,1973,"previews.md"],[1973,2400,"method/prefs.md"]];
const blocks = []; let cur = null, inB = false;
L.forEach((l, i) => { const t = l.trim(); const c = inB || t.startsWith("//") || t.startsWith("/*"); if (t.startsWith("/*") && !t.includes("*/")) inB = true; else if (inB && t.includes("*/")) inB = false;
  if (c) { (cur ??= { s: i + 1, n: 0, text: [] }).n++; cur.text.push(t); } else if (cur) { if (cur.n >= 4) blocks.push(cur); cur = null; } });
const out = blocks.map(b => { const t = b.text.join(" ");
  const doc = DOC.find(d => b.s >= d[0] && b.s < d[1])?.[2] ?? "decisions.md";
  let cls, dest;
  if (/════/.test(b.text[0])) { cls = "banner: keep as ONE line + doc pointer"; dest = doc; }
  else if (/compat only|one release|drop the special|remove (me|after)/i.test(t)) { cls = "obsolete? check callers, then drop"; dest = "decisions.md (history line)"; }
  else if (/20\d\d-\d\d-\d\d|\bwas\b|used to|renamed|folded|deleted|retired|the owner:/i.test(t)) { cls = "history: move"; dest = "decisions.md"; }
  else if (/⚠/.test(t)) { cls = "trap: keep 1 line, rest to doc"; dest = "watch-out.md"; }
  else { cls = "explanation: move, keep 1 line"; dest = doc; }
  return { ...b, cls, dest, first: b.text[0].replace(/^\/\/\s?|^\/\*+\s?/, "").slice(0, 70) }; });
const tally = {}; out.forEach(b => { const k = b.cls.split(":")[0]; tally[k] = tally[k] || { blocks: 0, lines: 0 }; tally[k].blocks++; tally[k].lines += b.n; });
console.log(`${out.length} blocks, ${out.reduce((a, b) => a + b.n, 0)} lines`); console.log(JSON.stringify(tally));
if (process.argv.includes("--md")) out.forEach(b => console.log(`| ${b.s} | ${b.n} | ${b.cls} | ${b.dest} | ${b.first.replace(/\|/g, "/")} |`));

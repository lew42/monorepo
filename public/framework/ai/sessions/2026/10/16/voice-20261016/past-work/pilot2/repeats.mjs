// Round 4 step 3b: repeated asks, no AI. Owner sentences -> stemmed rare words -> word pairs that recur across many sessions and days -> merged into clusters.
// Prints/writes the candidates; a Haiku pass (judge.mjs) only names and judges the top few.   node repeats.mjs [days=30]
import fs from "node:fs"; import path from "node:path";
const days = +process.argv[2] || 30, T = process.env.TEMP;
const ALL = JSON.parse(fs.readFileSync(path.join(T, "pw", `prompts-${days}d.json`), "utf8"));
// the owner's words: relayed [from: owner] lines, plus plain prompts of sessions no Servex brief started. Any text that opens 5+ sessions the same way is a template, not a person.
const head = t => t.replace(/\s+/g, " ").slice(0, 60), seen = new Map(); for (const p of ALL) { const k = head(p.t); (seen.get(k) || seen.set(k, new Set()).get(k)).add(p.sid); }
const P = ALL.filter(p => /^\[from: owner/.test(p.t) && (seen.get(head(p.t))?.size || 0) < 5 && !/^Continue from where you left off/.test(p.t));
const STOP = new Set("that this with have from they them then than there their what when where which will would could should about into just like also still some more very much even only over been being were your you're dont didn't it's i'm can't there's those these here does doing done make made need want going know think thing things really okay yeah right look let's lets sure maybe actually also because every each other another without within after before again always never same still being using used use uses please first last next".split(" "));
const stem = w => w.replace(/(ing|ed|es|s|ly)$/, "");
const clean = t => t.replace(/^\[from: owner\]\s*(\[on [^\]]*\])?\s*/i, "").replace(/\(the owner has stopped[^)]*\)/gi, "").replace(/`[^`]*`|https?:\/\/\S+|[A-Za-z]:[\/]\S+|\/[\w./-]{6,}/g, " ");
const sents = []; // {sid, day, w:Set, text}
for (const p of P) { const day = p.at.slice(0, 10); for (const s of clean(p.t).split(/(?<=[.?!])\s+|\n+/)) { if (s.split(/\s+/).length < 5) continue; const w = new Set(s.toLowerCase().match(/[a-z]{4,}/g)?.filter(x => !STOP.has(x)).map(stem).filter(x => x.length >= 4 && !STOP.has(x)) || []); if (w.size >= 2) sents.push({ sid: p.sid, day, w, text: s.trim() }); } }
const df = new Map(); for (const s of sents) for (const w of s.w) df.set(w, (df.get(w) || 0) + 1);
const keep = w => df.get(w) >= 4 && df.get(w) <= sents.length * 0.012;
const pair = new Map(); // "a|b" -> {n, sids:Set, days:Set, ex}
for (const s of sents) { const ws = [...s.w].filter(keep).sort(); for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) { const k = ws[i] + "|" + ws[j]; let e = pair.get(k); if (!e) pair.set(k, e = { sids: new Set(), days: new Set(), ex: s.text }); e.sids.add(s.sid); e.days.add(s.day); } }
let cand = [...pair].map(([k, e]) => ({ k, sessions: e.sids.size, days: e.days.size, last: [...e.days].sort().at(-1), first: [...e.days].sort()[0], sids: [...e.sids], ex: e.ex.slice(0, 160) })).filter(c => c.sessions >= 5 && c.days >= 3);
// merge pairs whose session sets overlap strongly (Jaccard >= .5) into one cluster, strongest first
cand.sort((a, b) => b.sessions - a.sessions); const clusters = [];
for (const c of cand) { const set = new Set(c.sids); let hit = null; for (const k of clusters) { const inter = c.sids.filter(x => k.set.has(x)).length; if (inter / (set.size + k.set.size - inter) >= .5) { hit = k; break; } } if (hit) { hit.keys.push(c.k); for (const x of c.sids) hit.set.add(x); } else clusters.push({ keys: [c.k], set, top: c }); }
const out = clusters.map(k => ({ keys: k.keys.slice(0, 6), sessions: k.set.size, days: k.top.days, first: k.top.first, last: k.top.last, example: k.top.ex, sids: [...k.set] })).sort((a, b) => b.sessions - a.sessions);
fs.writeFileSync(path.join(T, "pw", `repeats-${days}d.json`), JSON.stringify(out));
console.log(JSON.stringify({ sentences: sents.length, pairs: pair.size, candidatePairs: cand.length, clusters: out.length }));
for (const o of out.slice(0, 45)) console.log(String(o.sessions).padStart(4), String(o.days).padStart(2) + "d", o.first.slice(5), o.last.slice(5), o.keys.slice(0, 3).join(" ; "), "::", o.example.slice(0, 90));

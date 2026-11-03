// No AI: tag the extracted sessions from (1) edited file paths, (2) the task folder a brief names, (3) module-name keywords in the owner's prompts + result.
// node tag.mjs [days]  (needs extract.json from extract.mjs)   Answers: how many sessions does the cheap pass resolve, and does keyword agree with files?
import fs from "node:fs"; import path from "node:path";
const here = import.meta.dirname, TEMP = process.env.TEMP;
const rows = JSON.parse(fs.readFileSync(path.join(TEMP, "pw", "extract.json"), "utf8"));
const days = +process.argv[2] || 0, rs = days ? rows.filter(r => r.mtime > Date.now() - days * 864e5) : rows;

// vocabulary = the module list in topic-tree.txt ("tier/ : name name name"); names that are common English words are dropped
const COMMON = new Set("new old log doc is item view list task track tags tree menu card field table words scale icon item kbd alert badge theme start color content layout navigation section stats toolbar tooltip avatar background controls dialog decision accordion progress elements layers rules sections stacks system widths source markup research library catalog audit code design lab util sandbox sources faq timeline files highlight layout panel session search shell sidebar router property events page core ai".split(" "));
const vocab = new Map();   // word(lower) -> module
for (const l of fs.readFileSync(path.join(here, "topic-tree.txt"), "utf8").split("\n")) {
	const m = l.match(/^([\w-]+)\/\s*:?\s*(.*)$/); if (!m) continue;
	for (const n of m[2].split(/\s+/).filter(Boolean)) { const w = n.toLowerCase(); if (w.length >= 4 && !COMMON.has(w)) vocab.set(w, m[1] + "/" + n); }
}
for (const w of ["Dictate", "Mention", "DevBar", "Panel", "Router"]) vocab.set(w.toLowerCase(), w);   // sharp single-word names worth keeping
const fileMod = f => { f = f.replace(/\\/g, "/"); let m;
	if (/^public\/framework\/ai\//.test(f)) return "ai"; if ((m = f.match(/^public\/framework\/([^/]+)\/([^/.]+)(\/|$)/))) return m[1] + "/" + m[2];
	if ((m = f.match(/^Servex\/([^/.]+)\//))) return "Servex/" + m[1]; if (/^Servex\//.test(f)) return "Servex"; if (/^Server\//.test(f)) return "Server";
	if ((m = f.match(/^public\/(imagine|layouts|websites)\/([^/.]+)\//))) return m[1] + "/" + m[2]; return f.split("/")[0]; };

// session id -> modules touched by the task log that names it (the join SessionIndex already has)
const hereN = here.replace(/\\/g, "/"), AI = hereN.slice(0, hereN.indexOf("/public/framework/ai/") + "/public/framework/ai".length), linkMods = new Map();
(function w(d) { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const p = d + "/" + e.name; if (e.isDirectory()) { if (e.name !== "node_modules") w(p); } else if (e.name === "task.jsonl") {
	const ids = new Set(), mods = new Set(); for (const l of fs.readFileSync(p, "utf8").split("\n")) { if (!l) continue; let o; try { o = JSON.parse(l); } catch { continue; } const sid = o.assign?.session_id || o.session_id; if (sid) ids.add(sid); for (const f of o.action?.files || []) mods.add(fileMod(f)); }
	for (const id of ids) { const m = linkMods.get(id) || new Set(); for (const x of mods) m.add(x); linkMods.set(id, m); } } } })(AI + "/sessions");
let allChars = 0, weakChars = 0, nWeak = 0, strong = 0, linked = 0, aiOnly = 0;
let resolved = { files: 0, task: 0, keyword: 0, agent: 0, none: 0 }, any = 0, agree = 0, comparable = 0, kwOnly = 0, byChars = { total: 0 };
const sample = [];
for (const r of rs) {
	const lower = r.text.toLowerCase(), hits = new Map();
	for (const [w, mod] of vocab) { const c = lower.split(w).length - 1; if (c) hits.set(mod, (hits.get(mod) || 0) + c); }   // substring count is enough for a measure
	const kw = [...hits].sort((a, b) => b[1] - a[1]).filter(([, c]) => c >= 2).map(([m]) => m).slice(0, 3);
	const fmods = [...new Set(r.files.filter(f => !/^([A-Za-z]:|\/|\.)/.test(f) && !/scratchpad|AppData/.test(f)).map(fileMod))].filter(m => m !== "ai");
	const lm = [...(linkMods.get(r.id) || [])].filter(m => m !== "ai"); if (linkMods.has(r.id)) linked++; const sig = fmods.length || lm.length || r.task; const cc = Math.min(r.text.length, 30000); allChars += cc; if (!sig) { weakChars += cc; nWeak++; }
	if (sig) strong++; else if (r.files.some(f => /^public\/framework\/ai\//.test(f)) || linkMods.has(r.id)) aiOnly++;
	const has = { files: fmods.length > 0, task: !!r.task, keyword: kw.length > 0, agent: !!r.agent };
	for (const k of Object.keys(has)) if (has[k]) resolved[k]++;
	if (has.files || has.task || has.keyword) any++; else resolved.none++;
	if (!has.files && !has.task && has.keyword) kwOnly++;
	if (fmods.length && kw.length) { comparable++; if (kw.some(k => fmods.some(f => f === k || f.endsWith("/" + k.split("/").pop()) || k.endsWith("/" + f.split("/").pop())))) agree++; }
	if (sample.length < 6 && kw.length && fmods.length) sample.push({ id: r.id.slice(0, 8), files: fmods.slice(0, 3), kw });
}
// Haiku 4.5 ($1 in, $5 out per M): 2.9 chars a token, packed 100k chars a call, 2,200 tokens of fixed prompt a call, 150 tokens out a session, each session capped at 30k chars
const usd = (chars, n) => +(chars / 2.9 / 1e6 + Math.ceil(chars / 1e5) * 2200 / 1e6 + n * 150 * 5 / 1e6).toFixed(2);
const pct = (a, b) => Math.round(100 * a / b) + "%";
console.log(JSON.stringify({ window: days ? `last ${days} days` : "all", sessions: rs.length,
	"has edited files": `${resolved.files} (${pct(resolved.files, rs.length)})`, "brief names a task folder": `${resolved.task} (${pct(resolved.task, rs.length)})`,
	"keyword tag (>=2 hits)": `${resolved.keyword} (${pct(resolved.keyword, rs.length)})`, "agent name known": `${resolved.agent} (${pct(resolved.agent, rs.length)})`,
	"resolved by files OR task OR keyword": `${any} (${pct(any, rs.length)})`, "keyword is the ONLY signal": kwOnly, "no cheap signal at all": `${resolved.none} (${pct(resolved.none, rs.length)})`,
	"named by a task.jsonl (session_id join)": `${linked} (${pct(linked, rs.length)})`, "STRONG signal (edited non-ai files, or its task log's files, or a named task folder)": `${strong} (${pct(strong, rs.length)})`, "weak only: ai/ docs edited or task-linked, no module": aiOnly, "Haiku fallback cost, ALL sessions": "$" + usd(allChars, rs.length), "Haiku fallback cost, only sessions with no strong signal": `${nWeak} sessions, $` + usd(weakChars, nWeak), "keyword vs files, both present": comparable, "keyword agrees with a file module": `${agree} (${pct(agree, comparable)})`, sample }, null, 1));

// fold-proof.mjs — proves Server/SessionConsolidate.mjs --all --apply loses nothing, on a COPY of the live store's twin folders (never the main tree).
//   node fold-proof.mjs <checkout with the new SessionConsolidate> [--live <repo>]     writes fold-proof.json beside this file
// 1. every folder of every session held twice is copied (whole) into a scratch repo, at the same path;
// 2. apply_all() folds them there;
// 3. measured: twins before/after (must be 0 after), session ids before/after (must be equal), and every line of every .jsonl / .json
//    file that was in a removed folder or a replaced file, looked for again in the scratch store. A line not found must be an older
//    cache summary of a session whose kept cache.jsonl has a summary at least as new (the machine-state rule), else it is LOST.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2), CODE = path.resolve(args[0]), LIVE = path.resolve(args.includes("--live") ? args[args.indexOf("--live") + 1] : "C:/Code/lew42/monorepo");
const STORE = "public/framework/ai/sessions", HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const { default: SessionFolders } = await import(pathToFileURL(path.join(CODE, "public/framework/core/Session/SessionFolders.mjs")));
const { default: SessionConsolidate } = await import(pathToFileURL(path.join(CODE, "Server/SessionConsolidate.mjs")));
const lines = f => { try { return fs.readFileSync(f, "utf8").split("\n").map(l => l.replace(/\r$/, "")).filter(l => l.trim()); } catch { return []; } };
const walk = (d, out = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })){ const p = path.join(d, e.name); e.isDirectory() ? walk(p, out) : out.push(p); } return out; };

const twins = SessionFolders.at(path.join(LIVE, STORE)).twins();
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "fold-proof-")), S = path.join(TMP, STORE);
fs.mkdirSync(path.join(TMP, "public/framework/ai"), { recursive: true });
for (const t of twins) for (const dir of [t.home, ...t.others]) fs.cpSync(dir, path.join(S, path.relative(path.join(LIVE, STORE), dir)), { recursive: true, preserveTimestamps: true });

// before: every line of every file, by folder
const before = new Map();   // abs file in TMP -> lines
for (const f of walk(S)) if (/\.jsonl?$/.test(f)) before.set(f, f.endsWith(".json") ? [fs.readFileSync(f, "utf8").trim()] : lines(f));
const owner_before = new Map([...before.keys()].map(f => [f, SessionFolders.owner(path.dirname(f))]));   // asked before the fold: a removed folder answers nothing after
const ids_before = new Set(SessionFolders.at(S).refresh().homes().map(h => h.id)), twins_before = SessionFolders.at(S).twins().length;

const m = await SessionConsolidate.apply_all(TMP);

const pairs = m.groups.flatMap(g => g.steps.filter(s => s.do === "relink").map(s => [s.from, s.to]));
const after_files = walk(S).filter(f => /\.jsonl?$/.test(f) && !f.endsWith("task-moves.jsonl"));
const found = new Set(); for (const f of after_files) for (const l of (f.endsWith(".json") ? [fs.readFileSync(f, "utf8").trim()] : lines(f))) found.add(l);
const summary_at = l => { try { const j = JSON.parse(l); return (j.summary?.last_at ?? "") + "|" + String(j.summary?.messages ?? 0).padStart(9, "0"); } catch { return null; } };
const kept_cache = new Map(); for (const h of SessionFolders.at(S).homes()) { const c = lines(path.join(h.dir, "cache.jsonl")).filter(l => l.startsWith('{"summary"')).map(summary_at).sort().pop(); if (c) kept_cache.set(h.id, c); }
const kept_index = new Map(); for (const h of SessionFolders.at(S).homes()) { try { kept_index.set(h.id, JSON.parse(fs.readFileSync(path.join(h.dir, "index.json"), "utf8"))); } catch {} }
let total = 0, again = 0, older_summary = 0, older_index = 0, same_marker = 0; const lost = [];
for (const [f, ls] of before) for (const l of ls){
	total++;
	const moved = pairs.reduce((s, [a, b]) => s.split(a).join(b), l);   // an appended line had its folder's URL rewritten to the home's
	if (found.has(l) || found.has(moved)) { again++; continue; }
	const base = path.basename(f), id = owner_before.get(f);
	if (base === "cache.jsonl" && l.startsWith('{"summary"') && id && kept_cache.get(id) >= summary_at(l)) { older_summary++; continue; }
	if (base === "index.json" && id){ const k = kept_index.get(id), j = JSON.parse(l); if (k && k.id === j.id && String(k.last_activity ?? "") >= String(j.last_activity ?? "")) { older_index++; continue; } }
	// line 1 {"session": id} of a second folder's log, when the home's same log opens with the same id: skipped on purpose (manifest: skipped.marker)
	if (ls[0] === l && /^\{"session":/.test(l) && id){ const home = SessionFolders.at(S).of(id), h1 = home && lines(path.join(home, base))[0]; try { const a = JSON.parse(l), b = JSON.parse(h1); if ((a.session?.id ?? a.session) === (b.session?.id ?? b.session)) { same_marker++; continue; } } catch {} }
	lost.push({ file: path.relative(TMP, f), line: l.slice(0, 160) });
}
const ids_after = new Set(SessionFolders.at(S).refresh().homes().map(h => h.id)), twins_after = SessionFolders.at(S).twins().length;
const out = { at: new Date().toISOString(), copied_groups: twins.length, twins_before, twins_after, ids_before: ids_before.size, ids_after: ids_after.size,
	folded: m.folded, held: m.held.length, lines_before: total, found_again: again, older_cache_summary: older_summary, older_index_snapshot: older_index, same_session_marker: same_marker, lost: lost.length, lost_sample: lost.slice(0, 20) };
fs.writeFileSync(path.join(HERE, "fold-proof.json"), JSON.stringify(out, null, 1) + "\n");
console.log(out);
fs.rmSync(TMP, { recursive: true, force: true });

#!/usr/bin/env node
// Server/session-query.mjs — find past sessions the way the Sessions dashboard does, and say what they cost; or report one session's completion.
// Doc: public/framework/ai/sessions/doc/data/record-spec.md ("Asking about past sessions"); the completion report: public/framework/core/Session/readme.md
//
//   node Server/session-query.mjs --tag transcription --since 2026-10-01 --json
//   node Server/session-query.mjs --system dictation --since 2026-10-02 --sort cost
//   node Server/session-query.mjs --report <session id | 8-hex | agent id | folder path>     one session: prompts, tasks, children, cost, ONE completion score + its formula
//   node Server/session-query.mjs --recent 5 [--report-json]                                the N most recently active sessions (tabs and spawned masterminds)
//
// It asks DatedFiles.sessions.find, which reads the day composites `sessions/YYYY/MM/DD/index.json` (live or closed), one snapshot per session.
// A session is counted once, on the day of its last activity. Rows are capped (default 25) so an answer never floods a caller's context;
// the totals always cover EVERY match, not only the rows shown.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import DatedFiles from "./DatedFiles.mjs";

const SELF_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** query({ since, until, tags, system, state, model, provider, parent, min_cost, text, sort, limit }) -> { count, shown, usd, claude_usd, openrouter_usd, rows }.
 *  The filter itself is DatedFiles.sessions.find (the one reader of the day indexes, Server/doc/dated-files.md); `snapshots` lets a test pass its own. */
export function query(args = {}, { snapshots } = {}){ return DatedFiles.sessions.find(args, snapshots); }

/** Plain text for a human or a model that did not ask for --json. */
export function format(result){
	const lines = [`${result.count} session(s) matched; Claude API-equivalent $${result.claude_api_equivalent_usd}, OpenRouter real $${result.openrouter_real_usd}${result.count > result.shown ? `; showing the first ${result.shown}` : ""}`];
	for (const r of result.rows) lines.push(`${r.day}  $${String(r.usd).padStart(7)}  ${String(r.model ?? "").padEnd(18)} ${r.id}  ${[r.category, ...r.tags].filter(Boolean).join(", ")}${r.core.length ? "  [" + r.core.join(" ") + "]" : ""}`);
	return lines.join("\n");
}

/* ---- THE COMPLETION REPORT (completion-truth, 2026-11-04) ---------------------------------------------------------------------------------
 * One session, replayed from its record with its child folders resolved, then read through the SAME methods the session page and the item
 * tool use: `completion_score()` (the one score) and `tally()` (the labelled counts). Nothing here counts a second way (completion.test.mjs
 * recomputes the score independently). Children come from the registry (ChildLinks.plan). */
const FORMULA = "score(task) = 1 if the owner checked it; else the MEAN of score(part) over its parts (subtasks not stopped, child sessions as one part each, counted owner prompts), recursing to any depth; a task with no parts is 1 if complete else 0";
const ONE_PASS = /^(reviewer|clarity|checker)/;

const read_lines = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const registry = async () => { try { return new (await import("../Servex/agents/Registry.js")).default().read(); } catch { return {}; } };

/** Which record folder a reference names: a session id, its first 8 characters, a folder name, a repo path or a site path, or an agent id. Returns {dir, id, agent} or null. */
export async function locate(ref, { root = SELF_ROOT, rows = null } = {}){
	const { default: SessionFolders } = await import("../public/framework/core/Session/SessionFolders.mjs");
	const { default: SessionRecord } = await import("./SessionRecord.mjs");
	const store = SessionFolders.at(path.join(root, "public/framework/ai/sessions"));
	ref = String(ref).trim();
	const abs = [path.resolve(ref), path.join(root, "public", ref.replace(/^\/+/, ""))].find(p => fs.existsSync(p) && fs.statSync(p).isDirectory());
	if (abs) return { dir: abs, id: SessionFolders.owner(abs), agent: null };
	rows ??= await registry();
	let id = DatedFiles.UUID.test(ref) ? ref : rows[ref]?.session_id ?? null;
	if (!id && /^(session-|v-)?[0-9a-f]{8}$/.test(ref)){
		const p8 = ref.slice(-8);
		id = store.homes().map(h => h.id).find(i => i.startsWith(p8)) ?? Object.values(rows).map(r => r?.session_id).find(i => i?.startsWith(p8)) ?? null;
	}
	if (!id) return null;
	const agent = rows[ref] ? ref : Object.keys(rows).find(a => rows[a]?.session_id === id) ?? null;
	const has = d => d && SessionRecord.file(d);
	let dir = store.record_of(id);
	if (!has(dir)){ store.adopt_nested(); dir = store.record_of(id); }   // a nested record nobody claimed yet: one pass finds every such folder (SessionFolders.adopt_nested)
	if (!has(dir) && rows[agent]?.task_dir) dir = path.resolve(root, rows[agent].task_dir);
	return has(dir) ? { dir, id, agent } : null;
}

/** report(ref, { root, rows }) -> everything the CLI prints, as data. `rows` is the registry (a test passes its own). */
export async function report(ref, { root = SELF_ROOT, rows = null, cost = true } = {}){
	const { default: Task } = await import("../public/framework/core/Task/Task.js");
	const { default: Session } = await import("../public/framework/core/Session/Session.js");
	const { default: SessionRecord } = await import("./SessionRecord.mjs");
	const { default: ChildLinks } = await import("./ChildLinks.mjs");
	rows ??= await registry();
	if (root !== SELF_ROOT) DatedFiles.ROOT = root;   // cost and day indexes come from the same tree as the records
	const hit = await locate(ref, { root, rows });
	if (!hit) return { ref, error: `no session record found for "${ref}"` };
	const pub = path.join(root, "public"), file = SessionRecord.log_file(hit.dir), lines = read_lines(file);
	const keep = [Task.resolver, Task.session_resolver, console.warn]; console.warn = () => {};
	Task.resolver = u => { const d = path.resolve(pub, String(u).replace(/^\/+/, "")), ls = read_lines(SessionRecord.log_file(d) ?? path.join(d, "task.jsonl")); return ls.length ? ls : null; };
	Task.session_resolver = u => { const d = path.resolve(pub, String(u ?? "").replace(/^\/+/, "")); return path.basename(SessionRecord.file(d) ?? "") === "session.jsonl"; };
	let s; try { s = (lines[0]?.session ? Session : Task).replay(lines); } finally { [Task.resolver, Task.session_resolver, console.warn] = keep; }
	const tally = s.tally(), score = s.completion_score(), top = s.score_parts().map(t => t.completion_score());
	const said = lines.filter(l => l.type === "Prompt" || l.content?.add?.type === "Prompt" || l.tasks?.add?.type === "Prompt").length;
	const prompts = { said, ...tally.prompts };
	// Children: registered spawns under this session, and whether the record references each (ChildLinks.plan: inside | referenced | self = linked).
	const plan = ChildLinks.plan(Object.fromEntries(Object.entries(rows).filter(([, r]) => r?.parent_session === hit.id)), root);
	const linked = plan.filter(p => ["inside", "referenced", "self"].includes(p.why)), loose = plan.filter(p => !["inside", "referenced", "self"].includes(p.why));
	const one_pass = loose.filter(p => ONE_PASS.test(rows[p.agent]?.role ?? p.agent));
	const children = { registered: plan.length, linked: linked.length, unlinked: loose.length - one_pass.length, one_pass: one_pass.length };
	let usd = null, tree_usd = null;
	if (cost) try {
		const day = path.relative(path.join(pub, "framework/ai/sessions"), hit.dir).split(path.sep).slice(0, 3).join("-");
		const snap = DatedFiles.sessions.snapshots({ from: /^\d{4}-\d\d-\d\d$/.test(day) ? day : undefined }).find(x => x.id === hit.id);
		usd = snap?.usd ?? null; tree_usd = snap?.tree_usd ?? null;
	} catch {}
	return { ref, id: hit.id, agent: hit.agent, dir: path.relative(root, hit.dir).split(path.sep).join("/"), state: s.state, title: s.get_one?.("title") ?? null,
		prompts, tasks: { created: tally.created, finished: tally.finished, stopped: tally.stopped, open: tally.open, child_sessions: tally.sessions, unscored: tally.unscored }, unproven: tally.unproven, children,
		cost: { usd, tree_usd }, score, formula: FORMULA, top: { parts: top.length, complete: s.score_parts().filter(t => t.state === "complete").length, sum: +top.filter(n => n !== null).reduce((a, b) => a + b, 0).toFixed(3) } };
}

/** The lines the CLI prints for one report. */
export function format_report(r){
	if (r.error) return r.error;
	const pct = x => x === null ? "needs review" : (x * 100).toFixed(1) + "%", t = r.tasks, money = x => x == null ? "n/a" : "$" + x.toFixed(2);
	return [
		`${r.agent ?? r.id}  ${r.id}${r.title ? "  " + r.title : ""}`,
		`  record     ${r.dir}  (${r.state})`,
		`  prompts    ${r.prompts.said} said · ${r.prompts.counted} counted toward the score · ${r.prompts.unresolved} unresolved`,
		`  tasks      ${t.created} created · ${t.finished} finished · ${t.stopped} stopped · ${t.open} open   (${t.child_sessions} of the created are child sessions)`,
		`  proof      ${r.unproven} of ${t.finished} finished have no outcome or evidence (Task.proof_problem)`,
		`  children   ${r.children.registered} registered · ${r.children.linked} linked · ${r.children.unlinked} unlinked · ${r.children.one_pass} one-pass (reviewer/clarity/checker: no record by design)`,
		`  cost       ${money(r.cost.usd)} own · ${money(r.cost.tree_usd)} with children`,
		`  SCORE      ${pct(r.score)}${r.score === null ? "   (no tasks, no counted prompts and no steps: a missing record is neither done nor undone)" : ""}   = mean of ${r.top.parts} top-level parts (sum ${r.top.sum}); ${r.top.complete} of them complete = ${pct(r.top.parts ? r.top.complete / r.top.parts : 0)}, the rest count by how far along they are`,
		`  formula    ${r.formula}`,
		`  not used   finished/created = ${t.finished}/${t.created} = ${pct(t.created ? t.finished / t.created : 0)} counts every nested task flat; the score weights each part by its own completion`
	].join("\n");
}

/** The ids of the N most recently active sessions (tabs and spawned masterminds), newest first, from the day indexes. Asks for extra rows so `recent_reports` can skip sessions with no record (one-pass roles). */
export function recent(n = 5, extra = 8){ return DatedFiles.sessions.find({ sort: "recent", limit: n * extra }).rows.map(r => r.id); }

/** The reports of the N most recent sessions that have a record folder; `skipped` counts the ones passed over. */
export async function recent_reports(n = 5, opts = {}){
	const out = []; let skipped = 0;
	for (const id of recent(n)){ if (out.length >= n) break; const r = await report(id, opts); if (r.error) skipped++; else out.push(r); }
	return { reports: out, skipped };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = {}, argv = process.argv.slice(2);
	let json = false, ref = null, n = null, root;
	for (let i = 0; i < argv.length; i++){
		const a = argv[i];
		if (a === "--json" || a === "--report-json") json = true;
		else if (a === "--report") ref = argv[++i];
		else if (a === "--root") root = path.resolve(argv[++i]);
		else if (a === "--recent") n = Number(argv[++i]) || 5;
		else if (a === "--help" || a === "-h"){ console.log("usage: node Server/session-query.mjs [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--tag a,b] [--system module|category] [--state active|idle|closed] [--model part] [--provider claude|openrouter] [--parent id] [--min-cost usd] [--text word] [--sort recent|oldest|cost] [--limit 25] [--json]\n       node Server/session-query.mjs --report <session id | 8-hex | agent id | folder> [--report-json]\n       node Server/session-query.mjs --recent N [--report-json]   completion report for the N most recent sessions"); process.exit(0); }
		else if (a.startsWith("--")){ args[a.slice(2).replaceAll("-", "_")] = argv[++i]; }
	}
	if (root) DatedFiles.ROOT = root;
	if (ref || n){
		let out, skipped = 0;
		if (ref) out = [await report(ref, { root })]; else ({ reports: out, skipped } = await recent_reports(n, { root }));
		console.log(json ? JSON.stringify(ref ? out[0] : out) : out.map(format_report).join("\n\n") + (skipped ? "\n\n(" + skipped + " more recent session(s) have no record folder and were skipped)" : ""));
	} else {
		const result = query(args);
		console.log(json ? JSON.stringify(result) : format(result));
	}
}

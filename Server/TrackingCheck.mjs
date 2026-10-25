#!/usr/bin/env node
// Server/TrackingCheck.mjs: does the work get tracked? Reads the real records and writes public/framework/ai/tracking/report.json (the page /framework/ai/tracking/ draws it).
//   node Server/TrackingCheck.mjs [--days 7] [--id <session id>] [--print]
// Three checks (doc: public/framework/ai/tracking/readme.md):
//   1. untracked work   every assistant message in a session's transcript is "tracked" if a task was open at that moment (start..complete), else "untracked"; shares in dollars and tokens
//   2. unlinked children   Servex agent sessions with no parent, a parent that is an agent name and not a session id, or a parent record that does not list them
//   3. stored numbers   a stored dollar number (index.json tree_usd, children, usd) against what the children / the raw transcript give now
//   4. prompt coverage   per session with a prompts.jsonl: the owner's unique prompts in the transcript (PromptRecords.prompts) against those with refinement parts, and the unrecorded lines
//   5. jsonl perf   the slowest-reading records and the item-tool write timing (Server/JsonlPerf.mjs), each flagged past its limit. The write timing needs `--item` / `--http <url>`; otherwise the last run's is kept
// Read-only on every record; the one write is report.json.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(process.env.TRACKING_ROOT || path.join(HERE, ".."));   // TRACKING_ROOT: read the main checkout's records from a worktree (index.json and cache.jsonl are gitignored)
const AI = path.join(REPO, "public", "framework", "ai");
const SESSIONS = path.join(AI, "sessions");
const OUT = path.join(AI, "tracking", "report.json");
const REGISTRY = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "servex", "registry.json");
const PROJECTS = path.join(os.homedir(), ".claude", "projects");

const OPEN_VERBS = new Set(["start", "resume"]);
const CLOSE_VERBS = new Set(["complete", "finish", "stop", "pause", "wait"]);
const NOT_TASK_KEYS = new Set(["tasks", "assign", "log", "chat", "agent", "session", "sessions", "settings", "links", "tag", "note", "alert", "summary", "cost", "tool_call", "task", "decide", "start", "stop", "finish", "complete", "pause", "wait", "resume"]);
const ROUTINE = new Set(["clarity", "reviewer", "echo", "checker", "voter", "session-fast", "session-smart", "card-assistant", "expert", "expert-ask"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/;
const GRACE = 2 * 36e5;   // a task never closed counts as open for 2 hours after its last logged event, no longer

const when = v => { if (v == null) return null; if (typeof v === "number") return v; const t = Date.parse(v); return Number.isNaN(t) ? null : t; };
const r4 = n => Math.round(n * 1e4) / 1e4;
const read_lines = file => { try { return fs.readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };

/** Task events in one record file: [{bucket, t, open}] in file order. A line's own time is `ts`, else its body's `at`.
 *  In a task folder's file (line 1 is an `assign`) the whole file is one bucket "@file"; a session file's own start/stop is the session, not a task. */
export function task_events(lines){
	const ev = [], is_task_file = !!lines[0]?.assign;
	const push = (bucket, t, open) => { if (t != null) ev.push({ bucket, t, open }); };
	let last_t = null;
	for (const line of lines){
		const t = when(line.ts) ?? when(line.at) ?? last_t;
		if (t != null) last_t = t;
		for (const [key, body] of Object.entries(line)){
			if (key === "tasks" && body && typeof body === "object"){
				for (const [k, v] of Object.entries(body)){
					if (k === "add"){
						for (const a of [].concat(v)) if (a && typeof a === "object" && a.id && a.state === "running") push(a.id, t, true);
						continue;
					}
					if (v && typeof v === "object") for (const verb of Object.keys(v)) { if (OPEN_VERBS.has(verb)) push(k, t, true); else if (CLOSE_VERBS.has(verb)) push(k, t, false); }
				}
			} else if (key === "assign" && body && typeof body === "object"){
				if (body.requested_at) push("@file", when(body.requested_at), true);
				if (body.landed_at) push("@file", when(body.landed_at), false);
				else if (["complete", "landed", "finished"].includes(body.now)) push("@file", t, false);
			} else if (is_task_file && CLOSE_VERBS.has(key) && key !== "wait") push("@file", t, false);
			else if (is_task_file && key === "start") push("@file", t, true);
			else if (!NOT_TASK_KEYS.has(key) && body && typeof body === "object" && !Array.isArray(body)){
				for (const verb of Object.keys(body)) { if (OPEN_VERBS.has(verb)) push(key, t, true); else if (CLOSE_VERBS.has(verb)) push(key, t, false); }
			}
		}
	}
	return ev;
}

/** Merged, sorted [from, to] spans in which at least one bucket is open. A bucket never closed runs to its file's last line, at most GRACE past its last event. */
export function open_spans(events, end){
	const by = new Map();
	for (const e of events) (by.get(e.bucket) ?? by.set(e.bucket, []).get(e.bucket)).push(e);
	const spans = [];
	for (const list of by.values()){
		list.sort((a, b) => a.t - b.t);
		let from = null;
		for (const e of list){
			if (e.open){ if (from == null) from = e.t; }
			else if (from != null){ spans.push([from, e.t]); from = null; }
		}
		if (from != null){ const last = list[list.length - 1], file_end = last.file_end ?? end; spans.push([from, Math.max(from, Math.min(file_end, last.t + GRACE))]); }
	}
	spans.sort((a, b) => a[0] - b[0]);
	const merged = [];
	for (const s of spans){ const m = merged[merged.length - 1]; if (m && s[0] <= m[1]) m[1] = Math.max(m[1], s[1]); else merged.push([...s]); }
	return merged;
}

export const inside = (spans, t) => spans.some(([a, b]) => t >= a && t <= b);

/** One transcript to messages [{t, usd, tokens}], each message counted once (the largest usage any of its lines carries, as AISessionAudit does). */
export function messages_of(file, price_for){
	const peak = new Map(), order = [];
	for (const o of read_lines(file)){
		const u = o.type === "assistant" && !o.isSidechain && o.message?.usage; if (!u || o.message.model === "<synthetic>") continue;
		const k = o.message.id || o.uuid;
		let p = peak.get(k);
		if (!p){ p = { model: o.message.model, t: 0, in: 0, out: 0, cr: 0, w5: 0, w1: 0, cw: 0 }; peak.set(k, p); order.push(k); }
		p.t = when(o.timestamp) ?? p.t;
		p.in = Math.max(p.in, u.input_tokens || 0); p.out = Math.max(p.out, u.output_tokens || 0); p.cr = Math.max(p.cr, u.cache_read_input_tokens || 0);
		p.cw = Math.max(p.cw, u.cache_creation_input_tokens || 0); p.w5 = Math.max(p.w5, u.cache_creation?.ephemeral_5m_input_tokens ?? 0);
		p.w1 = Math.max(p.w1, u.cache_creation ? (u.cache_creation.ephemeral_1h_input_tokens ?? 0) : (u.cache_creation_input_tokens || 0));
	}
	return order.map(k => {
		const p = peak.get(k), price = price_for(p.model, new Set());
		const usd = (p.in * price.in + p.out * price.out + p.cr * price.cache_read + p.w5 * price.cache_write_5m + p.w1 * price.cache_write_1h) / 1e6;
		return { t: p.t, usd, tokens: p.in + p.out + p.cr + p.cw };
	});
}

/** Split messages into tracked and untracked by the spans. */
export function split(messages, spans){
	const s = { usd: 0, tokens: 0, tracked_usd: 0, tracked_tokens: 0, untracked_usd: 0, untracked_tokens: 0, messages: messages.length, untracked_messages: 0, first_untracked_at: null };
	for (const m of messages){
		s.usd += m.usd; s.tokens += m.tokens;
		if (inside(spans, m.t)){ s.tracked_usd += m.usd; s.tracked_tokens += m.tokens; }
		else { s.untracked_usd += m.usd; s.untracked_tokens += m.tokens; s.untracked_messages++; s.first_untracked_at ??= m.t; }
	}
	return s;
}

const walk = (dir, fn, depth = 0) => {
	let list; try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const d of list){
		const p = path.join(dir, d.name);
		if (d.isDirectory()){ if (depth < 8 && d.name !== "node_modules") walk(p, fn, depth + 1); }
		else fn(p, d.name);
	}
};

function transcripts(){
	const map = new Map();
	let dirs = []; try { dirs = fs.readdirSync(PROJECTS); } catch {}
	for (const d of dirs){
		let files = []; try { files = fs.readdirSync(path.join(PROJECTS, d)); } catch {}
		for (const f of files) if (f.endsWith(".jsonl") && UUID.test(f)) { const id = f.slice(0, -6), p = path.join(PROJECTS, d, f); if (!map.has(id) || fs.statSync(p).size > fs.statSync(map.get(id)).size) map.set(id, p); }
	}
	return map;
}

/** Every index.json snapshot under sessions/YYYY/MM/DD/<folder>/ (one per session). */
function snapshots(since){
	const out = [];
	walk(SESSIONS, (file, name) => {
		if (name !== "index.json") return;
		const rel = path.relative(SESSIONS, file).split(path.sep);
		if (!/^\d{4}$/.test(rel[0]) || rel.length !== 5) return;
		let j; try { j = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return; }
		if (!j?.id) return;
		const last = when(j.last_activity) ?? when(j.first_at) ?? 0;
		out.push({ id: j.id, dir: path.dirname(file), rel: rel.slice(0, -1).join("/"), snap: j, last, recent: last >= since });
	});
	return out;
}

/** The task events of every record file under `dir`. With `only_id`, a record whose line 1 belongs to another agent session is skipped. */
function record_events(dir, only_id = null){
	const events = []; let end = 0;
	walk(dir, (file, name) => {
		if (name !== "session.jsonl" && name !== "task.jsonl") return;
		const lines = read_lines(file); if (!lines.length) return;
		const assigned = lines[0]?.assign?.session_id;
		if (only_id && assigned && assigned !== only_id) return;
		const rel = path.relative(dir, file);
		let file_end = 0;
		for (const l of lines){ const t = when(l.ts) ?? when(l.at); if (t) file_end = Math.max(file_end, t); }
		end = Math.max(end, file_end);
		for (const e of task_events(lines)) events.push({ ...e, bucket: rel + "#" + e.bucket, file_end });
	});
	return { events, end };
}

/** Check 4: for each session folder holding a prompts.jsonl, the unique owner prompts (PromptRecords) with and without parts. Nothing is written. */
export async function prompt_coverage(){
	const { default: PromptRecords } = await import("./PromptRecords.mjs"), { default: PromptAudit } = await import("./PromptAudit.mjs");
	const rows = [];
	walk(SESSIONS, (file, name) => {
		if (name !== "prompts.jsonl") return;
		const dir = path.dirname(file), m = /^session-([0-9a-f]{8})$/.exec(path.basename(dir)); if (!m) return;
		const raw_lines = read_lines(file).filter(l => l.stage === "raw").length;
		const folder = path.relative(SESSIONS, dir).split(path.sep).join("/");
		let r; try { r = new PromptRecords(m[1]); } catch { rows.push({ id: m[1], folder, no_transcript: true, log_lines: raw_lines, unique: 0, recorded: 0, pct: null, unrecorded: [] }); return; }
		const recorded = r.rows(), unique = r.prompts, missing = unique.filter(p => !recorded[r.rid(p)]?.parts?.length);
		rows.push({ id: m[1], folder, no_transcript: false, log_lines: raw_lines, transcript_prompts: PromptAudit.prompts(r.transcript).length, unique: unique.length, recorded: unique.length - missing.length, pct: unique.length ? r4((unique.length - missing.length) / unique.length) : null,
			unrecorded: missing.map(p => ({ line: p.line, at: p.at, chars: p.text.length })) });
	});
	rows.sort((a, b) => (b.unique - b.recorded) - (a.unique - a.recorded) || b.folder.localeCompare(a.folder));
	const sum = k => rows.reduce((n, x) => n + (x[k] || 0), 0);
	return { sessions: rows.length, unique: sum("unique"), recorded: sum("recorded"), pct: sum("unique") ? r4(sum("recorded") / sum("unique")) : null, rows };
}

/** Check 5: read/parse of the largest records (always), plus the write timing when asked (JsonlPerf) or carried over from the last report. */
export async function jsonl_perf({ item = false, http = null, source = null } = {}){
	const { perf_report, LIMITS } = await import("./JsonlPerf.mjs");
	const r = await perf_report({ top: 8, item, source, http });
	let before = null; try { before = JSON.parse(fs.readFileSync(OUT, "utf8")).perf; } catch {}
	const stamp = x => x && { ...x, measured_at: new Date().toISOString() };
	return { limits: LIMITS, files: r.files, item: item ? stamp(r.item) : before?.item ?? null, http: http ? stamp(r.http) : before?.http ?? null, verdict: r.verdict };
}

export async function run({ days = 7, id = null, item = false, http = null, source = null } = {}){
	const { default: AISession } = await import(pathToFileURL(path.join(AI, "AISession", "AISession.js")).href);
	const price_for = AISession.price_for;
	const now = Date.now(), since = now - days * 864e5;
	const snaps = snapshots(since), by_id = new Map(snaps.map(s => [s.id, s]));
	const files = transcripts();
	let registry = {}; try { registry = JSON.parse(fs.readFileSync(REGISTRY, "utf8")); } catch {}
	const agent_of_session = new Map(Object.values(registry).filter(r => r.session_id).map(r => [r.session_id, r]));
	const agents_by_id = new Map(Object.entries(registry));
	const scope = snaps.filter(s => id ? s.id === id : s.recent);

	// 1. untracked work
	const sessions = [], per_day = {};
	for (const s of scope){
		const file = files.get(s.id); if (!file) continue;
		let { events, end } = record_events(s.dir);
		const row = agent_of_session.get(s.id);
		if (row?.task_dir){
			const dir = path.isAbsolute(row.task_dir) ? row.task_dir : path.join(REPO, row.task_dir);
			if (fs.existsSync(dir) && !path.resolve(dir).startsWith(path.resolve(s.dir))){ const extra = record_events(dir, s.id); events = events.concat(extra.events); end = Math.max(end, extra.end); }
		}
		const spans = open_spans(events, Math.max(end, s.last));
		const messages = messages_of(file, price_for), sp = split(messages, spans);
		for (const m of messages){ const d = new Date(m.t).toLocaleDateString("sv"), e = per_day[d] ??= { usd: 0, untracked_usd: 0 }; e.usd += m.usd; if (!inside(spans, m.t)) e.untracked_usd += m.usd; }
		sessions.push({
			id: s.id, folder: s.rel, agent: s.snap.agent ?? row?.id ?? null, role: row?.role ?? null, title: s.snap.title ?? null, day: s.snap.day ?? null, last_at: s.snap.last_activity ?? null,
			usd: r4(sp.usd), untracked_usd: r4(sp.untracked_usd), tokens: sp.tokens, untracked_tokens: sp.untracked_tokens, messages: sp.messages, untracked_messages: sp.untracked_messages,
			share_usd: sp.usd ? r4(sp.untracked_usd / sp.usd) : 0, share_tokens: sp.tokens ? r4(sp.untracked_tokens / sp.tokens) : 0,
			task_events: events.length, spans: spans.length, first_untracked_at: sp.first_untracked_at ? new Date(sp.first_untracked_at).toISOString() : null,
			stored_usd: s.snap.usd ?? null,
		});
	}
	sessions.sort((a, b) => b.untracked_usd - a.untracked_usd);
	const sum = (list, k) => list.reduce((n, x) => n + (x[k] || 0), 0);
	const totals = { sessions: sessions.length, usd: r4(sum(sessions, "usd")), untracked_usd: r4(sum(sessions, "untracked_usd")), tokens: sum(sessions, "tokens"), untracked_tokens: sum(sessions, "untracked_tokens") };
	totals.share_usd = totals.usd ? r4(totals.untracked_usd / totals.usd) : 0;
	totals.share_tokens = totals.tokens ? r4(totals.untracked_tokens / totals.tokens) : 0;
	const by_day = Object.entries(per_day).filter(([d]) => Date.parse(d) >= since - 864e5).sort().map(([day, e]) => ({ day, usd: r4(e.usd), untracked_usd: r4(e.untracked_usd), share_usd: e.usd ? r4(e.untracked_usd / e.usd) : 0 }));

	// 2. unlinked children: Servex agent sessions started in the window
	const child_rows = [], record_text = new Map();
	const text_of = sid => { if (!record_text.has(sid)){ const s = by_id.get(sid); let t = ""; if (s) walk(s.dir, (f, n) => { if (n === "session.jsonl" || n === "task.jsonl") try { t += fs.readFileSync(f, "utf8"); } catch {} }); record_text.set(sid, t); } return record_text.get(sid); };
	const in_window = Object.entries(registry).filter(([, r]) => r.session_id && !ROUTINE.has(r.role) && (when(r.started_at) ?? 0) >= since);
	for (const [agent, r] of in_window){
		const problems = [], parent = r.parent;
		let parent_session = null;
		if (!parent) problems.push("no parent");
		else if (UUID.test(parent)) parent_session = parent;
		else { problems.push("parent is an agent name"); parent_session = agents_by_id.get(parent)?.session_id ?? null; }
		if (parent_session && by_id.has(parent_session)){
			const t = text_of(parent_session), leaf = r.task_dir ? String(r.task_dir).replace(/\\/g, "/").replace(/\/$/, "").split("/").pop() : null;
			if (!(t.includes(r.session_id) || t.includes('"' + agent + '"') || (leaf && t.includes(leaf)))) problems.push("parent's record does not list it");
		} else if (parent && !parent_session) problems.push("parent has no session");
		if (problems.length) child_rows.push({ agent, role: r.role ?? null, session_id: r.session_id, started_at: r.started_at, parent: parent ?? null, parent_session, problems });
	}
	child_rows.sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)));
	const count = p => child_rows.filter(c => c.problems.includes(p)).length;
	const children = { checked: in_window.length, problems: child_rows.length, no_parent: count("no parent"), parent_is_name: count("parent is an agent name"), not_listed: count("parent's record does not list it"), rows: child_rows.slice(0, 200) };

	// 3. stored numbers
	const numbers = [], kids = new Map();
	for (const s of snaps) if (s.snap.parent) (kids.get(s.snap.parent) ?? kids.set(s.snap.parent, []).get(s.snap.parent)).push(s);
	for (const s of scope){
		const k = kids.get(s.id) ?? [], own = s.snap.usd ?? 0, stored_tree = s.snap.tree_usd;
		const computed_tree = r4(own + k.reduce((n, c) => n + (c.snap.tree_usd ?? c.snap.usd ?? 0), 0));
		if (stored_tree != null && Math.abs(stored_tree - computed_tree) > Math.max(0.01, computed_tree * 0.01)) numbers.push({ id: s.id, agent: s.snap.agent ?? null, what: "tree_usd", stored: stored_tree, computed: computed_tree, why: `own ${own} plus ${k.length} children found by their parent link` });
		if ((s.snap.children ?? 0) !== k.length) numbers.push({ id: s.id, agent: s.snap.agent ?? null, what: "children", stored: s.snap.children ?? 0, computed: k.length, why: "index.json children against the snapshots whose parent is this id" });
	}
	for (const x of sessions) if (x.stored_usd != null && Math.abs(x.stored_usd - x.usd) > Math.max(0.05, x.usd * 0.03)) numbers.push({ id: x.id, agent: x.agent, what: "usd", stored: x.stored_usd, computed: x.usd, why: "index.json usd against the transcript read again now" });

	return { generated_at: new Date().toISOString(), days, note: "Computed by Server/TrackingCheck.mjs; never edit by hand. Doc: public/framework/ai/tracking/readme.md", untracked: { totals, by_day, sessions: sessions.slice(0, 100) }, children, numbers: { count: numbers.length, rows: numbers.slice(0, 200) }, prompts: await prompt_coverage(), perf: await jsonl_perf({ item, http, source }) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : null; };
	const report = await run({ days: Number(arg("days")) || 7, id: arg("id"), item: process.argv.includes("--item"), http: arg("http"), source: arg("source") });
	if (!process.argv.includes("--print")){ fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT + ".tmp", JSON.stringify(report, null, 1)); fs.renameSync(OUT + ".tmp", OUT); }
	const t = report.untracked.totals, c = report.children;
	console.log(`untracked: ${(t.share_usd * 100).toFixed(0)}% of $${t.usd} (${t.sessions} sessions, ${(t.share_tokens * 100).toFixed(0)}% of tokens)`);
	console.log(`children: ${c.problems} of ${c.checked} have a problem (no parent ${c.no_parent}, parent is a name ${c.parent_is_name}, not listed ${c.not_listed})`);
	console.log(`stored numbers that disagree: ${report.numbers.count}`);
	const pc = report.prompts, pf = report.perf;
	console.log(`prompt coverage: ${pc.recorded} of ${pc.unique} unique prompts have parts (${pc.pct == null ? "n/a" : Math.round(pc.pct * 100) + "%"}) across ${pc.sessions} sessions; ${pc.rows.filter(x => x.unique > x.recorded).length} with unrecorded prompts`);
	console.log(`jsonl perf: ${pf.verdict}${pf.files.some(f => f.over) ? " (a read is over " + pf.limits.read_ms + " ms)" : ""}`);
}

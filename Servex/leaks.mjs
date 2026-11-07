/* node Servex/leaks.mjs [--root <repo>] [--write <file>] [--json]
 * EVERY START WITH NO END: reads the `{"pid":N}` start lines and `{"pid_exit":N}` end lines from the session logs (`git grep --untracked`,
 * so a log not yet committed counts) and from the `spawns` Servex log, pairs them, and lists each start that never got an end line in three groups:
 *   1. gone, end missed     the pid is not running any more (or the number now belongs to a newer process) and nobody wrote its end.
 *   2. alive, owner done    still running, but its agent is stopped / dormant / closed, or its task has landed. THE LEAKS.
 *   3. alive, owner working still running and its owner is still at work: normal, only counted.
 * It only READS: it never kills anything. A real leak is fixed in the close path that missed it (Lifecycle.js, closeout, Pool.js,
 * Server/Browser.mjs, Relief.js), not from this report. Both field names are read (`at` before 2026-11-06, `started` / `ended` after).
 * Doc: Servex/doc/processes.md, "Leaks: a start with no end". */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { place } from "./home.js";

const ms = t => { const n = Date.parse(t ?? ""); return Number.isFinite(n) ? n : 0; };

/* lines: [{ file, row }] -> { open: [start rows still without an end], starts, ends }. A start is paired with the first later end of the same pid;
 * the same line copied into a parent's log (claude.exe) is one line. */
export function pair(lines){
	const seen = new Set(), starts = [], ends = [];
	for (const { file, row } of lines){
		if ("pid_exit" in row){ const key = `x${row.pid_exit}@${row.ended ?? row.at}`; if (!seen.has(key)){ seen.add(key); ends.push({ pid: row.pid_exit, t: ms(row.ended ?? row.at), file }); } }
		else if ("pid" in row && typeof row.pid === "number"){ const key = `s${row.pid}@${row.started ?? row.at}`; if (!seen.has(key)){ seen.add(key); starts.push({ ...row, t: ms(row.started ?? row.at), file, files: [file] }); } }
	}
	for (const { file, row } of lines) if ("pid" in row && typeof row.pid === "number"){   // remember every log a start was copied to
		const s = starts.find(x => x.pid === row.pid && x.t === ms(row.started ?? row.at)); if (s && !s.files.includes(file)) s.files.push(file);
	}
	starts.sort((a, b) => a.t - b.t);
	const open = [], spent = new Set();
	for (const s of starts){
		const next = starts.find(x => x.pid === s.pid && x.t > s.t)?.t ?? Infinity;   // the same number started again: an end between belongs to the first
		const e = ends.find((x, i) => !spent.has(i) && x.pid === s.pid && x.t >= s.t && x.t < next);
		if (e) spent.add(ends.indexOf(e)); else open.push(s);
	}
	return { open, starts, ends };
}

/* open: from pair(); alive: Map pid -> born ms; owner_done(agent, files) -> reason string or null. */
export function classify(open, alive, owner_done){
	const gone = [], done = [], working = [];
	for (const s of open){
		const born = alive.get(s.pid);
		if (born == null || born > s.t + 15000){ gone.push(s); continue; }   // not running, or the number is a newer process (started after this line)
		const why = owner_done(s.agent, s.files);
		(why ? done : working).push(why ? { ...s, owner_state: why } : s);
	}
	return { gone, done, working };
}

function repo_root(){
	try { return path.dirname(execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: path.dirname(fileURLToPath(import.meta.url)), windowsHide: true }).toString().trim()); }
	catch { return process.cwd(); }
}

function read_lines(root){
	const out = [];
	try {
		const text = execFileSync("git", ["grep", "--untracked", "-H", "-I", "-e", '"pid":[0-9]', "-e", '"pid_exit":[0-9]', "--", "*.jsonl"], { cwd: root, windowsHide: true, maxBuffer: 1 << 29 }).toString();
		for (const l of text.split("\n")){ const i = l.indexOf(":"); if (i < 0) continue; try { out.push({ file: l.slice(0, i), row: JSON.parse(l.slice(i + 1)) }); } catch {} }
	} catch (e) { if (e.status !== 1) throw e; }   // 1 = no match
	const spawns = place("logs", "spawns.jsonl");
	if (fs.existsSync(spawns)) for (const l of fs.readFileSync(spawns, "utf8").split("\n")) { try { const row = JSON.parse(l); if ("pid" in row || "pid_exit" in row) out.push({ file: "spawns", row }); } catch {} }
	return out;
}

function live_pids(){
	const text = execFileSync("powershell.exe", ["-NoProfile", "-Command",
		"Get-CimInstance Win32_Process | % { '{0} {1}' -f $_.ProcessId, $(if($_.CreationDate){[DateTimeOffset]::new($_.CreationDate).ToUnixTimeMilliseconds()}else{0}) }"], { windowsHide: true, maxBuffer: 1 << 26 }).toString();
	return new Map(text.split(/\r?\n/).filter(Boolean).map(l => l.split(" ").map(Number)));
}

function owner_probe(root){
	let reg = {}; try { const j = JSON.parse(fs.readFileSync(place("registry.json"), "utf8")); reg = j.agents ?? j; } catch {}
	const landed = new Map();
	const file_landed = file => {   // the session log's folder has a landed_at line
		if (file === "spawns") return false;
		if (!landed.has(file)) { let t = ""; try { t = fs.readFileSync(path.join(root, file), "utf8"); } catch {} landed.set(file, /"landed_at"/.test(t)); }
		return landed.get(file);
	};
	return (agent, files) => {
		const st = agent ? reg[agent]?.state : null;
		if (agent && !reg[agent]) return null;   // unknown agent: cannot say it is done
		if (st === "stopped" || st === "dormant" || st === "closed") return `agent ${agent} is ${st}`;
		if (agent && files.some(f => f !== "spawns" && file_landed(f))) return `agent ${agent}'s task has landed`;
		return null;
	};
}

function row_text(s){
	return `| ${s.pid} | ${s.started ?? s.at ?? ""} | ${s.agent ?? "servex"} | ${s.seen ? "sample" : "spawn"} | ${s.why ?? ""} | \`${String(s.cmd ?? "").replace(/[|\`]/g, " ").slice(0, 90)}\` | ${s.owner_state ?? ""} |`;
}

export function report({ gone, done, working }, total){
	const table = rows => rows.length ? ["| pid | started | owner | seen | why | cmd | owner state |", "|---|---|---|---|---|---|---|", ...rows.map(row_text)].join("\n") : "_none_";
	const sorted = rows => [...rows].sort((a, b) => a.t - b.t);
	return [`# Start lines with no end line`, "",
		`${total.starts} start lines read (${total.ends} end lines): ${gone.length + done.length + working.length} open. gone, end missed: ${gone.length}. alive, owner done: ${done.length}. alive, owner working: ${working.length}.`, "",
		`## 1. Gone, end missed (${gone.length})`, "", table(sorted(gone).slice(-60)), gone.length > 60 ? `\n_${gone.length - 60} older ones not shown._` : "", "",
		`## 2. Alive, owner done: the leaks (${done.length})`, "", table(sorted(done)), "",
		`## 3. Alive, owner working (${working.length})`, "", table(sorted(working).slice(-30)), working.length > 30 ? `\n_${working.length - 30} older ones not shown._` : "", ""].join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
	const root = arg("--root") ?? repo_root();
	const { open, starts, ends } = pair(read_lines(root));
	const groups = classify(open, live_pids(), owner_probe(root));
	if (process.argv.includes("--json")) console.log(JSON.stringify({ starts: starts.length, ends: ends.length, ...Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])) }));
	else {
		const md = report(groups, { starts: starts.length, ends: ends.length });
		if (arg("--write")) fs.writeFileSync(arg("--write"), md); else console.log(md);
	}
}

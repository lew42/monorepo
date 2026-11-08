/* node Servex/pid-coverage.mjs [--root <repo>] [--hours 24] [--write <file>] [--json]
 * COVERAGE, BY KIND: every `{"pid":N}` start line in the window (default last 24 h), sorted into one of six kinds by its
 * `cmd`/`why` text (claude.exe, node, git, powershell/bash, chrome (playwright), other), with what fraction of each kind
 * got an end line and what fraction carries an agent AND a session. Read-only: reuses `pair()` and `read_lines()` from
 * leaks.mjs rather than re-reading or re-pairing the logs. Doc: Servex/doc/processes.md, "Who started this pid".
 * The two numbers that must agree: the sum of the per-kind "starts" column equals the window's own start-line count. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pair, read_lines, repo_root } from "./leaks.mjs";

export const KINDS = ["claude.exe", "node", "git", "powershell/bash", "chrome (playwright)", "other"];

/* The exe actually being spawned, not just any word in the command line: the FIRST `something.exe` token in `cmd`
 * (full path or bare), so `C:\Program Files\nodejs\node.exe C:\...\script.mjs` reads as "node.exe", not "other", and
 * `...bash.exe -c "git log ..."` reads as "bash.exe", not "git" (the git text is an argument, not the spawned exe).
 * Falls back to the first bare word (no `.exe` at all, as some sampled process names come through) for Playwright's
 * `chrome`/`chromium` and a plain `node script.js`/`git status` seen without an extension. */
function exe_of(cmd){
	const m = String(cmd).match(/([a-z0-9_.+-]+\.exe)\b/i);
	if (m) return m[1].toLowerCase();
	return (String(cmd).trim().split(/\s+/)[0] ?? "").toLowerCase();
}

/* One row's own `cmd` sorted into a kind by the exe it actually runs — `why` is skipped on purpose: a sampled
 * child's `why` is "child of claude.exe" for EVERY grandchild of an agent (git, node, a shell), so matching on it
 * would call them all "claude.exe". */
export function kind_of(row){
	const exe = exe_of(row.cmd);
	if (exe === "claude.exe") return "claude.exe";
	if (/^chrom(e|ium)(\.exe)?$/.test(exe) || /playwright/.test(exe)) return "chrome (playwright)";
	if (/^git(\.exe)?$/.test(exe)) return "git";
	if (/^(powershell|pwsh|bash|sh|cmd)(\.exe)?$/.test(exe)) return "powershell/bash";
	if (/^node(\.exe)?$/.test(exe)) return "node";
	return "other";
}

/* starts: pair()'s `starts` array (every start row, deduped by pid+started, with `.t` already computed). open: pair()'s
 * `open` array — the SAME objects, by reference, for the ones with no end (checked with `.has`, not reconstructed). */
export function coverage(starts, open_set, since_ms){
	const rows = new Map(KINDS.map(k => [k, { kind: k, starts: 0, with_end: 0, with_both: 0 }]));
	let windowed = 0;
	for (const s of starts){
		if (s.t < since_ms) continue;
		windowed++;
		const row = rows.get(kind_of(s));
		row.starts++;
		if (!open_set.has(s)) row.with_end++;
		if (s.agent && s.session) row.with_both++;
	}
	return { rows: [...rows.values()], windowed };
}

function pct(n, d){ return d ? `${Math.round((n / d) * 1000) / 10}%` : "—"; }

export function report({ rows, windowed }, hours){
	const total = rows.reduce((n, r) => n + r.starts, 0);
	const lines = [`# PID coverage, last ${hours} h`, "",
		`${windowed} start lines in the window. Row totals: ${total} (${total === windowed ? "agree" : "DISAGREE — a row was double-counted or missed"}).`, "",
		"| kind | starts | with end | with agent+session |", "|---|---|---|---|",
		...rows.map(r => `| ${r.kind} | ${r.starts} | ${pct(r.with_end, r.starts)} (${r.with_end}/${r.starts}) | ${pct(r.with_both, r.starts)} (${r.with_both}/${r.starts}) |`),
		""];
	return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
	const root = arg("--root") ?? repo_root();
	const hours = Number(arg("--hours") ?? 24);
	const { starts, open } = pair(read_lines(root));
	const open_set = new Set(open);
	const since = Date.now() - hours * 3600000;
	const cov = coverage(starts, open_set, since);
	if (process.argv.includes("--json")) console.log(JSON.stringify(cov));
	else {
		const md = report(cov, hours);
		if (arg("--write")) fs.writeFileSync(arg("--write"), md); else console.log(md);
	}
}

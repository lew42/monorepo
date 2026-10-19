/* Reads sustain.log and lists every "Servex <pid> exited (<code>) after <N>s" line.
 * Run once: node crashes.mjs  -> writes crashes.json beside it and prints the summary.
 * sustain stamps are UTC time-of-day only (toISOString().slice(11,19)); dates are rebuilt by
 * walking back from the file's mtime and rolling a day each time the clock steps backward. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOGS = path.join(process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA, "lew42", "servex"), "logs");
const log = path.join(LOGS, "sustain.log");
const lines = fs.readFileSync(log, "utf8").split(/\r?\n/);

const stamp = /^(\d\d):(\d\d):(\d\d) sustain: /;
const secs = l => { const m = stamp.exec(l); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null; };

// walk backward from the newest stamped line (= mtime's UTC day) to assign a date to each stamped line
const day0 = new Date(fs.statSync(log).mtime); day0.setUTCHours(0, 0, 0, 0);
const dates = new Array(lines.length).fill(null);
let day = day0.getTime(), prev = null;
for (let i = lines.length - 1; i >= 0; i--) {
	const s = secs(lines[i]); if (s == null) continue;
	if (prev != null && s > prev) day -= 864e5;       // clock jumped forward going backward => crossed midnight
	dates[i] = new Date(day + s * 1000).toISOString(); prev = s;
}

const exits = [];
lines.forEach((l, i) => {
	const m = /Servex (\d+) exited \(([^)]+)\) after (\d+)s/.exec(l);
	if (!m) return;
	// what did sustain write just before? a "restart asked for — killing Servex <pid>" line means we killed it ourselves
	let killed = false;
	for (let j = i - 1; j >= Math.max(0, i - 12); j--)
		if (new RegExp(`killing Servex ${m[1]}\\b`).test(lines[j])) { killed = true; break; }
	// stderr lines sustain captured between this crash and the previous stamped line
	const stderr = [];
	for (let j = i - 1; j >= Math.max(0, i - 30) && !stamp.test(lines[j]); j--) stderr.unshift(lines[j]);
	exits.push({ at: dates[i], line: i + 1, pid: +m[1], code: m[2], uptime_s: +m[3], restart_asked: killed, stderr_before: stderr });
});

const by = {};
for (const e of exits) by[e.code] = (by[e.code] || 0) + 1;
const crash = exits.filter(e => e.code === "3221226505").map(e => e.uptime_s).sort((a, b) => a - b);
const med = a => a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : null;
const one = exits.filter(e => e.code === "1");
// why the exit-1 boots happened: classify the stderr sustain captured just before each
const why = {};
for (const e of one) {
	const m = /Cannot find package .(\S+). imported from (\S+)/.exec(e.stderr_before.join("\n"));
	const k = m ? `missing package ${m[1]} (${m[2].replace(/\\[^\\]*$/, "")})` : "no module error in the captured lines (a kill, a restart, or a JS stack above them)";
	(why[k] ??= { n: 0, first: e.at, last: e.at }).n++; why[k].last = e.at;
}
const summary = {
	log, exit_lines: exits.length, by_code: by,
	fastfail: { n: crash.length, min_s: crash[0], median_s: med(crash), max_s: crash.at(-1), under_120s: crash.filter(s => s < 120).length },
	exit1: { n: one.length, why, with_restart_asked: one.filter(e => e.restart_asked).length, without: one.filter(e => !e.restart_asked).length },
	first: exits[0]?.at, last: exits.at(-1)?.at,
	stderr_captured: "sustain opens sustain.log and gives it to Servex as stdout AND stderr (stdio: ['ignore', fd, fd]); nothing is discarded"
};

// the last five fast-fails: servex.jsonl lines in the 90 s before (by time; the file is the single-writer system log)
const sx = path.join(LOGS, "servex.jsonl");
const fd = fs.openSync(sx, "r"), size = fs.fstatSync(fd).size, CH = 64 * 1024 * 1024;
const buf = Buffer.alloc(Math.min(size, CH)); fs.readSync(fd, buf, 0, buf.length, size - buf.length);
const sxLines = buf.toString("utf8").split("\n").slice(1).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(o => o && o.at);
const last5 = exits.filter(e => e.code === "3221226505").slice(-5).map(e => {
	const t = Date.parse(e.at);
	const before = sxLines.filter(o => Date.parse(o.at) <= t).slice(-10).map(o => JSON.stringify(o).slice(0, 300));
	return { ...e, servex_jsonl_before: before, servex_jsonl_covers_from: sxLines[0]?.at };
});

fs.writeFileSync(path.join(HERE, "crashes.json"), JSON.stringify({ summary, exits, last5 }, null, 1));
console.log(JSON.stringify(summary, null, 1));
console.log("last5:", last5.map(c => `${c.at} up ${c.uptime_s}s (${c.servex_jsonl_before.length} jsonl lines before)`).join("\n"));

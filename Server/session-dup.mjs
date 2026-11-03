#!/usr/bin/env node
// Server/session-dup.mjs — READ-ONLY. How much owner-prompt text does the repo store that the SDK session files already hold?
// Doc + decisions: public/framework/ai/sessions/doc/data-sources.md. Prints hashes' verdicts only: counts and bytes, never content.
//   node Server/session-dup.mjs [--json] [--files]        (--files: per-file rows, biggest duplicate first)
// Method: repo writers' text -> units (paragraphs >= MIN chars, whitespace/case normalised, sha1) -> stream every
// ~/.claude/projects/**/*.jsonl, hash each `user` text the same way -> a unit that appears in both is a verbatim duplicate.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIN = 60, argv = process.argv.slice(2);
const norm = s => s.toLowerCase().replace(/\s+/g, " ").trim();
const sha = s => crypto.createHash("sha1").update(norm(s)).digest("base64url").slice(0, 16);
const paras = s => s.split(/\n\s*\n/).filter(x => norm(x).length >= MIN);
const nl = buf => { let n = 0, last = 10; for (const b of buf) { if (b === 10) n++; last = b; } return buf.length && last !== 10 ? n + 1 : n; };

const WRITERS = [
	["task-chat", (rel, base) => base === "task.jsonl", line => "chat" in line],
	["requirements", (rel, base) => /^(requirements|brief).*\.md$/.test(base)],
	["owner-prompts", (rel, base) => base === "owner-prompts.jsonl"],
	["words", (rel, base) => base === "words.jsonl"],
	["dictate-logs", (rel, base) => /ux\/Dictate\/ai\/|framework\/ai\/whisper\/|^public\/ai\/(v-.*|chat)\.jsonl$/.test(rel) || /^v-.*\.jsonl$/.test(base)],
	["prompt-hook", (rel, base) => rel.startsWith(".claude/prompts/")],
	["page-card", (rel, base) => base === "page.jsonl"],
];
const writerOf = (rel, base) => WRITERS.find(w => w[1](rel, base));

// 1. walk the repo's AI + module-log trees
const ROOTS = [".claude/prompts", "public/framework/ai", "public/framework/ux/Dictate", "public/ai"].map(r => path.join(REPO, r));
const tracked = new Set(execFileSync("git", ["ls-files", "-z", "--", "public"], { cwd: REPO, maxBuffer: 1 << 28, windowsHide: true }).toString().split("\0"));
const files = [];
const walkAll = () => { for (const r of ROOTS) if (fs.existsSync(r)) (function walk(d) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".git") walk(p); continue; }
		const rel = path.relative(REPO, p).split(path.sep).join("/"), w = writerOf(rel, e.name);
		if (w && /\.(jsonl|md)$/.test(e.name)) files.push({ rel, abs: p, w });
	}
})(r); };
walkAll();

const leaves = (v, out) => { if (typeof v === "string") { if (v.length >= MIN) out.push(v); } else if (v && typeof v === "object") for (const k in v) leaves(v[k], out); return out; };

// units: array of {h, bytes}; one entry per whole-leaf hash and per paragraph hash (counted once: whole OR paragraphs)
const unitsOf = text => {
	const ps = paras(text);
	return { whole: { h: sha(text), bytes: Buffer.byteLength(text) }, parts: ps.length > 1 ? ps.map(x => ({ h: sha(x), bytes: Buffer.byteLength(x) })) : [] };
};

const stats = new Map(), want = new Set(); // want: every hash we need to look for
let linesScanned = 0, linesInFiles = 0;
for (const f of files) {
	const buf = fs.readFileSync(f.abs), text = buf.toString("utf8");
	f.bytes = buf.length; f.tracked = tracked.has(f.rel); f.lines = nl(buf); linesInFiles += f.lines;
	f.units = []; f.textBytes = 0; f.scanned = 0;
	const add = t => { const u = unitsOf(t); f.units.push(u); f.textBytes += u.whole.bytes; want.add(u.whole.h); u.parts.forEach(p => want.add(p.h)); };
	if (f.rel.endsWith(".md")) { f.scanned = f.lines; if (text.trim()) paras(text).forEach(add); }
	else for (const raw of text.split("\n")) {
		if (!raw.trim()) continue;
		f.scanned++;
		let o; try { o = JSON.parse(raw); } catch { continue; }
		if (f.w[2] && !f.w[2](o)) continue;
		leaves(o, []).forEach(add);
	}
	linesScanned += f.scanned;
}
// the line counts of non-md jsonl files agree if scanned == nonblank lines; md counts its raw lines (both sides are nl())
const blankLines = files.filter(f => f.rel.endsWith(".jsonl")).reduce((n, f) => n + (f.lines - f.scanned), 0);

// 2. stream the SDK session files, hash their user texts
const SDK = path.join(os.homedir(), ".claude", "projects"), found = new Set();
let sdkFiles = 0, sdkUserLines = 0, sdkBytes = 0;
const userTexts = o => {
	const c = o.message && o.message.content;
	if (typeof c === "string") return [c];
	return Array.isArray(c) ? c.filter(b => b && b.type === "text" && typeof b.text === "string").map(b => b.text) : [];
};
const seen = t => { if (t.length < MIN) return; const w = sha(t); if (want.has(w)) found.add(w); for (const p of paras(t)) { const h = sha(p); if (want.has(h)) found.add(h); } };
const sdkWalk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
	const p = path.join(d, e.name);
	if (e.isDirectory()) { sdkWalk(p); continue; }
	if (!e.name.endsWith(".jsonl")) continue;
	sdkFiles++;
	const txt = fs.readFileSync(p, "utf8"); sdkBytes += txt.length;
	for (const raw of txt.split("\n")) {
		if (!raw.includes('"type":"user"') && !raw.includes('"type": "user"')) continue;
		let o; try { o = JSON.parse(raw); } catch { continue; }
		if (o.type !== "user") continue;
		sdkUserLines++; userTexts(o).forEach(seen);
	}
} };
if (fs.existsSync(SDK)) sdkWalk(SDK);

// 3. tally per writer / file
const byWriter = {}, rows = [];
for (const f of files) {
	let dupBytes = 0, dupUnits = 0, units = 0;
	for (const u of f.units) {
		units++;
		if (found.has(u.whole.h)) { dupBytes += u.whole.bytes; dupUnits++; }
		else for (const p of u.parts) if (found.has(p.h)) { dupBytes += p.bytes; dupUnits++; }
	}
	f.dupBytes = dupBytes;
	const W = byWriter[f.w[0]] ??= { files: 0, tracked_files: 0, file_bytes: 0, tracked_bytes: 0, lines: 0, text_bytes: 0, dup_bytes: 0, tracked_dup_bytes: 0, units: 0, dup_units: 0 };
	W.files++; W.file_bytes += f.bytes; W.lines += f.lines; W.text_bytes += f.textBytes; W.dup_bytes += dupBytes; W.units += units; W.dup_units += dupUnits;
	if (f.tracked) { W.tracked_files++; W.tracked_bytes += f.bytes; W.tracked_dup_bytes += dupBytes; }
	rows.push({ rel: f.rel, writer: f.w[0], tracked: f.tracked, bytes: f.bytes, dup_bytes: dupBytes });
}
const out = { at: new Date().toISOString(), min_chars: MIN, lines_in_files: linesInFiles, lines_scanned: linesScanned, blank_lines: blankLines,
	lines_agree: linesInFiles === linesScanned + blankLines, sdk: { files: sdkFiles, user_lines: sdkUserLines, bytes: sdkBytes }, writers: byWriter };
if (argv.includes("--files")) out.files = rows.sort((a, b) => b.dup_bytes - a.dup_bytes).slice(0, 25);
if (argv.includes("--json") || argv.includes("--files")) console.log(JSON.stringify(out, null, 1));
else {
	console.log(`lines in files ${linesInFiles} = scanned ${linesScanned} + blank ${blankLines}: ${out.lines_agree ? "agree" : "DISAGREE"}`);
	console.log(`SDK: ${sdkFiles} files, ${(sdkBytes / 1e6).toFixed(0)} MB, ${sdkUserLines} user lines`);
	for (const [k, v] of Object.entries(byWriter)) console.log(`${k.padEnd(14)} files ${v.files} (tracked ${v.tracked_files}) ${(v.file_bytes / 1e3).toFixed(0)} KB | text ${(v.text_bytes / 1e3).toFixed(0)} KB | verbatim in SDK ${(v.dup_bytes / 1e3).toFixed(0)} KB (tracked ${(v.tracked_dup_bytes / 1e3).toFixed(0)} KB)`);
}

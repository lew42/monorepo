/* WINDOW LINT — `node Server/window-lint.mjs` (add `--fix-hint` for nothing yet; plain run lists).
 *
 * Repo-wide version of the hidden-window guard in `.claude/hooks/syntax-guard.mjs`'s
 * `hidden_guard`, so it can be run as a one-shot sweep instead of only firing on the next Edit.
 * Same rule (the owner, 2026-09-25: "never pop up a Node.js process without the hidden flag"):
 * every Node `spawn`/`spawnSync`/`exec`/`execFile`/`execFileSync`/`fork` needs
 * `windowsHide: true` on THAT call (not just somewhere in the file), and a PowerShell
 * `Start-Process` needs `-WindowStyle Hidden`.
 *
 * This is a per-CALL check (the syntax-guard's is a rough per-file count, which can pass a file
 * where one call is missing the flag as long as another call in the file has it twice). Finding
 * the call's own argument list needs a little bracket-matching, not just a regex on one line,
 * because most calls here spread their options object across several lines.
 *
 * Never throws; always exits 0. `--json` prints machine-readable rows instead of the text report.
 *
 * KNOWN FALSE POSITIVES (advisory tool, read before "fixing" a hit): a method DEFINITION that
 * happens to be named `spawn`/`exec`/`fork` with its own parameters — e.g. `spawn({task}, prompt,
 * opts){` in Server/plugins/Start.js — looks exactly like a real call to a regex scanner. The
 * empty-parens filter below catches a zero-argument definition (`spawn(){`) but not one with
 * params. Same for `Start-Process` appearing in a comment or an error-message string (e.g.
 * Servex/orphan.mjs's `"no pid from Start-Process"`). Confirm the hit is a real call before
 * editing anything; the 2026-09-28 sweep found every remaining hit after that sweep was one of
 * these two shapes — see ai/2026-09-28/hidden-windows/. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build"]);
const CODE_EXT = /\.(m?js)$/;

function walk(dir, out = []) {
	let entries;
	try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
	for (const e of entries) {
		if (e.name.startsWith(".") && e.name !== ".claude") continue;
		if (SKIP_DIRS.has(e.name)) continue;
		const full = path.join(dir, e.name);
		if (e.isDirectory()) walk(full, out);
		else if (CODE_EXT.test(e.name)) out.push(full);
	}
	return out;
}

// Find the balanced ( … ) argument list that starts right after `idx` (which points at the "(").
function args_span(src, idx) {
	let depth = 0;
	for (let i = idx; i < src.length; i++) {
		if (src[i] === "(") depth++;
		else if (src[i] === ")") { depth--; if (depth === 0) return src.slice(idx, i + 1); }
	}
	return src.slice(idx, Math.min(src.length, idx + 400)); // unbalanced (rare) — best effort
}

const CALL = /([.\w$])?\b(spawn|spawnSync|execFile|execFileSync|fork)\s*(\(|Sync\()|(^|[^.\w$])exec\s*\(/g;

function scan_js(file, rel) {
	const src = fs.readFileSync(file, "utf8");
	if (!/child_process/.test(src)) return [];
	const hits = [];
	CALL.lastIndex = 0;
	let m;
	while ((m = CALL.exec(src))) {
		const openParen = src.indexOf("(", m.index);
		if (openParen === -1) continue;
		const call = args_span(src, openParen);
		const line = src.slice(0, m.index).split("\n").length;
		const name = (m[2] || "exec");
		// Skip `this.spawn(` / `obj.spawn(` — a method call on our own class, not child_process's
		// export. And skip an empty argument list — that is a method DEFINITION (`spawn(){`),
		// never a real spawn/exec call (those always take at least a command).
		if (m[1] === ".") continue;
		if (!call.slice(1, -1).trim()) continue;
		const hidden = /windowsHide\s*:\s*true/.test(call);
		const detached = /detached\s*:\s*true/.test(call);
		if (!hidden) hits.push({ file: rel, line, call: name, why: detached ? "detached:true with no windowsHide — the exact shape that pops a console" : "no windowsHide on this call" });
	}
	return hits;
}

function scan_ps1_inline(file, rel) {
	// PowerShell text embedded in a JS/mjs string (or a real .ps1, if any land under public/framework later).
	const src = fs.readFileSync(file, "utf8");
	const hits = [];
	const SP = /Start-Process\b/g;
	let m;
	while ((m = SP.exec(src))) {
		const tail = src.slice(m.index, m.index + 300);
		const line = src.slice(0, m.index).split("\n").length;
		if (!/-WindowStyle\s+Hidden/i.test(tail)) hits.push({ file: rel, line, call: "Start-Process", why: "no -WindowStyle Hidden within ~300 chars of this call" });
	}
	return hits;
}

const files = walk(root);
let rows = [];
for (const f of files) {
	const rel = path.relative(root, f).replaceAll("\\", "/");
	try {
		rows = rows.concat(scan_js(f, rel));
		rows = rows.concat(scan_ps1_inline(f, rel));
	} catch { /* unreadable — skip, never throw */ }
}

if (process.argv.includes("--json")) {
	console.log(JSON.stringify(rows, null, 2));
} else {
	console.log(`window-lint: ${files.length} .js/.mjs files scanned, ${rows.length} call(s) without windowsHide / -WindowStyle Hidden\n`);
	for (const r of rows) console.log(`${r.file}:${r.line}  ${r.call}()  — ${r.why}`);
	if (!rows.length) console.log("clean.");
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

/* THE SYNTAX GUARD (2026-09-19). Every page of the site is native ESM served as written,
 * so ONE unparseable shared module blanks every page for whoever is looking at it. It
 * happened twice in fifteen minutes: backticks in a comment inside a css() template in
 * ui/tree/tree.js, written by a minion while the owner was using the site.
 *
 * So after any Edit/Write of a .js/.mjs file, ledger.mjs calls this: `node --check` the
 * file, and if it does not parse, tell the agent that wrote it, at once, in the one
 * channel it cannot miss (a PostToolUse "block" is fed straight back to the agent).
 * The write has already happened — this is the alarm, not a lock. About 60 ms a write.
 *
 * It lives in its own file, imported inside a try, so a mistake HERE can never take the
 * ledger hook down with it. Never throws; prints at most one JSON line. */
export default function syntax_guard(file){
	try {
		if (!file || !/\.m?js$/.test(file) || !fs.existsSync(file)) return;
		// Only files inside this repo: its package.json says "type": "module", which is
		// what makes `node --check` read a .js file as the ESM it is. A scratch .js file
		// outside the repo is CommonJS to node, and `export default` there reads as broken.
		if (!path.resolve(file).toLowerCase().startsWith(root.toLowerCase() + path.sep)) return;
		const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8", timeout: 8000, windowsHide: true });
		if (check.status === 0 || check.status === null) { hidden_guard(file); return browser_guard(file); }
		const said = String(check.stderr || "").split(/\r?\n/).slice(0, 6).join(" | ");
		console.log(JSON.stringify({
			decision: "block",
			reason: "YOU JUST BROKE THIS FILE: it does not parse, and on this no-build site that blanks every page that imports it, live, for the owner. Fix it NOW, before anything else, then run node --check on it. "
				+ said
				+ " (The usual cause: a backtick inside a comment inside a css() template ends the template. Take the backticks out of the comment.)",
		}));
	} catch {}
}

/* THE HIDDEN-WINDOW GUARD (the owner, 2026-09-25: "never pop up a Node.js process without the
 * hidden flag"; re-broken and re-enforced 2026-09-28, ai/2026-09-28/hidden-windows/). A file
 * that starts processes must set windowsHide on EVERY call, not just somewhere in the file — a
 * file-wide count can pass a call that lacks the flag as long as some OTHER call in the same
 * file has it written twice. So this finds each call's own balanced argument list (most calls
 * spread their options object over several lines, so a same-line regex isn't enough) and checks
 * THAT call for `windowsHide: true`. Same bracket-matching approach as the repo-wide sweep,
 * `Server/window-lint.mjs` — read that first if this needs changing again; this is the one-file
 * version of the same check, called from the ledger on every Edit/Write. */
function call_span(src, openParen){
	let depth = 0;
	for (let i = openParen; i < src.length; i++){
		if (src[i] === "(") depth++;
		else if (src[i] === ")"){ depth--; if (depth === 0) return src.slice(openParen, i + 1); }
	}
	return src.slice(openParen, Math.min(src.length, openParen + 400));
}
function hidden_guard(file){
	const src = fs.readFileSync(file, "utf8");
	if (!/child_process/.test(src)) return;
	const CALL = /([.\w$])?\b(spawn|spawnSync|execFile|execFileSync|fork)\s*(\(|Sync\()|(^|[^.\w$])exec\s*\(/g;
	const bad = [];
	let m;
	while ((m = CALL.exec(src))){
		const openParen = src.indexOf("(", m.index);
		if (openParen === -1) continue;
		const call = call_span(src, openParen);
		if (m[1] === ".") continue;                        // this.spawn(...) — a method call, not child_process's export
		if (!call.slice(1, -1).trim()) continue;            // spawn(){ — a method DEFINITION, never a real call
		const name = m[2] || "exec";
		const line = src.slice(0, m.index).split("\n").length;
		const hidden = /windowsHide\s*:\s*true/.test(call);
		if (hidden) continue;
		const detached = /detached\s*:\s*true/.test(call);
		bad.push({ line, name, detached });
	}
	if (!bad.length) return;
	const worst = bad.find(b => b.detached) ?? bad[0];
	const detachedNote = worst.detached
		? ` Line ${worst.line}'s ${worst.name}() sets detached:true with no windowsHide — that is the exact shape that pops a brand-new console window, not just a maybe.`
		: "";
	const rest = bad.length > 1 ? ` (${bad.length} call(s) total missing it: line${bad.length > 1 ? "s" : ""} ${bad.map(b => b.line).join(", ")}.)` : "";
	console.log(JSON.stringify({ decision: "block",
		reason: `This file has a spawn/exec/execFile/fork call with no { windowsHide: true } in its own argument list.${detachedNote} On Windows that pops a window in front of the owner. Add windowsHide: true to EACH call that needs it, not just somewhere in the file.${rest} (PowerShell: Start-Process -WindowStyle Hidden, no -Redirect flags. Still flashes even hidden? Route it through a wrapper proven with an EnumWindows probe, like Servex/hidden-launch.vbs.)` }));
}

/* THE ONE-LAUNCHER GUARD (shared-browser, 2026-09-28). `chromium.launch()` with no
 * `channel: "chromium"` opens a real OS window (chrome-headless-shell) even in
 * "headless" mode — the same class of popup as the hidden-window guard above, just
 * for Playwright instead of child_process. `Server/browser.mjs` is now the one place
 * every script gets Chromium from, so a `.launch(` next to a Playwright import
 * anywhere ELSE is a call that bypassed it — flag it, the same way a stray
 * spawn/exec without windowsHide gets flagged. Repo-wide sweep: `Server/window-lint.mjs`. */
function browser_guard(file){
	const rel = path.relative(root, file).replaceAll("\\", "/");
	// The launcher itself (where .launch( belongs) and this guard's own source
	// (which necessarily spells out ".launch(" and "playwright" to describe them).
	if (rel === "Server/browser.mjs" || rel === ".claude/hooks/syntax-guard.mjs" || rel === "Server/window-lint.mjs") return;
	const src = fs.readFileSync(file, "utf8");
	if (!/playwright/i.test(src)) return;
	const LAUNCH = /\.launch\s*\(/g;
	const lines = [];
	let m;
	while ((m = LAUNCH.exec(src))) lines.push(src.slice(0, m.index).split("\n").length);
	if (!lines.length) return;
	console.log(JSON.stringify({ decision: "block",
		reason: `This file calls Chromium's .launch( directly (line${lines.length > 1 ? "s" : ""} ${lines.join(", ")}), instead of going through Server/browser.mjs — the one launcher every script in this repo shares, which sets the channel that opens no window. Import { browser } from "./browser.mjs" (adjust the relative path) and call browser(opts) instead of chromium.launch(opts).` }));
}

// Ready-to-run patch for .claude/hooks/syntax-guard.mjs's hidden_guard — written by
// minion-hidden-guard-enforce, 2026-09-28. Blocked from applying it directly: Edit/Write
// refuse any path under .claude/ (repo policy, confirmed here), and this Servex-hosted
// agent's Bash/PowerShell tools refuse to run `node` with any script argument (only
// `node --version`/`--help` go through; `node --check <file>`, `node -e`, `node <file>.mjs`
// and even `python -c` all came back "this command requires approval" with no prompt to
// answer, in both the Bash and PowerShell tools, before and after a Servex restart mid-task).
// A CLI-based minion (full shell) or the owner can run this one file to apply the patch:
//
//   node public/framework/ai/2026-09-28/hidden-windows/apply-hidden-guard-patch.mjs
//
// It is a plain fs.readFileSync/replace/writeFileSync — the same safe-edit shape the minion
// skill documents for touching .claude/ files, checking the old text is found exactly once
// before writing anything. Delete this file once applied (see enforce-requirements.md step 4).
import fs from "node:fs";

const file = new URL("../../../../../.claude/hooks/syntax-guard.mjs", import.meta.url);
const src = fs.readFileSync(file, "utf8");

const oldStr = `/* THE HIDDEN-WINDOW GUARD (the owner, 2026-09-25: "never pop up a Node.js process without the
 * hidden flag"). A file that starts processes must set windowsHide on every one; a rough count
 * (calls vs flags) is enough to catch a new spawn without it. Same channel as above. */
function hidden_guard(file){
	const src = fs.readFileSync(file, "utf8");
	if (!/child_process/.test(src)) return;
	const calls = (src.match(/\\b(spawn|spawnSync|execSync|execFile|execFileSync|fork)\\s*\\(|[^.\\w]exec\\s*\\(/g) ?? []).length;
	const hidden = (src.match(/windowsHide/g) ?? []).length;
	if (calls <= hidden) return;
	console.log(JSON.stringify({ decision: "block",
		reason: \`This file starts \${calls} process(es) but sets windowsHide only \${hidden} time(s). On Windows every spawn/exec/execFile/fork needs { windowsHide: true } (detached ones too), or a window pops up in front of the owner. Add it to each call. (PowerShell: Start-Process -WindowStyle Hidden, no -Redirect flags.)\` }));
}`;

const newStr = `/* THE HIDDEN-WINDOW GUARD (the owner, 2026-09-25: "never pop up a Node.js process without the
 * hidden flag"). A file that starts processes must set windowsHide on every one. This is a
 * PER-CALL check, not a file-wide count: for each spawn-like call it finds that call's own
 * balanced argument list (bracket-matching, not a same-line regex, because most calls spread
 * the options object across several lines) and requires \`windowsHide: true\` inside THAT call's
 * own args — a file where only one of several calls sets the flag no longer slips through just
 * because the count comes out even. Same approach as \`Server/window-lint.mjs\` (the repo-wide
 * sweep, written this session) — read that first if this ever needs to change; the two should
 * stay in step. Same channel as the syntax check above. */

// Find the balanced ( … ) argument list that starts right after \`idx\` (which points at the "(").
function args_span(src, idx){
	let depth = 0;
	for (let i = idx; i < src.length; i++) {
		if (src[i] === "(") depth++;
		else if (src[i] === ")") { depth--; if (depth === 0) return src.slice(idx, i + 1); }
	}
	return src.slice(idx, Math.min(src.length, idx + 400)); // unbalanced (rare) — best effort
}

const HIDDEN_CALL = /([.\\w$])?\\b(spawn|spawnSync|execFile|execFileSync|fork)\\s*(\\(|Sync\\()|(^|[^.\\w$])exec\\s*\\(/g;

function hidden_guard(file){
	const src = fs.readFileSync(file, "utf8");
	if (!/child_process/.test(src)) return;
	HIDDEN_CALL.lastIndex = 0;
	let m;
	while ((m = HIDDEN_CALL.exec(src))) {
		if (m[1] === ".") continue; // \`this.spawn(\` / \`obj.spawn(\` — a method on our own class, not child_process's
		const openParen = src.indexOf("(", m.index);
		if (openParen === -1) continue;
		const call = args_span(src, openParen);
		if (!call.slice(1, -1).trim()) continue; // empty args — a method DEFINITION, e.g. \`spawn(){\`, never a real call
		if (/windowsHide\\s*:\\s*true/.test(call)) continue; // this call is fine — keep scanning the rest of the file
		const name = m[2] || "exec";
		const line = src.slice(0, m.index).split("\\n").length;
		const detached = /detached\\s*:\\s*true/.test(call);
		const reason = detached
			? \`Line \${line}: \${name}(...) has detached: true but no windowsHide: true in the same call. That is the exact shape that pops a new, visible console on Windows — add { windowsHide: true } to this call's own options object.\`
			: \`Line \${line}: \${name}(...) has no windowsHide: true in its own call. On Windows every spawn/spawnSync/exec/execFile/execFileSync/fork needs { windowsHide: true } on THAT call, or a window can pop up in front of the owner.\`;
		return console.log(JSON.stringify({ decision: "block", reason }));
	}
}`;

const count = src.split(oldStr).length - 1;
if (count !== 1) {
	console.error(`ABORT: found the old hidden_guard text ${count} time(s) in syntax-guard.mjs, expected exactly 1. File may already be patched, or has drifted — check by hand before retrying.`);
	process.exit(1);
}

fs.writeFileSync(file, src.replace(oldStr, newStr), "utf8");
console.log("Patched .claude/hooks/syntax-guard.mjs — hidden_guard is now a per-call, bracket-matching check.");
console.log("Next: node --check .claude/hooks/syntax-guard.mjs, then the hand-test in enforce-requirements.md step 5.");

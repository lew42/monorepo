/* JUNCTION CHECK: list every link under the worktree roots, and flag the ones into the main checkout.
 *
 *   node Server/junction-check.mjs           a readable list; exit code 1 if any link lands in the main checkout
 *   node Server/junction-check.mjs --json    the same, as JSON: [{ path, target, into_main }]
 *   node Server/junction-check.mjs --deep    also look inside every real node_modules (slow; the default skips them)
 *
 * It looks under the two places worktrees live: C:/Code/lew42/worktrees (the
 * sibling of the main checkout, used by worktree-up.mjs and the Servex pool) and
 * the main checkout's .claude/worktrees (Claude Code's own EnterWorktree).
 *
 * A link into the main checkout is how the main tree's node_modules was emptied on
 * 2026-09-22 and 2026-09-29: deleting the worktree, or running npm in it, went
 * through the link. worktree-up.mjs runs this after every `git worktree add` and
 * prints the warning. Remove a flagged link (the link only, never its contents):
 * PowerShell `(Get-Item <path>).Delete()`, or cmd `rmdir <path>`.
 * Detail: Server/doc/worktrees.md, "node_modules: never a junction". */

import fs from "node:fs";
import path from "node:path";
import { links_under, main_checkout } from "./junction-guard.mjs";

const MAIN = main_checkout();
const DEEP = process.argv.includes("--deep");   // also walk inside every real node_modules (slow: ~16 s for 20 worktrees)
const norm = p => path.resolve(p).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const into_main = t => !!t && (norm(t) === norm(MAIN) || norm(t).startsWith(norm(MAIN) + "/"));

const ROOTS = [path.resolve(MAIN, "..", "worktrees"), path.join(MAIN, ".claude", "worktrees")].filter(r => fs.existsSync(r));

/* Each worktree dir's links. A link that lands inside its OWN worktree is harmless and not flagged. */
const found = [];
for (const root of ROOTS){
	for (const e of fs.readdirSync(root, { withFileTypes: true })){
		const wt = path.join(root, e.name);
		for (const l of links_under(wt, { shallow: !DEEP })){
			const own = l.target && (norm(l.target) + "/").startsWith(norm(wt) + "/");
			found.push({ path: l.path, target: l.target, into_main: into_main(l.target) && !own });
		}
	}
}

const flagged = found.filter(l => l.into_main);
if (process.argv.includes("--json")) console.log(JSON.stringify(found, null, 2));
else {
	console.log(`junction-check: ${found.length} link(s) under ${ROOTS.join(" and ") || "(no worktree roots)"}; main checkout is ${MAIN}.`);
	for (const l of found) console.log(`  ${l.into_main ? "INTO MAIN" : "ok       "}  ${l.path}  ->  ${l.target ?? "(unresolvable)"}`);
	if (flagged.length) console.log(`junction-check: ${flagged.length} link(s) land in the main checkout. Deleting their worktree, or running npm in it, would empty the main tree's files. Remove the link only: (Get-Item <path>).Delete()`);
}
process.exit(flagged.length ? 1 : 0);

/* ENSURE DEPS: before the keeper starts Servex, make sure the two packages it dies without are there.
 *
 *   import { ensure_deps } from "./ensure-deps.mjs";
 *   ensure_deps(repoRoot, note);   // reinstalls a missing one, at most once per 10 minutes per dir
 *
 * WHY. On 2026-09-29 the repo root's node_modules was emptied at 13:46 (a delete went through
 * a worktree's junction into it — Server/doc/worktrees.md). Servex died at once on "Cannot find
 * package 'express'", and the keeper (sustain.mjs) restarted it into the same error for over an
 * hour, until someone ran npm install by hand. Now the keeper checks first, and reinstalls.
 *
 * What it checks: `node_modules/express` at the repo root (Server/ needs it) and
 * `Servex/node_modules/@anthropic-ai/claude-agent-sdk` (Servex's agents need it). A package
 * counts as present when its package.json parses. The rate limit means a broken network costs
 * one npm run per ten minutes per directory, never a loop. */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const NEEDS = [
	{ dir: ".", pkg: "express" },
	{ dir: "Servex", pkg: "@anthropic-ai/claude-agent-sdk" },
];
export const EVERY = 10 * 60 * 1000;   // at most one npm install per directory per ten minutes

const last = new Map();                // dir -> when npm install last ran there

export const present = (dir, pkg) => { try { JSON.parse(fs.readFileSync(path.join(dir, "node_modules", pkg, "package.json"), "utf8")); return true; } catch { return false; } };

/* Returns what it did, per need: "ok", "installed", "install failed", or "skipped (ran <n>s ago)". */
export function ensure_deps(root, note = console.log, needs = NEEDS, now = Date.now()){
	return needs.map(({ dir, pkg }) => {
		const full = path.resolve(root, dir);
		if (present(full, pkg)) return "ok";
		const ago = now - (last.get(full) ?? -Infinity);
		if (ago < EVERY){ note(`${pkg} is missing in ${full}, but npm install ran there ${Math.round(ago / 1000)}s ago — not again yet`); return `skipped (ran ${Math.round(ago / 1000)}s ago)`; }
		last.set(full, now);
		note(`${pkg} is missing in ${full} — running npm install there before starting Servex`);
		/* shell: true — Node refuses to exec npm.cmd directly on Windows (EINVAL; see Server/worktree-up.mjs). */
		const r = spawnSync(`${process.platform === "win32" ? "npm.cmd" : "npm"} install --no-audit --no-fund`,   // one string: args plus shell is deprecated (DEP0190)
			{ cwd: full, shell: true, windowsHide: true, encoding: "utf8", timeout: 5 * 60 * 1000 });
		const ok = r.status === 0 && present(full, pkg);
		note(ok ? `npm install in ${full} done; ${pkg} is back` : `npm install in ${full} FAILED (exit ${r.status}): ${String(r.stderr || r.error?.message || "").trim().split("\n").slice(-3).join(" | ")}`);
		return ok ? "installed" : "install failed";
	});
}

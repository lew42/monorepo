/* JUNCTION GUARD HOOK (2026-09-29): a PreToolUse hook on Bash and PowerShell.
 *
 * WHY. At 13:46:47 on 2026-09-29 an agent made node_modules junctions into the main checkout
 * BY HAND (`mklink /J`), then ran `git worktree remove --force` BY HAND. The remove deleted
 * through the junctions and emptied the main tree's node_modules; Servex crash-looped for an
 * hour. No script was involved, so the guards inside the worktree scripts could not see it.
 * (The cause: public/framework/ai/2026-09-29/node-modules-guard/cause/cause.md.)
 *
 * TWO BLOCKS (exit 2, the reason on stderr):
 *   1. A command that deletes or reinstalls (`worktree remove`, `rm -r`, `rmdir /s`,
 *      `Remove-Item -Recurse`, `rmSync`, `npm ci`, `npm install`) while any worktree holds a
 *      link that lands in the main checkout. It names each link and the link-only fix.
 *   2. Always: making a junction or symlink whose target is inside the main checkout
 *      (`mklink /J|/D`, `New-Item -ItemType Junction|SymbolicLink`). A worktree gets its own
 *      node_modules from Server/worktree-up.mjs or take_worktree, which run npm ci.
 *
 * FAST, AND FAILS OPEN. It only looks at each worktree's top two levels (where node_modules
 * and Servex/node_modules live) and never walks inside a node_modules: a few ms. The full walk
 * is `node Server/junction-check.mjs`. Any error inside this hook lets the command through. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const norm = p => path.resolve(p).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const inside = (child, parent) => { const c = norm(child), p = norm(parent); return c === p || c.startsWith(p + "/"); };

/* The main checkout, without spawning git: a worktree's `.git` is a file naming
 * <main>/.git/worktrees/<name>; the main checkout's `.git` is a directory. */
export function main_of(repo){
	const dotgit = path.join(repo, ".git");
	const st = fs.statSync(dotgit);
	if (st.isDirectory()) return path.resolve(repo);
	const gitdir = /gitdir:\s*(.+)/.exec(fs.readFileSync(dotgit, "utf8"))[1].trim();
	return path.resolve(path.resolve(repo, gitdir), "..", "..", "..");
}

const land = p => { try { return fs.realpathSync(p); } catch { try { return path.resolve(path.dirname(p), fs.readlinkSync(p)); } catch { return null; } } };

/* Links at depth 1 and 2 of one worktree dir that land in main (and not back inside the worktree). */
function shallow_links(wt, main){
	const out = [];
	const look = (dir, depth) => {
		let es; try { es = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of es){
			if (e.name === ".git") continue;
			const full = path.join(dir, e.name);
			if (e.isSymbolicLink()){ const t = land(full); if (t && inside(t, main) && !inside(t, wt)) out.push({ path: full, target: t }); }
			else if (e.isDirectory() && depth < 2 && e.name !== "node_modules") look(full, depth + 1);
		}
	};
	look(wt, 1);
	return out;
}

export function scan(main, cwd){
	const dirs = [];
	for (const root of [path.resolve(main, "..", "worktrees"), path.join(main, ".claude", "worktrees")]){
		try { for (const e of fs.readdirSync(root, { withFileTypes: true })) if (e.isDirectory() || e.isSymbolicLink()) dirs.push(path.join(root, e.name)); } catch {}
	}
	if (cwd && !inside(cwd, main) && fs.existsSync(path.join(cwd, ".git"))) dirs.push(cwd);   // a worktree somewhere else
	const seen = new Set(), out = [];
	for (const d of dirs){ if (seen.has(norm(d))) continue; seen.add(norm(d)); out.push(...shallow_links(d, main)); }
	return out;
}

const DESTRUCTIVE = /worktree\s+remove|\brm\s+(-\w*\s+)*-\w*[rR]|\brmdir\s+\/s|Remove-Item\b[^\n;|]*-Recurse|\brmSync\b|\bnpm(\.cmd)?\s+(ci|install|i)\b/i;
const unq = s => s.replace(/^["']|["']$/g, "");

/* The targets of any link-making command in `cmd`. */
export function link_targets(cmd, cwd){
	const out = [];
	for (const m of cmd.matchAll(/mklink\s+\/+[jd]\s+("[^"]+"|\S+)\s+("[^"]+"|\S+)/gi)) out.push(unq(m[2]));
	for (const m of cmd.matchAll(/New-Item\b[^\n;|]*/gi)){
		if (!/-ItemType\s+['"]?(Junction|SymbolicLink)\b/i.test(m[0])) continue;
		const t = /-(Target|Value)\s+("[^"]+"|'[^']+'|\S+)/i.exec(m[0]);
		if (t) out.push(unq(t[2]));
	}
	return out.map(t => path.resolve(cwd || ".", t.replace(/\\"/g, "")));
}

export function decide(input){
	const cmd = String(input?.tool_input?.command ?? "");
	const cwd = input?.cwd || process.cwd();
	const repo = input?.repo || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
	const main = input?.main || main_of(repo);

	const into = link_targets(cmd, cwd).filter(t => inside(t, main));
	if (into.length) return `junction-guard: blocked making a link into the main checkout (${into.join(", ")}).\n`
		+ `A worktree must never share the main tree's files: deleting it, or running npm in it, deletes them through the link\n`
		+ `(that emptied the main node_modules on 2026-09-22 and 2026-09-29). Get a worktree with its own node_modules from\n`
		+ `node Server/worktree-up.mjs <name>, or the Servex take_worktree tool; both run npm ci. See Server/doc/worktrees.md.`;

	if (!DESTRUCTIVE.test(cmd)) return null;
	const bad = scan(main, cwd);
	if (!bad.length) return null;
	return `junction-guard: blocked. This command deletes or reinstalls files, and ${bad.length} link(s) in a worktree land in the main checkout,\n`
		+ `so it could delete the main tree's files through them:\n`
		+ bad.map(l => `    ${l.path}  ->  ${l.target}`).join("\n") + "\n"
		+ `Remove the link only (never its contents), then retry: PowerShell (Get-Item <link>).Delete()  ·  cmd rmdir <link> (no /s).\n`
		+ `Full check: node Server/junction-check.mjs. See Server/doc/worktrees.md.`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	let raw = "";
	process.stdin.on("data", d => raw += d);
	process.stdin.on("end", () => {
		let why = null;
		try { why = decide(JSON.parse(raw)); } catch { process.exit(0); }   // fail open
		if (why){ process.stderr.write(why + "\n"); process.exit(2); }
		process.exit(0);
	});
}

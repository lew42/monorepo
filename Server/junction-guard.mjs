/* JUNCTION GUARD: refuse to delete or reinstall a directory that has a link into the main checkout.
 *
 *   import { refuse_links_into_main } from "./junction-guard.mjs";
 *   refuse_links_into_main(dir, "git worktree remove");   // throws if dir holds a link into main
 *
 * WHY. On 2026-09-22 and again on 2026-09-29 the main checkout's node_modules was
 * emptied. A worktree's node_modules was a JUNCTION (a Windows directory link)
 * pointing back at the main tree's node_modules. Deleting that worktree with a
 * recursive rm, `git worktree remove`, or running `npm ci` / `npm install` inside
 * it, follows the junction and empties the MAIN tree's copy. Servex then crash-
 * looped for an hour on "Cannot find package 'express'".
 *
 * So every script that deletes a worktree or installs into one calls this first.
 * It walks the directory (skipping .git), never descends into a link, and for each
 * link (a junction or a symlink: Node reports both as isSymbolicLink() on Windows)
 * asks where it really lands. A link that lands inside the main checkout, and not
 * back inside `dir` itself, is a refusal. Cost: one readdir per real directory.
 *
 * Detail and how to fix a refusal: Server/doc/worktrees.md, "node_modules: never a junction". */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* Windows paths compare case-insensitively, with either slash. */
const norm = p => path.resolve(p).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const inside = (child, parent) => { const c = norm(child), p = norm(parent); return c === p || c.startsWith(p + "/"); };

/* The main checkout: the parent of git's common dir, found from this file's own repo. */
export function main_checkout(from = HERE){
	const common = execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: from, encoding: "utf8", windowsHide: true }).trim();
	return path.resolve(from, common, "..");
}

/* Where a link lands. A dangling junction makes realpath throw, so fall back to its raw target. */
function landing(link){
	try { return fs.realpathSync(link); }
	catch { try { return path.resolve(path.dirname(link), fs.readlinkSync(link)); } catch { return null; } }
}

/* Every link under `dir`, as { path, target }. Never descends into a link; skips .git.
 * shallow: also skip descending into a REAL node_modules (a node_modules that is itself a link is
 * still found). npm never makes links inside one, and it turns a 16 s sweep into a quick one. */
export function links_under(dir, { shallow = false } = {}){
	const out = [];
	const walk = d => {
		let entries;
		try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
		for (const e of entries){
			if (e.name === ".git") continue;
			const full = path.join(d, e.name);
			if (e.isSymbolicLink()) out.push({ path: full, target: landing(full) });
			else if (e.isDirectory() && !(shallow && e.name === "node_modules")) walk(full);
		}
	};
	let top;
	try { top = fs.lstatSync(dir); } catch { return out; }
	if (top.isSymbolicLink()) return [{ path: path.resolve(dir), target: landing(dir) }];   // the target itself is a link
	walk(dir);
	return out;
}

/* The links under `dir` that land inside the main checkout (and not back inside `dir`). */
export function links_into_main(dir, main = main_checkout()){
	return links_under(dir).filter(l => l.target && inside(l.target, main) && !inside(l.target, dir));
}

/* Throw a clear error naming every offending link. `what` names the action being refused. */
export function refuse_links_into_main(dir, what = "this delete", main = main_checkout()){
	const bad = links_into_main(dir, main);
	if (!bad.length) return;
	const list = bad.map(l => `    ${l.path}  ->  ${l.target}`).join("\n");
	const err = new Error(`junction-guard: refusing ${what} in ${dir}: it holds ${bad.length} link(s) into the main checkout ${main}.\n`
		+ `${list}\n`
		+ `  Doing it would delete or overwrite the MAIN tree's files through the link. Remove only the link first\n`
		+ `  (PowerShell: (Get-Item <link>).Delete()  ·  cmd: rmdir <link>) and retry. See Server/doc/worktrees.md.`);
	err.code = "EJUNCTION";
	err.links = bad;
	throw err;
}

/* `node Server/worktree-leftovers.mjs [--apply] [--manifest <file>] [--dir <path>]…` — folders under the worktrees root
 * that git no longer lists as worktrees: a `git worktree remove` that failed partway on Windows
 * (a file held open) leaves the files and drops the entry (13 of them on 2026-10-13, worktree-cleanup).
 * Every file but node_modules is hashed and looked up in the repo's object store
 * (`git hash-object` + `git cat-file --batch-check`). A folder is removed with --apply only when EVERY file's
 * exact content is already in git, or the file is one .gitignore names (a cache the server regenerates).
 * A dev server's own logs (page.jsonl, files.jsonl, the clarity flags) count as noise, as in worktree-prune.mjs.
 * An ignored database (*.sqlite, *.db, e.g. a .wrangler D1 store) is never a cache: it keeps the folder.
 * `--dir <path>` checks that folder instead of the worktrees root (repeatable; a stray like ../wt-*).
 * A file whose content git has never seen is unique: the folder is kept and the file named.
 * Never touches a folder git lists as a worktree (or one holding a listed worktree, e.g. worktrees/worktrees/), or one changed in the last 6 hours. Every spawn sets windowsHide. */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN = path.resolve(HERE, execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: HERE, encoding: "utf8", windowsHide: true }).trim(), "..");
const ROOT = path.resolve(MAIN, "..", "worktrees");
const APPLY = process.argv.includes("--apply");
const MANIFEST = process.argv.includes("--manifest") ? process.argv[process.argv.indexOf("--manifest") + 1] : null;
const LOG = f => /(^|\/)(page|files)\.jsonl$/.test(f) || f === ".claude/skills/clarity/flags.jsonl";
const DIRS = process.argv.flatMap((a, i, all) => a === "--dir" ? [path.resolve(all[i + 1])] : []);
const DB = f => /\.(sqlite|db)(-shm|-wal)?$/i.test(f);
const RECENT = Date.now() - 6 * 3600e3;
const slash = s => s.replace(/\\/g, "/").toLowerCase();
const run = (args, input) => spawnSync("git", ["-C", MAIN, ...args], { input, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 30 });

const listed = new Set(run(["worktree", "list", "--porcelain"]).stdout.split(/\r?\n/).filter(l => l.startsWith("worktree ")).map(l => slash(l.slice(9))));
const walk = (dir, out = [], rel = "") => {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (e.name === "node_modules" || e.name === ".git") continue;
		const r = rel ? `${rel}/${e.name}` : e.name;
		if (e.isDirectory()) walk(path.join(dir, e.name), out, r); else out.push(r);
	}
	return out;
};
const report = [];
for (const dir of DIRS.length ? DIRS : fs.readdirSync(ROOT).map(n => path.join(ROOT, n))) {
	const name = path.basename(dir);
	try { if (!fs.statSync(dir).isDirectory() || listed.has(slash(dir)) || [...listed].some(l => l.startsWith(slash(dir) + "/"))) continue; } catch { continue; }   // gone meanwhile (the Pool removes its own)
	if (fs.existsSync(path.join(dir, ".git"))) { report.push({ name, keep: "has a .git file: a worktree git lost track of; repair it by hand" }); continue; }
	const files = walk(dir);
	const newest = Math.max(0, ...files.filter(f => !LOG(f)).map(f => { try { return fs.statSync(path.join(dir, f)).mtimeMs; } catch { return 0; } }));
	if (newest > RECENT) { report.push({ name, files: files.length, keep: "changed in the last 6 hours" }); continue; }
	// ignored by the repo's own rules: a cache, never anyone's work
	const ignored = new Set(files.length ? run(["check-ignore", "--stdin"], files.join("\n")).stdout.split(/\r?\n/).filter(Boolean) : []);
	const noise = files.filter(f => !ignored.has(f) && LOG(f)).length;
	const check = files.filter(f => !ignored.has(f) && !LOG(f));
	const hashes = check.length ? spawnSync("git", ["-C", MAIN, "hash-object", "--stdin-paths"], { input: check.map(f => path.join(dir, f)).join("\n"), encoding: "utf8", windowsHide: true, maxBuffer: 1 << 30 }).stdout.split(/\r?\n/).filter(Boolean) : [];
	const known = hashes.length ? run(["cat-file", "--batch-check"], hashes.join("\n") + "\n").stdout.split(/\r?\n/).filter(Boolean) : [];
	const unique = check.filter((f, i) => !known[i] || / missing$/.test(known[i])).concat([...ignored].filter(DB));
	const row = { name, path: dir.replace(/\\/g, "/"), files: files.length, ignored: ignored.size, noise, in_git: check.length - unique.filter(f => !ignored.has(f)).length, unique: unique.slice(0, 50), unique_count: unique.length };
	if (unique.length) row.keep = `${unique.length} file(s) git has never seen, e.g. ${unique[0]}`;
	else if (APPLY) { try { fs.rmSync(dir, { recursive: true, maxRetries: 3 }); row.removed = true; } catch (e) { row.keep = `remove failed: ${e.code || e.message}`; } }
	report.push(row);
	console.log(`${row.removed ? "removed" : row.keep ? "keep   " : "would  "} ${name}: ${files.length} files, ${row.in_git} in git, ${row.ignored} ignored, ${noise} server logs${row.keep ? ` — ${row.keep}` : ""}`);
}
for (const r of report) if (!("unique_count" in r)) console.log(`keep    ${r.name}: ${r.keep}`);
if (MANIFEST) fs.writeFileSync(MANIFEST, JSON.stringify({ at: new Date().toISOString(), apply: APPLY, root: ROOT.replace(/\\/g, "/"), folders: report }, null, "\t") + "\n");

/* `node Server/branch-prune.mjs [--dry|--run]` — prune merged `worktree/*` branches nobody has checked out.
 * Dry run is the default. Each branch is first tagged `salvage/<branch>` (same commit, so git can
 * restore it: `git branch <name> salvage/<name>`), then deleted with `git branch -d` (refuses unmerged).
 * Branches checked out in any worktree are skipped. Manifest: Server/logs/branch-prune-<stamp>.json
 * (old name -> tag -> sha). Never touches michael/dev, main or unmerged work. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const RUN = process.argv.includes("--run");
const BASE = "michael/dev";
const git = (...a) => spawnSync("git", a, { encoding: "utf8", windowsHide: true });
const lines = out => out.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

const merged = lines(git("branch", "--merged", BASE, "--format=%(refname:short)", "--list", "worktree/*"));
const checked = new Set(lines(git("worktree", "list", "--porcelain")).filter(l => l.startsWith("branch ")).map(l => l.replace("branch refs/heads/", "")));
const manifest = [];
for (const b of merged) {
	if (checked.has(b)) { console.log(`skip (checked out): ${b}`); continue; }
	const sha = git("rev-parse", b).stdout.trim(), tag = `salvage/${b}`;
	if (!RUN) { console.log(`would prune: ${b} -> tag ${tag} @ ${sha.slice(0, 9)}`); manifest.push({ branch: b, tag, sha }); continue; }
	const t = git("tag", tag, sha);
	if (t.status && !/already exists/.test(t.stderr)) { console.log(`skip (tag failed): ${b} ${t.stderr.trim()}`); continue; }
	const d = git("branch", "-d", b);
	console.log(d.status ? `skip (${d.stderr.trim()}): ${b}` : `pruned: ${b} -> ${tag}`);
	if (!d.status) manifest.push({ branch: b, tag, sha });
}
const dir = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "logs");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `branch-prune-${RUN ? "run" : "dry"}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
fs.writeFileSync(file, JSON.stringify(manifest, null, 1));
console.log(`${manifest.length} ${RUN ? "pruned" : "candidates"}; manifest ${file}`);

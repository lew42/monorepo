// node Server/Worktrees.test.mjs: the verdict cases on a scratch repo (no Servex, no network)
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import Worktrees from "./Worktrees.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "wt-")), main = path.join(root, "main").replace(/\\/g, "/");
const git = (cwd, ...a) => { const r = spawnSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true }); assert.equal(r.status, 0, `git ${a.join(" ")}: ${r.stderr}`); return r.stdout; };
const put = (dir, file, text) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), text); };

fs.mkdirSync(main);
git(main, "init", "-q", "-b", "michael/dev");
git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
put(main, "a.txt", "a\n"); git(main, "add", "."); git(main, "commit", "-qm", "init");
const add = (name) => { const p = path.join(root, name).replace(/\\/g, "/"); git(main, "worktree", "add", "-q", "-b", `worktree/${name}`, p); return p; };

const landed = add("landed"), regen = add("regen"), unmerged = add("unmerged"), real = add("real"), pool = add("qf-1");
// landed: a commit whose content reaches the base as a different commit (merge.mjs lands a diff, so it is not an ancestor)
put(landed, "f.txt", "feature\n"); git(landed, "add", "."); git(landed, "commit", "-qm", "feature");
put(main, "f.txt", "feature\n"); git(main, "add", "."); git(main, "commit", "-qm", "feature, landed as a diff");
// regen: nothing ahead, only files a dev server or a screenshot run rewrites
put(regen, "x/files.jsonl", "{}\n"); put(regen, "x/shots/a.png", "png"); put(regen, "x/b.png", "png");
// unmerged: a commit the base does not hold
put(unmerged, "u.txt", "work\n"); git(unmerged, "add", "."); git(unmerged, "commit", "-qm", "work");
// real: nothing ahead, but one hand-written uncommitted file next to regenerated ones
put(real, "notes.md", "mine\n"); put(real, "x/files.jsonl", "{}\n");

const wt = new Worktrees({ main, agents: [], here: main });
const rows = await wt.plan(), by = n => rows.find(r => r.path.endsWith("/" + n));
assert.equal(rows.length, 4, "the qf-* pool slot is not listed");
assert.equal(by("landed").verdict, "REMOVE"); assert.equal(by("landed").force, false);
assert.equal(by("regen").verdict, "REMOVE"); assert.equal(by("regen").force, true); assert.equal(by("regen").regenerated, 3);
assert.equal(by("unmerged").verdict, "KEEP"); assert.match(by("unmerged").why, /unmerged/);
assert.equal(by("real").verdict, "KEEP"); assert.equal(by("real").real, 1);

await wt.apply(rows);
assert.ok(!fs.existsSync(landed) && !fs.existsSync(regen), "REMOVE rows are gone");
assert.ok(fs.existsSync(unmerged) && fs.existsSync(real) && fs.existsSync(pool), "KEEP rows and the pool slot are untouched");
const branches = git(main, "branch", "--format=%(refname:short)");
for (const n of ["landed", "regen", "unmerged", "real", "qf-1"]) assert.ok(branches.includes(`worktree/${n}`), `branch worktree/${n} kept`);
const lines = fs.readFileSync(path.join(main, Worktrees.MANIFEST), "utf8").trim().split("\n").map(JSON.parse);
assert.deepEqual(lines.map(l => l.branch).sort(), ["worktree/landed", "worktree/regen"]);
assert.match(lines[0].restore, /^git worktree add /);
assert.ok(lines.every(l => /^[0-9a-f]{40}$/.test(l.sha)));

// a live agent in a REMOVE-able worktree keeps it
const busy = add("busy");
const live = await new Worktrees({ main, agents: [busy + "/sub"], here: main }).plan();
assert.match(live.find(r => r.path.endsWith("/busy")).why, /live agent/);
// Servex unreachable: nothing is removed on a guess
const blind = new Worktrees({ main, here: main }); blind.live_cwds = async () => null;
assert.ok((await blind.plan()).every(r => r.verdict === "KEEP"));

fs.rmSync(root, { recursive: true, force: true });
console.log("Worktrees.test: ok");

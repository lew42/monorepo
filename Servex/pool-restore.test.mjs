/* node Servex/pool-restore.test.mjs — a broken slot recycles in seconds and never blocks Servex (pool-restore-freeze, 2026-10-25).
 * 2026-10-25: qf-7 and qf-5 held a tree deleted wholesale (staged as deleted after an interrupted salvage). Pool.restore() ran one
 * synchronous `git show` per file, ~30 a second, and Servex answered nothing for two hours. Here a scratch slot of 1,500 .jsonl
 * files is emptied three ways and salvaged; the salvage must keep the real work, drop the deletions, finish fast, and the event
 * loop must keep turning. Also: restore() itself (a modified file, a deleted one, a new one, a name with glob characters), and the
 * lag watchdog (Crumbs.js) naming the operation that held the main thread. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "pool-restore-"));
process.env.SERVEX_HOME = path.join(root, "home");
const { default: Pool } = await import("./Pool.js");
const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true, maxBuffer: 256 << 20 }).trim();
const slash = p => p.split(path.sep).join("/");

const main = path.join(root, "main"); fs.mkdirSync(main);
git(main, "init", "-q", "-b", "michael/dev"); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
const N = 1500;
for (let d = 0; d < 15; d++){
    fs.mkdirSync(path.join(main, `d${d}`));
    for (let i = 0; i < N / 15; i++) fs.writeFileSync(path.join(main, `d${d}`, `f${i}.jsonl`), `{"n":${d * 100 + i}}\n`);
}
fs.writeFileSync(path.join(main, "a[1].txt"), "glob chars");
fs.writeFileSync(path.join(main, "keep.txt"), "original");
git(main, "add", "."); git(main, "commit", "-qm", "init");

const said = [];
const pool = new Pool({ main: slash(main), file: path.join(root, "pool.json"), servex: { say: m => said.push(m), agents: { registry_list: () => [] } } });
const wt = id => path.join(root, "worktrees", id);
fs.mkdirSync(path.join(root, "worktrees"));
const slot = id => ({ id, path: slash(wt(id)), branch: `worktree/${id}`, state: "taken" });

// 1. restore(): modified, deleted, glob-named, and a file that is not in HEAD
git(main, "worktree", "add", "-q", "-b", "worktree/qf-1", wt("qf-1"));
const s1 = slot("qf-1");
fs.writeFileSync(path.join(wt("qf-1"), "keep.txt"), "changed");
fs.rmSync(path.join(wt("qf-1"), "a[1].txt"));
fs.writeFileSync(path.join(wt("qf-1"), "new.txt"), "not in HEAD");
await pool.restore(s1, ["keep.txt", "a[1].txt", "new.txt"]);
assert.equal(fs.readFileSync(path.join(wt("qf-1"), "keep.txt"), "utf8"), "original");
assert.equal(fs.readFileSync(path.join(wt("qf-1"), "a[1].txt"), "utf8"), "glob chars");
assert.ok(!fs.existsSync(path.join(wt("qf-1"), "new.txt")), "a file not in HEAD is deleted");
assert.equal(git(wt("qf-1"), "status", "--porcelain"), "", "restore leaves the slot clean, index included");

// 2. a tree deleted wholesale, three ways, is salvaged in seconds without blocking the event loop
const ways = {
    "qf-2": w => { for (const f of fs.readdirSync(w)) if (f !== ".git") fs.rmSync(path.join(w, f), { recursive: true, force: true }); },                         // deleted on disk
    "qf-3": w => { for (const f of fs.readdirSync(w)) if (f !== ".git") fs.rmSync(path.join(w, f), { recursive: true, force: true }); git(w, "add", "-A"); },     // staged as deleted
    "qf-4": w => { git(w, "rm", "-rq", "--cached", "."); },                                                                                                     // staged as deleted, files back on disk (untracked)
};
for (const [id, wreck] of Object.entries(ways)){
    git(main, "worktree", "add", "-q", "-b", `worktree/${id}`, wt(id));
    const w = wt(id);
    fs.writeFileSync(path.join(w, "work.txt"), "precious");     // real work: a new file …
    git(w, "add", "work.txt"); git(w, "commit", "-qm", "real commit");   // … committed, then the tree is wrecked, then a late edit …
    wreck(w);
    if (id !== "qf-4") fs.mkdirSync(path.join(w, "d0"), { recursive: true });
    fs.writeFileSync(path.join(w, "d0", "f0.jsonl"), `{"edited":true}\n`);
    fs.writeFileSync(path.join(w, "late.txt"), "written after the wreck");
    const s = slot(id);

    let worst = 0, last = Date.now();
    const lag = setInterval(() => { const now = Date.now(); worst = Math.max(worst, now - last - 100); last = now; }, 100);
    const t0 = Date.now();
    const r = await pool.salvage(s, "tester");
    clearInterval(lag);
    const took = Date.now() - t0;

    assert.ok(took < 60000, `${id}: salvage took ${took} ms`);
    assert.ok(worst < 1500, `${id}: the event loop stalled ${worst} ms`);
    assert.ok(r.branch, `${id}: a salvage branch was made`);
    const files = git(main, "ls-tree", "-r", "--name-only", r.branch).split("\n");
    assert.ok(files.includes("work.txt") && files.includes("late.txt"), `${id}: real work kept: ${files.length} files`);
    assert.equal(git(main, "show", `${r.branch}:late.txt`), "written after the wreck");
    assert.ok(files.length >= N, `${id}: the salvage branch still holds the whole tree (${files.length}), not 1,500 deletions`);
    assert.equal(git(w, "branch", "--show-current"), `worktree/${id}`, `${id}: back on its own branch`);
    assert.equal(git(w, "rev-parse", "HEAD"), git(main, "rev-parse", "michael/dev"), `${id}: back at the base`);
    assert.equal(git(w, "status", "--porcelain"), "", `${id}: the slot is clean again`);
    console.log(`ok ${id}: salvaged in ${took} ms, worst event-loop stall ${worst} ms, ${r.what}`);
}

// 3. the lag watchdog names the operation that held the main thread
const home = path.join(root, "crumbs-home");
const stuck = spawnSync(process.execPath, ["--import", new URL("./Crumbs.js", import.meta.url).href, "-e",
    `const cp = require("child_process"); cp.execFileSync("git", ["--version"], {stdio:"ignore"}); const t = Date.now(); while (Date.now() - t < 7500); setTimeout(() => {}, 1500);`],
    { env: { ...process.env, SERVEX_HOME: home }, windowsHide: true, encoding: "utf8" });
assert.equal(stuck.status, 0, stuck.stderr);
const crumbs = fs.readFileSync(path.join(home, "logs", "crumbs.log"), "utf8");
assert.match(crumbs, /LAG 5\+ s: the main thread has not run since its last operation: execFileSync .*git --version/, crumbs);
assert.match(crumbs, /LAG over: the main thread was stuck/);
console.log("ok lag watchdog:", crumbs.split("\n").filter(l => /LAG/.test(l)).join(" | "));

fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
console.log("pool-restore.test.mjs: all passed");

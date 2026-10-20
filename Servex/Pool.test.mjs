/* node Servex/Pool.test.mjs — reclaim frees a slot whose work is already on the base, and keeps one that holds work (pool-reclaim, 2026-10-17).
 * A scratch git repo, three taken slots whose holders have stopped: (1) clean, nothing ahead; (2) commits ahead that were
 * landed as a diff (not ancestors; one file is a log that grew since); (3) a commit not on the base. Reclaim frees 1 and 2, keeps 3.
 * Then a stale explicit hold. remove() and top_up() are stubbed: no server, no npm. Doc: Servex/doc/pool.md "When a slot is freed". */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "pool-reclaim-"));
process.env.SERVEX_HOME = path.join(root, "home");
const { default: Pool } = await import("./Pool.js");
const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true }).trim();
const slash = p => p.split(path.sep).join("/");
const write = (dir, file, text) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), text); };

const main = path.join(root, "main"); fs.mkdirSync(main);
git(main, "init", "-q", "-b", "michael/dev"); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
write(main, "a.txt", "a"); write(main, "log.jsonl", "{\"n\":0}\n"); git(main, "add", "."); git(main, "commit", "-qm", "init");
fs.mkdirSync(path.join(root, "worktrees"));
const wt = id => path.join(root, "worktrees", id);
for (const id of ["qf-1", "qf-2", "qf-3"]) git(main, "worktree", "add", "-q", "-b", `worktree/${id}`, wt(id));
for (const id of ["qf-1", "qf-2", "qf-3"]) { git(wt(id), "config", "user.email", "t@t"); git(wt(id), "config", "user.name", "t"); }

// qf-2: a file and a log line, committed on its branch; then the base gets the same work as a DIFFERENT commit (merge.mjs lands a diff), and the log grows past it
write(wt("qf-2"), "fix.txt", "the fix"); write(wt("qf-2"), "log.jsonl", "{\"n\":0}\n{\"n\":1}\n"); git(wt("qf-2"), "commit", "-qam", "fix"); git(wt("qf-2"), "add", "."); git(wt("qf-2"), "commit", "-qm", "fix file");
write(main, "fix.txt", "the fix"); write(main, "log.jsonl", "{\"n\":0}\n{\"n\":1}\n{\"n\":2}\n"); git(main, "add", "."); git(main, "commit", "-qm", "landed as a diff");
// qf-3: work that is NOT on the base
write(wt("qf-3"), "mine.txt", "unmerged"); git(wt("qf-3"), "add", "."); git(wt("qf-3"), "commit", "-qm", "unmerged work");

const ago = h => new Date(Date.now() - h * 3600000).toISOString();
const rows = [
    { id: "h1", state: "stopped", last_at: ago(1), stopped_at: ago(1) },
    { id: "h2", state: "stopped", last_at: ago(1), stopped_at: ago(1) },
    { id: "h3", state: "stopped", last_at: ago(0.1), stopped_at: ago(0.1) },   // stopped minutes ago: inside the grace, so its work is not salvaged yet
    { id: "fx-old", state: "gone", last_at: ago(30) }, { id: "fx-new", state: "gone", last_at: ago(0.2) }
];
const said = [];
const pool = new Pool({ main: slash(main), file: path.join(root, "pool.json"), servex: { say: m => said.push(m), agents: { registry_list: () => rows } } });
pool.slots = ["qf-1", "qf-2", "qf-3"].map((id, i) => ({ id, path: slash(wt(id)), branch: `worktree/${id}`, url: null, state: "taken", taken_by: `h${i + 1}`, taken_at: ago(2) }));
const removed = []; pool.remove = slot => { removed.push(slot.id); pool.forget(slot); }; pool.top_up = () => {};

assert.equal((await pool.standing(pool.slots[1])).on_base, true, "qf-2: diff is on the base though the commits are not ancestors");
assert.throws(() => git(main, "merge-base", "--is-ancestor", "worktree/qf-2", "michael/dev"), "qf-2 is not an ancestor: only its diff landed");
const v = id => pool.verdict(pool.slots.find(s => s.id === id), rows, []);
assert.equal((await v("qf-1")).free, true, "clean, stopped, nothing ahead");
assert.equal((await v("qf-2")).free, true, "landed as a diff");
const kept = await v("qf-3");
assert.equal(kept.free, false); assert.match(kept.why, /1 unmerged commit\(s\) on worktree\/qf-3/, "the status names the branch");

const { reclaimed, kept: still } = await pool.reclaim();
assert.deepEqual(reclaimed.sort(), ["qf-1", "qf-2"], "two freed");
assert.deepEqual(still.map(k => k.id), ["qf-3"], "one kept");
assert.match(still[0].why, /worktree\/qf-3/);
const landed_branch = git(main, "branch", "--list", "landed/qf-2-*").replace(/^[* +]+/, "").trim();
assert.match(landed_branch, /^landed\/qf-2-/, "the freed branch's commits stay reachable under landed/");
assert.equal(git(main, "show", `${landed_branch}:fix.txt`), "the fix");
assert.equal(git(main, "branch", "--list", "worktree/qf-3").length > 0, true, "the unmerged branch is untouched");
assert.ok(fs.existsSync(path.join(wt("qf-3"), "mine.txt")), "unmerged work still on disk");

// an explicit hold: stale after ORPHAN_HOURS of its holder being gone, honoured before that
const slot = { id: "qf-9", path: slash(wt("qf-3")), state: "taken", taken_by: "fx-old", held_by: "fx-old", taken_at: ago(40) };
assert.equal(pool.held(slot, rows, []), null, "a hold whose holder has been gone 30 h is stale");
assert.ok(pool.held({ ...slot, taken_by: "fx-new", held_by: "fx-new" }, rows, []), "a hold whose holder vanished minutes ago stays");
assert.equal(pool.held({ ...slot, held_by: "nobody" }, rows, []), null, "a hold by a holder the registry never heard of, 40 h old, is released");
assert.ok(pool.held({ ...slot, held_by: "nobody", taken_by: "nobody", taken_at: ago(1) }, rows, []), "the same unknown hold, 1 h old, stays");

// a dormant holder whose task landed is done at once; one whose task has not landed stays
const tdir = path.join(root, "task-landed"); fs.mkdirSync(tdir, { recursive: true });
fs.writeFileSync(path.join(tdir, "task.jsonl"), JSON.stringify({ assign: { title: "t" } }) + "\n" + JSON.stringify({ finish: { outcome: "landed" } }) + "\n");
const tdir2 = path.join(root, "task-open"); fs.mkdirSync(tdir2, { recursive: true });
fs.writeFileSync(path.join(tdir2, "task.jsonl"), JSON.stringify({ assign: { title: "t" } }) + "\n");
const dorm = (id, task_dir) => ({ id, state: "dormant", last_at: ago(1), task_dir });
const dslot = id => ({ id: "qf-8", path: slash(wt("qf-3")), state: "taken", taken_by: id, taken_at: ago(2) });
assert.equal(pool.held(dslot("d1"), [dorm("d1", tdir)], []), null, "dormant 1 h, task landed: done at once");
assert.ok(pool.held(dslot("d2"), [dorm("d2", tdir2)], []), "dormant 1 h, task not landed: kept");

// the slot's own board.jsonl card writer is server noise
assert.equal(Pool.server_log("public/framework/ai/board.jsonl"), true, "board.jsonl is clean noise");
assert.equal(Pool.server_log("public/framework/ai/other/board.jsonl"), false, "only the one board");

console.log("Pool.test: all checks passed");
fs.rmSync(root, { recursive: true, force: true });

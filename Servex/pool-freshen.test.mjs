/* node Servex/pool-freshen.test.mjs — a ready slot whose dev server dirtied tracked logs still fast-forwards (2026-11-24).
 * The slot's server rewrites files.jsonl; a "log sweep" commit on the base changes the same file; `merge --ff-only` then says
 * "local changes would be overwritten" and take_sync used to drop the only ready slot. freshen_sync/freshen put the generated
 * dirt back (diff kept aside) and fast-forward. Real git, scratch repo, no Servex. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DEV_BRANCH } from "../Server/dev-branch.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "pool-freshen-"));
process.env.SERVEX_HOME = path.join(root, "home");
const { default: Pool } = await import("./Pool.js");
const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true }).trim();
const slash = p => p.split(path.sep).join("/");
const main = path.join(root, "main"); fs.mkdirSync(main);
git(main, "init", "-q", "-b", DEV_BRANCH); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
for (const f of ["files.jsonl", "sub/files.jsonl", "page.jsonl", "keep.txt"]) { fs.mkdirSync(path.dirname(path.join(main, f)), { recursive: true }); fs.writeFileSync(path.join(main, f), "v0\n"); }
git(main, "add", "."); git(main, "commit", "-qm", "init");
fs.mkdirSync(path.join(root, "worktrees"));

const said = [];
const pool = new Pool({ main: slash(main), file: path.join(root, "pool.json"), servex: { say: m => said.push(m), agents: { registry_list: () => [] } } });
Object.assign(pool, { page_watch(){}, start_watcher(){}, top_up(){ pool.topped = (pool.topped ?? 0) + 1; } });
let n = 0;
function slot(){
    const id = `qf-${++n}`, dir = path.join(root, "worktrees", id);
    git(main, "worktree", "add", "-q", "-b", `worktree/${id}`, dir);
    const s = { id, path: slash(dir), branch: `worktree/${id}`, url: null, state: "ready", taken_by: null, taken_at: null, idle_since: null };
    pool.slots.push(s);
    return s;
}
const advance = (...files) => { for (const f of files) fs.writeFileSync(path.join(main, f), `${Date.now()}${Math.random()}\n`); git(main, "add", "."); git(main, "commit", "-qm", "log sweep"); };
const dirty = (s, ...files) => files.forEach(f => fs.writeFileSync(path.join(s.path, f), "server rewrote this\n"));

// 1. take_sync: dirty files.jsonl + a base commit touching it -> the slot is taken, current and clean
const a = slot();
dirty(a, "files.jsonl", "sub/files.jsonl", "page.jsonl");
advance("files.jsonl", "sub/files.jsonl");
let got = pool.take_sync("minion-1");
assert.ok(got, `take_sync handed the slot over: ${said.join(" | ")}`);
assert.equal(a.state, "taken");
assert.equal(git(a.path, "rev-parse", "HEAD"), git(main, "rev-parse", DEV_BRANCH), "current with the base");
assert.equal(git(a.path, "status", "--porcelain", "-uno"), "", "the generated dirt went back to HEAD");
assert.ok(fs.readdirSync(path.join(main, ".worktree-logs")).some(f => f.startsWith(`${a.id}-`) && f.endsWith(".patch")), "its diff was kept aside first");
console.log("ok take_sync: dirty files.jsonl + new base commit");

// 2. a file of its own (not generated) is never restored: the ff fails, the slot is dropped, a new one is asked for
const b = slot();
dirty(b, "files.jsonl"); fs.writeFileSync(path.join(b.path, "keep.txt"), "someone's work\n");
advance("files.jsonl", "keep.txt");
const before = pool.topped ?? 0;
assert.equal(pool.take_sync("minion-2"), null, "no slot handed over");
assert.equal(fs.readFileSync(path.join(b.path, "keep.txt"), "utf8"), "someone's work\n", "its own file was not touched");
assert.ok(pool.topped > before, "a replacement was asked for at once");
assert.ok(said.some(m => /qf-2 would not fast-forward.*dropped: .*1 file\(s\) of its own, not restored/.test(m)), said.join(" | "));
console.log("ok take_sync: a file of its own is kept and the failure says why");

// 3. the sweep keeps the ready slot current (async twin), and leaves a taken slot alone
const c = slot();
dirty(c, "files.jsonl", "page.jsonl");
advance("files.jsonl", "page.jsonl");
const r = await pool.freshen(c, { guard: true });
assert.ok(r.ok, r.out + " // " + said.slice(-3).join(" | "));
assert.equal(git(c.path, "rev-parse", "HEAD"), git(main, "rev-parse", DEV_BRANCH));
assert.equal(git(c.path, "status", "--porcelain", "-uno"), "");
const d = slot();
dirty(d, "files.jsonl"); advance("files.jsonl");
d.state = "taken";
const skipped = await pool.freshen(d, { guard: true });
assert.ok(skipped.ok && skipped.skipped, "a slot taken meanwhile is left alone");
assert.notEqual(git(d.path, "rev-parse", "HEAD"), git(main, "rev-parse", DEV_BRANCH), "and was not moved");
console.log("ok freshen: current after restore; a taken slot is skipped");

await pool.chain;   // the dropped slot's removal runs in the background
fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
console.log("pool-freshen.test.mjs: all passed");

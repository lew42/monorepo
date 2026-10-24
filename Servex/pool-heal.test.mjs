/* node Servex/pool-heal.test.mjs — proves the pool heals itself (worktree-pool-ready, 2026-10-09).
 * A scratch git repo with a real worktree: (1) a forgotten qf-N worktree holding work is salvaged to a
 * salvage/ branch and removed, so its name is free again; (2) an unmerged leftover branch is moved aside, not deleted;
 * (3) a holder the registry forgot, 12h+ ago, releases its slot; (4) a long wait raises an alert;
 * (5) take, return, take hands out the same slot. Pool.up() is stubbed: no server, no npm. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "pool-heal-"));
process.env.SERVEX_HOME = path.join(root, "home");
const { default: Pool } = await import("./Pool.js");
const { default: Log } = await import("./Log.js");
const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true }).trim();

const main = path.join(root, "main"); fs.mkdirSync(main);
git(main, "init", "-q", "-b", "michael/dev"); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
fs.writeFileSync(path.join(main, "a.txt"), "a"); git(main, "add", "."); git(main, "commit", "-qm", "init");
fs.mkdirSync(path.join(root, "worktrees"));
const wt = id => path.join(root, "worktrees", id);
git(main, "worktree", "add", "-q", "-b", "worktree/qf-2", wt("qf-2"));
fs.writeFileSync(path.join(wt("qf-2"), "work.txt"), "precious");            // uncommitted work
git(main, "branch", "worktree/qf-3"); git(main, "checkout", "-q", "worktree/qf-3");
fs.writeFileSync(path.join(main, "b.txt"), "b"); git(main, "add", "."); git(main, "commit", "-qm", "unmerged"); git(main, "checkout", "-q", "michael/dev");

const said = [];
const pool = new Pool({ main: main.split(path.sep).join("/"), file: path.join(root, "pool.json"), servex: { say: m => said.push(m), agents: { registry_list: () => [] }, queued: () => [{ id: "minion-x", reason: "waits for a pool worktree", since: new Date(Date.now() - 20 * 60000).toISOString() }] } });

const out = await pool.heal();
await pool.chain;
assert.deepEqual(out.orphans, ["qf-2"]);
assert.ok(!fs.existsSync(wt("qf-2")), "orphan worktree removed");
assert.match(git(main, "branch", "--list", "salvage/qf-2-*"), /salvage\/qf-2-/);
assert.equal(git(main, "show", git(main, "branch", "--list", "salvage/qf-2-*").replace(/^[* +]+/, "").trim() + ":work.txt"), "precious", "work kept");
assert.deepEqual(out.branches, ["qf-3"]);
assert.match(git(main, "branch", "--list", "salvage/qf-3-*"), /salvage\/qf-3-/);
assert.equal(git(main, "branch", "--list", "worktree/qf-3"), "", "name freed, commits moved not deleted");
assert.ok(said.some(m => /ALERT pool: minion-x/.test(m)), "stuck spawn alerted");

const slot = { id: "qf-1", path: wt("qf-1"), state: "taken", taken_by: "task-gone-agent", taken_at: new Date(Date.now() - 13 * 3600000).toISOString() };
assert.equal(pool.held(slot, [], []), null, "forgotten holder, 13h: released");
assert.ok(pool.held({ ...slot, taken_at: new Date().toISOString() }, [], []), "fresh unknown holder stays held");

assert.equal(pool.held(slot, [{ id: "task-gone-agent", state: "dormant", last_at: new Date(Date.now() - 13 * 3600000).toISOString() }], []), null, "dormant 13h = gone");
assert.ok(pool.held(slot, [{ id: "task-gone-agent", state: "dormant", last_at: new Date().toISOString() }], []), "fresh dormant stays held");

pool.slots = [];
git(main, "worktree", "add", "-q", "-b", "worktree/qf-1", wt("qf-1"));
Object.assign(pool, { slots: [{ id: "qf-1", path: wt("qf-1").split(path.sep).join("/"), branch: "worktree/qf-1", state: "ready", url: "http://x/" }] });
const a = pool.take_sync("agent-a"); assert.equal(a.id, "qf-1");
pool.top_up = () => {};
await pool.give_back("qf-1");
assert.equal(pool.take_sync("agent-b").id, "qf-1", "take, return, take");

// a server log that the slot's server dirtied and michael/dev also changed must not block the return
fs.writeFileSync(path.join(main, "files.jsonl"), "1\n"); git(main, "add", "."); git(main, "commit", "-qm", "files");
git(wt("qf-1"), "merge", "-q", "--ff-only", "michael/dev");
Object.assign(pool, { slots: [{ id: "qf-1", path: wt("qf-1").split(path.sep).join("/"), branch: "worktree/qf-1", state: "taken", taken_by: "x", baseline: {} }] });
fs.writeFileSync(path.join(wt("qf-1"), "files.jsonl"), "1\n2\n");          // the slot's server wrote a line
fs.writeFileSync(path.join(main, "files.jsonl"), "1\n3\n"); git(main, "commit", "-qam", "dev changed files.jsonl");
pool.remove = () => {};
await pool.give_back("qf-1");
assert.equal(git(wt("qf-1"), "rev-parse", "HEAD"), git(main, "rev-parse", "HEAD"), "server-log clash: fast-forwarded anyway");

const long = "task-mastermind-" + "x".repeat(90);
assert.ok(Log.safe(long).length <= 64 && Log.safe(long) === Log.safe(long) && Log.safe("short-name") === "short-name", "long log names shortened");
console.log("pool-heal: all checks passed");
fs.rmSync(root, { recursive: true, force: true });

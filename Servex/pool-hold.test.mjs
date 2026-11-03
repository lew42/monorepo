/* node Servex/pool-hold.test.mjs — proves Pool.hold(id, by) (quick-fix-path/fixer, 2026-10-01)
 * makes a TAKEN slot immune to reclaim(), the step the ten-minute sweep runs
 * (Lifecycle.sweep() calls `pool.reclaim()` every tick; Pool's own `sweep()` runs the same
 * length of timer too) — even when the Servex agent registry says the slot's holder has
 * stopped. That exact false alarm is documented in doc/pool.md: on 2026-09-30 the sweep
 * salvaged qf-9 twice because its holder LOOKED stopped while its minion was still writing
 * there. The fixer (Servex/agents/Fixer.js) holds one slot for its whole life and never calls
 * return_worktree between fixes, so it needs a hold that does not depend on the registry
 * guessing its state correctly at every instant — a Servex restart's own "the registry still
 * says stopped, revive() has not run yet" window is exactly such a moment.
 *
 * No real git and no real worktree: `give_back` is replaced with a counter, so this only has
 * to prove whether reclaim() tried to hand the slot back at all, never whether the handback
 * itself works (that is Pool.js's own existing behaviour, unchanged here). `main`/`file` are
 * given directly to the constructor, which skips Pool.main_repo()'s git call entirely. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pool-hold-test-"));
process.env.SERVEX_HOME = dir;   // home.js's HOME is frozen at import time — set before Pool.js (which imports it) loads
const { default: Pool } = await import("./Pool.js");

let checks = 0;
const check = async (name, fn) => { await fn(); checks++; };

/* One pool, one TAKEN slot, a fake Servex whose agent registry a test can set freely. */
function fake_pool(registry, opts = {}){
	const pool = new Pool({ main: dir, file: path.join(dir, `.worktree-pool-${Math.random().toString(36).slice(2)}.json`),
		servex: { say(){}, agents: { registry_list: () => registry } } });
	if (!opts.phantom){ fs.mkdirSync(path.join(dir, "qf-1"), { recursive: true }); fs.writeFileSync(path.join(dir, "qf-1", ".git"), "gitdir: fake"); }   // a real slot has a worktree on disk; reclaim() drops one that has none
	pool.slots = [{ id: "qf-1", path: path.join(dir, "qf-1"), branch: "worktree/qf-1", url: "http://127.0.0.1:9/",
		state: "taken", taken_by: "fixer-1", taken_at: "2026-10-01T00:00:00-05:00" }];
	pool.give_back_calls = 0;
	pool.give_back_real = Pool.prototype.give_back;
	pool.give_back = async id => { pool.give_back_calls++; return { id, state: "ready" }; };
	return pool;
}

await check("a PHANTOM slot (taken, but no worktree on disk) is dropped, even from a live-looking holder", async () => {
	fs.rmSync(path.join(dir, "qf-1"), { recursive: true, force: true });
	const pool = fake_pool([{ id: "fixer-1", name: "fixer-1", state: "idle", cwd: path.join(dir, "elsewhere") }], { phantom: true });
	await pool.reclaim();
	assert.equal(pool.slots.length, 0, "the phantom slot was forgotten");
	assert.equal(pool.give_back_calls, 0, "nothing to give back: there was no worktree");
});

await check("give_back refuses a slot another live agent is working in (the parent asking for a child's slot)", async () => {
	const pool = fake_pool([{ id: "child-1", state: "working", cwd: path.join(dir, "qf-1") }, { id: "fixer-1", state: "idle" }]);
	pool.holders = () => [{ id: "child-1", state: "working", cwd: path.join(dir, "qf-1") }];
	await assert.rejects(pool.give_back_real("qf-1", "fixer-1"), /is in use — child-1/);
	await assert.rejects(pool.give_back_real("qf-1", "child-1"), e => !/is in use/.test(e.message), "the worker itself may return it");
});

await check("the baseline this feature changes: NOT held, holder looks stopped -> reclaim hands it back", async () => {
	const pool = fake_pool([{ id: "fixer-1", name: "fixer-1", state: "stopped" }]);
	const { reclaimed, kept } = await pool.reclaim();
	assert.equal(pool.give_back_calls, 1, "give_back WAS called — the false-alarm case hold() exists to prevent");
	assert.deepEqual(reclaimed, ["qf-1"]);
	assert.deepEqual(kept, []);
});

await check("held -> reclaim leaves it alone even though the registry says its holder stopped", async () => {
	const pool = fake_pool([{ id: "fixer-1", name: "fixer-1", state: "stopped" }]);
	const out = pool.hold("qf-1", "fixer-1");
	assert.equal(out.held_by, "fixer-1");
	assert.equal(pool.slots[0].held_by, "fixer-1");
	const { reclaimed, kept } = await pool.reclaim();
	assert.equal(pool.give_back_calls, 0, "give_back was never called on a held slot");
	assert.deepEqual(reclaimed, [], "never reclaimed");
	assert.deepEqual(kept, [], "not even listed as a kept-but-dead holder — held() answers before any of that");
	assert.equal(pool.slots[0].state, "taken", "still taken, exactly as before reclaim() ran");
});

await check("held -> survives a save and a fresh load of the same file, same as taken_by does", async () => {
	const file = path.join(dir, ".worktree-pool-persist.json");
	const a = new Pool({ main: dir, file, servex: { say(){} } });
	a.slots = [{ id: "qf-2", path: path.join(dir, "qf-2"), branch: "worktree/qf-2", url: null, state: "taken", taken_by: "fixer-1" }];
	a.hold("qf-2", "fixer-1");
	const b = new Pool({ main: dir, file, servex: { say(){} } });
	assert.equal(b.slots.find(s => s.id === "qf-2")?.held_by, "fixer-1", "held_by was written to disk and read back by a fresh Pool");
});

await check("hold() on an id the pool does not have throws, naming the ones it does", () => {
	const pool = fake_pool([]);
	assert.throws(() => pool.hold("qf-9", "fixer-1"), /No worktree "qf-9".*qf-1/);
});

await check("unhold() clears it — the sweep can reclaim normally again", async () => {
	const pool = fake_pool([{ id: "fixer-1", name: "fixer-1", state: "stopped" }]);
	pool.hold("qf-1", "fixer-1");
	pool.unhold("qf-1");
	assert.equal(pool.slots[0].held_by, undefined);
	const { reclaimed } = await pool.reclaim();
	assert.deepEqual(reclaimed, ["qf-1"], "reclaim works again once unheld");
});

/* A restart used to make fixer-1 take and hold a NEW slot each time (pool full of its holds, 2026-10-25). */
await check("reuse_hold gives back the newest slot the holder already holds; release_extra_holds hands the other back", async () => {
	const { execFileSync } = await import("node:child_process");
	const pool = fake_pool([{ id: "fixer-1", name: "fixer-1", state: "idle" }]);
	const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, "-c", "user.name=t", "-c", "user.email=t@t", ...a], { stdio: "ignore" });
	const repo = path.join(dir, "reuse-repo"); fs.mkdirSync(repo, { recursive: true });
	git(repo, "init", "-q"); git(repo, "commit", "-q", "--allow-empty", "-m", "x");
	pool.base = "HEAD";
	pool.slots = [
		{ id: "qf-1", path: repo, branch: "worktree/qf-1", url: "http://127.0.0.1:9/", state: "taken", taken_by: "fixer-1", taken_at: "2026-10-25T10:00:00-05:00", held_by: "fixer-1" },
		{ id: "qf-2", path: repo, branch: "worktree/qf-2", url: "http://127.0.0.1:9/", state: "taken", taken_by: "fixer-1", taken_at: "2026-10-25T12:00:00-05:00", held_by: "fixer-1" },
		{ id: "qf-3", path: repo, branch: "worktree/qf-3", url: "http://127.0.0.1:9/", state: "taken", taken_by: "someone-else", taken_at: "2026-10-25T13:00:00-05:00" } ];
	assert.equal(pool.reuse_hold("nobody"), null, "a holder with no slot gets null, so take_sync runs");
	assert.equal(pool.reuse_hold("fixer-1").id, "qf-2", "the newest hold is the one reused");
	pool.give_back_calls = 0;
	assert.deepEqual(await pool.release_extra_holds("fixer-1", "qf-2"), ["qf-1"]);
	assert.equal(pool.give_back_calls, 1, "only the extra one was handed back");
	assert.equal(pool.slots.find(s => s.id === "qf-1").held_by, undefined, "its hold is cleared");
	assert.equal(pool.slots.find(s => s.id === "qf-2").held_by, "fixer-1", "the kept one stays held");
	assert.equal(pool.slots.find(s => s.id === "qf-3").taken_by, "someone-else", "another holder's slot is untouched");
});

console.log(`pool-hold.test.mjs: ${checks} checks passed`);

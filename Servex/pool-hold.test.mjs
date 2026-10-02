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
function fake_pool(registry){
	const pool = new Pool({ main: dir, file: path.join(dir, `.worktree-pool-${Math.random().toString(36).slice(2)}.json`),
		servex: { say(){}, agents: { registry_list: () => registry } } });
	pool.slots = [{ id: "qf-1", path: path.join(dir, "qf-1"), branch: "worktree/qf-1", url: "http://127.0.0.1:9/",
		state: "taken", taken_by: "fixer-1", taken_at: "2026-10-01T00:00:00-05:00" }];
	pool.give_back_calls = 0;
	pool.give_back = async id => { pool.give_back_calls++; return { id, state: "ready" }; };
	return pool;
}

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

console.log(`pool-hold.test.mjs: ${checks} checks passed`);

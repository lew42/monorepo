/* node Servex/agents/spawn-worktree.test.mjs — proves Agents.spawn()'s minion-worktree
 * redirect (session-gate, 2026-10-01): a minion spawned with no worktree cwd of its own is
 * moved into a pool slot before its first turn, so a voice session spawning a `minion`
 * directly can never again write straight into the main tree with no worktree, no smoke
 * test, no review (session-smart.md used to let exactly that happen — registry.json,
 * 2026-10-01: six minions, all `cwd: C:\Code\lew42\monorepo`).
 *
 * Five cases, against a FAKE pool (no real git, no real worktree) and a FAKE Agent (no real
 * claude.exe — Agents.spawn() would otherwise launch an actual SDK session for every case
 * below). No network, no filesystem touched outside one scratch SERVEX_HOME. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spawn-worktree-test-"));
process.env.SERVEX_HOME = dir;   // home.js's place(): registry.json and servex.jsonl land here, never the real machine's
// ⚠ set BEFORE this import, and it must be DYNAMIC — a static top-of-file import is hoisted
// ahead of the line above and would freeze home.js's module-level HOME at the REAL Servex
// home first (the exact trap External.test.mjs documents, caught 2026-09-28).
const { Agents } = await import("./Agents.js");

// A fake Agent that never starts a real claude.exe: only start() is overridden, so register(),
// recipe() and card() are all the real Agent's own code, and the registry row written is real.
class FakeAgent extends Agents.Agent {
	start(){ this.session_id ??= "fake-" + Math.random().toString(36).slice(2); this.state = "idle"; return this; }
}
class TestAgents extends Agents {}
TestAgents.Agent = FakeAgent;

// A fake pool: take_sync() hands back one ready slot, or refuses — and counts how many times
// it was asked, so a test can prove it was (or was never) called at all.
function fake_pool(slot){
	let calls = 0;
	return { calls: () => calls, take_sync(){ calls++; return slot ? { ...slot } : null; } };
}

const SLOT = { id: "qf-1", path: "/fake/worktrees/qf-1", branch: "worktree/qf-1", url: "http://127.0.0.1:9999/" };
let n = 0;
const fresh = pool => new TestAgents({ registry_dir: path.join(dir, `reg-${++n}`), servex: { pool, say(){} } });

check("minion + no cwd -> moved into the pool's worktree", () => {
	const pool = fake_pool(SLOT);
	const agent = fresh(pool).spawn({ role: "minion", name: "x", prompt: "do it" });
	assert.equal(agent.cwd, SLOT.path, "cwd becomes the pool slot's path");
	assert.equal(pool.calls(), 1, "take_sync was asked exactly once");
});

check("minion + a worktree cwd already -> left untouched, pool never asked", () => {
	const pool = fake_pool(SLOT);
	const already = path.join(dir, "worktrees", "qf-9");
	const agent = fresh(pool).spawn({ role: "minion", name: "y", prompt: "do it", cwd: already });
	assert.equal(agent.cwd, already, "cwd is exactly what was given");
	assert.equal(pool.calls(), 0, "take_sync was never asked — it already has a worktree");
});

check("task-mastermind + no cwd -> left untouched, pool never asked (only a `minion` is moved)", () => {
	const pool = fake_pool(SLOT);
	const agent = fresh(pool).spawn({ role: "task-mastermind", name: "z", prompt: "own this task" });
	assert.equal(agent.cwd, process.cwd(), "cwd keeps the Agent class's own default, process.cwd()");
	assert.equal(pool.calls(), 0, "take_sync was never asked — only a minion is moved");
});

check("minion + no cwd, no pool slot ready -> refused, NEVER falls back to the main tree", () => {
	// fresh-eyes review finding 1: an earlier version of this fell back to spawning in the main
	// tree here, silently recreating the exact incident this feature exists to close.
	const pool = fake_pool(null);
	const agents = fresh(pool);
	assert.throws(() => agents.spawn({ role: "minion", name: "w", prompt: "do it" }), /no pool worktree is ready/i);
	assert.equal(pool.calls(), 1, "take_sync was still asked once");
});

check("minion + no cwd, but no `servex.pool` at all (a demo/test host) -> left untouched, never refused", () => {
	// A host with no pool object — demo.mjs, a plain `new Agents()`, most tests — is NOT the real
	// Servex this feature is guarding against, so it is left exactly as it behaved before this
	// feature existed: no redirect, no throw.
	const agents = new TestAgents({ registry_dir: path.join(dir, `reg-${++n}`) });   // no `servex` at all
	const agent = agents.spawn({ role: "minion", name: "v", prompt: "do it" });
	assert.equal(agent.cwd, process.cwd(), "falls back to the Agent class's own default cwd, unchanged from before this feature");
});

console.log(`spawn-worktree.test.mjs: ${checks} checks passed`);

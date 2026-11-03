/* node Servex/Gate-stale.test.mjs — a held spawn is checked for "landed" only against a task dir the spec names (a fresh `ai-system-mastermind` was dropped 2026-10-25 because an OLD task of that name had landed), and a drop tells the parent. */
import assert from "node:assert/strict";
import Servex from "./Servex.js";

function run(spec){
	const asked = [], logged = [], told = [];
	const self = { log: { append: (...a) => (logged.push(a), Promise.resolve()) },
		agents: { blocked: (row, opts) => (asked.push(opts), spec.__block ?? null), reg: () => ({ read: () => ({}) }), send: (...a) => told.push(a) } };
	return { stale: Servex.prototype.stale.call(self, spec), asked, logged, told };
}

assert.equal(run({ id: "ai-system-mastermind" }).asked[0].landed, false, "a fresh spawn with no task dir never matches an old landed task");
assert.equal(run({ id: "x", resume: true }).asked[0].landed, false, "a held resume is never dropped for landing");
assert.equal(run({ id: "x", task: { dir: "t/x" } }).asked[0].landed, true, "a spec naming its task dir is checked against it");
const dropped = run({ id: "m", parent: "p", __block: { why: "landed", text: "its task x has landed" } });
assert.equal(dropped.stale, true);
assert.equal(dropped.told[0][0], "p", "the parent is told");
assert.match(dropped.told[0][1], /dropped from the spawn queue/);
console.log("Gate-stale: ok");

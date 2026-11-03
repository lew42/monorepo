/* node Server/clarity.test.mjs — the ClarityGate predicate: one-pass agents are never reviewed. */
import assert from "node:assert";
import { ClarityGate as G } from "./clarity.mjs";

assert.ok(G.skip("clarity-restart-sweep"), "a clarity agent is skipped");
assert.ok(G.skip("clarity-clarity-x"), "so is a reviewer of a reviewer");
assert.ok(G.skip("reviewer-abc"), "a reviewer is skipped");
assert.ok(G.skip("checker-abc"), "a checker is skipped");
assert.ok(G.skip("helper-x", "reviewer"), "by role too");
assert.ok(G.skip("whatever", "clarity"));
assert.equal(G.skip("helper-restart-sweep"), "", "a helper is reviewed");
assert.equal(G.skip("minion-x", "minion"), "");
assert.equal(G.skip("mastermind-clarity"), "", "'clarity' later in the name is not a clarity agent");
console.log("clarity gate: ok");

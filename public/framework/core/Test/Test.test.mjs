// Test: the check helper itself. One instance, each method called, a check after each. Run: node public/framework/core/Test/Test.test.mjs
import assert from "node:assert/strict";
import Test from "./Test.js";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };
const quiet = fn => { const log = console.log; let out = ""; console.log = s => { out += s; }; try { return [fn(), out]; } finally { console.log = log; } };

const x = new Test("x");
t(x.name === "x" && x.checks === 0 && x.failures.length === 0, "a new Test is empty");
t(x.ok(true) === true && x.checks === 1, "ok(true) counts and returns true");
t(x.ok(false, "boom") === false && x.failures[0] === "boom", "ok(false) records the message");
t(x.eq(1, 1) === true, "eq: equal numbers");
t(x.eq({ a: [1, 2] }, { a: [1, 2] }) === true, "eq: deep equal");
t(x.eq({ a: 1 }, { a: 2 }, "diff") === false && /diff \(got {"a":1}, wanted {"a":2}\)/.test(x.failures[1]), "eq: a difference names both sides");
t(x.eq([1], { 0: 1 }) === false, "eq: array is not an object");
t(x.checks === 6 && x.failures.length === 3, "6 checks, 3 failed");
t(await x.throws(() => { throw new Error("nope"); }, /nope/) === true, "throws: sync throw matches");
t(await x.throws(async () => { throw new Error("later"); }) === true, "throws: a rejection counts");
t(await x.throws(() => 1) === false && /did not throw/.test(x.failures.at(-1)), "throws: no throw fails");
t(Test.same(null, null) && !Test.same(null, {}), "same: null handling");
t(Test.show(1n) === "1", "show: falls back to String when JSON fails");

const prev = process.exitCode;
const [r, out] = quiet(() => x.done());
process.exitCode = prev;
t(r.failed === 4 && r.passed === 5, "done: reports the failures");
t(/^FAIL x:/.test(out), "done: prints FAIL");
const y = new Test("y"); y.ok(true);
const [r2, out2] = quiet(() => y.done());
t(r2.failed === 0 && out2 === "PASS y (1 checks)", "done: a clean Test prints PASS");

console.log(`Test: ${n} checks passed`);

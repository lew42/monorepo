// test("name", fn): one file runs in node and on a page. Run: node public/framework/core/Test/test-fn.test.mjs
// The browser stage (TestBlocks.js) needs a DOM, so here a small stand-in object plays the stage and records what it is handed.
import assert from "node:assert/strict";
import Test, { test } from "./Test.js";

let n = 0;
const ok = (v, msg) => { assert.ok(v, msg); n++; };
const quiet = async fn => { const log = console.log; const out = []; console.log = s => out.push(s); try { return [await fn(), out]; } finally { console.log = log; } };
const exit = process.exitCode;

// In node a test runs at once, in order, and answers with its verdict.
const [pass, out1] = await quiet(() => test("adds", t => { t.eq(1 + 1, 2, "one plus one"); t.ok(true); }));
ok(pass.name === "adds" && pass.failed === 0 && pass.passed === 2, "a passing test reports its checks");
ok(out1.some(l => /^PASS adds/.test(l)), "and prints PASS");

const [fail, out2] = await quiet(() => test("breaks", t => t.eq(1, 2, "must match")));
ok(fail.failed === 1 && out2.some(l => /^FAIL breaks.*must match/.test(l)), "a failing check prints FAIL with its message");

const [boom] = await quiet(() => test("throws", () => { throw new Error("oops"); }));
ok(boom.failed === 1 && /oops/.test(boom.failures[0]), "a function that throws is one failure, not a crash");

// optional: still runs and still counts, but is marked an edge case.
const [edge] = await quiet(() => test.optional("edge: empty", t => t.ok(true)));
ok(edge.optional === true && edge.passed === 1, "an optional test runs and is marked");

// node: a test about node-only things is skipped where there is no node.
const [nodeOnly] = await quiet(() => test.node("reads a file", t => t.ok(true)));
ok(nodeOnly.passed === 1 && nodeOnly.node === true, "a node test runs in node");

// A stage (the browser's) takes over: it gets the entry and runs it, test() does not.
const seen = [];
Test.stage = { run: entry => { seen.push(entry); return { name: entry.name, passed: 0, failed: 0, failures: [] }; } };
try {
	await test("on a page", () => { throw new Error("must not run in node"); });
	ok(seen.length === 1 && seen[0].name === "on a page" && seen[0].optional === false, "the stage is handed the entry");
	await test.optional("on a page too", () => {});
	ok(seen[1].optional === true, "with the optional flag");
} finally { Test.stage = null; }

// t.view hands a thing to the stage; with no stage it just gives the thing back.
const thing = { a: 1 };
const t0 = new Test("x");
ok(t0.view(thing) === thing, "t.view with no stage returns the thing");
const shown = [];
Test.stage = { show: (t, x, label) => shown.push([x, label]) };
try { t0.view(thing, "the thing"); } finally { Test.stage = null; }
ok(shown.length === 1 && shown[0][0] === thing && shown[0][1] === "the thing", "t.view with a stage shows it, labelled");

process.exitCode = exit;   // the failures above were on purpose
console.log(`test-fn: ${n} checks passed`);

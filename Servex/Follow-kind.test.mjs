// node Servex/Follow-kind.test.mjs — a parent tailing a child (`of`) is woken only by state and pointer lines.
import assert from "assert";
import Follow from "./Follow.js";

const L = o => JSON.stringify(o);
const kinds = {
	state: [L({ assign: { now: "queued" } }), L({ complete: { outcome: "x" } }), L({ wait: { on: "owner" } }), L({ set: { state: "waiting" }, by: "owner" }), L({ "fix-it": { complete: { outcome: "done" } } }), L({ tasks: { add: "Fix the tab bar" } })],
	pointer: [L({ log: { at: "t", msg: "public/framework/ai/doc/x.md — the design" } }), L({ log: { at: "t", msg: "ready: branch worktree/x" } }), L({ shot: { url: "/a.png" } }), L({ review: { verdict: "pass" } })],
	watcher: [L({ log: { at: "t", msg: "worktree-watch: test a.test.mjs fails" } })],
	other: [L({ log: { at: "t", msg: "started: reading the brief" } }), L({ action: { did: "edit", files: ["a"] } }), L({ decision: { what: "x" } }), L({ commit: "abc" }), "not json"]
};
for (const [k, lines] of Object.entries(kinds)) for (const l of lines) assert.equal(Follow.kind(l), k, `${k}: ${l}`);

const noisy = [...kinds.other, ...kinds.watcher, L({ commit: "f00dcafe1234" }), L({ log: { msg: "heartbeat: ping" } }), ...kinds.state];
assert.equal(Follow.worth_waking(noisy).length, kinds.state.length, "only the state lines wake a parent");
const long = L({ review: { verdict: "pass", findings: "x".repeat(2000) } });
assert.ok(Follow.worth_waking([long])[0].length <= Follow.LINE_MAX + 1, "a long line is cut");
console.log("ok Follow.kind");

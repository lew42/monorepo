// node Servex/Follow-skip.test.mjs — an agent tailing its OWN log (`skip_by`) is not woken by its own lines.
import assert from "assert";
import Follow from "./Follow.js";

const L = o => JSON.stringify(o);
const me = "session-smart-v-1";
const lines = [
	L({ chat: { text: "owner words", from: { kind: "owner" } } }),
	L({ chat: { text: "my reply", from: { kind: "assistant", agent: me } } }),
	L({ place: { to: "same" }, by: "voice-assistant-v-1" }),
	L({ p1: { title: "refined" }, by: me }),
	"not json"
];
assert.deepEqual(Follow.without(lines, [me]), [lines[0], lines[2], lines[4]], "own chat and own `by` lines are dropped");
assert.equal(Follow.without(lines, undefined), lines, "no skip_by: untouched");

const sent = [];
const f = new Follow({ subs: [], agents: { live: new Map([[me, { state: "idle" }]]), send: (a, m) => sent.push([a, m]) } });
f.save = f.rescope = () => {};
f.follow({ agent: me, path: "public/framework/ai/sessions/2026/10/25/v-1/session.jsonl", gather_ms: 5, skip_by: [me] });
assert.deepEqual(f.list(me)[0].skip_by, [me], "skip_by is stored on the subscription");
const sub = f.list(me)[0];
f.queue(sub, { file: "x.jsonl", lines: [lines[1], lines[3]] });
assert.equal(f.pending.size, 0, "only own lines: nothing queued, no wake");
f.queue(sub, { file: "x.jsonl", lines: lines.slice(0, 4) });
assert.equal(f.pending.get(me)[0].lines.length, 2, "owner and fast lines still queued");
f.stop();
console.log("ok Follow.skip_by");

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

const housekeeping = [L({ sent: { to: "smart", at: "t" } }), L({ refined: { at: "t" } }), L({ quiet: { ms: 1 } }), L({ skip: { why: "x" } }), L({ react: { emoji: "x" } }), L({ chat: { text: "reply", from: { kind: "assistant", agent: me } } })];
const heard = [lines[0], L({ place: { to: "same" }, by: "voice-assistant-v-1" }), L({ tasks: { add: { type: "Question", id: "q1" } } })];
assert.deepEqual(Follow.heard([...housekeeping, ...heard, "not json"]), heard, "`heard` keeps owner chat, {place} and Question items only");
f.follow({ agent: "other", path: "public/framework/ai/sessions/2026/10/25/v-2/session.jsonl", gather_ms: 5, skip_by: ["other"], heard: true });
assert.equal(f.list("other")[0].heard, true, "heard is stored on the subscription");
f.queue(f.list("other")[0], { file: "y.jsonl", lines: housekeeping });
assert.equal(f.pending.has("other"), false, "a {sent} line and the other housekeeping wake nobody");
f.queue(f.list("other")[0], { file: "y.jsonl", lines: [...housekeeping, ...heard] });
assert.equal(f.pending.get("other")[0].lines.length, 3, "owner chat, place and Question get through");
f.stop();
console.log("ok Follow.skip_by");

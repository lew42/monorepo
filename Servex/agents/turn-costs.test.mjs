// turn_costs tags each turn with the session it belongs to, and its costs do not change. `node Servex/agents/turn-costs.test.mjs`.
// Doc: public/framework/core/Session/doc/identity.md ("How cost follows an id").
import assert from "node:assert";
import { turn_costs } from "./turn-costs.js";

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const A = "aaaaaaaa-0000-4000-8000-000000000001", B = "bbbbbbbb-0000-4000-8000-000000000002", C = "cccccccc-0000-4000-8000-000000000003";
const L = o => JSON.stringify({ at: "2026-10-24T20:00:00-05:00", agent: "x", ...o });
const log = [
	L({ type: "process", state: "started", pid: 1 }),
	L({ type: "agent_msg", from: "host", text: `[You are Servex agent x.]\n[Your own page is /framework/ai/sessions/${A}/ — pass it as \`path\`…]` }),
	L({ type: "result", turn_cost: 1, sdk_total: 1 }),
	L({ type: "result", turn_cost: 2, sdk_total: 3 }),
	L({ type: "agent_msg", from: "someone", text: `see /framework/ai/sessions/${C}/ — Your own page is /framework/ai/sessions/${C}/` }),   // quoted by another agent: not a marker
	L({ type: "renew", why: "tokens", replaces: A, session: B }),
	L({ type: "result", turn_cost: 0.5, sdk_total: 0.5 }),
	L({ type: "process", state: "started", pid: 2 }),
	L({ type: "result", turn_cost: 1.5, sdk_total: 2 }),
	L({ type: "result", turn_cost: 1, sdk_total: 1, session_id: C })   // a line that says its own session wins (a new fresh session: total dropped)
].join("\n");

const { turns, sdk_total } = turn_costs(log);
ok(turns.map(t => t.session).join() === [A, A, B, B, C].join(), "each turn carries its session: whoami, then renew, then its own session_id");
ok(turns.map(t => t.cost).join() === "1,2,0.5,1.5,1" && sdk_total === 1, "costs are the same as before: diffs of the SDK total, a drop is a fresh session");
const of = sid => turns.filter(t => t.session === sid).reduce((s, t) => s + t.cost, 0);
ok(of(A) === 3 && of(B) === 2 && of(C) === 1, "a session's turns are its own: 3 + 2 + 1, never the agent id's 6");
const old = turn_costs([L({ type: "result", turn_cost: 1 }), L({ type: "result", turn_cost: 2 })].join("\n"));
ok(old.turns.every(t => t.session === null) && old.turns.length === 2, "an old log with no marker: turns with session null (session_turns then keeps them all)");
ok(turn_costs(log, { openrouter: true }).turns.map(t => t.session).join() === [A, A, B, B, C].join(), "openrouter turns are tagged the same way");
console.log(`${n} passing`);

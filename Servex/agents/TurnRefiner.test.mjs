import assert from "node:assert/strict";
import TurnRefiner from "./TurnRefiner.js";
import Ask from "../../Server/Ask.mjs";
import Session from "../../public/framework/core/Session/Session.js";

const lines = [], text = "Fix the login page. It is broken. Thanks a lot.", re = "2026-11-09T10:00:00.000-05:00";
const parts_of = async s => { assert.equal(s.length, 3); return { parts: [{ id: "a1", cites: [0, 1], kind: "ask", text: "Fix login" }, { id: "a2", cites: [2], kind: "conversation", text: "thanks" }], usd: 0.002 }; };
Ask.write(text, "voice", re, l => lines.push(l));   // the channel's first line
assert.equal(Session.replay(lines).coverage().cited, 0, "before the refiner nothing is cited");
const r = await TurnRefiner.refine(text, "voice", re, l => lines.push(l), { parts_of });
assert.equal(r.ok, true); assert.equal(r.parts, 2);
const c = Session.replay(lines).coverage();
assert.equal(c.sentences, 3); assert.equal(c.cited, 3, "every sentence is cited after the refiner");
assert.equal((await TurnRefiner.refine("/clear", "voice", re, () => {}, { parts_of })).skipped, "slash command");
assert.equal((await TurnRefiner.refine(text, "voice", re, () => {}, { parts_of: async () => { throw new Error("down"); } })).ok, false);
console.log("TurnRefiner.test: ok");

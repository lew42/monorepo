// node Servex/agents/landing-check.test.mjs — Agent.landing_check on a stub task: flags a missing file once, passes an ancestor branch.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { Agents } from "./Agents.js"; const Agent = Agents.Agent;
const mk = branch => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "lct-")); fs.writeFileSync(path.join(d, "task.jsonl"), JSON.stringify({ assign: { branch, landed_at: "2026-10-13T00:00:00-05:00", outcome: "shipped" } }) + "\n"); return d; };
const calls = { sent: [], replies: [] };
const agent = dir => Object.assign(Object.create(Agent.prototype), { id: "stub", parent: "boss", task: { dir, card: "c1" }, host: {
	store: () => ({ append: async () => {} }), send: (to, t) => calls.sent.push([to, t]), servex: { assistant: { card_reply: r => calls.replies.push(r) } } } });
const bad = mk("michael/bags-rail"), a = agent(bad);
assert.equal(a.landing_check(), true); assert.equal(a.landing_check(), false);   // flagged once
assert.match(fs.readFileSync(path.join(bad, "task.jsonl"), "utf8"), /landed but 1 commits are not on michael.dev/);
assert.equal(calls.sent.length, 1); assert.equal(calls.replies.length, 1);
assert.equal(agent(mk("michael/dev")).landing_check(), false);   // landed: silent
console.log("ok");

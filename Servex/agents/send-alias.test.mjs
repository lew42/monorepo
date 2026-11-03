// send_to_agent takes `to` for `id` and `message` for `text`. Agents kept calling it with
// {to, message} or {to, text}, got a validation error, and reported that "vscode-mastermind
// isn't a live agent" (2026-11-02: assistant-toggle, recite-cue-icon, in-flight-real-data).
// Run: node Servex/agents/send-alias.test.mjs
import assert from "node:assert/strict";
import { tools } from "./tools.js";

const sent = [];
const fake = {
	live: new Map(),
	send(id, text, note){ sent.push({ id, text, from: note.from }); return { card: () => ({ id, state: "external" }) }; },
};
const send = tools(fake).find(t => t.name === "send_to_agent");

assert.ok(!send.inputSchema.required.includes("id"), "`id` is not schema-required, so `to` can stand in for it");

await send.handler({ to: "vscode-mastermind", message: "merged" }, { caller: "mastermind-x" });
assert.deepEqual(sent.at(-1), { id: "vscode-mastermind", text: "merged", from: "mastermind-x" }, "{to, message} delivers");

await send.handler({ to: "vscode-mastermind", text: "merged 2" }, { caller: "mastermind-x" });
assert.equal(sent.at(-1).text, "merged 2", "{to, text} delivers");

await send.handler({ agent: "vscode-mastermind", text: "via agent" }, { caller: "mastermind-x" });
assert.equal(sent.at(-1).id, "vscode-mastermind", "{agent, text} delivers");

await send.handler({ id: "vscode-mastermind", text: "plain" }, { caller: "mastermind-x" });
assert.equal(sent.at(-1).text, "plain", "{id, text} still delivers");

const none = JSON.parse(await send.handler({ text: "who?" }, { caller: "mastermind-x" }));
assert.equal(none.ok, false);
assert.match(none.why, /id/, "a missing recipient says which field is missing");

console.log("send-alias: 6 checks pass");

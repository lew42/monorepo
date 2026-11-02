/* node Servex/ext/refine/voice-page-refused.test.mjs — a refused page write nobody awaits must not become an unhandled rejection
 * (it ended Servex at 00:31 on 2026-11-02, and every agent with it). A caller that DOES await still sees the refusal. */
import assert from "node:assert/strict";
import VoicePage from "./VoicePage.js";

const loose = [];
process.on("unhandledRejection", e => loose.push(e));
const quiet = console.error; const logged = []; console.error = (...a) => logged.push(a.join(" "));

VoicePage.tools = {
	page_read: { handler: async () => "" },
	page_add: { handler: async () => JSON.stringify({ ok: false, why: "no session abc: nothing was created" }) },
	page_set: { handler: async () => JSON.stringify({ ok: false, why: "no session abc: nothing was created" }) },
};
const v = new VoicePage({ session: "abc", prompt: "p1" });
v.raw("so the page should", { final: false });        // not awaited
v.raw("so the page should do x", { final: true });     // not awaited: this is the tail nobody holds
await new Promise(r => setTimeout(r, 50));
const awaited = await new VoicePage({ session: "abc", prompt: "p2" }).write({ status: "x" }).then(() => "ok", e => e.message);
console.error = quiet;

assert.equal(loose.length, 0, "no unhandled rejection: " + loose.map(e => e?.message));
assert.match(awaited, /no session abc/, "an awaiting caller still sees the refusal");
assert.ok(logged.some(l => /no session abc/.test(l)), "and it is logged");
console.log("voice-page-refused: 3 checks passed");
process.exit(0);

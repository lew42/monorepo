/* node Servex/agents/seat-cost.test.mjs — a voice session's fast seat is counted under its smart seat (both keep parent "sessions"). */
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
process.env.SERVEX_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "seatcost-home-"));
const { nest_agents } = await import("./page_tools.js");

const row = (id, role, cost, parent_session, parent = "sessions") => ({ id, role, cost, parent, parent_session });
const roots = nest_agents([
	row("fast-1", "session-fast", 0.1, "v-a"), row("smart-1", "session-smart", 0.5, "v-a"),
	row("fast-2", "voice-assistant", 0.2, "v-b"),                       // no smart seat yet: stays a root
	row("other", "minion", 1, "v-a", "smart-1"),                          // an ordinary child keeps its parent link
]);
const smart = roots.find(r => r.id === "smart-1");
assert.deepEqual(smart.children.map(c => c.id).sort(), ["fast-1", "other"]);
assert.equal(smart.total, 1.6, "smart own 0.5 + fast 0.1 + minion 1");
assert.ok(roots.some(r => r.id === "fast-2") && !roots.some(r => r.id === "fast-1"));
console.log("seat-cost: 4 passed");

// node Servex/agents/child-follow.test.mjs — a spawned child's parent tails its session log (doc/messaging.md), and stops when the child stops.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { Agents } from "./Agents.js";
import Follow from "../Follow.js";

const dir = "public/framework/ai/sessions/_child-follow-test/c1";   // Follow refuses anything outside a module, so the fixture sits in the repo
fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "session.jsonl"), "{\"assign\":{\"agent\":\"c1\"}}\n");
const follow = new Follow({ file: path.join(fs.mkdtempSync(path.join(os.tmpdir(), "follow-")), "follow.json") });   // never the real follow.json
const host = new Agents({ servex: { follow } }); follow.agents = host;
const parent = Object.assign(Object.create(Agents.Agent.prototype), { id: "p", state: "idle" });
host.live.set("p", parent);
host.live.set("dispatcher", { id: "dispatcher", send(){} });

try {
	assert.equal(host.follow_child("p", dir, "c1"), `${dir}/session.jsonl`);
	assert.deepEqual(follow.list("p"), [{ agent: "p", path: `${dir}/session.jsonl`, gather_ms: 60000, of: "c1" }]);
	assert.equal(host.follow_child("dispatcher", dir, "c1"), null);          // the Dispatcher's stand-in is not tailed into
	assert.equal(host.follow_child("p", `${dir}-missing`, "c2"), null);     // no log yet: nothing to follow
	follow.agent_ended({ id: "c1" });                                         // the child stops: its parent stops tailing it
	assert.deepEqual(follow.list("p"), []);
	console.log("child-follow: ok");
} finally {
	follow.stop();
	fs.rmSync("public/framework/ai/sessions/_child-follow-test", { recursive: true, force: true });
}

// node ai/AISession/AISessionIndex.test.mjs — a record-only folder (cloud voice) gets a snapshot; a transcript-session folder does not.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import AISessionIndex from "./AISessionIndex.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "aisi-test-")), day = path.join(root, "2026", "10", "20");
const put = (name, ...ls) => { const d = path.join(day, name); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "session.jsonl"), ls.map(l => JSON.stringify(l)).join("\n") + "\n"); return d; };
const at = Date.parse("2026-10-20T22:50:00Z");
const cloud = put("cloud-voice-demo", { session: { id: "cloud-voice-demo", kind: "cloud-voice-agent", caller: "voice-app", at } }, { tool_call: { at: "2026-10-20T22:55:00.000Z", tool: "x" } }, { cost: { usd: 0.5 } });
const tab = put("session-abcdef12", { session: { id: "abcdef12", kind: "vscode-tab", at } });
const task = put("just-a-task", { assign: { title: "t" } });

const snap = AISessionIndex.record_snap(cloud);
assert.equal(snap.id, "cloud-voice-demo"); assert.equal(snap.kind, "cloud-voice-agent"); assert.equal(snap.folder, "cloud-voice-demo");
assert.equal(snap.first_at, "2026-10-20T22:50:00.000Z"); assert.equal(snap.last_activity, "2026-10-20T22:55:00.000Z"); assert.equal(snap.usd, 0.5);
assert.equal(AISessionIndex.record_snap(tab), null); assert.equal(AISessionIndex.record_snap(task), null);

const ix = new AISessionIndex({ base: path.join(root, "none"), root, repo: root }); ix.no_heal = true;
await ix.load_records();
assert.deepEqual([...ix.snaps.keys()], ["cloud-voice-demo"]);
await ix.stop();
const written = JSON.parse(fs.readFileSync(path.join(day, "index.json"), "utf8"));
assert.equal(written.snapshots.length, 1); assert.equal(written.snapshots[0].id, "cloud-voice-demo");
console.log("AISessionIndex record-only: ok");

// a voice session (v-…, kind voice) takes its children's dollars and count from the sessions whose parent is it
const voice = put("v-abc1234", { session: { id: "v-abc1234", kind: "voice", home: "/framework/", at } });
const vsnap = AISessionIndex.record_snap(voice);
assert.equal(vsnap.kind, "voice"); assert.equal(vsnap.usd, 0);
assert.equal(AISessionIndex.record_snap(put("v-nokind", { session: { id: "v-nokind", at } })).kind, "voice");   // an old record with no kind is still a voice session
const vx = new AISessionIndex({ base: path.join(root, "none"), root, repo: root }); vx.no_heal = true;
await vx.load_records();
const kid = (id, usd) => ({ id, parent: "v-abc1234", usd, tree_usd: usd, kind: null, state: "idle", first_at: "2026-10-20T22:51:00.000Z", last_activity: "2026-10-20T22:52:00.000Z", day: "2026-10-20" });
vx.set(kid("child-fast", 0.1)); vx.set(kid("child-smart", 0.4));
const rolled = vx.snaps.get("v-abc1234");
assert.equal(rolled.children, 2); assert.equal(rolled.tree_usd, 0.5);
vx.set(AISessionIndex.record_snap(voice));   // the voice record grows after its children are in: the totals must survive
assert.equal(vx.snaps.get("v-abc1234").children, 2); assert.equal(vx.snaps.get("v-abc1234").tree_usd, 0.5);
await vx.stop();
console.log("AISessionIndex voice roll-up: ok");

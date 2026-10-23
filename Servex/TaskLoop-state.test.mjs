/* node Servex/TaskLoop-state.test.mjs — TaskLoop reads state through Task.replay (task-replay, 2026-10-16).
 * Fixtures: Servex/fixtures/task-state/<case>/task.jsonl, with @AGO_<min>@ standing for "that many minutes ago".
 * A fake servex stands in (agents.send is a recorder); no real agent. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-state-test-"));
process.env.SERVEX_HOME = dir;
process.env.LEDGER_ROOT = dir;
const { default: TaskLoop } = await import("./TaskLoop.js");

const fx = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "task-state");
const day = new Date().toISOString().slice(0, 10), [y, m, d] = day.split("-");
const store = path.join(dir, "public", "framework", "ai", "sessions", y, m, d);
const files = {};
for (const name of fs.readdirSync(fx)){
	const t = path.join(store, name); fs.mkdirSync(t, { recursive: true });
	const text = fs.readFileSync(path.join(fx, name, "task.jsonl"), "utf8").replace(/@AGO_(\d+)@/g, (_, n) => new Date(Date.now() - n * 60000).toISOString());
	fs.writeFileSync(files[name] = path.join(t, "task.jsonl"), text);
	const ago = new Date(Date.now() - 10 * 60000); fs.utimesSync(files[name], ago, ago);   // quiet for 10 min: past the 5 min default
}

const sent = [], cards = [];
const servex = {
	say(){}, heartbeat: { opted_in: s => s.heartbeat === true },
	agents: { registry_list: () => [{ id: "minion-x", state: "working", session_id: "s1" }], send: (id, text, note) => sent.push({ id, text, note }) },
	assistant: { card_reply: async c => (cards.push(c), { ok: true }) },
	log: { append: async () => {} },
};
const loop = new TaskLoop({ root: dir, servex, quiet_min: 5 });
const about = slug => sent.filter(s => s.text.includes(`Task ${slug} `));
const followups = f => fs.readFileSync(f, "utf8").split("\n").filter(l => l.includes('"follow_up"'));

await loop.tick();
assert.equal(about("legacy-open").length, 1, "a legacy open task is still chased");
assert.match(about("legacy-open")[0].text, /no line on your log for 10 min/);
assert.equal(about("idle").length, 0, "an idle task is not chased");
assert.equal(about("approved").length, 0, "an approved task is accepted (idle) until its agent calls start: never chased");
assert.equal(followups(files.approved).length, 0);
assert.equal(about("waiting-young").length, 0, "waiting under 2 hours gets nothing");
assert.equal(about("waiting-on-agent").length, 0, "waiting on an agent gets no reminder");
const old = about("waiting-old");
assert.equal(old.length, 1, "waiting over 2 hours gets exactly one reminder");
assert.equal(old[0].id, "minion-x");
assert.match(old[0].text, /^Task waiting-old is waiting on the owner since .*: pick a name\.$/);
assert.ok(!/build/i.test(old[0].text), "a reminder never tells an agent to build");
assert.equal(cards.length, 1, "the reminder also rides the card path");
assert.equal(followups(files["waiting-old"]).length, 1, "recorded as a follow_up line");
for (const n of ["idle", "approved", "waiting-young", "waiting-on-agent"]) assert.equal(followups(files[n]).length, 0, n + " records nothing");

const before = sent.length;
await loop.tick();
assert.equal(sent.length, before, "a second tick inside 24 hours sends nothing new");
const fresh = new TaskLoop({ root: dir, servex, quiet_min: 5 });   // a restart reads the count back from the file
await fresh.tick();
assert.equal(about("waiting-old").length, 1, "a restart loses no count");

// 24 hours later: one more
const f = files["waiting-old"];
fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/("follow_up":\{"n":1,"to":"minion-x","at":)"[^"]+"/, `$1"${new Date(Date.now() - 25 * 3600000).toISOString()}"`));
await fresh.tick();
assert.equal(about("waiting-old").length, 2, "another reminder after 24 hours");
assert.equal(followups(f).length, 2);

try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}   // Windows may still hold the temp dir (TaskLoop-steps.test.mjs hits the same)
console.log("TaskLoop-state.test.mjs: all checks passed");
process.exit(0);

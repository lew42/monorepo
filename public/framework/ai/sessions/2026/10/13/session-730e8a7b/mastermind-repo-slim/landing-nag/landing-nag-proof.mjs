/* node landing-nag-proof.mjs — no real Servex, no network. A stub task mastermind (a real Agent prototype with
 * its model-facing parts replaced) ends a turn merged-but-unlanded: the nag is sent once, never twice; a stopped
 * agent gets a log line instead; compaction and the next-step wake read their role/dep rules. Exit 0 = all pass. */
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { Agents, next_briefs } from "../../../../../../../../../../Servex/agents/Agents.js";
import { compact_after } from "../../../../../../../../../../Servex/agents/roles.js";

const out = []; let bad = 0;
const check = (n, ok, d) => { if (!ok) bad++; const l = `${ok ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`; out.push(l); console.log(l); };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nag-")); process.chdir(tmp);
const dir = "t/parent/child", append = (d, o) => { fs.mkdirSync(d, { recursive: true }); fs.appendFileSync(path.join(d, "task.jsonl"), JSON.stringify(o) + "\n"); };
append(dir, { assign: { agent: "task-mastermind-x" } });

const sent = [], logged = [];
const mk = (over = {}) => Object.assign(Object.create(Agents.Agent.prototype), {
	id: "task-mastermind-x", role: "task-mastermind", state: "idle", task: { dir }, last_text: "All merged to michael/dev.", words: "merged.",
	host: { live: new Map(), store: () => ({ append: async (n, e) => logged.push(e) }), register(){} }, send(t, o){ sent.push({ t, o }); } }, over);

const a = mk();
check("first turn end: nag sent", a.landing_nag() === true && sent.length === 1, sent[0]?.t.slice(0, 60));
check("second turn end: not resent", a.landing_nag() === false && sent.length === 1);
check("flag persisted on the registry row", new (await import("../../../../../../../../../../Servex/agents/registry.js")).default({ dir: tmp }).row(a).landing_nagged === true);
check("blocked agent not nagged", mk({ last_text: "BLOCKED: need X" }).landing_nag() === false);
check("not-yet-merged agent not nagged", mk({ last_text: "still building", words: "building" }).landing_nag() === false);
check("agent with a working child not nagged", mk({ host: { live: new Map([["m", { parent: "task-mastermind-x", state: "working" }]]) } }).landing_nag() === false);
const gone = mk(); gone.unlanded_note();
check("gone agent: log line in its task, no message", /too late to nag/.test(fs.readFileSync(path.join(dir, "task.jsonl"), "utf8")) && sent.length === 1);
append(dir, { assign: { landed_at: "NOW", outcome: "ok" } });
check("landed task never nagged", mk().landing_nag() === false);

check("minion never compacts (compact_after null)", compact_after("minion") === null);
check("task-mastermind compacts at 150k / 45 min", JSON.stringify(compact_after("task-mastermind")) === '{"tokens":150000,"minutes":45}');
const m = mk({ context: 160000, compacted_turn: -1, turns: 1, started_at: new Date().toISOString() });
check("mastermind at 160k asks to compact", m.oversized() === "context");
check("minion at 160k does not", mk({ role: "minion", context: 160000, compacted_turn: -1, started_at: new Date().toISOString() }).oversized() === null);

append("t/parent/next", { assign: { after: [dir], brief: "t/parent/next/requirements.md" } });
append("t/parent/blocked", { assign: { after: [dir, "t/parent/never"] } });
const nb = next_briefs(dir);
check("landed task names its unblocked sibling with the brief", nb.length === 1 && nb[0].dir === "t/parent/next" && nb[0].brief.endsWith("requirements.md"), JSON.stringify(nb));
const woke = []; const host = Object.create(Agents.prototype); Object.assign(host, { live: new Map(), reg: () => ({ read: () => ({}) }), holder: x => x, inbox(){}, store: () => ({ append: async () => {} }), send(...x){ woke.push(x); } });
host.wake_parent(mk({ parent: "p", last_text: "done" }), "done");
check("parent's wake carries 'Next: …'", /Next: t\/parent\/next \(brief t\/parent\/next\/requirements.md\)/.test(woke[0]?.[1] ?? ""), woke[0]?.[1]?.slice(-120));
fs.writeFileSync(path.join(import.meta.dirname, "landing-nag-proof.txt"), out.join("\n") + "\n");
process.exit(bad ? 1 : 0);

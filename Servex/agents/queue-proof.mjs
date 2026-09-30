/* node Servex/agents/queue-proof.mjs — the spawn gate's queue, without a
 * claude process: a held spawn gets its id at once, wait_for_agent on it
 * waits for the start, a second request for the same id / session / name
 * joins the first, reviewers go first under a 1 GB floor, and the queue
 * comes back after a "restart" (a second gate reading the same file).
 * Exit 0 = every case behaved. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Servex from "../Servex.js";
import { Agents } from "./Agents.js";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "queue-proof-"));
const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); };

/* A gate: Servex's own admission methods on a bare object, over a real Agents
 * host whose spawn only records (no SDK session is ever opened). */
function gate(){
	const agents = new Agents({ registry_dir: tmp, log: { append: async () => {} } });
	const started = [];
	agents.spawn = spec => {
		const id = spec.id ?? agents.name(spec);
		const a = { id, state: "idle", session_id: spec.resume ?? "sess-" + id, sent: [], turns: 1, cost: 0,
			send(t){ this.sent.push(t); return this; }, card(){ return { id }; }, idle: () => Promise.resolve(true) };
		agents.live.set(id, a); started.push({ id, spec }); return a;
	};
	const g = Object.assign(Object.create(Servex.prototype), {
		events: {}, agents, queue_file: path.join(tmp, "spawn-queue.json"),
		log: { append: async () => {} }, dispatcher: { queue: [], pump(){} }, say(){}
	});
	g.admission();
	g.hot = true;
	g.checks.push(() => g.hot ? "only 3000 MB of memory is free; waiting for 4096 MB" : null);
	return { g, agents, started };
}

const { g, agents, started } = gate();
process.env.SERVEX_FINISH_FLOOR_MB = String(10 ** 9);   // no machine has this much: reviewers queue like everyone else, for now

const a = agents.spawn({ role: "minion", name: "audio-parts", prompt: "build it" });
check("a queued spawn returns an id at once", a.queued && a.id === "minion-audio-parts", JSON.stringify(a.card()));
const b = agents.spawn({ role: "minion", name: "audio-parts", prompt: "build it" });
check("the same spawn again (a retry) joins the first entry", b === a && g.queue.length === 1);
const other = agents.spawn({ role: "minion", name: "audio-parts", prompt: "a different job", parent: "task-mastermind-x" });
check("the same name with a different job or parent is its own entry", other !== a && other.id === "minion-audio-parts-2");
agents.stop(other.id);
check("stop_agent on a queued id takes it out of the queue", g.queue.length === 1);
const r1 = agents.spawn({ role: "reviewer", name: "follow", prompt: "review" });
agents.spawn({ role: "reviewer", name: "follow", prompt: "review" });
check("a retried reviewer is one entry, not two", g.queue.filter(e => e.spec.role === "reviewer").length === 1);
const resume1 = agents.spawn({ id: "task-mastermind-lifecycle", resume: "3c88ad4d", prompt: "continue" });
const resume2 = agents.spawn({ id: "task-mastermind-lifecycle-2", resume: "3c88ad4d", prompt: "you have mail" });
check("a second resume of the same session joins the queued one", resume2 === resume1 && g.queue.length === 3);
check("…and its prompt is held for delivery", g.queue[2].inbox.length === 1);
agents.send(a.id, "one more thing", { from: "task-mastermind-x" });
check("send_to_agent on a queued id holds the message in its entry", g.queue[0].inbox.length === 1);

const saved = JSON.parse(fs.readFileSync(g.queue_file, "utf8"));
check("the queue is on disk after every change", saved.length === 3, saved.map(e => e.spec.id).join(", "));

/* restart: a fresh gate on the same file */
const two = gate();
check("after a restart the queue is restored, prompts and held messages included",
	two.g.queue.length === 3 && two.g.queue[0].spec.prompt === "build it" && two.g.queue[0].inbox.length === 1,
	two.g.queue.map(e => e.spec.id).join(", "));

/* wait_for_agent on a queued id: resolves once it starts */
const waiting = two.agents.wait("reviewer-follow", 5);
delete process.env.SERVEX_FINISH_FLOOR_MB;   // 1 GB floor: a reviewer is let through, the minion is not
two.g.drain();
const w = await waiting;
check("finishing roles go first: the reviewer started, the minion still waits",
	two.started.map(s => s.id).join() === "reviewer-follow" && two.g.queue.length === 2, two.started.map(s => s.id).join());
check("wait_for_agent on a queued id waited for it to start, then answered", w.id === "reviewer-follow" && !w.timed_out, JSON.stringify(w));

/* one session, one process: a resume of a session a live agent holds goes to that agent */
two.g.hot = false;
two.g.drain();
const live = two.agents.live.get("task-mastermind-lifecycle");
const again = two.agents.spawn({ id: "task-mastermind-lifecycle-5", resume: "3c88ad4d", prompt: "status?" });
check("a resume of a live session returns the live agent, with the prompt delivered", again === live && live.sent.at(-1) === "status?");
check("the queue file is empty once everything started", JSON.parse(fs.readFileSync(two.g.queue_file, "utf8")).length === 0);

/* one-pass roles stop themselves once their turn ends (a bare Agent, no SDK) */
const bare = role => Object.assign(Object.create(Agents.Agent.prototype), { id: role + "-x", role, turns: 0, state: "working", said: [],
	queue: { close(){} }, query: { close(){} }, aborter: { abort(){} }, emit(){}, settle(){} });
const rv = bare("reviewer"), mn = bare("minion");
rv.result({ usage: {} }); mn.result({ usage: {} });
await new Promise(r => setImmediate(r));
check("a reviewer stops itself when its one turn ends; a minion stays idle", rv.state === "stopped" && mn.state === "idle", `reviewer ${rv.state}, minion ${mn.state}`);

fs.rmSync(tmp, { recursive: true, force: true });
const failed = results.filter(x => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

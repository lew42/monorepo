// A build process end to end on a fake agent host: one item call creates it, node runs every phase, completion rolls up. `node Servex/ProcessRunner.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item, hooks, ledgers } from "./agents/page_tools.js";
import TaskHomes from "../Server/TaskHomes.mjs";
import ProcessRunner from "./ProcessRunner.js";
import Task from "../public/framework/core/Task/Task.js";
import "../public/framework/core/Task/Process.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REL = "public/framework/ai/sessions/2026/10/22/.process-test-" + process.pid;
const DIR = path.join(ROOT, REL), SESSION = path.join(DIR, "session.jsonl");
const URL = "/" + REL.slice("public/".length) + "/";
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };

// The fake host: spawn and send are recorded; "mm1" is the live creator; ids a1, a2… are spawned.
const sent = [], spawned = [], live = new Map([["mm1", { state: "idle", cost: 0 }]]);
const agents = {
	live,
	spawn(spec){ const id = "a" + (spawned.length + 1); spawned.push({ id, ...spec }); live.set(id, { state: "working", cost: 0 }); return { id, session_id: "s-" + id }; },
	send(id, text){ if (!live.has(id)) throw new Error(`no agent ${id}`); sent.push({ id, text }); },
	stopped: [], stop(id){ this.stopped.push(id); },
};
const runner = new ProcessRunner({ servex: { agents, say(){} }, root: ROOT, pulse_after_ms: 0 });
hooks.changed = file => runner.step(file);
const settle = async file => { await runner.chains.get(path.resolve(file)); await runner.chains.get(path.resolve(file)); };
const item = (delta, caller, url = URL) => run_item({ path: url, delta }, { caller });

fs.mkdirSync(DIR, { recursive: true });
ledgers.task_moves = path.join(DIR, "task-moves.jsonl"); TaskHomes.INDEX = path.join(DIR, "homes.jsonl");   // never the real ledgers
fs.writeFileSync(SESSION, JSON.stringify({ assign: { session_id: "sess", agent: "mm1", title: "Test session" } }) + "\n");
try {
	const Process = (await import("../public/framework/core/Task/Process.js")).default;
	const clash = Object.values(Process.DEFINITIONS).flat().filter(ph => typeof Process.prototype[ph.id] === "function" || Task.FIELDS.includes(ph.id) || ["tasks", "content", "set", "file", "task", "log", "spawn", "queue", "pulse", "measure"].includes(ph.id));
	ok(!clash.length, "no phase id names a Task verb, field or line key: " + clash.map(c => c.id));
	const fs_ = Process.from_steps(["file", { title: "Improve", id: "improve" }, "Write the docs"]), fl = Process.lines({ process: "<unknown>", steps: ["file", "log"] });
	ok(fs_?.map(x => x.id).join() === "file-step,improve-step,write-the-docs", "from_steps: a step id that is a line key or verb gets -step, not a refusal");
	ok(fl?.[0].process === "steps" && fl.length === 3, "lines(): own steps under an unknown process name become process \"steps\"");
	let r = await item({ tasks: { add: { title: "Fix X", process: "nope" } } }, "mm1");
	ok(r.ok === false && /no process "nope"/.test(r.why), "an unknown process is refused, nothing written");

	r = await item({ tasks: { add: { title: "Fix X", process: "build", brief: "b.md" } } }, "mm1");
	const FILE = path.join(DIR, "fix-x", "task.jsonl"), PURL = URL + "fix-x/";
	ok(r.ok && fs.existsSync(FILE), "one call makes the process folder");
	ok(read(SESSION).some(l => l.task === PURL), "the session's record references it");
	await settle(FILE);
	let L = read(FILE);
	ok(L[0].class === "Process" && L[0].process === "build" && L.filter(l => l.tasks?.add).length === 7, "line 1 is a Process, seven phase lines");
	ok(L.some(l => l.start) && L.some(l => l.investigate?.start) && L.some(l => l.spawn?.phase === "investigate" && l.spawn.agent === "a1"), "node started it and spawned the investigate session");
	ok(spawned[0].model === "claude-sonnet-5-5" && spawned[0].task.dir.endsWith("fix-x/investigate") && spawned[0].prompt.includes(`"investigate": {"complete"`), "the spawn carries the phase's model, a folder inside the process, and the completing line");

	const step = async (delta, caller) => { await item(delta, caller, PURL); await settle(FILE); };
	await step({ investigate: { complete: { outcome: "found the cause in X.js", evidence: ["test"] } } }, "a1");
	L = read(FILE);
	ok(L.some(l => l.plan?.start) && sent.at(-1).id === "a1" && sent.at(-1).text.includes("found the cause in X.js"), "plan runs in the same session, told what investigate found");

	live.set("a1", { state: "idle", cost: 0.5 });
	await Promise.all([runner.queue_turn(FILE, "a1"), runner.queue_turn(FILE, "a1")]);   // two wakes for one turn end
	L = read(FILE);
	ok(L.filter(l => l.measure?.phase === "investigate" && l.measure.usd === 0.5).length === 1, "investigate's cost is measured by node, once however many wakes");
	ok(!L.some(l => l.pulse), "the turn that ends first is investigate's own (plan was sent mid-turn): no pulse");
	await runner.after_turn(FILE, "a1");
	L = read(FILE);
	ok(L.some(l => l.pulse?.phase === "plan" && l.pulse.n === 1) && sent.at(-1).text.includes("not recorded as complete"), "the next turn that ends with plan open gets one pulse");

	await step({ plan: { complete: { outcome: "plan.md written", evidence: ["test"] } } }, "a1");
	ok(spawned[1]?.role === "reviewer", "improve is a fresh reviewer");
	await step({ "improve-plan": { complete: { outcome: "two steps cut", evidence: ["test"] } } }, "a2");
	ok(sent.at(-1).id === "mm1" && sent.at(-1).text.includes("Approve"), "approve goes to the creator");
	await step({ "approve-plan": { complete: { outcome: "approved", evidence: ["test"] } } }, "mm1");
	ok(spawned[2]?.role === "helper" && spawned[2].prompt.includes("approved"), "execute is a fresh builder");
	await step({ execute: { complete: { outcome: "branch task/fix-x, 2 commits", evidence: ["test"] } } }, "a3");
	await step({ review: { complete: { outcome: "ready to merge: task/fix-x", evidence: ["test"] } } }, "a4");
	let p = runner.read(FILE);
	ok(p.phase.id === "merge" && p.phase.state === "waiting" && p.state === "running", "merge waits on the owner; the process is not complete");
	ok(sent.at(-1).id === "mm1" && sent.at(-1).text.includes("waits on the owner"), "the creator is told");

	await step({ merge: { complete: { outcome: "merged", evidence: ["test"] } } }, "owner");
	p = runner.read(FILE);
	ok(p.state === "complete" && p.completion === 1, "the last phase completes the process");
	const sess = Task.replay(read(SESSION));
	ok(sess.completion === 1 && sess._tasks.find("fix-x")?.constructor.name === "Process", "the session's completion counts it (replayed as a Process)");

	const before = read(FILE).length;
	await new ProcessRunner({ servex: { agents, say(){} }, root: ROOT, files: new Set() }).step(FILE);
	ok(read(FILE).length === before, "a restart re-steps a finished process and writes nothing");

	// A stall: the phase agent ends two turns without completing; the phase then waits on the creator.
	await item({ tasks: { add: { title: "Look into Y", process: "investigate" } } }, "mm1");
	const Q = path.join(DIR, "look-into-y", "task.jsonl");
	await settle(Q);
	const q = spawned.at(-1).id;
	live.set(q, { state: "idle", cost: 0.1 });
	await runner.after_turn(Q, q);
	await runner.after_turn(Q, q);
	p = runner.read(Q);
	ok(p.phase.id === "questions" && p.phase.state === "waiting" && p.phase.get_one("waiting_on") === "mm1", "two silent turn ends: the phase waits on the creator");

	// Draft in the session, then move home: a process naming a module moves to <module>/tasks/<id>/ once its plan is approved.
	const MOD = "ai/process-test-" + process.pid;   // a module name has no dots (MODULE_NAME); removed in finally
	fs.mkdirSync(path.join(ROOT, "public/framework", MOD), { recursive: true });
	await item({ tasks: { add: { title: "Go home", process: "build", module: MOD } } }, "mm1");
	const G = path.join(DIR, "go-home", "task.jsonl");
	await settle(G);
	for (const [ph, by] of [["investigate", spawned.at(-1).id], ["plan", spawned.at(-1).id], ["improve-plan", null], ["approve-plan", "mm1"]]){
		await item({ [ph]: { complete: { outcome: "ok", evidence: ["test"] } } }, by ?? spawned.at(-1).id, URL + "go-home/");
		await settle(G);
	}
	const HOME = path.join(ROOT, "public/framework", MOD, "tasks", "go-home", "task.jsonl");
	await settle(HOME); await settle(HOME);
	ok(!fs.existsSync(G) && fs.existsSync(HOME), "approved: the process folder moved to <module>/tasks/go-home/");
	p = runner.read(HOME);
	ok(p.get_one("path").endsWith(`/${MOD}/tasks/go-home/`) && p.phase.id === "execute" && p.phase.get_one("spawned"), "it records its new path and the run goes on there (execute spawned)");
	const s2 = Task.replay(read(SESSION));
	ok(s2._tasks.find("go-home")?.get_one("path")?.endsWith(`/${MOD}/tasks/go-home/`) && [...s2._tasks].filter(t => t.id === "go-home").length === 1, "the session's later reference replaces the old one: one child, at its new home");
	ok(read(path.join(ROOT, "public/framework", MOD, "tasks", "task.jsonl")).some(l => l.task?.endsWith(`/${MOD}/tasks/go-home/`)), "the module's tasks list references it");

	// Improvements: one list per folder through the item tool; the same proposal again adds weight, never a second line.
	const IMP = URL + "improvements.jsonl", add = why => item({ tasks: { add: { title: "Move X into Y", why } } }, "mm1", IMP);
	await add("X is a tool"); r = await add("seen again");
	const imp = read(path.join(DIR, "improvements.jsonl")), state = (await run_item({ path: IMP }, { caller: "mm1" })).state;
	ok(r.ok && imp.filter(l => l.tasks?.add).length === 1 && imp.some(l => l["move-x-into-y"]?.reinforce?.why === "seen again"), "an improvement proposed again is a reinforce line, not a duplicate");
	ok(Task.replay(imp)._tasks.find("move-x-into-y").weight === 2 && state.tasks.length === 1, "its weight is 2, computed on replay");

	r = await run_item({ path: PURL }, { caller: "mm1" });
	ok(r.state.class === "Process" && r.state.state === "complete" && r.state.tasks.length === 7, "item({path}) reads the process back: class, state, phases");

	// A SIMPLE PROCESS THROUGH THE TOOL (the owner, 2026-10-22): create it with your own steps, node prompts step 1, then step 2 when step 1 returns.
	r = await item({ tasks: { add: { title: "Dup", steps: [{ title: "Same" }, { title: "Same" }] } } }, "mm1");
	ok(r.ok === false && /steps/.test(r.why), "two steps with one id are refused, nothing written");
	r = await item({ tasks: { add: { title: "Two steps", steps: [{ title: "Write the note", do: "write note.md" }, { title: "Check the note", do: "read note.md back" }] } } }, "mm1");
	const SF = path.join(DIR, "two-steps", "task.jsonl"), SURL = URL + "two-steps/";
	await settle(SF);
	let S = read(SF), sent0 = sent.length;
	ok(r.ok && S[0].class === "Process" && S[0].process === "steps" && S.filter(l => l.tasks?.add).length === 2, "one call: a Process with the two steps as its phases");
	ok(S.some(l => l["write-the-note"]?.start) && sent.at(-1).id === "mm1" && sent.at(-1).text.includes("write note.md") && sent.at(-1).text.includes(`"write-the-note": {"complete"`), "node starts step 1 and prompts the creator with it");
	await item({ "write-the-note": { complete: { outcome: "note.md written", evidence: ["test"] } } }, "mm1", SURL); await settle(SF);
	ok(sent.length === sent0 + 1 && sent.at(-1).text.includes("read note.md back") && sent.at(-1).text.includes("note.md written"), "step 1 returns: node prompts step 2, with step 1's outcome");
	await item({ tasks: { add: { title: "Add a step", do: "a step added while it runs" } } }, "mm1", SURL); await settle(SF);
	await item({ "check-the-note": { complete: { outcome: "checked", evidence: ["test"] } } }, "mm1", SURL); await settle(SF);
	ok(sent.at(-1).text.includes("a step added while it runs"), "a step added while the process runs is run after the others");
	await item({ "add-a-step": { complete: { outcome: "done", evidence: ["test"] } } }, "mm1", SURL); await settle(SF);
	ok(Task.replay(read(SF)).state === "complete" && Task.replay(read(SESSION))._tasks.find("two-steps"), "every step done: the process is complete, and its session references it");

	// The evidence rule on a build → review process: a complete with no evidence is refused and written nowhere; with it, each step's outcome and evidence are recorded.
	await item({ tasks: { add: { title: "Build review", steps: [{ title: "Build it", do: "build" }, { title: "Review it", do: "review" }] } } }, "mm1");
	const BF = path.join(DIR, "build-review", "task.jsonl"), BURL = URL + "build-review/"; await settle(BF);
	const blen = read(BF).length;
	r = await item({ "build-it": { complete: { outcome: "built" } } }, "mm1", BURL);
	ok(r.ok === false && /evidence/.test(r.why ?? "") && read(BF).length === blen, "complete without evidence is refused, nothing written");
	await item({ "build-it": { complete: { outcome: "built", evidence: ["commit abc"] } } }, "mm1", BURL); await settle(BF);
	ok(runner.read(BF).phases.find(x => x.id === "build-it").state === "complete" && sent.at(-1).text.includes("review"), "step 1 completes with evidence; step 2 is prompted");
	ok(runner.read(BF).state !== "complete", "the process is not complete after the first step");
	await item({ "review-it": { complete: { outcome: "approved", evidence: ["review.md"] } } }, "mm1", BURL); await settle(BF);
	const bl = read(BF);
	ok(runner.read(BF).state === "complete" && bl.some(l => l["build-it"]?.complete?.evidence?.[0] === "commit abc") && bl.some(l => l["review-it"]?.complete?.evidence?.[0] === "review.md"), "the last step completes the process; both steps' evidence is in the log");

	// Stopping a process stops the agent of the phase it spawned (found live, 2026-10-22: the phase agent kept going), never the creator.
	await item({ tasks: { add: { title: "Stop me", process: "investigate" } } }, "mm1");
	const T = path.join(DIR, "stop-me", "task.jsonl"); await settle(T);
	const ta = spawned.at(-1).id;
	await item({ stop: { why: "not needed" } }, "mm1", URL + "stop-me/"); await settle(T);
	const tp = runner.read(T);
	ok(agents.stopped.includes(ta) && tp.state === "stopped" && tp.phases.find(x => x.id === "questions").state === "stopped" && !agents.stopped.includes("mm1"), "a stopped process stops its running phase and that phase's agent");
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
	fs.rmSync(path.join(ROOT, "public/framework/ai/process-test-" + process.pid), { recursive: true, force: true });
}
console.log(`${n} passing`);
process.exit(0);

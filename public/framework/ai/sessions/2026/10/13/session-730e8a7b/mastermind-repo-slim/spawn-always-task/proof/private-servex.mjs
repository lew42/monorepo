/* Proof for "spawn always opens a task dir": a PRIVATE Servex from this worktree (own SERVEX_HOME, own ports, no
 * assistants, no pool, never the live one). Spawns one minion with a bare prompt and one with `task: false`.
 *   node proof/private-servex.mjs  (from the worktree root)
 * Costs a few cents: one Haiku minion that appends a finish line. Prints JSON proof lines; writes proof/result.json. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../../../../../../../..");
process.chdir(REPO);
const home = fs.mkdtempSync(path.join(os.tmpdir(), "spawn-task-proof-"));
Object.assign(process.env, {
	SERVEX_HOME: home, SERVEX_PORT: "18090", SERVEX_API_PORT: "18090", SERVEX_URL: "http://localhost:18090", SERVEX_PROXY_PORT: "18080", SERVEX_PROXY_INTERNAL: "18079", SERVEX_NO_GATE: "1",
	SERVEX_NO_ASSISTANT: "1", SERVEX_NO_ECHO: "1", SERVEX_NO_LAYERS: "1", SERVEX_NO_POOL: "1", SERVEX_NO_FIXER: "1", SERVEX_NO_MONITOR: "1", SERVEX_NO_SWEEP: "1",
	SERVEX_NO_PROCESSES: "1", SERVEX_NO_GAMES: "1", SERVEX_NO_WORKTREES: "1", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_ASKS: "1", SERVEX_NO_USAGE: "1", SERVEX_NO_REAPER: "1",
	SERVEX_NO_BUDGET: "1"
});
const { default: Servex } = await import(pathToFileURL(path.join(REPO, "Servex/Servex.js")).href);
const servex = new Servex({ root: path.join(home, "projects") });   // a scan root with no projects in it
fs.mkdirSync(path.join(home, "projects"), { recursive: true });
await new Promise(r => setTimeout(r, 3000));

const spawn_tool = async args => { const r = await servex.mcp.call("spawn_agent", args, { caller: null }); if (r.isError) throw new Error(r.content[0].text); return r.content[0].text; };
const out = {};
const rel = d => path.relative(REPO, d).split(path.sep).join("/");
const first_line = file => fs.readFileSync(file, "utf8").split("\n")[0];

/* 1. a bare prompt, no `task` */
const bare = JSON.parse(await spawn_tool({
	role: "minion", name: "proof-bare", model: "claude-haiku-5-5", effort: "low", permission_mode: "bypassPermissions", cwd: REPO,
	prompt: "Proof probe. Do exactly one thing: append this line to your task log with `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>` (write lines.json first, one object): {\"finish\":{\"at\":\"NOW\",\"merged\":\"proof\",\"files\":0,\"checks\":0}}. Then reply \"done\" and stop."
}));
out.bare = { returned: bare };
const id = bare.id ?? bare.agent?.id;
const agent = servex.agents.live.get(id);
const dir = path.resolve(REPO, agent.task.dir);
out.bare.task_dir = rel(dir);
out.bare.dir_exists_at_return = fs.existsSync(dir);
out.bare.files_at_return = fs.readdirSync(dir);
out.bare.line1 = JSON.parse(first_line(path.join(dir, "task.jsonl")));
out.bare.first_turn_tells = /Your task is already open at .*task\.jsonl; don't run new-task/.test(agent.prompt) ? agent.prompt.match(/Your task is already open at [^\n]*/)[0] : "MISSING";

const { default: State } = await import(pathToFileURL(path.join(REPO, "Server/State.mjs")).href);
const listed = async () => {   // Server/State.mjs on THIS store, its registry read from the private Servex
	const st = new State({ root: REPO });
	st.registry = await State.fetch_registry();
	const snap = st.snapshot({ full: true });
	const mine = snap.tasks.find(t => t.dir === rel(dir));
	return { registry_rows: st.registry.length, found: mine ? { bucket: mine.bucket, state: mine.state, dir: mine.dir, title: mine.title, agent: mine.agent } : null };
};
out.bare.state_while_running = await listed();

/* 2. `task: false`: the one opt-out */
const before = new Set(fs.readdirSync(path.dirname(dir)));
const quiet = JSON.parse(await spawn_tool({
	role: "minion", name: "proof-notask", task: false, model: "claude-haiku-5-5", effort: "low", permission_mode: "bypassPermissions", cwd: REPO,
	prompt: "Proof probe. Reply with the single word ok and stop."
}));
const q = servex.agents.live.get(quiet.id ?? quiet.agent?.id);
out.no_task = { returned: quiet, agent_task: q.task ?? null, new_siblings_in_spawned_dir: fs.readdirSync(path.dirname(dir)).filter(n => !before.has(n)),
	any_dir_named: fs.readdirSync(path.dirname(dir)).filter(n => n.includes("proof-notask")) };

/* 3. wait for the bare minion to end, then the heartbeat view */
const t0 = Date.now();
while (Date.now() - t0 < 240000){
	const fin = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").includes('"finish"');
	if (fin && ["idle", "stopped"].includes(agent.state)) break;
	await new Promise(r => setTimeout(r, 3000));
}
const { task_landed } = await import(pathToFileURL(path.join(REPO, "Servex/agents/Agents.js")).href);
out.bare.log_tail = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").trim().split("\n").slice(-2);
out.bare.task_landed = task_landed(dir);
out.bare.state_after_finish = await listed();
const hb = servex.heartbeat;
out.bare.heartbeat_tick = await (async () => { const mark = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").length; const sent = []; const send = servex.agents.send; servex.agents.send = (...a) => sent.push(a[0]); try { await hb.tick?.(); } catch (e){ return "tick threw: " + e.message; } finally { servex.agents.send = send; } return { woke_it: sent.includes(id), lines_added: fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").slice(mark).trim().split(/\r?\n/).filter(Boolean) }; })();
out.bare.cost_usd = agent.spent_usd?.();

fs.writeFileSync(path.join(HERE, "result.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
for (const a of servex.agents.live.values()) try { a.stop?.(); } catch {}
setTimeout(() => process.exit(0), 500);

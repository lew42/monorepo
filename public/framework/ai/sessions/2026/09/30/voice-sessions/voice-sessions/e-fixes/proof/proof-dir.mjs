// directory.js against a stub host. node --import ./register.mjs proof-dir.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
process.env.SERVEX_HOME = path.join(HERE, "servex-home-dir");
fs.rmSync(process.env.SERVEX_HOME, { recursive: true, force: true });
fs.mkdirSync(process.env.SERVEX_HOME, { recursive: true });
const { ask } = await import(pathToFileURL("C:/Code/lew42/worktrees/voice-fixes/Servex/agents/directory.js").href);
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const tick = () => new Promise(r => setTimeout(r, 30));

function fake(spec, n){
	return { id: spec.id ?? `directory-mastermind-${spec.name}-${n}`, spec, state: "idle", session_id: "sid-" + n, parent: spec.parent ?? null, sent: [],
		emit(e){ return e; }, idle(){ return Promise.resolve(); }, send(t, o){ this.sent.push({ t, o }); }, stop(){ this.state = "stopped"; } };
}
const host = { live: new Map(), n: 0, spawns: [], woken: [],
	spawn(spec){ const a = fake(spec, ++this.n); this.live.set(a.id, a); this.spawns.push(spec); return a; },
	wake(id){ this.woken.push(id); const a = fake({ id, name: "x" }, ++this.n); a.id = id; this.live.set(id, a); return a; } };

const r1 = ask(host, { dir: "Servex/agents", question: "who calls ask_directory?", session: "v-test", parent: "session-smart-v-test" });
const spec = host.spawns[0];
check("1 spawned urgent, so the gate never returns a stand-in", spec.urgent === true);
check("1 the spawn names the caller as parent", spec.parent === "session-smart-v-test");
check("1 ...but the READY turn wakes nobody (live parent cleared until the question)", host.live.get(r1.agent).parent === null || host.live.get(r1.agent).sent.length);
await tick();
const a1 = host.live.get(r1.agent);
check("1 the question is sent with the parent restored", a1.parent === "session-smart-v-test" && a1.sent.length === 1);
check("12 plan mode + no write tools", spec.permission_mode === "plan" && spec.sdk.disallowedTools.includes("Write"));

let err = null;
try { ask({ ...host, spawn: s => ({ id: "q", state: "queued" }) }, { dir: "Servex/agents", question: "q", session: "v-other" }); } catch (e){ err = e.message; }
check("1 a stand-in (no idle/emit) is a clear error, not a crash", /did not start/.test(err ?? ""), err);

a1.stop();
const r2 = ask(host, { dir: "Servex/agents", question: "follow-up", session: "v-test", parent: "session-smart-v-test" });
check("3 after a stop, a follow-up reopens the SAME agent by its saved session", r2.reused && host.woken.includes(r1.agent) && host.spawns.length === 1);

ask(host, { dir: "public/framework/ext", question: "q2", session: "v-test" });
await tick();
const r4 = ask(host, { dir: "public/framework/core", question: "q3", session: "v-test" });
const live = [...host.live.values()].filter(a => a.state !== "stopped" && a.id.startsWith("directory") ).length;
check("12 at most 2 live directory masterminds per session", live === 2, `${live} live, oldest idle stopped`);
fs.writeFileSync(path.join(HERE, "proof-dir.json"), JSON.stringify(results, null, 2));
console.log(`${results.filter(r => r.ok).length}/${results.length} pass`);
process.exit(0);

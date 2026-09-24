/* node Servex/agents/layers-proof.mjs [scratch dir]
 *
 * THE ASSISTANT LAYERS, END TO END, against a PRIVATE Servex booted from this
 * checkout in a child process: its own LOCALAPPDATA (a fresh folder in the
 * scratch dir), its own ports (8190 dashboard, 8189 proxy, no gate, no whisper),
 * so nothing it does reaches the live Servex on 8090 or port 80.
 *
 * It speaks on two cards, waits for two separate assistants, the master
 * assistant, one manager per card and a claim collision, then breaks four
 * things on purpose (a lost session, a claim race, the admission check, the
 * reaper). One screen of pass/fail comes out, the same as JSON in
 * public/framework/ai/2026-09-24/assistant-layers/proof.json. It then stops
 * every agent it started, kills the child, and deletes the cards it made.
 *
 * ⚠ It spends real money: two Sonnet assistants, the Sonnet master assistant,
 * an Opus mastermind-servex and two Opus managers on a one-line job each. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const SCRATCH = path.resolve(process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "layers-proof-")));
const STAMP = Date.now().toString(36);
const LOCALS = [];   // one fresh LOCALAPPDATA per boot: the main run, then the two gate boots
const PORT = 8190, BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(REPO, "public/framework/ai/2026-09-24/assistant-layers/proof.json");
const AI = path.join(REPO, "public/framework/ai");

const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), secs = () => Math.round((Date.now() - t0) / 1000);
const say = text => console.log(`[${String(secs()).padStart(4)}s] ${text}`);
const results = [];
const record = (name, pass, evidence) => { results.push({ name, pass, evidence }); say(`${pass === true ? "PASS" : pass === false ? "FAIL" : String(pass).toUpperCase()}  ${name}`); };

// ── http ─────────────────────────────────────────────────────────────────
async function http(method, url, body){
	const res = await fetch(BASE + url, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
	const text = await res.text();
	try { return JSON.parse(text); } catch { return text; }
}
const get = url => http("GET", url);
const post = (url, body) => http("POST", url, body);
let rpc = 0;
async function tool(name, args = {}, as = null){
	const out = await post(`/mcp${as ? `?as=${encodeURIComponent(as)}` : ""}`, { jsonrpc: "2.0", id: ++rpc, method: "tools/call", params: { name, arguments: args } });
	const text = out?.result?.content?.[0]?.text ?? JSON.stringify(out);
	try { return JSON.parse(text); } catch { return text; }
}
/* Poll `fn` every `every` ms until it returns something truthy, or `ms` runs out (null). */
async function until(fn, ms, every = 3000){
	const end = Date.now() + ms;
	while (Date.now() < end){
		try { const v = await fn(); if (v) return v; } catch {}
		await sleep(every);
	}
	return null;
}
const card_log = async id => (await get(`/card?id=${encodeURIComponent(id)}`)) ?? {};
const agent_log = async (id, n = 400) => { const r = await get(`/log/agent-${id}?n=${n}`); return Array.isArray(r) ? r : []; };
const servex_log = async (name = "servex", n = 500) => { const r = await get(`/log/${name}?n=${n}`); return Array.isArray(r) ? r : []; };
const clip = (s, n = 160) => String(s ?? "").replace(/\s+/g, " ").slice(0, n);

// ── boot ─────────────────────────────────────────────────────────────────
function free(port){
	try { return !execFileSync("netstat", ["-ano"], { encoding: "utf8" }).split("\n").some(l => l.includes(`:${port} `) && /LISTEN/.test(l)); }
	catch { return true; }
}

let child = null;
async function boot(tag = "main", extra = {}){
	for (const p of [8190, 8189, 8188]) if (!free(p)) throw new Error(`port ${p} is already taken; is an earlier proof still running?`);
	const local = path.join(SCRATCH, `localappdata-${STAMP}-${tag}`);
	fs.mkdirSync(local, { recursive: true });
	LOCALS.push(local);
	const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8190", SERVEX_PROXY_PORT: "8189", SERVEX_PROXY_INTERNAL: "8188",
		SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8187", SERVEX_CARD_IDLE_MS: "90000", SERVEX_MASTER_BATCH_MS: "5000",
		SERVEX_REAP_MS: "20000", SERVEX_REAP_EVERY_MS: "5000" };
	for (const k of ["SERVEX_HOME", "SERVEX_NO_ASSISTANT", "SERVEX_NO_LAYERS", "SERVEX_NO_MONITOR", "SERVEX_POLICY", "SERVEX_AGENT_CAP", "SERVEX_MIN_FREE_MB", "PORT"]) delete env[k];
	Object.assign(env, extra);
	const log = fs.openSync(path.join(SCRATCH, `servex-child-${tag}.log`), "a");
	child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", log, log], windowsHide: true });
	say(`private Servex (${tag}) pid ${child.pid}, LOCALAPPDATA ${local}`);
	const up = await until(async () => Array.isArray(await get("/api/agents")), 30000, 500);
	if (!up) throw new Error(`the private Servex (${tag}) did not answer on :8190 within 30 s; see servex-child-${tag}.log`);
}

/* Stop every agent the private Servex started, then kill it and wait for its ports. */
async function shutdown(){
	if (!child) return;
	try {
		const live = await get("/api/agents");
		for (const a of Array.isArray(live) ? live : []) if (a.state !== "stopped" && a.id !== "dispatcher") await tool("stop_agent", { id: a.id }).catch(() => {});
	} catch {}
	await sleep(1500);
	try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
	say(`private Servex pid ${child.pid} stopped`);
	child = null;
	await until(async () => free(8190) && free(8189) && free(8188), 15000, 500);
}

// ── cleanup ──────────────────────────────────────────────────────────────
const before_year = fs.existsSync(path.join(AI, "2026"));
const made_cards = [];
/* The day's index page (tracked since the card-folders merge) gains a line per
 * card; it is put back byte for byte at cleanup. `dirty()` lists what the agents
 * edited in the tree, as evidence — the proof never reverts their work itself. */
const today = new Date(), pad = n => String(n).padStart(2, "0");   // LOCAL date, as the card ids use
const DAY = path.join(AI, String(today.getFullYear()), pad(today.getMonth() + 1), pad(today.getDate()), "page.jsonl");
const day_before = fs.existsSync(DAY) ? fs.readFileSync(DAY) : null;
const dirty = () => { try { return execFileSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).split("\n").filter(Boolean); } catch { return []; } };
const dirty_before = new Set(dirty());
let touched = [];
/* Check 8 needs ai2-dashboard's groups file, which this branch does not have
 * yet: copied in from michael/dev for the run, removed again at cleanup. */
const GROUPS = path.join(REPO, "public/framework/ai2/groups.json");
const groups_before = fs.existsSync(GROUPS);
function groups_in(){
	if (groups_before) return JSON.parse(fs.readFileSync(GROUPS, "utf8"));
	const text = execFileSync("git", ["show", "michael/dev:public/framework/ai2/groups.json"], { cwd: REPO, encoding: "utf8" });
	fs.writeFileSync(GROUPS, text);
	return JSON.parse(text);
}
async function cleanup(){
	await shutdown();
	if (!groups_before) fs.rmSync(GROUPS, { force: true });
	if (!before_year) fs.rmSync(path.join(AI, "2026"), { recursive: true, force: true });
	else for (const id of made_cards) fs.rmSync(path.join(AI, ...id.split("/")), { recursive: true, force: true });
	if (day_before) fs.writeFileSync(DAY, day_before);
	touched = dirty().filter(l => !dirty_before.has(l) && !l.includes("assistant-layers/proof.json"));
	if (touched.length) say(`the agents changed these files in the tree (left for a person to review): ${touched.join(", ")}`);
	say(`cleaned up: ${before_year ? made_cards.length + " card folders" : "public/framework/ai/2026/"} removed`);
}

// ── the run ──────────────────────────────────────────────────────────────
async function run(){
	const groups = groups_in();
	await boot();

	// (d) the reaper, started first because it only needs time: a finished helper, idle past 20 s, is stopped.
	const reap = await tool("spawn_agent", { role: "helper", name: "reap-proof", model: "claude-haiku-4-5-20251001", effort: "low",
		permission_mode: "plan", prompt: "Reply with the single word: done. Use no tools." });
	say(`reaper subject: ${reap.id}`);

	// 1-2. two cards, two contradicting prompts
	const A = (await post("/card/create", { title: "Proof header blue", by: "owner" })).id;
	const B = (await post("/card/create", { title: "Proof header red", by: "owner" })).id;
	made_cards.push(A, B);
	say(`cards ${A} and ${B}`);
	await post(`/card/append?id=${encodeURIComponent(A)}`, { prompt: { text: "Make the site header blue." } });
	await post(`/card/append?id=${encodeURIComponent(B)}`, { prompt: { text: "Make the site header red." } });

	// 3. each card has its own assistant, and a reply by it
	const pair = await until(async () => {
		const out = {};
		for (const [k, id] of [["A", A], ["B", B]]){
			const rows = await get(`/api/card-agents?card=${encodeURIComponent(id)}`);
			const a = rows.find(r => r.role === "assistant");
			const reply = (await card_log(id)).messages?.find(m => m.by === a?.id);
			if (!a?.session_id || !reply) return null;
			out[k] = { id: a.id, session_id: a.session_id, reply: clip(reply.text) };
		}
		return out;
	}, 120000);
	record("3. two cards -> two separate assistants, each answering on its own card",
		!!pair && pair.A.id !== pair.B.id && pair.A.session_id !== pair.B.session_id, pair ?? "timed out after 120 s");

	// 4. the master assistant notices both cards
	const master = await until(async () => {
		for (const id of [A, B]){
			const m = (await card_log(id)).messages?.find(m => m.by === "master-assistant");
			if (m) return { on: id, text: clip(m.text, 300) };
		}
		const told = (await agent_log("mastermind-servex")).find(e => e.type === "agent_msg" && e.from === "master-assistant");
		return told ? { to: "mastermind-servex", text: clip(told.text, 300) } : null;
	}, 90000);
	const both = master && /blue/i.test(master.text) && /red/i.test(master.text);
	record("4. the master assistant says something across both cards", master ? (both ? true : "partial") : false,
		master ? { ...master, names_both: both } : "no line by master-assistant within 90 s");

	// 5. a work request on A -> exactly one manager
	const WORK = "Please look into how many lines Servex/agents/policy.js has, and tell me on this card. Nothing else.";
	await post(`/card/append?id=${encodeURIComponent(A)}`, { prompt: { text: WORK } });
	const mgrA = pair?.A.id.replace(/^assistant-/, "manager-") ?? `manager-${A.split("/").pop()}`;
	const mgrB = pair?.B.id.replace(/^assistant-/, "manager-") ?? `manager-${B.split("/").pop()}`;
	const rowsOf = async prefix => (await get("/agents")).filter(r => r.id === prefix || r.id.startsWith(prefix + "-"));
	const hadA = await until(async () => (await rowsOf(mgrA)).length ? await rowsOf(mgrA) : null, 180000);
	await sleep(10000);
	const finalA = await rowsOf(mgrA);
	record("5. a work request on card A starts exactly one manager", !!hadA && finalA.length === 1,
		{ manager: mgrA, rows: finalA.map(r => ({ id: r.id, session_id: r.session_id, state: r.state })) });

	// 6. the same request on B -> its manager's claim collides with A's
	await post(`/card/append?id=${encodeURIComponent(B)}`, { prompt: { text: WORK } });
	const hadB = await until(async () => (await rowsOf(mgrB)).length ? await rowsOf(mgrB) : null, 180000);
	const collision = await until(async () => {
		/* A REAL collision is a refused claim_topic (Global logs it to `policy`). A
		 * manager that notices the clash on its own and tells mastermind-servex is a
		 * finding, not a pass: the claims did not catch it. */
		const refused = (await servex_log("policy")).find(e => String(e.to ?? "").startsWith("claim ") && [mgrA, mgrB].includes(e.from));
		if (refused) return { refused_claim: refused };
		const told = (await agent_log("mastermind-servex")).filter(e => e.type === "agent_msg" && /^(manager|assistant|master)/.test(e.from ?? ""));
		const hit = told.find(e => /claim|already|collid|same|both|duplicate|conflict/i.test(e.text ?? ""));
		return hit ? { noticed_not_refused: true, to: "mastermind-servex", from: hit.from, text: clip(hit.text, 300) } : null;
	}, 240000, 5000);
	const claims = await tool("list_claims");
	const toolsA = (await agent_log(mgrA)).filter(e => e.type === "tool" && /claim_topic/.test(e.name)).map(e => e.input);
	const toolsB = (await agent_log(mgrB)).filter(e => e.type === "tool" && /claim_topic/.test(e.name)).map(e => e.input);
	record("6. the second card's manager collides with the first, and mastermind-servex hears of it",
		collision?.refused_claim ? true : collision ? "finding" : false,
		{ manager_B: hadB?.map(r => r.id) ?? null, collision: collision ?? "no message about it reached mastermind-servex within 240 s",
			claims: Array.isArray(claims) ? claims.map(c => ({ key: c.key, agent: c.agent, card: c.card, stale: !!c.stale })) : claims,
			claim_calls: { [mgrA]: toolsA, [mgrB]: toolsB } });

	// identity (i): the policy reads the STAMPED caller. assistant-A may not message card B's manager.
	const idA = pair?.A.id ?? `assistant-${A.split("/").pop()}`;
	const cross = await tool("send_to_agent", { id: mgrB, text: "layers proof: this message must be refused.", from: "owner" }, idA);
	const refused_line = (await servex_log("policy")).find(e => e.from === idA && e.to === mgrB);
	record("identity (i): assistant-A -> send_to_agent manager-B is refused with the policy's reason, even typing from: owner",
		cross?.ok === false && /may not message/.test(cross.why ?? "") && !!refused_line,
		{ caller: idA, to: mgrB, answer: cross, policy_log: refused_line ?? null });

	// identity (ii): `from` comes from the connection (?as=), not from what the agent types.
	const marker = `layers proof identity ${Date.now()}`;
	const typed = await tool("card_reply", { card: A, text: marker, from: "owner" }, idA);
	const signed = (await card_log(A)).messages?.find(m => m.text === marker);
	record("identity (ii): a card_reply typed as from: owner lands signed by the connection's own id",
		signed?.by === idA, { caller: idA, typed_from: "owner", answer: typed, landed_by: signed?.by ?? null });

	// 7a. a lost session: stop B's assistant, delete its session file, speak again
	const rowB = (await get(`/api/card-agents?card=${encodeURIComponent(B)}`)).find(r => r.role === "assistant");
	await tool("stop_agent", { id: rowB.id }).catch(() => {});
	await sleep(2000);
	const projects = path.join(os.homedir(), ".claude", "projects");
	const found = fs.readdirSync(projects).map(d => path.join(projects, d, `${rowB.session_id}.jsonl`)).filter(f => fs.existsSync(f));
	for (const f of found) fs.rmSync(f);
	const asked = new Date().toISOString();
	await post(`/card/append?id=${encodeURIComponent(B)}`, { prompt: { text: "Are you still there? One short sentence, please." } });
	const revived = await until(async () => {
		const log = await card_log(B);
		const m = log.messages?.filter(m => m.by === rowB.id).at(-1);
		const since = log.prompts?.at(-1)?.at;
		if (!m || !since || String(m.at) < String(since)) return null;
		const now = (await get(`/api/card-agents?card=${encodeURIComponent(B)}`)).find(r => r.role === "assistant");
		const lost = (await servex_log()).find(e => e.event === "session-missing" && e.id === rowB.id);
		return { id: now.id, old_session: rowB.session_id, new_session: now.session_id, reply: clip(m.text), logged: lost ? clip(lost.text ?? lost.msg, 200) : null };
	}, 120000);
	record("7a. a deleted session: the same id starts fresh, answers, and the failure is logged",
		!!revived && revived.id === rowB.id && !!revived.logged && revived.new_session !== rowB.session_id,
		{ deleted: found, asked_at: asked, ...(revived ?? { error: "no fresh reply within 120 s" }) });

	// 7b. two claims on one topic at the same moment: exactly one wins
	const live = (await get("/api/agents")).filter(a => a.state !== "stopped" && a.id !== "dispatcher");
	const managers = live.filter(a => a.id.startsWith("manager-")).map(a => a.id);
	const [c1, c2] = managers.length >= 2 ? managers : [live[0]?.id, live[1]?.id];
	const topic = `layers proof race ${Date.now()}`;
	const race = await Promise.all([tool("claim_topic", { topic, card: A }, c1), tool("claim_topic", { topic, card: B }, c2)]);
	const winners = race.filter(r => r?.ok).length;
	record("7b. two claims on one topic at once: exactly one wins", winners === 1,
		{ callers: [c1, c2], managers: managers.length >= 2, results: race });
	await tool("release_topic", { topic }, race[0]?.ok ? c1 : c2);

	// 7c runs after this, on two boots of its own: see gate()

	// 7d. the reaper
	const reaped = await until(async () => {
		const line = (await servex_log()).find(e => e.type === "reaped" && e.id === reap.id);
		const row = (await get("/agents")).find(r => r.id === reap.id);
		return line && row?.state === "stopped" ? { id: reap.id, state: row.state, line } : null;
	}, 90000);
	record("7d. a finished helper, idle past 20 s, is stopped by the reaper", !!reaped, reaped ?? { id: reap.id, error: "not reaped within 90 s" });

	// 8. the lobby: words spoken with NO card are filed onto their group's card, and that group's assistant answers there
	const group = groups.find(g => g.id === "system-design");
	const made = await post("/card/create", { title: group?.name ?? "System design", type: "group", by: "owner" });
	if (made?.id) made_cards.push(made.id);
	const G = group?.card ?? made?.id;
	const LOBBY = "The per-card assistants should share one brief about system design";
	await post("/log/prompts", { type: "prompt", text: LOBBY });
	const filed = await until(async () => {
		const log = await card_log(G);
		const p = log.prompts?.find(p => p.text === LOBBY);
		const m = log.messages?.find(m => m.by === "assistant-system-design");
		return p && m ? { card: G, prompt: { text: p.text, via: p.via ?? null }, reply: { by: m.by, text: clip(m.text, 200) } } : null;
	}, 120000);
	const lobby = (await agent_log("assistant-fast")).filter(e => e.type === "tool" && /file_to_group/.test(e.name ?? "")).map(e => e.input);
	record("8. words with no card are filed onto the system-design group card, and assistant-system-design answers there",
		!!filed && made?.id === group?.card,
		{ group_card_made: made?.id ?? made, groups_json_card: group?.card ?? null, lobby_calls: lobby,
			...(filed ?? { error: "no prompt plus reply by assistant-system-design on the group card within 120 s" }) });

	// identity: every agent that spoke on the cards spoke under its own id
	const speakers = new Set();
	for (const id of [A, B]) for (const m of (await card_log(id)).messages ?? []) speakers.add(m.by);
	record("identity: every line on the two cards is signed by its own agent id, never a generic 'agent'",
		![...speakers].some(s => !s || s === "agent"), { speakers: [...speakers] });

	const agents = await get("/agents");
	return { cards: { A, B }, agents: agents.map(a => ({ id: a.id, role: a.role, model: a.model, state: a.state, session_id: a.session_id, cost: a.cost ?? null })) };
}

/* 7c. THE REAL SPAWN GATE (Servex.admission() + Global's check), on two short boots
 * with no standing agents (SERVEX_NO_ASSISTANT): three Haiku minions fill a ceiling
 * of 3, a fourth with no parent is queued with its reason, a child of a live one is
 * admitted anyway, and freeing slots starts the queued one on the next monitor tick.
 * Then a boot whose memory floor is far above what is free refuses a spawn. */
async function gate(){
	const HAIKU = { role: "minion", model: "claude-haiku-4-5-20251001", effort: "low", permission_mode: "plan",
		prompt: "Reply with the single word: done. Use no tools." };
	await boot("cap", { SERVEX_AGENT_CAP: "3", SERVEX_NO_ASSISTANT: "1" });
	/* Spawn until the gate holds one. The boot is not empty (run 4: something of
	 * its own already counted, so the THIRD filler was the one queued), so the
	 * number of fillers is read, not assumed. */
	const before = (await get("/api/agents")).filter(a => a.state !== "stopped").map(a => a.id);
	const fill = [];
	let held = null;
	for (let i = 1; i <= 4 && !held; i++){
		const r = await tool("spawn_agent", { ...HAIKU, name: `cap-${i}` });
		if (r?.state === "queued") held = r; else fill.push(r);
	}
	const kid = await tool("spawn_agent", { ...HAIKU, name: "cap-child", parent: fill[0]?.id });
	const health = await tool("system_health");
	const queue = health?.queue ?? clip(JSON.stringify(health), 300);
	for (const a of [...fill.slice(1), kid]) if (a?.id) await tool("stop_agent", { id: a.id }).catch(() => {});
	const started = await until(async () => {
		const line = (await servex_log("system")).find(e => e.type === "gate" && e.state === "started");
		if (!line) return null;
		const row = (await get("/api/agents")).find(a => a.id === line.id);
		return { line, agent: row ? { id: row.id, state: row.state } : null };
	}, 60000);
	await shutdown();

	const free_mb = Math.round(os.freemem() / 1048576);
	await boot("memory", { SERVEX_NO_ASSISTANT: "1", SERVEX_MIN_FREE_MB: String(free_mb + 100000) });
	const mem = await tool("spawn_agent", { ...HAIKU, name: "mem-refused" });
	await shutdown();

	const at_cap = held?.state === "queued" && /ceiling is 3/.test(held?.reason ?? "");
	const child_in = !!kid?.id && kid?.state !== "queued";
	const memory = mem?.state === "queued" && /memory/.test(mem?.reason ?? "");
	record("7c. the real spawn gate: queued at the ceiling with its reason, started when a slot frees, a live parent's child admitted, low memory refused",
		fill.length >= 1 && fill.every(a => a?.id) && at_cap && child_in && !!started && memory,
		{ live_at_boot: before, filled: fill.map(a => a?.id ?? a), queued_at_cap: held, queue_seen: queue, child_of_live_parent: kid,
			started_when_freed: started ?? "the queued spawn did not start within 60 s of freeing two slots",
			low_memory: { free_mb, floor_mb: free_mb + 100000, answer: mem } });
}

/* Cost, from the agents' own logs: `cost` is cumulative per running instance and
 * restarts at 0 when an agent is respawned, so add each run's last value. */
function total_cost(){
	let cost = 0;
	for (const local of LOCALS){
		const logs = path.join(local, "lew42", "servex", "logs");
		let files = [];
		try { files = fs.readdirSync(logs).filter(f => f.startsWith("agent-")); } catch {}
		for (const f of files){
			let prev = 0;
			for (const line of fs.readFileSync(path.join(logs, f), "utf8").split("\n")){
				let c; try { c = JSON.parse(line).cost; } catch { continue; }
				if (typeof c !== "number") continue;
				if (c < prev) cost += prev;
				prev = c;
			}
			cost += prev;
		}
	}
	return Math.round(cost * 10000) / 10000;
}

let extra = {}, error = null;
try { extra = await run(); }
catch (e){ error = String(e.stack || e); say(`ERROR ${e.message}`); }
finally { await cleanup(); }
try { await gate(); }
catch (e){ error = (error ? error + "\n" : "") + String(e.stack || e); say(`ERROR in the gate boots: ${e.message}`); }
finally { await shutdown(); }
extra.cost_usd = total_cost();

const summary = { at: new Date().toISOString(), seconds: secs(), scratch: SCRATCH, localappdata: LOCALS,
	passed: results.filter(r => r.pass === true).length, of: results.length, error, results, files_changed_by_agents: touched, ...extra };
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + "\n");
console.log("\n── layers proof ──────────────────────────────────────────────");
for (const r of results) console.log(`${r.pass === true ? "PASS" : r.pass === false ? "FAIL" : String(r.pass).toUpperCase()}  ${r.name}\n      ${clip(JSON.stringify(r.evidence), 400)}`);
console.log(`\n${summary.passed}/${summary.of} passed · cost $${extra.cost_usd ?? "?"} · ${secs()} s · ${OUT}`);
process.exit(0);

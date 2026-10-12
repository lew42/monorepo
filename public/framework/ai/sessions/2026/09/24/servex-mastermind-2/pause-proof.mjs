/* node Servex/agents/layers.test.mjs — Layers.js against a fake servex: fake
 * cards, fake agents that record spawn/send/stop, a fake mcp and router, and a
 * state file in a scratch dir. No Claude session is started. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Layers from "file:///C:/Code/lew42/monorepo/Servex/agents/Layers.js";

process.env.SERVEX_PROMPT_QUIET_MS = "300";

let checks = 0;
const check = (name, fn) => { fn(); checks++; };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "layers-"));
const file = path.join(dir, "layers.json");

// ── fakes ────────────────────────────────────────────────────────────────
const logs = new Map();                       // card id -> lines
const listeners = [];
const cards = {
	canonical: id => (logs.has(id) ? id : null),
	transcript: id => (logs.get(id) ?? []).map(l => JSON.stringify(l)).join("\n"),
	append(id, line){ logs.get(id).push(line); },
	on(fn){ listeners.push(fn); return () => {}; },
	make(id){ logs.set(id, [{ class: "/framework/ai2/card.js", id, title: id }]); }
};
const prompt = (card, text) => {
	const p = { id: "p-" + Math.random().toString(36).slice(2), text, raw: text, on: card };
	logs.get(card).push({ prompt: p });
	for (const fn of listeners) fn(card, { prompt: p }, { fresh: true });
};

const calls = [];
let sid = 0;
const agents = {
	live: new Map(),
	spawn(spec){
		calls.push({ verb: "spawn", spec });
		const agent = { id: spec.id, model: spec.model, state: "working", session_id: spec.resume ?? `sess-${++sid}`, context: 50000 };
		agents.live.set(spec.id, agent);
		return agent;
	},
	send(id, text, note){ calls.push({ verb: "send", id, text, note }); },
	stop(id){ calls.push({ verb: "stop", id }); agents.live.get(id).state = "stopped"; }
};
const tools = new Map();
const mcp = { tool(def){ tools.set(def.name, def); } };
const routes = new Map();
const router = { get(p, ...h){ routes.set("GET " + p, h.at(-1)); }, post(p, ...h){ routes.set("POST " + p, h.at(-1)); }, options(){} };

const logged = [];
const log = { append: (name, e) => (logged.push({ name, ...e }), Promise.resolve()) };
const servex = { cards, agents, mcp, log, dashboard: { router } };
const gone = new Set();                       // session ids whose file was deleted
const layers = new Layers({ servex, file, idle_ms: 1000, system(){ return "SYSTEM"; }, watch(){},
	session_exists: slot => !gone.has(slot.session_id) }).install();
const spawns = () => calls.filter(c => c.verb === "spawn");
const call = (name, args, caller) => tools.get(name).handler(args, { caller }).then(JSON.parse);

const A = "2026/09/24/fix-the-sidebar", B = "2026/09/24/new-logo", A_SUB = A + "/wider";
cards.make(A);
prompt(A, "make the columns"); prompt(A, "a bit wider"); prompt(A, "on mobile too");
const early = calls.filter(c => c.verb !== "stop").length;
await new Promise(r => setTimeout(r, 500));
const sp = spawns();
console.log("before pause:", early, "calls; after:", sp.length, "spawn(s),", calls.filter(c=>c.verb==="send").length, "send(s)");
console.log("fresh assistant read the whole thought:", /make the columns[\s\S]*a bit wider[\s\S]*on mobile too/.test(sp[0]?.spec?.prompt ?? ""));
prompt(A, "and the header"); prompt(A, "blue");
await new Promise(r => setTimeout(r, 500));
console.log("live assistant got one joined send:", JSON.stringify(calls.filter(c=>c.verb==="send").map(c=>c.text)));
process.exit(0);

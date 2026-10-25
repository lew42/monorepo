// ModelsNow.mjs — which agent runs on which model, computed (never recalled). Read-only except --backend / --write.
//   node Server/ModelsNow.mjs                     print the table
//   node Server/ModelsNow.mjs --write             also write public/framework/ai/models/now.json (the models page reads it)
//   node Server/ModelsNow.mjs --backend openrouter|anthropic   write / delete the switch file, print what changes at the next Servex restart
// Doc: Servex/ext/openrouter/readme.md ("The wall switch"). It moves the voice seats and Refine only (Claude is the default everywhere else).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "lew42", "servex");
const SWITCH = path.join(HOME, "session-backend.txt");
const AI = path.join(ROOT, "public", "framework", "ai");
const read_json = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
const provider_of = m => !m || m === "?" ? "unknown" : m.startsWith("local/") ? "local" : m.includes("/") ? "openrouter" : "anthropic";

export default class ModelsNow {
	static switch_value(){ try { return fs.readFileSync(SWITCH, "utf8").trim().toLowerCase() || null; } catch { return null; } }

	static async agents(){
		try { const r = await fetch("http://localhost:8090/agents", { signal: AbortSignal.timeout(4000) }); if (r.ok) return { from: "GET :8090/agents", rows: await r.json() }; } catch {}
		const reg = read_json(path.join(HOME, "registry.json"));
		return { from: "registry.json", rows: Array.isArray(reg) ? reg : Object.values(reg?.agents ?? reg ?? {}) };
	}

	/** One row per role in roles.js: its model and where it came from. */
	static async roles(){
		const { ROLES } = await import("../Servex/agents/roles.js");
		return Object.entries(ROLES).map(([role, r]) => ({
			role, tier: r.tier, model: r.model, provider: provider_of(r.model),
			origin: `tier ${r.tier} (Servex/agents/tiers.js)`
		}));
	}

	/** Echo and the voice pair do not use their role row alone. */
	static async special(){
		const { model } = await import("../Servex/agents/tiers.js");
		const { session_backend } = await import("../Servex/agents/Sessions.js");
		const be = session_backend();
		return [
			{ role: "echo-*", tier: "scan", model: model("scan"), provider: provider_of(model("scan")), origin: "Echo.model_for(): the scan tier" },
			{ role: "session-fast (voice)", tier: "fast", model: be === "openrouter" ? "openai/gpt-6-luna" : model("fast"), provider: be === "openrouter" ? "openrouter" : "anthropic", origin: `Sessions.session_model(): backend "${be}"` },
			{ role: "session-smart (voice)", tier: "manager", model: be === "openrouter" ? "openai/gpt-6-luna" : model("manager"), provider: be === "openrouter" ? "openrouter" : "anthropic", origin: `Sessions.session_model(): backend "${be}"` }
		];
	}

	/** Cost over the last 24 h. OpenRouter is metered per call (logs/openrouter.jsonl); Claude is a subscription, so its measure is the usage %. */
	static cost24(){
		const since = Date.now() - 864e5, by_agent = {}; let total = 0;
		try {
			for (const l of fs.readFileSync(path.join(HOME, "logs", "openrouter.jsonl"), "utf8").split("\n")) {
				if (!l) continue; let o; try { o = JSON.parse(l); } catch { continue; }
				if (Date.parse(o.at) < since) continue;
				total += o.cost_usd || 0; by_agent[o.agent] = (by_agent[o.agent] || 0) + (o.cost_usd || 0);
			}
		} catch {}
		const u = read_json(path.join(AI, "usage.json"))?.utilization;
		return { openrouter_usd: +total.toFixed(4), openrouter_by_agent: by_agent,
			claude: { five_hour_pct: u?.five_hour?.utilization ?? null, five_hour_resets: u?.five_hour?.resets_at ?? null, seven_day_pct: u?.seven_day?.utilization ?? null, seven_day_resets: u?.seven_day?.resets_at ?? null, note: "subscription: no per-call dollars, usage % of the window" } };
	}

	/** Is Echo's old Gemini route still firing? Compares the last route log line with when this Servex started. */
	static echo_evidence(){
		let last = null;
		try { for (const l of fs.readFileSync(path.join(HOME, "logs", "servex.jsonl"), "utf8").split("\n")) if (l.includes('"type":"route"') && l.includes('"job":"echo"')) { try { last = JSON.parse(l).at; } catch {} } } catch {}
		return { last_gemini_echo_route: last };
	}

	static async build(){
		const { from, rows } = await this.agents();
		const groups = new Map();
		for (const a of rows) {
			const model = a.model ?? "?", k = `${a.role}|${model}`, g = groups.get(k) ?? { role: a.role, model, provider: provider_of(model), count: 0, live: 0, dormant: 0, last_at: "" };
			g.count++; if (a.state === "dormant") g.dormant++; if (["working", "idle", "starting"].includes(a.state)) g.live++;
			if ((a.last_at ?? "") > g.last_at) g.last_at = a.last_at; groups.set(k, g);
		}
		const agents = [...groups.values()].sort((x, y) => y.count - x.count);
		const counted = agents.reduce((n, g) => n + g.count, 0);
		const by_provider = {}; for (const g of agents) by_provider[g.provider] = (by_provider[g.provider] || 0) + g.count;
		const live_by_provider = {}; for (const g of agents) live_by_provider[g.provider] = (live_by_provider[g.provider] || 0) + g.live;
		return { generated_at: new Date().toISOString(), backend: this.switch_value() ?? "anthropic (no switch file)", switch_file: SWITCH,
			roles: [...await this.roles(), ...await this.special()], agents, agents_source: from, registry_rows: rows.length, agents_counted: counted, counts_agree: counted === rows.length,
			by_provider, live_by_provider, cost_24h: this.cost24(), echo: this.echo_evidence() };
	}

	static async set_backend(which){
		if (which === "openrouter") { fs.mkdirSync(HOME, { recursive: true }); fs.writeFileSync(SWITCH, "openrouter\n"); }
		else if (which === "anthropic") { try { fs.unlinkSync(SWITCH); } catch {} }
		else throw new Error("--backend takes openrouter or anthropic");
		console.log(`switch file ${which === "openrouter" ? "written" : "deleted"}: ${SWITCH}\nAt the NEXT Servex restart (node Servex/sustain.mjs --restart; not done by this script):`);
		console.log(which === "openrouter" ? "  voice sessions and Refine/clean calls then bill OpenRouter (cap in Servex/ext/openrouter/readme.md); other agents stay on Claude unless a spawn names a `/` model" : "  everything runs on Claude again");
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const arg = process.argv.slice(2), i = arg.indexOf("--backend");
	if (i >= 0) { await ModelsNow.set_backend(arg[i + 1]); process.exit(0); }
	const d = await ModelsNow.build();
	if (arg.includes("--write")) { const dir = path.join(AI, "models"); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "now.json"), JSON.stringify(d, null, 1)); }
	console.log(`backend: ${d.backend}   (agents from ${d.agents_source}: ${d.agents_counted} counted vs ${d.registry_rows} registry rows -> ${d.counts_agree ? "AGREE" : "DISAGREE"})`);
	console.log("\nROLE (what a new spawn gets)");
	for (const r of d.roles) console.log(`  ${r.role.padEnd(22)} ${r.model.padEnd(24)} ${r.provider.padEnd(11)} ${r.origin}`);
	console.log("\nAGENTS IN THE REGISTRY (role / model: count, live now)");
	for (const g of d.agents.slice(0, 15)) console.log(`  ${String(g.role).padEnd(22)} ${g.model.padEnd(28)} ${String(g.count).padStart(5)}  running ${g.live}  parked ${g.dormant}`);
	console.log("\nby provider (all rows):", JSON.stringify(d.by_provider), "  live now:", JSON.stringify(d.live_by_provider));
	console.log(`last 24 h: OpenRouter $${d.cost_24h.openrouter_usd}; Claude ${d.cost_24h.claude.five_hour_pct}% of the 5 h window, ${d.cost_24h.claude.seven_day_pct}% of the week`);
	console.log(`last Gemini echo route logged: ${d.echo.last_gemini_echo_route}`);
}

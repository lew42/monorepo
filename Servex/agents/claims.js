import fs from "fs";
import path from "path";

const slug = text => String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "topic";
const DEFAULT = () => path.join(process.env.SERVEX_HOME
	|| path.join(process.env.LOCALAPPDATA || "", "lew42", "servex"), "claims.json");

/* THE CLAIMS LIST — who is working on what, so two cards never build the same
 * thing twice. A claim is `{topic, agent, card, at}`, keyed by a slug of the
 * topic. A claim whose holder is gone or stopped is STALE: shown as such, and
 * taken over by the next claimant. One small JSON file, whole-file rewrite —
 * Servex is the only writer. */
export class Claims {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }
	defaults(){ return { agents: null, file: DEFAULT() }; }

	read(){ try { return JSON.parse(fs.readFileSync(this.file, "utf8")); } catch { return {}; } }
	write(rows){
		fs.mkdirSync(path.dirname(this.file), { recursive: true });
		fs.writeFileSync(this.file, JSON.stringify(rows, null, 2));
	}

	/* The owner is always live; an agent is live while `agents.live` holds it
	 * and it has not stopped. */
	alive(agent){
		if (agent === "owner") return true;
		const a = this.agents?.live?.get(agent);
		return !!a && a.state !== "stopped";
	}

	claim({ topic, agent = "owner", card = null } = {}){
		if (!topic) return { ok: false, why: "topic is required" };
		const rows = this.read(), key = slug(topic), held = rows[key];
		if (held && held.agent !== agent && this.alive(held.agent))
			return { ok: false, holder: held.agent, card: held.card,
				why: `${held.topic} is already being worked on by ${held.agent} on card ${held.card}. Ask mastermind-servex before starting.` };
		rows[key] = { topic, agent, card, at: new Date().toISOString() };
		this.write(rows);
		return { ok: true, key, ...(held && held.agent !== agent ? { took_over: held.agent } : {}) };
	}

	release({ topic, agent = "owner" } = {}){
		const rows = this.read(), key = slug(topic), held = rows[key];
		if (!held) return { ok: true, released: false };
		if (held.agent !== agent && this.alive(held.agent)) return { ok: false, why: `${held.topic} is held by ${held.agent}, not ${agent}.` };
		delete rows[key];
		this.write(rows);
		return { ok: true, released: true };
	}

	release_all(agent){
		const rows = this.read();
		const mine = Object.keys(rows).filter(k => rows[k].agent === agent);
		for (const k of mine) delete rows[k];
		if (mine.length) this.write(rows);
		return { ok: true, released: mine.length };
	}

	list(){
		return Object.entries(this.read()).map(([key, c]) => ({ key, ...c, ...(this.alive(c.agent) ? {} : { stale: true }) }));
	}

	/* The three tools, in `mcp.tool()`'s shape. The agent is always the caller
	 * Servex stamped, never a field the model typed; a tab (null) is the owner. */
	tools(){
		const who = ctx => ctx?.caller ?? "owner";
		const json = x => JSON.stringify(x);
		return [
			{ name: "claim_topic", description: "Claim a topic before starting work on it, so no other card starts the same thing."
				+ " Refused when another live agent holds it: then ask mastermind-servex.",
				inputSchema: { type: "object", required: ["topic"], properties: {
					topic: { type: "string", description: "What you are working on, in a few words." },
					card: { type: "string", description: "The card the work belongs to." } } },
				handler: (args = {}, ctx) => json(this.claim({ topic: args.topic, card: args.card ?? null, agent: who(ctx) })) },
			{ name: "release_topic", description: "Release a topic you claimed, when the work has landed or stopped.",
				inputSchema: { type: "object", required: ["topic"], properties: { topic: { type: "string" } } },
				handler: (args = {}, ctx) => json(this.release({ topic: args.topic, agent: who(ctx) })) },
			{ name: "list_claims", description: "Who is working on what, right now. A stale claim's holder has stopped.",
				inputSchema: { type: "object", properties: {} },
				handler: () => json(this.list()) }
		];
	}
}

export default Claims;

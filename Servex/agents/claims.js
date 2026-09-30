import fs from "fs";
import path from "path";

const slug = text => String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "topic";
const DEFAULT = () => path.join(process.env.SERVEX_HOME
	|| path.join(process.env.LOCALAPPDATA || "", "lew42", "servex"), "claims.json");

/* THE CLAIMS LIST — who is changing what, so two cards never change the same
 * thing at once. A claim is `{thing, change, agent, card, at}`, keyed by a slug
 * of the THING only: "the site header" made blue and "the site header" made red
 * are one key, so the second is refused. (Keyed by the change, they were two
 * keys and both were granted — the layers proof, 2026-09-24.) `topic` is the old
 * word for `thing`, still accepted, and old rows written with it still read.
 * A claim whose holder is gone or stopped is STALE: shown as such, and taken
 * over by the next claimant. One small JSON file, whole-file rewrite — Servex is
 * the only writer. */
const thing_of = row => row?.thing ?? row?.topic;
export class Claims {

	constructor(...args){ this.assign(this.defaults(), ...args); }
	assign(...args){ return Object.assign(this, ...args); }
	defaults(){ return { agents: null, file: DEFAULT(), on: null }; }
	// Tell `on(event, row)` ("claimed" | "released"); a throw there never breaks a claim.
	told(event, row){ try { this.on?.(event, row); } catch {} }

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

	claim({ thing, topic, change = null, agent = "owner", card = null } = {}){
		thing ??= topic;
		if (!thing) return { ok: false, why: "thing is required: what you will change, as a short noun (the site header, policy.js)" };
		const rows = this.read(), key = slug(thing), held = rows[key];
		if (held && held.agent !== agent && this.alive(held.agent))
			return { ok: false, holder: held.agent, card: held.card, change: held.change ?? null,
				why: `${thing_of(held)} is already being changed by ${held.agent} on card ${held.card}`
					+ `${held.change ? ` (${held.change})` : ""}. Ask mastermind-servex before starting.` };
		rows[key] = { thing, change, agent, card, at: new Date().toISOString() };
		this.write(rows);
		if (held?.agent !== agent) this.told("claimed", rows[key]);
		return { ok: true, key, ...(held && held.agent !== agent ? { took_over: held.agent } : {}) };
	}

	release({ thing, topic, agent = "owner" } = {}){
		const rows = this.read(), key = slug(thing ?? topic), held = rows[key];
		if (!held) return { ok: true, released: false };
		if (held.agent !== agent && this.alive(held.agent)) return { ok: false, why: `${thing_of(held)} is held by ${held.agent}, not ${agent}.` };
		delete rows[key];
		this.write(rows);
		this.told("released", held);
		return { ok: true, released: true };
	}

	release_all(agent){
		const rows = this.read();
		const mine = Object.keys(rows).filter(k => rows[k].agent === agent);
		const gone = mine.map(k => rows[k]);
		for (const k of mine) delete rows[k];
		if (mine.length) this.write(rows);
		for (const row of gone) this.told("released", row);
		return { ok: true, released: mine.length };
	}

	list(){
		return Object.entries(this.read()).map(([key, c]) => {
			const { topic, ...rest } = c;
			return { key, ...rest, thing: thing_of(c), change: c.change ?? null, ...(this.alive(c.agent) ? {} : { stale: true }) };
		});
	}

	/* The three tools, in `mcp.tool()`'s shape. The agent is always the caller
	 * Servex stamped, never a field the model typed; a tab (null) is the owner. */
	tools(){
		const who = ctx => ctx?.caller ?? "owner";
		const json = x => JSON.stringify(x);
		return [
			{ name: "claim_topic", description: "claim_topic({thing, change, card}): claim the THING you will change before you start, so no other card changes it at the same time."
				+ " `thing` is what you will change, as a short noun anyone would use (the site header, policy.js, the AI 2 rail), never the change itself."
				+ " Refused when another live agent holds that thing: then ask mastermind-servex.",
				inputSchema: { type: "object", properties: {
					thing: { type: "string", description: "What you will change, as a short noun anyone would use: the site header, policy.js, the AI 2 rail. Never the change itself." },
					change: { type: "string", description: "What you will do to it, in a few words: make it blue." },
					card: { type: "string", description: "The card the work belongs to." },
					topic: { type: "string", description: "Deprecated: the old name for `thing`." } } },
				handler: (args = {}, ctx) => json(this.claim({ thing: args.thing ?? args.topic, change: args.change ?? null, card: args.card ?? null, agent: who(ctx) })) },
			{ name: "release_topic", description: "Release a thing you claimed, when the work has landed or stopped.",
				inputSchema: { type: "object", properties: { thing: { type: "string" }, topic: { type: "string", description: "Deprecated: the old name for `thing`." } } },
				handler: (args = {}, ctx) => json(this.release({ thing: args.thing ?? args.topic, agent: who(ctx) })) },
			{ name: "list_claims", description: "Who is working on what, right now. A stale claim's holder has stopped.",
				inputSchema: { type: "object", properties: {} },
				handler: () => json(this.list()) }
		];
	}
}

export default Claims;

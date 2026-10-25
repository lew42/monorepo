#!/usr/bin/env node
// Server/role-spend.mjs: what one agent (by id prefix) and the agents it spawned cost, by ISO week and by month.
// The owner, 2026-10-23: "track the AI system mastermind's spend per week and month, so we can see whether it's fixing things."
// Reads Servex's own logs (the single writer): every turn's cost in the agent's Servex log (rebuilt by Servex/agents/turn-costs.js), and registry.json's
// `parent` to find the children. Nothing is estimated.
//
//   node Server/role-spend.mjs ai-system-mastermind                 the role's ids (ALIASES below), a table
//   node Server/role-spend.mjs mastermind-deputy --json             any id prefix; --json prints the numbers
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { turn_costs } from "../Servex/agents/turn-costs.js";

// A role's earlier ids count as the same role: the AI system mastermind was mastermind-servex*, then mastermind-system-architect*.
export const ALIASES = { "ai-system-mastermind": ["ai-system-mastermind", "mastermind-ai", "mastermind-system-architect", "mastermind-servex"] };

const home = () => process.env.SERVEX_HOME ?? path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "lew42", "servex");

// ISO week label, e.g. 2026-W43.
export function week(d){
	const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
	const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
	const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
	return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y0) / 864e5 + 1) / 7)).padStart(2, "0")}`;
}

// Each id matching a prefix (exactly, or prefix + "-…"), plus every descendant by registry parent.
export function ids_for(prefixes, registry){
	const own = Object.keys(registry).filter(id => prefixes.some(p => id === p || id.startsWith(p + "-")));
	const all = new Set(own), kids = new Map();
	for (const [id, row] of Object.entries(registry)) if (row?.parent) (kids.get(row.parent) ?? kids.set(row.parent, []).get(row.parent)).push(id);
	const walk = id => { for (const k of kids.get(id) ?? []) if (!all.has(k)){ all.add(k); walk(k); } };
	own.forEach(walk);
	return { own: new Set(own), all };
}

export function spend(prefixes, { dir = path.join(home(), "logs"), registry = null } = {}){
	registry ??= JSON.parse(fs.readFileSync(path.join(home(), "registry.json"), "utf8"));
	const { own, all } = ids_for(prefixes, registry);
	const rows = { week: {}, month: {} };
	const add = (bucket, key, who, usd) => { const r = (rows[bucket][key] ??= { own: 0, children: 0 }); r[who] += usd; };
	for (const id of all){
		let text; try { text = fs.readFileSync(path.join(dir, `agent-${id}.jsonl`), "utf8"); } catch { continue; }
		for (const { line: j, cost } of turn_costs(text, { openrouter: registry[id]?.provider === "openrouter" }).turns){
			if (!(cost > 0) || !j.at) continue;
			const d = new Date(j.at), who = own.has(id) ? "own" : "children";
			add("week", week(d), who, cost);
			add("month", j.at.slice(0, 7), who, cost);
		}
	}
	return { prefixes, agents: { own: own.size, children: all.size - own.size }, ...rows };
}

const main = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (main){
	const args = process.argv.slice(2), json = args.includes("--json"), word = args.find(a => !a.startsWith("--"));
	if (!word){ console.error("usage: node Server/role-spend.mjs <role or id prefix> [--json]"); process.exit(1); }
	const out = spend(ALIASES[word] ?? [word]);
	if (json){ console.log(JSON.stringify(out, null, 2)); process.exit(0); }
	const fmt = n => ("$" + n.toFixed(2)).padStart(9);
	console.log(`${word}: ${out.agents.own} sessions of its own, ${out.agents.children} spawned (ids: ${out.prefixes.join(", ")})`);
	for (const b of ["month", "week"]){
		console.log(`\n${b.padEnd(9)}      own  spawned    total`);
		for (const k of Object.keys(out[b]).sort().slice(b === "week" ? -8 : -6)){ const r = out[b][k]; console.log(`${k.padEnd(9)} ${fmt(r.own)}${fmt(r.children)}${fmt(r.own + r.children)}`); }
	}
}

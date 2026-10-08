#!/usr/bin/env node
/* Reconcile OpenRouter cost per agent: Servex's number against OpenRouter's own records.
 * (2026-10-02: Servex showed mastermind-ai-2 at $13.36, and the usage it reported had
 * cache_creation equal to cache_read, which looks double-counted.)
 *
 *   node public/framework/ai/2026-10-02/servex-mastermind/or-reconcile.mjs [agent-id ...]
 *
 * For each agent (default: mastermind-ai-2, mastermind-page-2):
 *   1. Servex's registry row: its session id and the cost Servex shows.
 *   2. Servex's ledger lines (logs/openrouter.jsonl): the cost per turn and where it came
 *      from ("generation" = exact, "key_diff" = the whole key's change, which takes in
 *      every OTHER agent's spend while two run at once).
 *   3. The claude transcript for that session: every assistant message id, counted once,
 *      and the token usage summed per unique id AND per line (the SDK writes one line per
 *      content block, so a per-line sum counts a call several times).
 *   4. OpenRouter's /generation record for every id: the real cost and native token counts.
 * Writes or-reconcile.json beside this file and prints one table. Reads only; changes nothing. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "servex");
const ids = process.argv.slice(2).filter(a => !a.startsWith("--"));
const agents = ids.length ? ids : ["mastermind-ai-2", "mastermind-page-2"];
const key = fs.readFileSync(path.join(HOME, "openrouter.key"), "utf8").trim();
const registry = JSON.parse(fs.readFileSync(path.join(HOME, "registry.json"), "utf8"));

const lines = file => { try { return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
const ledger = lines(path.join(HOME, "logs", "openrouter.jsonl")).map(l => l.data ?? l);

function transcript(session_id){
	const root = path.join(os.homedir(), ".claude", "projects");
	for (const dir of fs.readdirSync(root)){
		const f = path.join(root, dir, `${session_id}.jsonl`);
		if (fs.existsSync(f)) return f;
	}
	return null;
}

async function generation(id){
	for (let i = 0; i < 3; i++){
		const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${key}` } }).catch(() => null);
		if (res?.ok) return (await res.json())?.data ?? null;
		await new Promise(r => setTimeout(r, 1500));
	}
	return null;
}

const sum = (rows, f) => rows.reduce((a, r) => a + (Number(f(r)) || 0), 0);
const out = [];
for (const id of agents){
	const row = registry[id] ?? {};
	const sessions = [...new Set([row.session_id, row.resumed_from, row.forked_from].filter(Boolean))];
	const mine = ledger.filter(l => l.agent === id);
	const by_source = {};
	for (const l of mine) by_source[l.source ?? "?"] = +((by_source[l.source ?? "?"] ?? 0) + (Number(l.cost_usd) || 0)).toFixed(4);

	const per_line = [], unique = new Map();
	for (const s of sessions){
		const f = transcript(s);
		for (const l of f ? lines(f) : []){
			if (l.type !== "assistant" || !l.message?.id) continue;
			per_line.push(l.message.usage ?? {});
			unique.set(l.message.id, l.message.usage ?? {});
		}
	}
	const tokens = rows => ({
		input: sum(rows, u => u.input_tokens), cache_read: sum(rows, u => u.cache_read_input_tokens),
		cache_creation: sum(rows, u => u.cache_creation_input_tokens), output: sum(rows, u => u.output_tokens) });

	const gens = [];
	const queue = [...unique.keys()];
	await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length){ const g = await generation(queue.shift()); if (g) gens.push(g); } }));

	/* WAS ANYTHING CACHED? (vscode-mastermind, 2026-10-03: ~10.6M input tokens each at $0.75/M is
	 * ~$8 per agent, and ~$17 was charged for the two, which looks like no cache discount at all,
	 * though the SDK reported 9.2M cache-read tokens.) Per request: OpenRouter's own cached count and
	 * discount, and which upstream served it (a cache lives with one provider, so alternating
	 * between Google AI Studio and Vertex would miss every time). */
	const sample = g => ({ id: g.id, provider: g.provider_name ?? null, model: g.model ?? null, cost: g.total_cost,
		prompt: g.native_tokens_prompt, cached: g.native_tokens_cached ?? null, discount: g.cache_discount ?? null });
	const providers = {};
	for (const g of gens) providers[g.provider_name ?? "?"] = (providers[g.provider_name ?? "?"] ?? 0) + 1;
	const cache = {
		requests_with_cached_tokens: gens.filter(g => Number(g.native_tokens_cached) > 0).length,
		requests_with_discount: gens.filter(g => Number(g.cache_discount) !== 0 && g.cache_discount != null).length,
		providers,
		first: gens.slice(0, 5).map(sample), last: gens.slice(-5).map(sample),
	};

	out.push({
		agent: id, model: row.model ?? null, sessions, cache,
		servex_cost_usd: row.cost ?? null,
		ledger: { turns: mine.length, total_usd: +sum(mine, l => l.cost_usd).toFixed(4), by_source },
		calls: { unique: unique.size, transcript_lines: per_line.length, priced: gens.length },
		tokens_unique: tokens([...unique.values()]),
		tokens_per_line: tokens(per_line),
		openrouter: {
			total_usd: +sum(gens, g => g.total_cost).toFixed(4),
			native_prompt: sum(gens, g => g.native_tokens_prompt), native_cached: sum(gens, g => g.native_tokens_cached),
			native_completion: sum(gens, g => g.native_tokens_completion), cache_discount_usd: +sum(gens, g => g.cache_discount).toFixed(4),
		},
	});
}

fs.writeFileSync(path.join(HERE, "or-reconcile.json"), JSON.stringify({ at: new Date().toISOString(), agents: out }, null, 2));
for (const a of out){
	console.log(`\n${a.agent} (${a.model})`);
	console.log(`  Servex shows      $${a.servex_cost_usd}`);
	console.log(`  ledger            $${a.ledger.total_usd} over ${a.ledger.turns} turns, by source ${JSON.stringify(a.ledger.by_source)}`);
	console.log(`  OpenRouter        $${a.openrouter.total_usd} over ${a.calls.priced} of ${a.calls.unique} calls`);
	console.log(`  tokens, per call  ${JSON.stringify(a.tokens_unique)}`);
	console.log(`  tokens, per line  ${JSON.stringify(a.tokens_per_line)}  (${a.calls.transcript_lines} lines)`);
	console.log(`  OpenRouter native prompt ${a.openrouter.native_prompt}, cached ${a.openrouter.native_cached}, completion ${a.openrouter.native_completion}`);
	console.log(`  cache: ${a.cache.requests_with_cached_tokens} of ${a.calls.priced} requests had cached tokens, ${a.cache.requests_with_discount} a discount ($${a.openrouter.cache_discount_usd}); served by ${JSON.stringify(a.cache.providers)}`);
	for (const s of [...a.cache.first, ...a.cache.last]) console.log(`    ${JSON.stringify(s)}`);
}
console.log(`\nwritten: ${path.join(HERE, "or-reconcile.json")}`);

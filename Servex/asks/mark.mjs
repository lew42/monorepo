#!/usr/bin/env node
// Servex/asks/mark.mjs — mark an ask's status by hand, from a terminal.
//
//   node Servex/asks/mark.mjs <id-or-title-words> <status> "<why>" [--by <agent>]
//   node Servex/asks/mark.mjs --list
//
// <id-or-title-words> can be the ask's exact id, or any part of its id or
// title (case-insensitive) — whatever's shorter to type. An ambiguous match
// lists every ask it could mean and exits 1 rather than guessing. This is
// the same `Asks.mark()` the ledger's own tick uses, constructed with no
// `servex` so it appends one line and does nothing else — no ticking.
import Asks from "./Asks.js";

function usage(){
	console.error('usage: node Servex/asks/mark.mjs <id-or-title-words> <status> "<why>" [--by <agent>]');
	console.error("       node Servex/asks/mark.mjs --list");
}

/* Pull `--by <agent>` out of argv wherever it sits, leaving the positional
 * args in order. */
function take_by(argv){
	const args = [...argv];
	const i = args.indexOf("--by");
	if (i === -1) return { rest: args, by: null };
	const by = args[i + 1] ?? null;
	args.splice(i, 2);
	return { rest: args, by };
}

/* The ask `query` means: its exact id, or — if nothing matches that — every
 * ask whose id or title contains it, case-insensitive. */
function find(rows, query){
	const exact = rows.find(a => a.id === query);
	if (exact) return [exact];
	const q = query.toLowerCase();
	return rows.filter(a => a.id.toLowerCase().includes(q) || String(a.title ?? "").toLowerCase().includes(q));
}

async function main(){
	const argv = process.argv.slice(2);
	const asks = new Asks({});   // no `servex`: read/mark only, no interval, no close_task wrap

	if (argv[0] === "--list"){
		const rows = Object.values(await asks.read()).sort((a, b) => a.id.localeCompare(b.id));
		for (const a of rows) console.log(`${a.id} · ${a.status} · ${a.owner ?? "?"}`);
		return;
	}

	const { rest, by } = take_by(argv);
	const [query, status, why] = rest;
	if (!query || !status){ usage(); process.exit(2); }

	const rows = Object.values(await asks.read());
	const matches = find(rows, query);

	if (matches.length === 0){ console.error(`no ask matches "${query}"`); process.exit(1); }
	if (matches.length > 1){
		console.error(`"${query}" matches ${matches.length} asks — say which one:`);
		for (const m of matches) console.error(`  ${m.id} · ${m.status} · ${m.title}`);
		process.exit(1);
	}

	const out = await asks.mark(matches[0].id, status, why ?? null, by);
	if (!out.ok){ console.error(out.why); process.exit(1); }
	console.log(`${out.id} -> ${out.status}`);
}

main().catch(e => { console.error(String(e?.message || e)); process.exit(1); });

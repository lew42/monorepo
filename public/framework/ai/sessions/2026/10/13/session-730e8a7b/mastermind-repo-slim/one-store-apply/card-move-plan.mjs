#!/usr/bin/env node
// card-move-plan.mjs — DRY RUN: every entry of the old card tree public/framework/ai/YYYY/ and where it goes in the sessions
// store, by the one rule (ai/cards/CardDir.js): a card folder ai/Y/M/D/<card>/ -> ai/sessions/Y/M/D/cards/<card>/, an index
// file ai/Y[/M[/D]]/<file> -> ai/sessions/Y[/M[/D]]/cards/<file>. Moves nothing; writes the manifest that
// `node Server/TaskMove.mjs --manifest <it> --ledger card-moves` applies.   node card-move-plan.mjs [--repo <path>] [--out <file>]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const argv = process.argv.slice(2), val = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(val("--repo") ?? path.resolve(here, "../../../../../../../../../.."));
const OUT = val("--out") ?? path.join(here, "card-moves.manifest.json");
const AI = path.join(REPO, "public/framework/ai");
const { default: CardDir } = await import(pathToFileURL(path.join(AI, "cards/CardDir.js")).href);   // the rule, from the repo being moved

const slash = p => p.split(path.sep).join("/"), rel = p => slash(path.relative(REPO, p));
const ents = d => { try { return fs.readdirSync(d, { withFileTypes: true }); } catch { return []; } };
const moves = [], odd = [], skipped = [];
const add = (kind, id) => {
	const from = path.join(AI, ...id.split("/")), to = path.join(AI, ...CardDir.rel(id).split("/"));
	moves.push({ kind, id, from: rel(from), to: rel(to), exists: fs.existsSync(to) });
};
// a card folder moves whole; if its folder already exists in the store (a merge carried its tracked files, and git-ignored
// ones were left behind), what is left moves file by file into it
const tree = id => {
	if (!fs.existsSync(path.join(AI, ...CardDir.rel(id).split("/")))) return add("card", id);
	for (const e of ents(path.join(AI, ...id.split("/")))){
		const child = `${id}/${e.name}`;
		if (e.isDirectory()) tree(child);
		else if (e.name === "files.jsonl") skipped.push(rel(path.join(AI, ...child.split("/"))));
		else add("cardfile", child);
	}
};
// year, month, day: their files are index pages; a day's folders are cards; anything else is reported, never guessed
const walk = (id, depth) => {
	for (const e of ents(path.join(AI, ...id.split("/")))){
		const child = `${id}/${e.name}`;
		if (e.isFile() && e.name === "files.jsonl") skipped.push(rel(path.join(AI, ...child.split("/"))));   // a generated listing (Server/plugins/PageFiles.js): the store ignores it and makes its own
		else if (e.isFile()) add("cardfile", child);
		else if (depth < 2 && /^\d{2}$/.test(e.name)) walk(child, depth + 1);
		else if (depth === 2) tree(child);
		else odd.push(rel(path.join(AI, ...child.split("/"))));
	}
};
for (const y of ents(AI).filter(e => e.isDirectory() && /^\d{4}$/.test(e.name))) walk(y.name, 0);

const out = {
	at: new Date().toISOString(), dry_run: true, rule: "public/framework/ai/cards/CardDir.js", repo: REPO,
	totals: { cards: moves.filter(m => m.kind === "card").length, files: moves.filter(m => m.kind === "cardfile").length, skipped_listings: skipped.length, target_exists: moves.filter(m => m.exists).length, odd: odd.length },
	odd, skipped, moves,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.totals), "->", OUT);
if (out.totals.target_exists || odd.length) process.exit(1);

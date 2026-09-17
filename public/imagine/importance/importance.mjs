#!/usr/bin/env node
/**
 * THE BOT'S HALF — propose and judge from the command line, writing the same rows a
 * click writes, into the same three files, scored by the same formula.
 *
 *   node public/imagine/importance/importance.mjs rank --context car
 *   node public/imagine/importance/importance.mjs propose --kind question --text "Is the timing belt done?" --author bot_7 --context car
 *   node public/imagine/importance/importance.mjs edge --src c1 --rel qualifies --dst q5
 *   node public/imagine/importance/importance.mjs judge --context car --a q1 --b q2 --winner q1 --judge bot_7 --reason "a bent frame is money"
 *   node public/imagine/importance/importance.mjs check
 *
 * The owner's rule: "nothing structural distinguishes a bot". This file is the proof —
 * it is `Graph` (Graph.js, shared with the browser) plus fs, and it validates the same
 * way `ext/Research/entry.mjs` does: an illegal row is refused with a reason and exit 1,
 * and nothing is written.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { Graph, KINDS, RELS } from "./Graph.js";

const DATA = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "data");

const HELP = `importance — propose and judge from the command line.

  node public/imagine/importance/importance.mjs <command> [--flag value]

  rank     --context <id>                       the ranked children, with the counts
  propose  --kind ${KINDS.join("|")}
           --text T --author A --context <id>   two lines: the node, and its edge
  edge     --src <id> --rel ${RELS.join("|")} --dst <id>
                                                join a node that ALREADY exists to a
                                                second place - this is reuse
  judge    --context <id> --a <id> --b <id> --winner <id>
           --judge J [--weight 1] [--goal G] [--reason R]     one appended line
  check                                         every line the schema refuses, by number

Importance is always relative to a CONTEXT, so --context is never optional: the same
question can rank first in one topic and last in another, and a row without one belongs
to nothing. Quote text containing spaces; one line, one row, a real newline is a torn row.`;

/** --key value, --key=value, and a bare --flag (true). Same parser as entry.mjs. */
function flags(argv){
	const out = {};
	for (let i = 0; i < argv.length; i++){
		if (!argv[i].startsWith("--")) continue;
		const [key, inline] = argv[i].slice(2).split(/=(.*)/s);
		out[key] = inline ?? (argv[i + 1]?.startsWith("--") ? true : argv[++i] ?? true);
	}
	return out;
}

/* The same Graph the browser runs, over the filesystem instead of fetch + the socket.
   Two methods, and they are the only two this file adds. */
export class FileStore extends Graph {

	at(name){ return path.join(DATA, name); }

	read(name){
		const full = this.at(name);
		return fs.existsSync(full) ? this.parse(fs.readFileSync(full, "utf8")) : [];
	}

	load(){
		this.reset();
		this.read("nodes.jsonl").forEach(n => this.nodes.set(n.id, n));
		this.edges = this.read("edges.jsonl");
		this.judgments = this.shards().flatMap(name => this.read("judgments/" + name));
		return this;
	}

	// Whatever shards exist on disk — the browser walks months because it cannot list a
	// directory; here we can, so we do.
	shards(){
		const dir = this.at("judgments");
		return fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.endsWith(".jsonl")).sort() : [];
	}

	/* ⚠ "a", never a rewrite — the whole file is append-only, and two writers (a bot here
	     and a person in the browser) interleave between lines and never inside one. */
	append(kind, row){
		const full = this.at(this.file(kind));
		fs.mkdirSync(path.dirname(full), { recursive: true });
		fs.appendFileSync(full, JSON.stringify(row) + "\n", "utf8");
		return this.take(kind, row);
	}
}

/** Every line the schema refuses, with its 1-based number — run it before handing a log over. */
export function check(store){
	const bad = [];
	const names = ["nodes.jsonl", "edges.jsonl", ...store.shards().map(n => "judgments/" + n)];
	let lines = 0;

	for (const name of names){
		const full = store.at(name);
		if (!fs.existsSync(full)) continue;

		fs.readFileSync(full, "utf8").split("\n").forEach((raw, i) => {
			if (!raw.trim()) return;
			lines++;

			let row;
			try { row = JSON.parse(raw); }
			catch { return void bad.push(`${name}:${i + 1} — not JSON`); }

			const why = refused(name, row, store);
			if (why) bad.push(`${name}:${i + 1} — ${why}`);
		});
	}

	return { lines, bad };
}

function refused(name, row, store){
	if (name === "nodes.jsonl")
		return !row.id ? "no id" : !KINDS.includes(row.kind) ? `kind "${row.kind}" is not one of ${KINDS.join(", ")}` : null;

	if (name === "edges.jsonl")
		return !store.node(row.src) ? `src "${row.src}" is not a node` : !store.node(row.dst) ? `dst "${row.dst}" is not a node` : null;

	for (const key of ["context", "a", "b"]) if (!store.node(row[key])) return `${key} "${row[key]}" is not a node`;
	if (store.won(row) !== row.a && store.won(row) !== row.b) return `winner "${row.winner}" is neither side`;
	if (!row.judge) return "no judge";
	return null;
}

export async function run(argv){
	const [command] = argv;
	if (!command || command === "--help" || command === "-h" || command === "help") return HELP;

	const store = new FileStore().load();
	const f = flags(argv.slice(1));

	if (command === "check"){
		const { lines, bad } = check(store);
		return `${lines} lines, ${bad.length} refused` + (bad.length ? "\n" + bad.join("\n") : "\n every line is legal");
	}

	if (command === "rank"){
		const context = String(f.context ?? "");
		if (!store.node(context)) throw new Error(`--context "${context}" is not a node`);

		const rows = store.rank(store.items(context), context);
		return rows.map((r, i) => `${r.ranked ? i + 1 : "-"}  ${(r.ranked ? Math.round(r.score * 100) + "%" : "unranked").padStart(8)}  ${String(r.games).padStart(3)} judgments  ${r.id}  ${r.node?.text ?? ""}`).join("\n")
			|| `nothing hangs off "${context}" yet`;
	}

	if (command === "propose"){
		const node = await store.propose({ kind: f.kind, text: f.text, author: f.author, context: f.context });
		return `${node.kind} ${node.id} — "${node.text}"` + (node.kind === "topic" ? ", a new topic — hang questions off it with --context " + node.id : ` under ${f.context}, unranked`);
	}

	// The reuse verb: one existing node, a second place. `propose` always mints a NEW
	// node, so this is the only way to say "that caveat qualifies this question too".
	if (command === "edge"){
		const row = await store.link({ src: f.src, rel: f.rel, dst: f.dst });
		return `${row.src} ${row.rel} ${row.dst} — ${store.node(row.src)?.text ?? row.src} is now reached from ${store.also(row.src).length} topics`;
	}

	if (command === "judge"){
		const row = await store.judge({ context: f.context, a: f.a, b: f.b, winner: f.winner, judge: f.judge, weight: f.weight ?? 1, goal: f.goal ?? "", reason: f.reason ?? "" });
		return `${row.id} — in ${row.context}, ${row.winner} beat ${row.winner === row.a ? row.b : row.a} (${row.judge}, weight ${row.weight})`;
	}

	throw new Error(`"${command}" is not a command — try: rank, propose, edge, judge, check`);
}

/* Only when run as the program — importing this must not execute anything. */
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url){
	run(process.argv.slice(2))
		.then(out => console.log(out))
		.catch(e => { console.error(String(e.message || e)); process.exit(1); });
}

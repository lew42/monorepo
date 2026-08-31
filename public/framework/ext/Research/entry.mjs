#!/usr/bin/env node
/**
 * The PROGRAM writer — one legal entry per call, appended to a topic's log.
 *
 *   node public/framework/ext/Research/entry.mjs public/imagine/research/stone/log.jsonl \
 *     --kind finding --title "…" --summary "…" --url https://… --credence contested
 *
 *   node public/framework/ext/Research/entry.mjs public/imagine/research/stone/log.jsonl --check
 *
 * A path, not a slug: `research.mjs` owns one topic tree at one fixed location,
 * and a program's topics live wherever the program does. Everything else is the
 * same bargain — `entries.js` validates, an illegal line is refused with a
 * reason and exit 1, and nothing is written.
 *
 * ⚠ `--check` is the one to run before handing a log over. It reads a log that
 *   already exists and prints every line the schema refuses, with its number.
 *   The page shows those lines too, marked; this tells you before the owner sees.
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { KINDS, CREDENCE, validate, notes, line } from "./entries.js";
import { now } from "./store.mjs";

const HELP = `entry — one line of a research program's log.

  node public/framework/ext/Research/entry.mjs <path/to/log.jsonl> [--flag value]

  --kind ${KINDS.join("|")}
  --credence ${CREDENCE.join("|")}
  --title T            what you found, in one line
  --summary S          the evidence, and what it would take to overturn it
  --url U              where to check it
  --topic T            defaults to the log's own directory name
  --at ISO             defaults to the clock
  --check              validate the whole file instead of writing to it

Credence is the point. Say what your evidence actually supports:
  established  mainstream consensus, checkable against a source
  contested    specialists disagree — the evidence cuts both ways
  fringe       argued outside the mainstream, by someone who names their evidence
  speculation  nobody has evidence — this is a possibility, written down

Quoting text that contains quotes, backticks or $:
  bash / PowerShell   --title 'a "quoted" $var'      single quotes, nothing expands
  One line, one entry — a real newline anywhere is a torn line.`;

/** --key value, --key=value, and a bare --flag (true). */
function flags(argv){
	const out = {};
	for (let i = 0; i < argv.length; i++){
		if (!argv[i].startsWith("--")) continue;
		const [key, inline] = argv[i].slice(2).split(/=(.*)/s);
		out[key] = inline ?? (argv[i + 1]?.startsWith("--") ? true : argv[++i] ?? true);
	}
	return out;
}

/** ⚠ A path from an agent becomes a write — it stays inside `public/`, always. */
export function logged(where){
	const full = path.resolve(process.cwd(), String(where ?? ""));
	const root = path.resolve(process.cwd(), "public");

	if (!full.startsWith(root + path.sep)) throw new Error(`"${where}" is outside public/ — a log lives with the site it is about`);
	if (!full.endsWith(".jsonl")) throw new Error(`"${where}" is not a .jsonl — a program's log is append-only`);
	return full;
}

/** Every line the schema refuses, with its 1-based number. */
export function check(full){
	if (!fs.existsSync(full)) return { lines: 0, bad: [], torn: [] };

	const out = { lines: 0, bad: [], torn: [] };

	fs.readFileSync(full, "utf8").split("\n").forEach((raw, i) => {
		if (!raw.trim()) return;
		out.lines++;

		let entry;
		try { entry = JSON.parse(raw); }
		catch { return void out.torn.push(`${i + 1}: not JSON — ${raw.slice(0, 60)}`); }

		const why = validate(entry);
		if (why) out.bad.push(`${i + 1}: ${why}`);
		notes(entry).forEach(note => out.bad.push(`${i + 1}: (advice) ${note}`));
	});

	return out;
}

export function run(argv){
	const [where] = argv;
	if (!where || where === "--help" || where === "-h" || where === "help") return HELP;

	const full = logged(where);
	const f = flags(argv.slice(1));

	if (f.check){
		const { lines, bad, torn } = check(full);
		const found = [...torn, ...bad];
		return `${lines} lines, ${torn.length} torn, ${bad.filter(b => !b.includes("(advice)")).length} refused`
			+ (found.length ? "\n" + found.join("\n") : "\n every line is legal");
	}

	const entry = {
		at: f.at === undefined ? now() : String(f.at),
		topic: f.topic === undefined ? path.basename(path.dirname(full)) : String(f.topic),
		kind: f.kind, title: f.title, summary: f.summary, url: f.url, credence: f.credence,
	};

	for (const key of Object.keys(entry)) if (entry[key] === undefined) delete entry[key];

	// Throws with the reason — nothing half-written, exactly as `verbs.js` does.
	const text = line(entry);

	fs.mkdirSync(path.dirname(full), { recursive: true });
	fs.appendFileSync(full, text, "utf8");

	const advice = notes(entry);
	return `${entry.kind} · ${entry.credence} → ${path.relative(process.cwd(), full).replace(/\\/g, "/")}`
		+ (advice.length ? "\n advice: " + advice.join("; ") : "");
}

/* Only when run as the program — importing this must not execute anything. */
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url){
	try { console.log(run(process.argv.slice(2))); }
	catch (e){ console.error(String(e.message || e)); process.exit(1); }
}

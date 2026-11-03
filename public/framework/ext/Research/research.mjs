#!/usr/bin/env node
/**
 * The research CLI — one legal line per call, from a terminal or a hook.
 *
 *   node public/framework/ext/Research/research.mjs say livereload --kind claim --by m1 --text "…"
 *
 * Run it from the repo root: the topic is `public/framework/research/<slug>/`.
 * The MCP tools in `Server/plugins/Research.js` call the same functions, so
 * whatever this refuses, an agent cannot write either. See doc/writers.md.
 */
import { pathToFileURL } from "url";
import { KINDS, STATES, write, outline, summary, state, slugged } from "./store.mjs";

const HELP = `research — an append-only argument tree, one topic per file.

  node public/framework/ext/Research/research.mjs <cmd> <slug> [--flag value]

  open     --title T [--question Q --by W --minions N --minutes N --status S --summary "a|b"]
  say      --kind ${KINDS.join("|")} --text T [--parent ID --why W
           --refs a,b --icon name --img url --importance 1-5 --by W]
  vote     --node ID --importance 1-5 [--by W]
  verdict  --node ID --state ${STATES.join("|")} --why W [--into ID --by W]
  agent    --name N --doing D [--persona P --model M --done D]
  log      --msg M
  outline  [--under ID --depth N --min SCORE]     the tree, indented — read THIS, not the file
  summary  [--top N]                              header, the report block, the top roots

  text ≤ 240 chars, why ≤ 1000 — refused, not truncated. support and dissent need
  --parent and --why. --refs is comma-separated ("Server/x.js:22,https://…").

Quoting text that contains quotes, backticks or $:
  bash        --text 'a "quoted" $var and \`ticks\`'      single quotes, nothing expands
  PowerShell  --text 'a "quoted" $var and \`ticks\`'      single quotes, '' for a literal '
  Both        put a real newline nowhere — one line, one thought.`;

/** `--key value`, `--key=value`, and a bare `--flag` (true). */
function flags(argv){
	const out = {};
	for (let i = 0; i < argv.length; i++){
		if (!argv[i].startsWith("--")) continue;
		const [key, inline] = argv[i].slice(2).split(/=(.*)/s);
		out[key] = inline ?? (argv[i + 1]?.startsWith("--") ? true : argv[++i] ?? true);
	}
	return out;
}

const num = v => v == null ? undefined : Number(v);
const list = (v, sep = ",") => v == null ? undefined : String(v).split(sep).map(s => s.trim()).filter(Boolean);
const drop = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const CMDS = {
	open(slug, f){
		if (!f.title && !state(slug).head.title) throw new Error("a new topic needs --title");
		const config = drop({ minions: num(f.minions), minutes: num(f.minutes) });
		return ["assign", drop({
			title: f.title, question: f.question, by: f.by, status: f.status,
			config: Object.keys(config).length ? config : undefined,
			summary: list(f.summary, "|")
		})];
	},

	say(slug, f){
		return ["node", drop({
			kind: f.kind, text: f.text, by: f.by ?? "anon", parent: f.parent, why: f.why,
			refs: list(f.refs), icon: f.icon, img: f.img, importance: num(f.importance)
		})];
	},

	vote(slug, f){ return ["vote", drop({ node: f.node, by: f.by ?? "anon", importance: num(f.importance) })]; },

	verdict(slug, f){
		return ["verdict", drop({ node: f.node, by: f.by ?? "orchestrator", state: f.state, why: f.why, into: f.into })];
	},

	agent(slug, f){
		return ["agent", drop({ name: f.name, persona: f.persona, model: f.model, doing: f.doing, done: f.done })];
	},

	log(slug, f){ return ["log", drop({ msg: f.msg })]; }
};

const READS = {
	outline: (slug, f) => outline(slug, { under: f.under, depth: num(f.depth) ?? 9, min: num(f.min) ?? 0 }),
	summary: (slug, f) => summary(slug, { top: num(f.top) ?? 7 })
};

export function run(argv){
	const [cmd, slug] = argv;
	if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") return HELP;
	if (!CMDS[cmd] && !READS[cmd]) throw new Error(`no command "${cmd}" — one of: ${[...Object.keys(CMDS), ...Object.keys(READS)].join(" ")}`);
	if (!slug || slug.startsWith("--")) throw new Error(`${cmd} needs a topic slug: ${cmd} <slug> …`);

	slugged(slug);
	const f = flags(argv.slice(2));
	if (READS[cmd]) return READS[cmd](slug, f);

	const [verb, value] = CMDS[cmd](slug, f);
	const written = write(slug, verb, value);
	const what = [verb, written.id ?? written.node ?? written.name].filter(Boolean).join(" ");
	return `${what} → public/framework/research/${slug}/research.jsonl`;
}

/* Only when run as the program — importing this must not execute anything. */
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url){
	try { console.log(run(process.argv.slice(2))); }
	catch (e){ console.error(String(e.message || e)); process.exit(1); }
}

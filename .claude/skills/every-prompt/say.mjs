#!/usr/bin/env node
/* say.mjs — the assistant's (and the mastermind's) three verbs, one file, no dependency.
 *
 *   node .claude/skills/every-prompt/say.mjs state            print the run's current state, to answer from
 *   node .claude/skills/every-prompt/say.mjs <file.json>      post what the file says, then delete nothing
 *
 * The JSON file (write it with the Write tool — never pass the owner's words through a
 * shell argument: quotes and apostrophes break) is one object or a list of them:
 *
 *   {"card":  {"id": "…", "title": "…", "text": "…", "status": "working|done|needs-you", "links": [{"url","label"}]}}
 *        → appended to the V3 board; it shows at once on /framework/ai/v/3/ and in the dev bar's chat log.
 *   {"relay": "the owner's words, verbatim"}
 *        → appended to the mastermind's inbox: a `chat` line in the newest unlanded
 *          mastermind run's task.jsonl — {"chat": {at, from: "owner", via: "assistant", msg}}.
 *
 * `at` is stamped here, in local time with its offset, so every clock on the page is right. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(import.meta.url), "../../../..");
const AI = path.join(root, "public/framework/ai");
// 2026-09-19 (ai/2026-09-19/v3-data/): moved OUT of the v/3 template dir — the
// board is real, version-agnostic data, not something that belongs inside one
// dashboard version's own folder. The old path still works (a filesystem hard
// link points it at this same file, for two Server plugins this task's fence
// did not cover — see that task's task.jsonl) but every writer should use
// this one from now on.
const BOARD = path.join(AI, "board.jsonl");

const now = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + p(Math.trunc(off / 60)) + ":" + p(off % 60);
};
const read = file => fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
const append = (file, entry) => fs.appendFileSync(file, JSON.stringify(entry) + "\n");

/* The newest mastermind run that has not landed: ai/<date>/mastermind-<slug>/task.jsonl. */
function run(){
	const days = fs.readdirSync(AI).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse();
	for (const day of days) for (const slug of fs.readdirSync(path.join(AI, day)).filter(s => s.startsWith("mastermind-")).sort().reverse()) {
		const file = path.join(AI, day, slug, "task.jsonl");
		if (!fs.existsSync(file)) continue;
		const state = Object.assign({}, ...read(file).filter(e => e.assign).map(e => e.assign));
		if (!state.landed_at) return file;
	}
	return null;
}

/* The name a `SendMessage` reaches the running mastermind by — the same field `state()`
 * prints as `MASTERMIND SESSION`, written into the open run's own task.jsonl by the
 * mastermind itself (`{"assign": {"mastermind_session": "…"}}`). Used as `--ask`'s
 * default `--ask-to`, so a question card always has SOMEWHERE to ring, without the
 * caller having to look it up by hand. `null` when no run is open or none ever set it. */
function mastermind_session(){
	const file = run();
	if (!file) return null;
	const state = Object.assign({}, ...read(file).filter(e => e.assign).map(e => e.assign));
	return state.mastermind_session ?? null;
}

function state(){
	const file = run();
	if (!file) return console.log("No mastermind run is open.");
	const lines = read(file), merged = (verb, key) => {
		const out = [];
		for (const e of lines) if (e[verb]) { const k = out.find(x => x[key] === e[verb][key]); k ? Object.assign(k, e[verb]) : out.push({ ...e[verb] }); }
		return out;
	};
	const assign = Object.assign({}, ...lines.filter(e => e.assign).map(e => e.assign));
	const agents = merged("agent", "task"), asks = merged("ask", "id"), today = now().slice(0, 10);
	console.log("RUN      " + path.relative(root, file).replaceAll("\\", "/"));
	// The name other Claude sessions use to SendMessage the mastermind (it writes this itself).
	if (assign.mastermind_session) console.log("MASTERMIND SESSION  " + assign.mastermind_session + "   ← SendMessage to this name");
	console.log("NOW      " + (assign.now ?? ""));
	console.log("WORKING  " + (agents.filter(a => !a.outcome).map(a => `${a.task} (${a.model}) — ${a.does ?? ""}`).join("\n         ") || "nothing"));
	console.log("LANDED   " + (agents.filter(a => a.outcome && String(a.landed_at ?? a.at).startsWith(today)).map(a => a.task).join(", ") || "nothing today"));
	console.log("NEEDS    " + (asks.filter(a => a.needs?.owner && !a.needs.done).map(a => `${a.needs.minutes ?? "?"} min — ${a.needs.owner}`).join("\n         ") || "nothing"));
	console.log("INBOX    " + lines.filter(e => e.chat?.from === "owner").slice(-3).map(e => `${e.chat.at.slice(11, 16)} ${String(e.chat.msg).slice(0, 100)}`).join("\n         "));
	// The dashboard's topics, by id — reuse an id to EVOLVE its card instead of making a new one.
	const board = fs.existsSync(BOARD) ? read(BOARD).filter(e => e.card) : [];
	const topics = new Map();
	for (const e of board) if (e.card.author !== "owner" && !/^a-\d{6}$/.test(String(e.card.id))) topics.set(e.card.id, e.card);
	console.log("TOPICS (id — title — status)\n" + [...topics.values()].slice(-14).map(c => `  ${c.id} — ${c.title} — ${c.status ?? ""}`).join("\n"));
	const heard = board.filter(e => e.card.author === "owner").slice(-1)[0];
	if (heard) console.log("LAST HEARD  " + heard.card.id + "   ← answer it with --re " + heard.card.id);
}

/* THE ONE-COMMAND FORMS (2026-09-19) — the file form cost two tool calls, and a fast,
 * low-effort assistant skipped it and answered only in its own chat, which the owner
 * never reads. These cost one:
 *
 *   node …/say.mjs say   "<title: the answer, as a sentence>" "<one to three more sentences>"
 *   node …/say.mjs relay "<the owner's words, verbatim>"
 *   node …/say.mjs both  "<title>" "<text>" "<the owner's words>"      ← answer AND relay
 *
 * Inside the double quotes an apostrophe is fine; write a double quote as a single one and
 * leave out dollar signs and backticks (the shell would eat them). */
const post = posts => {
	for (const p of posts) {
		if (p.card) append(BOARD, { card: { at: now(), ...p.card } });
		if (p.relay) {
			const file = run();
			if (!file) { console.log("No open mastermind run — relay NOT delivered."); continue; }
			append(file, { chat: { at: now(), from: "owner", via: "assistant", msg: p.relay } });
			console.log("relayed to the mastermind's inbox");
		}
	}
	console.log(`posted at ${now()} — it is on the owner's screen`);
};
/* ANYONE CAN WRITE TO THE LOG (the owner, 2026-09-19: "the assistant, the mastermind session and
 * any minion could all write to the log … it's just create new log item … full stream control").
 *
 *   --as <name>      who is speaking: `--as sidebar-repair`, `--as mastermind`. Default: assistant.
 *   --id <id>        post under a steady id, so a later post EVOLVES the same card
 *   --status <s>     working | done | needs-you
 *   chunk <id> "<more text>"     append text to a card that is already on screen — a log item
 *                                that types itself out: post the card, then chunk, chunk, chunk.
 *
 * A `chunk` is its own line — {"chunk": {at, id, text}} — so streaming stays append-only. */
/* --ask "yes,no"  a question with plain buttons — the card gains ask: ["yes","no"].
 *                  --ask "Rewrite small|one script, no PM2;Move Servex in|keeps its UI"
 *                  (";" between options, "|" splits a label from its one-line note)
 *                  gives option CARDS instead: ask: [{label, note}, …].
 * --ask-to <name>  which Claude session the answer rings — a name SendMessage can
 *                  reach, stored on the card as ask_to. Default: the running
 *                  mastermind's own session name (mastermind_session() above), so a
 *                  card with --ask and no --ask-to still knows where to ring. */
function parse_ask(spec){
	if (spec.includes(";")) return spec.split(";").map(s => s.trim()).filter(Boolean).map(opt => {
		const i = opt.indexOf("|");
		return i > -1 ? { label: opt.slice(0, i).trim(), note: opt.slice(i + 1).trim() } : { label: opt };
	});
	return spec.split(",").map(s => s.trim()).filter(Boolean);
}

const argv = process.argv.slice(2), flags = {};
/*   --icon <name>    a Material icon name for the dashboard card's face (warning, mic, bug_report…)
 *   --re <id>        the owner card this one ANSWERS — the dashboard morphs that "heard" card into this one */
/*   --parent <id>    this card lives INSIDE that card: the dashboard shows it in the parent's top-three preview */
/*   --focus          (no value) this card is what the owner is asking about RIGHT NOW: the dashboard makes it the biggest */
const focus = argv.includes("--focus"); if (focus) argv.splice(argv.indexOf("--focus"), 1);
for (const flag of ["as", "id", "status", "icon", "re", "parent", "ask-to"]) {
	const i = argv.indexOf("--" + flag);
	if (i > -1) { flags[flag] = argv[i + 1]; argv.splice(i, 2); }
}
let ask;
{
	const i = argv.indexOf("--ask");
	if (i > -1) { ask = parse_ask(argv[i + 1] ?? ""); argv.splice(i, 2); }
}
if (ask && !flags["ask-to"]) flags["ask-to"] = mastermind_session();
if (ask && !flags["ask-to"]) console.warn("say.mjs --ask: no mastermind session is open to ring by default — pass --ask-to, or the card will have nowhere to send the answer.");

const author = flags.as ?? "assistant";
const stamp = () => flags.id ?? (author === "assistant" ? "a-" : author.slice(0, 12) + "-") + now().slice(11, 19).replaceAll(":", "");
const [arg, one, two, three] = argv;

if (!arg || arg === "state") state();
else if (arg === "say") post([{ card: { id: stamp(), author,
	...(flags.status ? { status: flags.status } : {}), ...(flags.icon ? { icon: flags.icon } : {}), ...(flags.re ? { re: flags.re } : {}), ...(flags.parent ? { parent: flags.parent } : {}), ...(focus ? { focus: true } : {}),
	...(ask ? { ask, ask_to: flags["ask-to"] ?? null } : {}),
	title: one, text: two ?? "" } }]);
else if (arg === "chunk") { append(BOARD, { chunk: { at: now(), id: one, text: two ?? "" } }); console.log("chunk appended"); }
/* heard "<the owner's words, verbatim>" — the echo: their exact words go on THEIR screen as
   their own card (author: owner) and into the mastermind's inbox, in one command that needs
   no thought. The assistant runs it FIRST, before it even considers an answer. */
else if (arg === "heard") post([
	{ card: { id: "o-" + now().slice(11, 19).replaceAll(":", ""), author: "owner", title: String(one ?? "").slice(0, 90), text: one ?? "" } },
	{ relay: one },
]);
else if (arg === "relay") post([{ relay: one }]);
else if (arg === "both") post([{ card: { id: stamp(), title: one, text: two ?? "" } }, { relay: three }]);
else {
	const posts = [JSON.parse(fs.readFileSync(arg, "utf8"))].flat();
	post(posts);
}

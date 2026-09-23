/* MIGRATE-CARDS — folds today's `ai/board.jsonl` and Servex's `prompts` log into
 * one append-only file per card, `cards/<slug>`, written only through Servex's
 * `Log` (decision `card-storage`, ai2-nested). `ai/board.jsonl` stays the index —
 * this script only ever WRITES new per-card files; it never edits or deletes
 * anything already on disk. Safe to run twice: a second run re-derives the same
 * per-card lines and appends them again (Log.js has no idempotency of its own),
 * so run it once per real migration and keep the printed counts as the receipt.
 *
 * Usage:
 *   node Servex/proof/migrate-cards.mjs --board <path> --prompts <path> --verdicts <path>
 *
 * All three default to the real repo files. `SERVEX_HOME` (env) decides where
 * the per-card files land, exactly as it does for every other Servex log — set
 * it to a scratch folder to prove this without touching the real one.
 *
 * WHAT MOVES, AND WHY. `fold()` (the same, unmodified `log-model/fold.js` every
 * other reader of these logs already trusts) groups every event by id and links
 * a `re` back to its target — that is the ENTIRE folding logic, reused rather
 * than rewritten, because two independent forks of "how do these events nest"
 * is exactly the bug `Log.js`'s own naming-rule comment warns about. A card's
 * own board lines (after its first — the first stays the index's own creation
 * line, never migrated) become `reply`/`archive` events; a card's *children* —
 * every prompt, refined reading, name, task or proposal whose `re` names it —
 * move over verbatim, `type` and all, because they already are the shape
 * `cards/<slug>.jsonl` wants. Flags from `ai/verdicts.jsonl` join as `flag`
 * events matched by `id`, the one field that log actually uses instead of `re`. */

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");

const arg = (name, dflt) => {
	const i = process.argv.indexOf(`--${name}`);
	return i === -1 ? dflt : process.argv[i + 1];
};

const BOARD_PATH = arg("board", path.join(REPO, "public/framework/ai/board.jsonl"));
const PROMPTS_PATH = arg("prompts", path.join(REPO, "public/framework/ai/prompts.jsonl"));
const VERDICTS_PATH = arg("verdicts", path.join(REPO, "public/framework/ai/verdicts.jsonl"));

const { default: Log } = await import("../Log.js");
const { fold, parse } = await import(pathToFileURL(
	path.join(REPO, "public/framework/ai/2026-09-22/log-model/fold.js")
));

function read(file){
	try { return fs.readFileSync(file, "utf8"); }
	catch { return ""; }
}

/* A slug the same way the decision describes it: the card's own id, lower-cased
 * and stripped to what `Log.js`'s `CARD_NAME` pattern accepts. Most ids already
 * ARE a locked, readable name (`open-mic`, `padding-law`); an auto-minted
 * `topic-<base36>` id from `+ New card` becomes its own slug unchanged — still
 * unique, still valid kebab-case, just not pretty yet. Giving every card a
 * proper name is the assistant's own naming-rules job (`Log.js`'s `name` /
 * `rename` / `approve`), not this script's — that is a fast-follow, logged as
 * a decision below rather than built here on a migration script's budget. */
function slugify(id){
	return String(id ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

/* Board lines are `{card: {...}}`, TaskJSONL's own verb wrapping — `fold()`
 * wants a flat `{type: "card", ...}`, the same shape Servex's own logs already
 * use. Only `card` lines matter here; a `say` echo or a `chunk` fragment (the
 * composer's own typing echo) is not a card event. */
function board_entries(text){
	return parse(text)
		.map(line => line.card)
		.filter(Boolean)
		.map(c => ({ type: "card", ...c }));
}

function prompt_entries(text){
	return parse(text);
}

/* `ai/verdicts.jsonl` is `{verdict: {id, say, note, quote, by, at}}` — matched
 * by `id`, not `re` (`inbox.js`'s own `Says` reads it the same way), so it is
 * folded separately rather than fed through `fold()`, which only ever links by
 * `re`. */
function verdict_entries(text){
	return parse(text).map(line => line.verdict).filter(v => v?.id);
}

async function main(){
	const board_text = read(BOARD_PATH);
	const prompts_text = read(PROMPTS_PATH);
	const verdicts_text = read(VERDICTS_PATH);

	if (!board_text) console.warn(`(no board at ${BOARD_PATH} — nothing to migrate)`);

	const board = board_entries(board_text);
	const prompts = prompt_entries(prompts_text);
	const verdicts = verdict_entries(verdicts_text);

	// One id space, so a prompt's `re` can find a card that came from the OTHER
	// file — exactly what `threads()` in `ai2/inbox.js` does client-side, reused
	// here through the same `fold()` instead of a second implementation of it.
	const all_entries = [...board, ...prompts];
	const out = fold(all_entries);

	const log = new Log();
	let events_in = 0, events_out = 0, refused = 0, cards_written = 0;
	const per_card = [];

	for (const [id, card] of Object.entries(out.cards)){
		const slug = slugify(id);
		if (!slug){ console.warn(`skipping card with no usable slug: ${JSON.stringify(id)}`); continue; }

		// The FIRST history line is the card's creation — that stays the index's
		// job (`board.jsonl`) and is never migrated. Everything after it is a
		// real change worth keeping as an event.
		const later = card.history.slice(1);
		const card_flags = verdicts.filter(v => v.id === id);
		// Same heuristic `ai2/inbox.js`'s own `author_of()` uses — most board
		// lines carry no explicit `author` at all, so the id's own prefix is
		// what decides "owner" from "mastermind" client-side too.
		const default_by = e => e.author ?? e.by ?? (/^o-/.test(id) ? "owner" : /^a-/.test(id) ? "assistant" : "mastermind");

		const events = [
			...later.map(e => e.status === "archived"
				? { type: "archive", by: default_by(e), at: e.at, re: id }
				: { type: "reply", by: default_by(e), at: e.at, re: id, from: "board", raw: e }),
			...card.children,   // already typed: prompt / refined / name / task / proposal, `re` already this id
			...card_flags.map(v => ({ type: "flag", by: v.by ?? "owner", at: v.at, say: v.say, note: v.note, quote: v.quote, re: id })),
		];

		if (!events.length) continue;   // a card with only its creation line has nothing to migrate yet

		events_in += events.length;
		let written = 0;

		for (const e of events){
			const result = await log.append(`cards/${slug}`, e);
			if (result.ok){ written++; events_out++; }
			else { refused++; console.warn(`refused on "${slug}": ${result.why} — ${JSON.stringify(e).slice(0, 200)}`); }
		}

		cards_written++;
		per_card.push({ id, slug, events: written });
	}

	log.close();

	console.log(`\ncards folded: ${cards_written}`);
	console.log(`events in:  ${events_in}`);
	console.log(`events out: ${events_out}${refused ? ` (${refused} refused — see warnings above)` : ""}`);
	console.log(events_in === events_out ? "COUNTS AGREE." : "COUNTS DISAGREE — see warnings above.");
	console.log(`\nSERVEX_HOME: ${process.env.SERVEX_HOME || "(default — %LOCALAPPDATA%/lew42/servex)"}`);

	return { cards_written, events_in, events_out, refused, per_card };
}

// Importable for a proof script to call `main()` directly against a scratch
// SERVEX_HOME/board/prompts, or run standalone: `node migrate-cards.mjs`.
if (import.meta.url === pathToFileURL(process.argv[1]).href){
	const result = await main();
	process.exit(result.events_in === result.events_out ? 0 : 1);
}

export { main, slugify };

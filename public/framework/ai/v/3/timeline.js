import { JSONL } from "../../../ext/JSONL/JSONL.js";

/**
 * The ONE model behind both readers of `board.jsonl` — the dev bar's "the
 * mastermind log" (`dev/DevBar/says.js`) and this realm's own `page.js`: the
 * same file, the same merge-by-id, the same author and status vocabulary, so
 * the two views can never drift into disagreeing about what a card IS.
 *
 * Each view still builds its OWN chrome over these shared primitives —
 * compact cards you scroll in the dev bar, one roomy column of conversation
 * here — because they answer different questions ("what just happened, at a
 * glance" vs "read the whole thing") ­— but the DATA, and the rules for
 * reading it, live here once.
 *
 * (2026-09-19, the owner, on seeing the same cards twice in two shapes: "I
 * think we might actually want a timeline, a joint timeline.")
 *
 * The DATA moved on 2026-09-19 (`ai/2026-09-19/v3-data/`): it used to live
 * inside this template dir (`./board.jsonl`), which is exactly the "data
 * saved inside a version dir" the owner objected to. It now lives at
 * `ai/board.jsonl`, next to `handover.md` and `usage.jsonl` — version-
 * agnostic files every dashboard can read, outside every `v/<n>/` dir. `BOARD`
 * below is unrelated to that file: it is only the URL PREFIX this version's
 * own pages live under, used for building a card's own route
 * (`history.pushState`) — never for finding the data. `LOG_URL` is the one
 * name that actually answers "where is the file": resolved once, here, so a
 * reader (`page.js`, `dev/DevBar/says.js`) never hard-codes the path itself.
 *
 * `VERDICTS_URL` (`ai/2026-09-19/inbox-zero/`) follows the exact same rule,
 * for the exact same reason — the owner, verbatim: "the data should not be
 * saved in the ai/v/3/ dir... the actual ai tasks and whatnot is template
 * (v3) agnostic, and should be stored like the rest." A verdict judges a
 * board CARD, not this version's own UI (that stays in `Page.Store`, per-
 * browser) — a future v4 would need the exact same verdicts on the exact
 * same cards, so the file lives beside `board.jsonl`, not inside this
 * folder, and this is the one place that resolves it.
 */
export const BOARD = "/framework/ai/v/3/";
export const LOG_URL = import.meta.resolve("../../board.jsonl");
export const VERDICTS_URL = import.meta.resolve("../../verdicts.jsonl");

export class Timeline extends JSONL {
	static verbs = [...JSONL.verbs, "card", "chunk"];
	cards = [];
	// An ORDERED, append-only log of streaming fragments — never merged into
	// `cards`, which stays the ground truth written only by real `card` lines.
	// A renderer wanting the "typing itself out" effect reads new entries here
	// since it last looked; a renderer that does not care (a cold page load,
	// or the V3 page before it grows its own live view) can ignore it and
	// still show the right FINAL text once the real `card` line lands.
	chunks = [];

	/* Merge by id, IN PLACE — the array slot an id first lands in is the slot
	   it keeps (oldest-to-newest reading order falls out of that for free: a
	   card's position is when it was FIRST seen, an update never moves it).
	   ⚠ Every merge REPLACES the slot with a NEW object, never mutates the old
	   one — both readers ask "is this the same object I last rendered, or did
	   it change" to decide whether to touch the DOM at all, and a mutate
	   (`Object.assign(known, value)`, the pattern `TaskJSONL`'s own `ask()`/
	   `decision()` use) would make that question always answer "no change",
	   updated or not, because the object in `cards` and the one already
	   rendered would always be the same reference.
	   A `say`-with-no-`title` line is the dev bar composer's own optimistic
	   echo of what the owner just typed — never a card on the timeline. */
	card(value) {
		if (value.say && !value.title) return;
		const i = value.id != null ? this.cards.findIndex(c => c.id === value.id) : -1;
		if (i === -1) this.cards.push(value);
		else this.cards[i] = { ...this.cards[i], ...value };
	}

	/* `{id, at, text}` — one fragment of a card that is still being typed out.
	   Recorded, never merged into `cards` (see `chunks` above) — a `card` line
	   arriving later with the real, whole text is what actually finalises it. */
	chunk(value) {
		if (value.id == null || !value.text) return;
		this.chunks.push(value);
	}

	reset() { this.cards = []; this.chunks = []; return super.reset(); }
}

export const STATUS = { working: "working", done: "done", "needs-you": "needs you" };
export const status_word = s => STATUS[s] ?? s;

/**
 * WHO — "owner", "assistant", "mastermind", or a MINION's own task slug (e.g.
 * "sidebar-repair": every minion posts under its own name, not one shared
 * "minion" bucket). An explicit `author` field wins, whatever string it
 * carries; the id PREFIX the owner's and the assistant's own posts already
 * mint (`o-<HHMMSS>`, `a-<HHMMSS>`) is the fallback for an older line that
 * predates the field but still carries the prefix; a line with neither —
 * every card from before this existed — is the mastermind's own, which is
 * why it alone needs no marker.
 */
export function author_of(c) {
	if (c.author) return c.author;
	if (typeof c.id === "string" && /^o-/.test(c.id)) return "owner";
	if (typeof c.id === "string" && /^a-/.test(c.id)) return "assistant";
	return "mastermind";
}

/* The three fixed voices read as words; anything else IS already a readable
   word — a minion's own task slug — so it labels itself. */
const AUTHOR_WORD = { owner: "you", assistant: "assistant", mastermind: "mastermind" };
export const author_label = author => AUTHOR_WORD[author] ?? author;

/** "owner" | "assistant" | "mastermind" | "minion" — which of the four this
    author reads as for STYLING (every minion slug shares one look). */
export const author_kind = author => AUTHOR_WORD[author] ? author : "minion";

export const clock = at => at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

/** A card's own text, one paragraph per line — the owner's whole prompt, or
    the mastermind's own written-out answer, alike. */
export const text_lines = c => String(c.text ?? "").split(/\n/).filter(Boolean);

/** Cards that need the owner's yes RIGHT NOW — the pinned strip both views
    show above their own stream, so a request for a yes is never buried under
    everything said since. */
export const needing_you = cards => cards.filter(c => c.status === "needs-you");

export default Timeline;

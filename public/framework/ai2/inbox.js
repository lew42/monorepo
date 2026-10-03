import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { fold } from "/framework/ai/2026-09-22/log-model/fold.js";
import { fold_card, parse_lines, summary } from "./fold.js";
import { fold_asks } from "../ai/asks/fold.js";
import { importance, silent_hours } from "./needs-rule.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";

export { fold };

/** THE INBOX ORDER (INBOX ZERO, 2026-09-30). A row scoring HOT (≥90 on `importance()`,
 *  needs-rule.js: a blocker, a question a live agent is blocked on, or anything else while it
 *  is still fresh) sits on top, highest first; everything else stays newest first. `page.js`
 *  sorts with this same function after it sets each card row's own score, so there is one
 *  order, never two. */
export const HOT = 90;
const hot = it => (it.score >= HOT ? it.score : 0);
export const inbox_order = (a, b) => (hot(b) - hot(a)) || (Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0));

/**
 * THE INBOX MODEL — three logs in, one list of cards out.
 *
 * The page draws; this file decides what there is to draw. Nothing here knows
 * about the DOM, which is why the whole "what is a card" question can be read
 * in one place.
 *
 * The three sources, and what each one is:
 *
 *   1. `ai/board.jsonl` — what the mastermind and the minions posted. One
 *      `card` line per thing; more lines with the same `id` update it in
 *      place. A card whose title starts with "Note:" is an explanation the
 *      mastermind wrote for the owner, and it reads as a note, not a report.
 *   2. Servex's own `prompts` log — the owner's spoken and typed sentences,
 *      and everything the fast assistant made of them seconds later. One
 *      card per PROMPT, which then grows a title, a reading and some names
 *      without ever becoming a second card.
 *   3. Today's `ai/<date>/day.jsonl` — the one line a task writes when it
 *      actually lands. "What happened" and "what I said" belong in the same
 *      stream, so a landing is a card here too.
 *
 * And one more log that is not a source but a STATE: `ai/verdicts.jsonl`,
 * where every "I opened this" and every flag lands, one append-only line each
 * (`Server/plugins/CardAnswer.js`'s own `card_say`).
 */

/* ── the logs ───────────────────────────────────────────────────────────── */

export const BOARD_URL = "/framework/ai/board.jsonl";
export const VERDICTS_URL = "/framework/ai/verdicts.jsonl";
export const PROMPTS_FALLBACK = "/framework/ai/prompts.jsonl";

/** `board.jsonl` — cards merged by id, newest fields winning, the exact rule
    every other reader of this file already uses. A `say` line with no title is
    the dev bar composer's own echo of what the owner just typed, never a card. */
export class Board extends JSONL {
	static verbs = [...JSONL.verbs, "card", "chunk"];
	cards = [];
	card(value){
		if (value.say && !value.title) return;
		const i = value.id != null ? this.cards.findIndex(c => c.id === value.id) : -1;
		if (i === -1) this.cards.push(value);
		else this.cards[i] = { ...this.cards[i], ...value };
	}
	chunk(){}   // a half-typed fragment is not a card — the real `card` line finalises it
	reset(){ this.cards = []; return super.reset(); }
}

/**
 * `verdicts.jsonl` — the same append-only file the old board wrote Approve and
 * Improve to. Only the FLAG is read from it now:
 *
 *   `flags`  — the ids flagged RIGHT NOW. An `improve` line puts one in, a
 *              later `reopen` line takes it out again, so pressing the flag
 *              twice leaves no flag and two lines of history.
 *
 * ⚠ `read` LINES ARE IGNORED, on purpose (the owner, 2026-09-22: "when I click
 * on them, they're disappearing — becoming read when I click on them. No no no.
 * I need them all unread again"). Nothing on this page marks a card read any
 * more, and the `read` lines already in the file are not replayed, so every card
 * is unread again. The file still holds them — nothing was deleted — and
 * read/unread comes back later as an explicit, tiny control, never as a side
 * effect of looking at something.
 */
export class Says extends JSONL {
	static verbs = [...JSONL.verbs, "verdict"];
	flags = new Map();
	verdict(v){
		if (!v?.id) return;
		if (v.say === "improve") this.flags.set(v.id, v);
		else if (v.say === "reopen") this.flags.delete(v.id);
	}
	reset(){ this.flags = new Map(); return super.reset(); }
}

/** One line onto `verdicts.jsonl` through the dev server, which also tells the
    mastermind and rings it for a flag — `Server/plugins/CardAnswer.js`. True
    when the server actually took it. */
export async function say(id, word, { note, quote } = {}){
	const answer = await Promise.race([
		Socket.singleton().async_rpc("card_say", { id, say: word, note, quote }),
		new Promise(done => setTimeout(done, 4000, null)),
	]).catch(() => null);
	return answer?.ok === true;
}

/* ── the live prompt log ────────────────────────────────────────────────── */

/**
 * Servex's own log of what the owner said. One fetch for the backlog, one
 * `EventSource` for everything that arrives after — copied from the working
 * client on the old board (`ai/v/3/prompts.js`) rather than imported, because
 * that board is being replaced and this page must not go down with it.
 *
 * Servex may not be running at all. Then the backlog comes from the static
 * `prompts.jsonl` the dictation box falls back to writing, `ok` stays false,
 * and the page says the assistant is off instead of throwing anything.
 */
// servex_base, servex_up and servex_fetch moved to the Inbox extension; re-exported here unchanged.
export { servex_base, servex_up, servex_fetch } from "/framework/core/Page/ext/Inbox/servex.js";
import { servex_base, servex_up, servex_fetch } from "/framework/core/Page/ext/Inbox/servex.js";

/**
 * ONE EVENTSOURCE PER BASE, DEMUXED BY LOG NAME. `prompts` was the only log
 * this page ever read live; a card's own `cards/<slug>` (decision
 * `card-storage`, ai2-nested) is the second, and there can be dozens of those
 * open across a session — one `EventSource` each would be dozens of open
 * sockets for nothing `/api/stream` doesn't already carry on the one it has
 * open. `sources` holds the one connection per base; `streams` holds one
 * entry-list per `(base, log name)`, same shape as the original `prompt_stream`
 * so nothing that already reads `.entries` / `.on()` / `.ready` had to change.
 */
const streams = new Map();
const sources = new Map();

function demux(base){
	if (sources.has(base)) return sources.get(base);
	let source;
	try { source = new EventSource(`${base}/api/stream`); }
	catch { return null; }
	source.addEventListener("log", msg => {
		let frame;
		try { frame = JSON.parse(msg.data); } catch { return; }
		const stream = streams.get(base + "|" + frame.log);
		if (!stream || !frame.entry) return;
		stream.entries.push(frame.entry);
		stream.readers.forEach(reader => reader(frame.entry));
	});
	source.onerror = () => {};   // Servex restarting — EventSource retries by itself
	sources.set(base, source);
	return source;
}

/** The backlog for one Servex log, then everything that arrives after, over the
 *  one shared `EventSource`. `fallback`, when given, is a static file this page
 *  reads instead when Servex itself is not answering — only `prompts` has one. */
export function log_stream(name, { base = servex_base(), fallback } = {}){
	const key = base + "|" + name;
	if (streams.has(key)) return streams.get(key);

	const stream = { entries: [], readers: new Set(), ok: false, ready: null };
	streams.set(key, stream);
	stream.on = reader => { stream.readers.add(reader); return () => stream.readers.delete(reader); };

	stream.ready = servex_fetch(`${base}/log/${name}?n=400`).then(r => (r.ok ? r.json() : null)).catch(() => null)
		.then(list => {
			if (Array.isArray(list)){
				stream.ok = true;
				list.forEach(e => stream.entries.push(e));
				demux(base);
				return stream;
			}
			if (!fallback) return stream;
			return fetch(fallback).then(r => (r.ok ? r.text() : "")).catch(() => "")
				.then(text => { JSONL.parse(text).forEach(e => stream.entries.push(e)); return stream; });
		});

	return stream;
}

/** Every agent moment Servex pushes (`event: agent`), on the SAME connection. */
export function agent_frames(fn, base = servex_base()){
	let off = () => {}, stopped = false;
	servex_up().then(ok => {
		const source = ok && !stopped && demux(base);
		if (!source) return;
		const handler = msg => { try { fn(JSON.parse(msg.data)); } catch {} };
		source.addEventListener("agent", handler);
		off = () => source.removeEventListener("agent", handler);
	});
	return () => { stopped = true; off(); };
}

export const prompt_stream = (base = servex_base()) => log_stream("prompts", { base, fallback: PROMPTS_FALLBACK });

/** One card's own append-only stream, `cards/<slug>` — the store deliverable 1
 *  adds. No static fallback: a card with Servex down simply shows nothing new
 *  until it comes back, same as the live prompt stream does today.
 *  ⚠ A STALLED-ASK ROW's pseudo-id (`ask:<ask id>`, course correction, 2026-09-30) is never a
 *  real card slug, and Servex's `cards/<slug>` route answers a colon in one with 400 — this
 *  short-circuits to an empty, inert stream (the same shape `log_stream()` returns, so every
 *  caller's `.entries`, `.ready` and `.on()` still work) instead of ever asking for it. A
 *  stalled-ask card page's own content comes entirely from its row's `full()` data anyway
 *  (`page.js`'s `card_page()` reads `by_id.get(id)`, this list's own item, not a card log). */
export const card_stream = (slug, base = servex_base()) =>
	slug.startsWith("ask:")
		? { entries: [], readers: new Set(), ok: false, ready: Promise.resolve(null), on: () => () => {} }
		: log_stream(`cards/${slug}`, { base });

/* ── today's landings ───────────────────────────────────────────────────── */

/* ── words for a preview ─────────────────────────────────────────────── */

/** Markdown and link syntax out, whitespace folded — a preview is plain words. */
export const plain = t => String(t ?? "")
	.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
	.replace(/[*_`>#]+/g, "")
	.replace(/\s+/g, " ").trim();

/** The first sentence of some plain words. */
export const first_sentence = t => (String(t).match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? String(t)).trim();

/** A landing's headline: its leading **bold** part when it has one, else its first sentence. */
export const headline = t => {
	const bold = String(t ?? "").trim().match(/^\*\*(.+?)\*\*/s);
	return plain(bold ? bold[1] : first_sentence(plain(t)));
};

export function today_str(){
	const d = new Date(), pad = n => String(n).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

/**
 * Today's `landed — …` lines, STREAMED like the other two logs.
 *
 * ⚠ Not a `fetch()`, and not the socket's `data` event either: the dev server
 * routes EVERY `.jsonl` change to `Tail.changed()`, its own line-streaming
 * wire, and never broadcasts it as a reload — so `data` never fires for one,
 * however plainly the tab has fetched it. Subscribing is the wire that carries
 * it. `doc/logs.md`.
 */
export class Day extends JSONL {
	landings = [];
	opened = [];   // `task opened — …` lines: what the Live card calls a task in progress
	pages = [];    // lines carrying `"page": "/framework/…/"` — an event on that page (real.js)
	log(value){
		super.log(value);
		if (typeof value?.page === "string") this.pages.push({ path: value.page, at: value.at, by: value.by, task: value.task, what: value.msg });
		if (/^task opened\b/.test(value?.msg ?? "")) this.opened.push({ task: value.task, at: value.at,
			sentence: (value.msg ?? "").replace(/^task opened[\s—–-]+/, "") });
		if (!/^landed\b/.test(value?.msg ?? "")) return;
		this.landings.push({ task: value.task, at: value.at, date: this.date,
			sentence: (value.msg ?? "").replace(/^landed[\s—–-]+/, "") });
	}
	reset(){ this.landings = []; this.opened = []; this.pages = []; return super.reset(); }
}

export const day_log = (date = today_str()) =>
	new Day({ url: `/framework/ai/${date}/day.jsonl`, date });

/* ── a stalled ask, as one more Inbox row (course correction, 2026-09-30) ─────────────────
 * The owner: "the inbox and the needs you, that sounds like the same thing... let's forget
 * the needs you page for now and focus on the inbox." So a STALLED line in the asks ledger
 * (`/framework/ai/asks.jsonl`, `Servex/asks/Asks.js`'s own word) becomes one row in THIS
 * list, never a second view. `fold_asks()` is the one vocabulary Servex's own Asks.js folds
 * the same way, so this page and the ledger can never disagree about what is stalled.
 *
 * ⚠ NO NEW POLLER. `items()` below runs synchronously, every time something already live —
 * a prompt, an agent moment, the card list — repaints this page, which on a system with
 * agents running happens often. `stalled_asks()` just refreshes its own cache in the
 * background and returns whatever it already has; a stalled ask is quiet for 2+ hours
 * before it even qualifies, so a few seconds of staleness here changes nothing. */
const ASKS_URL = "/framework/ai/asks.jsonl";
let asks_cache = { rows: [], at: 0, loading: false };

function hours_since(at, now = Date.now()){
	const t = at ? Date.parse(at) : NaN;
	return Number.isFinite(t) ? Math.max(0, (now - t) / 3600000) : 0;
}

/** How long an ask has sat quiet, in words — the row's own quiet line, and also handed to
 *  `importance()` as `hours_silent` so the row and its own rank can never disagree. */
function silent_words(hours){
	if (hours < 1) return Math.round(hours * 60) + " min";
	if (hours < 48) return hours.toFixed(1) + " h";
	return Math.round(hours / 24) + " d";
}

/** A ledger `words` path as a served url under `/framework/`, or `null` when it is not
 *  served at all (`.claude/prompts/...` — a words file to show as plain text instead of a
 *  dead link). */
function words_url(words){
	if (!words || words.startsWith(".claude/")) return null;
	return "/framework/" + String(words).replace(/^\/+/, "");
}

function fetch_asks(){
	return fetch(ASKS_URL, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "")
		.then(text => {
			const folded = text ? fold_asks(parse_lines(text)) : {};
			const rows = Object.values(folded).filter(a => a.status === "stalled");
			asks_cache = { rows, at: Date.now(), loading: false };
			return rows;
		});
}

/** Every STALLED ask right now, from the cache — refreshing itself in the background (see
 *  the comment above) rather than making every caller await a fetch. */
function stalled_asks(){
	if (Date.now() - asks_cache.at > 15000 && !asks_cache.loading){
		asks_cache.loading = true;
		fetch_asks();
	}
	return asks_cache.rows;
}

/** The same rows, but AWAITABLE — for the one caller that cannot live with a cold, empty
 *  cache: `resolve_card()`'s "ask:" redirect, which can run within the first few
 *  milliseconds of a fresh page load (a pasted or bookmarked `/ask:.../` url), before
 *  `items()` has ever run once to warm `stalled_asks()`'s own cache the normal way. */
async function stalled_asks_ready(){
	if (asks_cache.at) return asks_cache.rows;                         // already warm
	if (!asks_cache.loading){ asks_cache.loading = true; return fetch_asks(); }
	return new Promise(resolve => {                                    // someone else's fetch is in flight
		const check = () => (asks_cache.loading ? setTimeout(check, 50) : resolve(asks_cache.rows));
		check();
	});
}

/** A stalled-ask row's read state (course correction: "unread is bold, read is plain", and
 *  opening it once reads it). It is the Inbox's OWN read state — the same localStorage key
 *  `rules.js` `is_read()`/`mark_read()` use, so the row's dot and page.js's `paint()` agree.
 *  The key is repeated here, not imported, because rules.js imports this file (a cycle).
 *  Opening marks ONLY a stalled row read; every other row still waits for its dot. */
const READ_KEY = "ai2-read-ids";   // = rules.js READ_KEY
function read_ids(){
	try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]")); } catch { return new Set(); }
}
function mark_ask_read(id){
	try { const s = read_ids(); s.add("ask:" + id); localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch {}
}
function ask_is_read(id){ return read_ids().has("ask:" + id); }

/* ── the one list ───────────────────────────────────────────────────────── */

const AUTHOR_WORD = { owner: "you", assistant: "assistant", mastermind: "mastermind" };
const author_of = c => c.author ?? (/^o-/.test(c.id ?? "") ? "owner" : /^a-/.test(c.id ?? "") ? "assistant" : "mastermind");
export const author_word = a => AUTHOR_WORD[a] ?? a;

/** WHO MADE A CARD, as a plain role word — or null. A card folder's `by` is
    usually an agent's id (`minion-ai2-groups`, `health-watch`), and an id is
    never shown in a card's head (the owner, 2026-09-24). */
export const role_word = by => {
	const b = String(by ?? "");
	if (AUTHOR_WORD[b]) return AUTHOR_WORD[b];
	if (/assistant/.test(b)) return "assistant";
	if (/mastermind/.test(b)) return "mastermind";
	if (/^minion/.test(b)) return "minion";
	return null;
};

/**
 * THE ID OF A LOG ENTRY — its own `id` when it has one, and otherwise one made
 * from its timestamp.
 *
 * Servex mints ids now, but the oldest lines still inside its window (and the
 * first lines of the static `prompts.jsonl` fallback) were written before it
 * did. Those entries still need an id, because the id is what a `read` mark and
 * a flag are attached to — and it has to be STABLE. The obvious choice, the
 * entry's position in the list, is not: the log is a rolling window, so
 * `prompt-0` means a different sentence every time an older line falls off the
 * end, and a flag the owner put on one sentence would quietly reappear on
 * another. A timestamp does not move.
 */
export const entry_id = e => e.id ?? `${e.type ?? "e"}@${e.at ?? ""}`;

/** What a line is answering, ALWAYS as a list. ⚠ `re` is a bare id on a `name`
    line and an ARRAY on a `card` line — the assistant can title one idea it read
    across several sentences — and reading it as a string alone silently drops
    every one of the array kind (measured on the live log, `ai/talk/`). */
export const refs = e => (Array.isArray(e?.re) ? e.re : e?.re ? [e.re] : []);

/**
 * A NEW CARD TO TALK INTO — a real `card` line on `ai/board.jsonl`, not a thing
 * this page remembers by itself.
 *
 * That choice is the whole reason it works with nothing else built: the board is
 * already streamed into this page line by line, already merges later lines with
 * the same id in place, and is already what every other reader of this repo
 * looks at. So the card appears in the rail by the same route a minion's card
 * does, the assistant can evolve it by appending another line with the same id,
 * and it survives a reload without a scrap of browser storage.
 */
/* Local time with its offset — the same format `say.mjs` and Servex's own
 * `stamp()` write, so one line's clock reads the same as every other writer's
 * instead of a bare `.toISOString()`'s UTC "Z" standing out on its own. */
const stamp = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + p(Math.trunc(off / 60)) + ":" + p(off % 60);
};

export async function new_card(title = "New card"){
	const id = "topic-" + Date.now().toString(36);
	const line = { card: { id, title, at: stamp(), icon: "forum",
		author: "owner", text: "" } };
	await FsFile.append(BOARD_URL, line);
	return id;
}

/** Nothing is ever deleted (the owner, 2026-09-22) — `clear` on a card page
 *  writes one more board line, `status: "archived"`, merged onto whatever is
 *  already there by id; `items()`'s own filter is what then hides it and its
 *  count. Scoped to board-born cards (`+ New card`'s own `topic-…` ids) — the
 *  ones the owner actually meant ("four new cards labelled you"). */
export async function archive_card(id){
	const line = { card: { id, status: "archived", by: "owner", at: stamp() } };
	await FsFile.append(BOARD_URL, line);
}

/* ── card folders: one folder per card (Servex/cards) ─────────────────────
 *
 * A card is a folder under `ai/`, and its id is its path there:
 * `2026/09/24/fix-the-sidebar`, a sub-card one segment deeper. Servex's
 * `Cards` is the only writer; this page asks it through four routes and never
 * builds a folder itself. A card's own page reads its `page.jsonl` straight
 * off the dev server (`card.js`), so only the LIST and the WRITES go through
 * Servex. */

/** A folder card's id always starts with its four-digit year; an old board id never does. */
export const is_folder_id = id => /^\d{4}\//.test(String(id ?? ""));

const TYPE_ICON = { card: "forum", question: "help", request: "assignment", "sub-question": "contact_support", note: "sticky_note_2", task: "task_alt", group: "workspaces" };
export const type_icon = type => TYPE_ICON[type] ?? "forum";

/**
 * DOES THIS SERVEX HAVE THE CARD ROUTES? Asked once per page: a Servex running
 * the card code appends `{"cards": 1}` to its `features` log when it boots.
 * An older Servex answers `/log/features` with `[]` (and a CORS header, so no
 * console error) — then every card call below returns null WITHOUT a request,
 * because an old Servex answers `/cards` with no CORS header and the browser
 * logs that as an error nothing can hide. `cards_ready.known` is the answer
 * once it is in, for code that draws synchronously.
 */
let ready = null;
export function cards_ready(){
	return ready ??= servex_fetch(servex_base() + "/log/features?n=20")
		.then(r => (r.ok ? r.json() : []))
		.then(list => Array.isArray(list) && list.some(e => e?.cards))
		.catch(() => false)
		.then(ok => (cards_ready.known = ok));
}
cards_ready.known = false;

/* ⚠ Servex answers an unknown route with its dashboard's HTML at 200, so
 * `r.ok` is not enough — the content-type is the 404, as everywhere here. */
async function servex_json(path, body){
	if (!(await cards_ready())) return null;
	const init = body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {};
	const r = await servex_fetch(servex_base() + path, init).catch(() => null);
	if (!r || !(r.headers.get("content-type") ?? "").includes("json")) return null;
	return r.json().catch(() => null);
}

/** `POST /card/create` — `{ok, id, url}`, or null when Servex has no card routes. */
export const create_card = ({ parent, title = "New card", type = "card" } = {}) =>
	servex_json("/card/create", { parent, title, type, by: "owner" });

/** `POST /card/append?id=` — one line onto a card, `{"type": …}`, `{"status": …}`, `{"prompt": …}`. */
export const append_card = (id, line) => servex_json("/card/append?id=" + encodeURIComponent(id), line);

/* ── READS ARE STATIC FILES (no Servex) ───────────────────────────────────
 * Production is a static site, so the list and every card's state come off
 * plain files: `ai/cards.jsonl` (one summary per line; Servex only keeps it
 * fresh) and each card's own `page.jsonl`. The index replaces walking ~400
 * folders. Missing index: walk the year → month → day pages, top-level cards
 * only. Servex answers only what a file cannot: writes, live agents, push. */
const AI_ROOT = new URL("../ai/", import.meta.url).pathname;
const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok && !(r.headers.get("content-type") ?? "").includes("html") ? r.text() : "")).catch(() => "");

async function walk_cards(){
	const kids = async dir => parse_lines(await read_text(AI_ROOT + dir + "page.jsonl")).filter(l => l.file).map(l => dir + l.file.replace(/page\.jsonl$/, ""));
	let dirs = ["2026/"];
	for (let depth = 0; depth < 2; depth++) dirs = (await Promise.all(dirs.map(kids))).flat();   // → day folders
	const ids = (await Promise.all(dirs.map(kids))).flat().map(d => d.replace(/\/$/, ""));
	const rows = await Promise.all(ids.map(async id => fold_card(id, parse_lines(await read_text(AI_ROOT + id + "/page.jsonl")))));
	return rows.map(summary);
}

/** Every card's summary, or null when there is neither an index nor a walkable tree. */
export async function static_cards(){
	const text = await read_text(AI_ROOT + "cards.jsonl");
	const rows = text ? parse_lines(text).filter(r => r.id) : await walk_cards().catch(() => []);
	return rows.length ? rows : null;
}

/** One card's folded state, read off its `page.jsonl` — no Servex. An OLD (non-folder) id
 *  still asks Servex, which alone knows the legacy map.
 *  ⚠ A STALLED-ASK ROW's id (`ask:<ask id>`) is never a folder id, so it fell through to
 *  Servex and 404'd — `card_page()` (page.js, untouched by this fence) then correctly shows
 *  its own row's `full()` content (the ask's title, why and links), but this extra check is
 *  what makes its own OLD-ID-SWAP logic redirect straight to the real card when it has one,
 *  exactly like a migrated board id already does — no page.js change needed for that hop. */
export async function resolve_card(id){
	if (is_folder_id(id)){
		const text = await read_text(AI_ROOT + id + "/page.jsonl");
		if (text) return fold_card(id, parse_lines(text));
	}
	if (id.startsWith("ask:")){
		// Awaited, not the plain cache read `items()` uses — see `stalled_asks_ready()`'s own
		// comment: this can run before anything else has warmed the cache at all.
		const rows = await stalled_asks_ready();
		const ask = rows.find(a => "ask:" + a.id === id);
		// ⚠ MARKED READ RIGHT HERE, not only by `items()`'s own `location.pathname` check below
		// — a has-a-card ask REDIRECTS the instant this resolves (page.js's own `activated()`,
		// right after this call), so the browser may never sit on this url long enough for any
		// `paint()` to see it as `location.pathname` at all. This is the one place that always
		// runs exactly when the owner opened it, has-a-card or not.
		if (ask) mark_ask_read(ask.id);
		if (ask?.card) return { id: ask.card };
		return null;
	}
	return servex_json("/card?id=" + encodeURIComponent(id)).then(s => (s?.id ? s : null));
}

/**
 * THE OWNER'S WORDS, AS A RECORD OF THEIR OWN (the owner, 2026-09-24: "Every
 * prompt that I make is very tangible. It's a quotation"). One `prompt` line
 * on the card, `raw` verbatim; Servex stamps its `id` and `at`, and a later
 * line with the same id is the cleaned reading. `Servex/cards/readme.md`
 * defines the shape.
 *
 * `context` (optional) is the drawer's chips — the elements picked on the
 * page — carried along so the card-assistant sees what the words are about,
 * not just the words (ext/drawer/doc/select.md's `item()` shape). Typed and
 * dictated words both go through this one function, so neither send path can
 * drop it on its own.
 */
export const card_prompt = (id, words, via, context) => append_card(id, {
	prompt: { raw: words, text: words, via, on: id, url: location.pathname, ...(context ? { context } : {}) },
});

/**
 * EVERY FOLDER CARD, as Servex's short summaries — `GET /cards?view=all`,
 * `{id, title, type, status, tags, created, last}` each. `ok` stays false when
 * Servex is down or has no card routes; the page then reads `board.jsonl` as
 * it always did.
 *
 * It POLLS, gently: a card's own page streams its own log live, but a line
 * written into some OTHER card (a reply, a new sub-card) only moves that card
 * in the list, and nothing streams the list itself. `refresh()` after this
 * page's own writes makes those appear at once.
 */
export class CardList {
	static every = 20000;

	constructor(...args){ this.assign(...args); this.initialize(); }
	assign(...args){ return Object.assign(this, ...args); }

	initialize(){
		this.cards ??= [];
		this.ok ??= false;
		this.by_id = new Map();
		this.readers = new Set();
	}

	on(fn){ this.readers.add(fn); return () => this.readers.delete(fn); }

	card(id){ return this.by_id.get(id) ?? null; }

	async refresh(){
		const list = await static_cards();
		const ok = Array.isArray(list);
		const next = ok ? list : [];
		if (ok === this.ok && JSON.stringify(next) === JSON.stringify(this.cards)) return this;
		this.ok = ok;
		this.cards = next;
		this.by_id = new Map(next.map(c => [c.id, c]));
		this.readers.forEach(fn => fn(this));
		return this;
	}

	/** Several writes in a row ask for one refresh, not one each. */
	soon(){
		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.refresh(), 300);
	}

	start(){
		this.poll ??= setInterval(() => { if (!document.hidden) this.refresh(); }, this.constructor.every);
		return this.refresh();
	}
}

/** One card's summary as a row of the list `items()` returns. */
export function folder_item(c){
	return {
		id: c.id,
		kind: c.type === "note" ? "note" : "card",
		folder: true,
		type: c.type,
		at: c.last ?? c.created,
		icon: type_icon(c.type),
		title: c.title || "Untitled card",   // never the slug — the owner reads names, not ids
		text: "",
		tags: c.tags ?? [],
		status: c.status,
		links: [],
	};
}

/* Everything one prompt turned into, gathered off the fold's own `children` —
   every line the assistant appends carries `re` pointing back at the prompt it
   answers, which is why this is a few lines and not a search. */
function threads(entries){
	const out = fold(entries.map(e => (e.id ? e : { ...e, id: entry_id(e) })));
	const kids = (thing, type, bin) => (thing?.children ?? [])
		.filter(c => c.type === type).map(c => out[bin][c.id] ?? c);

	return Object.values(out.prompts).map(prompt => {
		const cards = kids(prompt, "card", "cards");
		return {
			prompt,
			card: cards[0] ?? null,
			refined: kids(prompt, "refined", "refined")[0] ?? null,
			names: kids(prompt, "name", "names"),
			proposals: [...kids(prompt, "proposal", "proposals"), ...cards.flatMap(c => kids(c, "proposal", "proposals"))],
			/* A `task` line hangs off the CARD it answers, not the prompt
			   (`Servex/agents/Assistant.js`'s `entry()`), so it is a grandchild
			   here — the Dispatcher keeps rewriting the SAME id's `state` and
			   `now` as a task mastermind works, and the fold's newest-wins
			   merge is what makes that one thing instead of a growing list. */
			task: cards.flatMap(c => kids(c, "task", "tasks"))[0] ?? null,
		};
	});
}

/**
 * THE LIST THE PAGE DRAWS — board cards, prompt threads and today's landings,
 * merged into one stream, unread first and newest first inside that.
 *
 * A landing and a board card can be the SAME piece of work under the same
 * name: the minion posts a card called `padding-audit` and then lands a task
 * called `padding-audit`. That is one thing, so it stays one card, and the
 * landing only adds its sentence and a link to the task page. This is also why
 * "cards on screen" can be counted against "board ids ∪ prompt ids ∪ landed
 * tasks" and the two agree: every source contributes an id, and an id that two
 * sources share contributes it once.
 */
/**
 * `groups` (optional — `Groups`, `groups.js`, passed by `page.js` when it has one built) is
 * how a folder-card row gets its REAL last-activity time instead of the server index's own
 * `last`, which still counts a `servex-heartbeat` notice as activity the same naive way
 * `fold.js`'s `state.last` does (item A, 2026-09-30). `groups.real_at(id)` returns the
 * fold-based recompute once that card's raw lines have been fetched (`Groups.read_cards()`
 * fetches every card touched in the last two days — every card that could plausibly be a hot
 * Inbox row) and `null` otherwise, so this always has a safe fallback to the index. Omitting
 * `groups` entirely (a caller that has none built yet) behaves exactly as before.
 */
export function items({ board, folders, prompts, landed, says, groups }){
	const by_id = new Map();
	const add = item => { by_id.set(item.id, item); return item; };
	const real_at = id => groups?.real_at(id) ?? null;

	/* THE CARD FOLDERS REPLACE THE BOARD when Servex answers — every board card
	   was migrated into a folder (`Servex/cards/migrate.mjs`), so reading both
	   would show each one twice. Servex down: the board, exactly as before. */
	const from_folders = !!folders?.ok;
	// Top-level cards only: a sub-card is listed inside its own card, and a
	// view (`view/all/`) lists every one.
	/* A CARD IS AS NEW AS ITS NEWEST SUB-CARD (the owner, 2026-09-25: "any update to a child
	   bumps the parent's last-updated"), so a topic touched deep down rises in the rail. */
	const newest = new Map();
	if (from_folders) folders.cards.forEach(c => {
		const top = c.id.split("/").slice(0, 4).join("/"), t = real_at(c.id) ?? c.last ?? c.created;
		if (Date.parse(t ?? 0) > Date.parse(newest.get(top) ?? 0)) newest.set(top, t);
	});
	if (from_folders) folders.cards.filter(c => c.id.split("/").length === 4).forEach(c => add({ ...folder_item(c), at: newest.get(c.id) ?? real_at(c.id) ?? c.last ?? c.created }));

	if (!from_folders) board.forEach(c => add({
		id: c.id,
		kind: /^Note:/.test(c.title ?? "") ? "note" : "card",
		at: c.updated_at ?? c.at,
		icon: c.icon,
		title: (c.title ?? c.id ?? "").replace(/^Note:\s*/, ""),
		text: c.text ?? "",
		author: author_of(c),
		status: c.status,
		links: [...(c.links ?? [])],
	}));

	/* A SENTENCE SPOKEN INTO A CARD IS NOT A CARD OF ITS OWN. Every board card's
	   id is known by now, so a prompt whose `re` names one is that card's
	   transcript instead — appended, in the order it was said, never moved (the
	   owner, 2026-09-22: "it's chunking off every sentence I say into its own
	   card… I should be able to create a new card and then talk to that card").
	   A prompt with no `re`, or one citing something this page has never heard
	   of, still starts a card of its own exactly as before. */
	const known = new Set(by_id.keys());

	threads(prompts).forEach(({ prompt, card, refined, names, proposals, task }) => {
		// A sentence spoken into a SUB-card (`<card>/<sub>`) belongs to its card;
		// one spoken into the Live card lives in the Live card's own chat.
		const roots = refs(prompt).map(r => String(r).split("/")[0]);
		if (roots.includes("live")) return;
		// ⚠ With folders, a sentence said INTO a card is already that card's
		// own `prompt` line — and the old board ids its `re` may name are not in
		// this list any more, so "unknown host → a card of its own" would turn
		// every old sentence into a card. Said into anything: never its own card.
		if (from_folders && roots.length) return;
		const host = roots.find(id => known.has(id));
		if (host){
			const into = by_id.get(host);
			(into.transcript ??= []).push({ id: prompt.id, at: prompt.at,
				said: prompt.sentences ?? [prompt.text ?? ""] });
			if (prompt.at && (!into.at || Date.parse(prompt.at) > Date.parse(into.at))) into.at = prompt.at;
			return;
		}
		add({
			id: prompt.id,
			kind: "prompt",
			at: prompt.at,
			icon: card?.icon ?? "mic",
			title: card?.title ?? "You said…",
			text: card?.text ?? "",
			author: "owner",
			said: prompt.sentences ?? [prompt.text ?? ""],
			refined: refined?.text ?? "",
			names: names.map(n => n.name).filter(Boolean),
			proposals: proposals.map(pr => ({ title: pr.title ?? pr.id, shape: pr.shape ?? [] })),
			/* A mastermind has taken this card and is running with it — `state`
			   is `queued` grey, `working` (with `now`, its live progress line),
			   `landed` or `blocked`. `null` when the sentence was a note or a
			   question, which never gets a task line at all. */
			task: task ? { id: task.id, state: task.state, now: task.now, title: task.title, brief: task.brief } : null,
			links: [],
		});
	});

	landed.forEach(l => {
		const url = `/framework/ai/${l.date}/${l.task}/`;
		// A landing whose task has a card folder of the same name IS that card: one row, bumped.
		const known = by_id.get(l.task) ?? (from_folders ? [...by_id.values()].find(x => x.folder && x.id.split("/").pop() === l.task) : null);
		if (known){
			known.landed = l.sentence;
			known.at = Date.parse(l.at ?? 0) > Date.parse(known.at ?? 0) ? l.at : known.at;
			if (!known.links.some(k => k.url === url)) known.links.push({ url, label: "Task page" });
			return;
		}
		add({
			id: l.task, kind: "landed", at: l.at, icon: "task_alt",
			// The landing's own headline, never the task's slug (the owner: "task
			// names that are more like ids").
			title: headline(l.sentence), text: plain(l.sentence) === headline(l.sentence) ? "" : plain(l.sentence),
			author: "task", landed: l.sentence,
			links: [{ url, label: "Task page" }],
		});
	});

	/* A STALLED ASK, AS ONE MORE ROW (course correction, 2026-09-30 — see the long comment
	   on `stalled_asks()` above). `id: "ask:" + ask id` so it can never collide with a real
	   card's own row. Its read state (deliverable 4) is marked by `resolve_card()`, above —
	   NOT by checking `location.pathname` here: a has-a-card ask redirects the instant it is
	   opened (page.js's own `activated()`, right after `resolve_card()` resolves), so the
	   browser may never sit on this row's own url long enough for any `paint()` to see it. */
	stalled_asks().forEach(ask => {
		const hours = silent_hours(ask);
		add({
			id: "ask:" + ask.id, kind: "stalled", at: ask.status_at ?? ask.at, icon: "hourglass_disabled",
			title: ask.title || "Untitled ask",
			text: ask.why ? "Stalled — " + ask.why : "",
			author: "task",
			owner: ask.owner,
			hours_silent: hours,
			// The row's own quiet line (brief's exact words): "Stalled · <owner> · silent 2 h".
			sub: ["Stalled", ask.owner || null, "silent " + silent_words(hours)].filter(Boolean).join(" · "),
			// Opened, it goes to its card when it has one (`resolve_card()`'s own redirect,
			// above); otherwise its links are the only way anywhere, so the ledger goes last.
			links: [
				ask.card ? { url: "/framework/ai2/" + ask.card + "/", label: "its card" } : null,
				words_url(ask.words) ? { url: words_url(ask.words), label: "its words" } : null,
				{ url: "/framework/ai/asks/?status=stalled", label: "the asks ledger" },
			].filter(Boolean),
			read: ask_is_read(ask.id),
		});
	});

	const list = [...by_id.values()];
	// A clock from the future is a hand-typed mistake (a day-log line said 21:10 -07:00 for a
	// 15:53 -05:00 landing, 2026-09-25) and would pin its row to the top forever: it counts as unknown.
	list.forEach(it => { if (Date.parse(it.at ?? 0) > Date.now() + 10 * 60 * 1000) it.at = null; });
	list.forEach(it => {
		// ⚠ ALWAYS unread — nothing marks a card read any more, and the `read`
		// lines already in `verdicts.jsonl` are not replayed. See `Says` above.
		it.unread = true;
		it.flag = says.flags.get(it.id) ?? null;
		it.transcript ??= [];
		// `importance()` (needs-rule.js) — every kind it does not recognise (every kind here
		// except `stalled`, today) falls back to its own low DEFAULT, so this is free to run
		// on the whole list rather than singling out one kind.
		it.score = importance(it, Date.now());
	});
	// A STALLED ROW IS THE ONE EXCEPTION TO "ALWAYS UNREAD" (deliverable 4) — `Says`'s own
	// comment above says why nothing else here has a read state any more; this one does,
	// because the brief asked for it, and it overwrites the blanket `true` just set above.
	list.forEach(it => { if (it.kind === "stalled") it.unread = !it.read; });
	// 2026-09-22 20:00, the owner: "if it doesn't help me, it shouldn't be on the board" — an
	// archived card leaves the rail and the counts; item 12's "archived (n)" foot reads
	// `.archived` off the returned array (still a plain array everywhere else) to show them
	// again, greyed, without a second call or a second shape.
	const archived = list.filter(it => it.status === "archived");
	const sorted = list.filter(it => it.status !== "archived").sort(inbox_order);
	/* NEVER TWELVE OF THE SAME (the owner, 2026-09-25: "recycle the old one if it happened within
	   the last minute or two"). Two rows with the same title less than two minutes apart are one
	   row: the newer is kept, and the older one's words go under it. */
	const last_seen = new Map();
	const shown = sorted.filter(it => {
		const key = String(it.title ?? "").trim().toLowerCase(), t = Date.parse(it.at ?? 0);
		const kept = key && last_seen.get(key);
		if (kept && Math.abs(Date.parse(kept.at ?? 0) - t) < 2 * 60 * 1000){
			if (it.transcript?.length) (kept.transcript ??= []).push(...it.transcript);
			return false;
		}
		if (key) last_seen.set(key, it);
		return true;
	});
	shown.archived = archived;
	return shown;
}

/* ── sub-cards: deliverable 3 ──────────────────────────────────────────────
 *
 * A CARD'S OWN TABLE OF CONTENTS, read off ITS OWN LOG (`cards/<slug>`) —
 * `AI 2 SWITCHES ITS READER`, deliverable 1's own words. Every task, proposal
 * and refined reading is already one thing in `fold()`'s own bins; a
 * transcript paragraph is not, so one row is made per `prompt` entry, which is
 * already one paragraph — a sentence is not a sub-card, a spoken turn is.
 *
 * `sub` is the THIRD URL SEGMENT (`/framework/ai2/<slug>/<sub>/`) — prefixed
 * by kind so a task's own event id (say, `t-1`) can never collide with a
 * proposal's or a prompt's, all three of which mint ids from the same small
 * alphabet independently. */
const SUB_KIND = { task: "task_alt", proposal: "science", refined: "auto_awesome", said: "mic" };

export function sub_rows(entries){
	const out = fold(entries);
	const rows = [];

	for (const t of Object.values(out.tasks)) rows.push({
		sub: `task-${t.id}`, kind: "task", icon: SUB_KIND.task,
		title: t.title ?? "Task", line: t.now ?? t.state ?? "", at: t.at,
	});
	for (const p of Object.values(out.proposals)) rows.push({
		sub: `proposal-${p.id}`, kind: "proposal", icon: SUB_KIND.proposal,
		title: p.title ?? "Proposal", line: (p.shape ?? []).find(Boolean) ?? "", at: p.at,
	});
	for (const r of Object.values(out.refined)) rows.push({
		sub: `refined-${r.id}`, kind: "refined", icon: SUB_KIND.refined,
		title: "Refined reading", line: (r.text ?? "").slice(0, 140), at: r.at,
	});
	for (const pr of Object.values(out.prompts)){
		const said = pr.sentences ?? [pr.text ?? ""].filter(Boolean);
		if (!said.length) continue;
		rows.push({
			sub: `said-${pr.id}`, kind: "said", icon: SUB_KIND.said,
			title: said[0].slice(0, 60), line: said.length > 1 ? `+${said.length - 1} more` : "", at: pr.at,
		});
	}

	rows.sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0));
	return rows;
}

/** One sub-card's own full content, by its `sub` id — used by the third
 *  column, which needs more than the table-of-contents row (a proposal's
 *  whole shape, a task's brief, every sentence of a transcript paragraph). */
export function sub_row(entries, sub){
	const out = fold(entries);
	const [kind, ...rest] = sub.split("-");
	const id = rest.join("-");
	if (kind === "task") return out.tasks[id] ? { ...out.tasks[id], sub, kind, icon: SUB_KIND.task } : null;
	if (kind === "proposal") return out.proposals[id] ? { ...out.proposals[id], sub, kind, icon: SUB_KIND.proposal } : null;
	if (kind === "refined") return out.refined[id] ? { ...out.refined[id], sub, kind, icon: SUB_KIND.refined } : null;
	if (kind === "said"){
		const pr = out.prompts[id];
		if (!pr) return null;
		return { ...pr, sub, kind, icon: SUB_KIND.said, said: pr.sentences ?? [pr.text ?? ""].filter(Boolean) };
	}
	return null;
}

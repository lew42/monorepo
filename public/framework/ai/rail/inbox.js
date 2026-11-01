import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { fold } from "/framework/ai/log/fold.js";
import { Fold } from "../cards/Fold.js";
import CardDir from "../cards/CardDir.js";
import { AskFold } from "../asks/AskFold.js";
import { NeedsRule } from "./NeedsRule.js";
import Inbox from "/framework/core/Page/ext/Inbox/Inbox.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";

export { fold };

// HOT rows (importance >= 90) first, then newest: doc/notes.md#inbox-order
export const HOT = 90;
// An unread owner note outranks even a blocker at 100 (`importance()`): a half point puts it first.
const hot = it => (it.score >= HOT ? it.score + (it.kind === "owner_note" && it.score >= 100 ? 0.5 : 0) : 0);
// One ranking, Inbox.rank (core/Page/ext/Inbox/doc/ranking.md): importance + recency; `hot` stays for callers.
export const inbox_order = (a, b) => (Inbox.rank(b) - Inbox.rank(a)) || (Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0));

/** The inbox model: board, prompts and day logs in, one list of cards out. doc/notes.md#the-inbox-model */


export const BOARD_URL = "/framework/ai/board.jsonl";
export const VERDICTS_URL = "/framework/ai/verdicts.jsonl";
export const PROMPTS_FALLBACK = "/framework/ai/prompts.jsonl";

/** `board.jsonl`: cards merged by id, newest fields winning. A titleless `say` is the composer's echo, not a card. */
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

// Only flags are read; `read` lines are ignored on purpose: doc/notes.md#verdicts-read-lines-are-ignored
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

/** One line onto `verdicts.jsonl` via the dev server (Server/plugins/CardAnswer.js); true when it took it. */
export async function say(id, word, { note, quote } = {}){
	const answer = await Promise.race([
		Socket.singleton().async_rpc("card_say", { id, say: word, note, quote }),
		new Promise(done => setTimeout(done, 4000, null)),
	]).catch(() => null);
	return answer?.ok === true;
}


// Prompt log: backlog fetch then EventSource, static fallback if Servex is down: doc/notes.md#the-live-prompt-log
export { servex_base, servex_up, servex_fetch } from "/framework/core/Page/ext/Inbox/servex.js";
import { servex_base, servex_up, servex_fetch } from "/framework/core/Page/ext/Inbox/servex.js";

// One shared EventSource per base, demuxed by log name: doc/notes.md#one-eventsource-per-base
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

/** Backlog then live entries for one Servex log; `fallback` is a static file read when Servex is down. */
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

/** One card's own stream, `cards/<slug>`. ⚠ `ask:` ids are not slugs (Servex answers 400): inert stream, doc/notes.md#stalled-ask-ids */
export const card_stream = (slug, base = servex_base()) =>
	slug.startsWith("ask:")
		? { entries: [], readers: new Set(), ok: false, ready: Promise.resolve(null), on: () => () => {} }
		: log_stream(`cards/${slug}`, { base });


/** Markdown and link syntax out, whitespace folded — a preview is plain words. Handles objects/arrays cleanly. */
export const plain = t => {
	if (t == null) return "";
	if (typeof t === "object") {
		if (Array.isArray(t)) return t.map(plain).filter(Boolean).join(" · ");
		if (typeof t.text === "string") return plain(t.text);
		if (typeof t.summary === "string") return plain(t.summary);
		if (typeof t.title === "string") return plain(t.title);
		if (typeof t.headline === "string") return plain(t.headline);
		if (typeof t.outcome === "string") return plain(t.outcome);
		if (typeof t.outcome === "object" && t.outcome !== null) return plain(t.outcome);
		if (typeof t.msg === "string") return plain(t.msg);
		try {
			const str = JSON.stringify(t);
			return str.slice(0, 120);
		} catch {
			return "";
		}
	}
	return String(t)
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[*_`>#]+/g, "")
		.replace(/\s+/g, " ").trim();
};

export const first_sentence = t => (String(plain(t)).match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? String(plain(t))).trim();

/** A landing's headline: its leading **bold** part when it has one, else its first sentence. */
export const headline = t => {
	if (t == null) return "";
	if (typeof t === "object") {
		if (typeof t.summary === "string") return headline(t.summary);
		if (typeof t.headline === "string") return headline(t.headline);
		if (typeof t.title === "string") return headline(t.title);
		if (typeof t.text === "string") return headline(t.text);
		if (typeof t.outcome === "string") return headline(t.outcome);
		if (typeof t.outcome === "object" && t.outcome !== null) return headline(t.outcome);
		return plain(t);
	}
	const str = String(t).trim();
	const bold = str.match(/^\*\*(.+?)\*\*/s);
	if (bold) return plain(bold[1]);
	return first_sentence(plain(str));
};

export function today_str(){
	const d = new Date(), pad = n => String(n).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

// ⚠ Streamed, not fetched: the socket's `data` event never fires for .jsonl: doc/notes.md#day-streaming
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
	new Day({ url: `/framework/ai/sessions/${date.replaceAll("-", "/")}/day.jsonl`, date });   // the day log lives in the sessions store (ai/doc/task-folders.md)

// A stalled ask is one more row, from a background-refreshed cache, never a new poller: doc/notes.md#stalled-asks-as-rows
const ASKS_URL = "/framework/ai/asks.jsonl";
let asks_cache = { rows: [], at: 0, loading: false };

function hours_since(at, now = Date.now()){
	const t = at ? Date.parse(at) : NaN;
	return Number.isFinite(t) ? Math.max(0, (now - t) / 3600000) : 0;
}

function silent_words(hours){
	if (hours < 1) return Math.round(hours * 60) + " min";
	if (hours < 48) return hours.toFixed(1) + " h";
	return Math.round(hours / 24) + " d";
}

/** A ledger `words` path as a /framework/ url, or null when it is not served (.claude/). */
function words_url(words){
	if (!words || words.startsWith(".claude/")) return null;
	return "/framework/" + String(words).replace(/^\/+/, "");
}

function fetch_asks(){
	return fetch(ASKS_URL, { cache: "no-store" }).then(r => (r.ok ? r.text() : "")).catch(() => "")
		.then(text => {
			const folded = text ? AskFold.fold(Fold.parse_lines(text)) : {};
			const rows = Object.values(folded).filter(a => a.status === "stalled");
			asks_cache = { rows, at: Date.now(), loading: false };
			return rows;
		});
}

function stalled_asks(){
	if (Date.now() - asks_cache.at > 15000 && !asks_cache.loading){
		asks_cache.loading = true;
		fetch_asks();
	}
	return asks_cache.rows;
}

/** Awaitable `stalled_asks()` for resolve_card(), which can run before the cache is warm. */
async function stalled_asks_ready(){
	if (asks_cache.at) return asks_cache.rows;                         // already warm
	if (!asks_cache.loading){ asks_cache.loading = true; return fetch_asks(); }
	return new Promise(resolve => {                                    // someone else's fetch is in flight
		const check = () => (asks_cache.loading ? setTimeout(check, 50) : resolve(asks_cache.rows));
		check();
	});
}

// Same localStorage key as rules.js (repeated: rules.js imports this file, a cycle): doc/notes.md#stalled-ask-read-state
const READ_KEY = "ai2-read-ids";   // = rules.js READ_KEY
function read_ids(){
	try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]")); } catch { return new Set(); }
}
function mark_ask_read(id){
	try { const s = read_ids(); s.add("ask:" + id); localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch {}
}
function ask_is_read(id){ return read_ids().has("ask:" + id); }


const AUTHOR_WORD = { owner: "you", assistant: "assistant", mastermind: "mastermind" };
const author_of = c => c.author ?? (/^o-/.test(c.id ?? "") ? "owner" : /^a-/.test(c.id ?? "") ? "assistant" : "mastermind");
export const author_word = a => AUTHOR_WORD[a] ?? a;

/** Who made a card as a role word, or null: an agent id is never shown (the owner, 2026-09-24). */
export const role_word = by => {
	const b = String(by ?? "");
	if (AUTHOR_WORD[b]) return AUTHOR_WORD[b];
	if (/assistant/.test(b)) return "assistant";
	if (/mastermind/.test(b)) return "mastermind";
	if (/^minion/.test(b)) return "minion";
	return null;
};

// Stable id for a log entry: its own, else from its timestamp (list position shifts as the log rolls): doc/notes.md#entry-id
export const entry_id = e => e.id ?? `${e.type ?? "e"}@${e.at ?? ""}`;

/** What a line answers, as a list. ⚠ `re` is a string on `name` lines and an array on `card` lines. */
export const refs = e => (Array.isArray(e?.re) ? e.re : e?.re ? [e.re] : []);

/** A real `card` line on board.jsonl, so it reaches the rail by the same route as a minion's card. */
// Local time with offset, the format say.mjs and Servex's stamp() write.
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

/** Never deleted: `clear` appends status "archived" to a board-born card; items() hides it. */
export async function archive_card(id){
	const line = { card: { id, status: "archived", by: "owner", at: stamp() } };
	await FsFile.append(BOARD_URL, line);
}

// Card folders: Servex's Cards is the only writer; list and writes go through it: doc/notes.md#card-folders

/** A folder card's id always starts with its four-digit year; an old board id never does. */
export const is_folder_id = id => /^\d{4}\//.test(String(id ?? ""));

const TYPE_ICON = { card: "forum", question: "help", request: "assignment", "sub-question": "contact_support", note: "sticky_note_2", task: "task_alt", group: "workspaces" };
export const type_icon = type => TYPE_ICON[type] ?? "forum";

// ⚠ An old Servex answers /cards without CORS headers (console error), so probe /log/features first: doc/notes.md#cards_ready
let ready = null;
export function cards_ready(){
	return ready ??= servex_fetch(servex_base() + "/log/features?n=20")
		.then(r => (r.ok ? r.json() : []))
		.then(list => Array.isArray(list) && list.some(e => e?.cards))
		.catch(() => false)
		.then(ok => (cards_ready.known = ok));
}
cards_ready.known = false;

// ⚠ Servex answers unknown routes with HTML at 200: check content-type, not r.ok.
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

// Reads are static files (cards.jsonl index, else walk page.jsonl): doc/notes.md#reads-are-static-files
const AI_ROOT = new URL("../", import.meta.url).pathname;
const read_text = url => fetch(url, { cache: "no-store" }).then(r => (r.ok && !(r.headers.get("content-type") ?? "").includes("html") ? r.text() : "")).catch(() => "");

// ids, not folders: an index page lists its children by slug, and CardDir says where each one's folder is (one tree, 2026-10-13)
async function walk_cards(){
	const kids = async id => Fold.parse_lines(await read_text(CardDir.url(id) + "page.jsonl")).filter(l => l.file).map(l => id + "/" + l.file.replace(/\/?(page\.jsonl)?$/, ""));
	let ids = ["2026"];
	for (let depth = 0; depth < 3; depth++) ids = (await Promise.all(ids.map(kids))).flat();   // year → month → day → card
	const rows = await Promise.all(ids.map(async id => Fold.fold_card(id, Fold.parse_lines(await read_text(CardDir.url(id) + "page.jsonl")))));
	return rows.map(Fold.summary);
}

/** Every card's summary, or null when there is neither an index nor a walkable tree. */
export async function static_cards(){
	const text = await read_text(AI_ROOT + "cards.jsonl");
	const rows = text ? Fold.parse_lines(text).filter(r => r.id) : await walk_cards().catch(() => []);
	return rows.length ? rows : null;
}

/** One card's folded state from its page.jsonl; old ids ask Servex. ⚠ `ask:` ids redirect to their card: doc/notes.md#stalled-ask-redirect */
export async function resolve_card(id){
	// "now" has no fixed folder: resolve the latest ".../now" card: doc/notes.md#the-now-card
	if (id === "now" && !is_folder_id(id)){
		const cards = await static_cards().catch(() => null);
		const latest = (cards ?? []).filter(c => /(^|\/)now$/.test(c.id))
			.sort((a, b) => Date.parse(b.last ?? b.created ?? 0) - Date.parse(a.last ?? a.created ?? 0))[0];
		if (latest) return resolve_card(latest.id);
	}
	if (is_folder_id(id)){
		const text = await read_text(CardDir.url(id) + "page.jsonl");
		if (text) return Fold.fold_card(id, Fold.parse_lines(text));
	}
	if (id.startsWith("ask:")){
		// Awaited: this can run before the cache is warm.
		const rows = await stalled_asks_ready();
		const ask = rows.find(a => "ask:" + a.id === id);
		// ⚠ Marked read here: a card-ask redirects before any paint() sees its url: doc/notes.md#marked-read-in-resolve_card
		if (ask) mark_ask_read(ask.id);
		if (ask?.card) return { id: ask.card };
		return null;
	}
	return servex_json("/card?id=" + encodeURIComponent(id)).then(s => (s?.id ? s : null));
}

/** A `prompt` line on the card, `raw` verbatim; optional `context` is the drawer's chips. See Servex/cards/readme.md. */
export const card_prompt = (id, words, via, context) => append_card(id, {
	prompt: { raw: words, text: words, via, on: id, url: location.pathname, ...(context ? { context } : {}) },
});

/** Servex's card summaries (static index); ok=false means read board.jsonl. Refreshes on a timer and after this page's own writes. */
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
		kind: c.owner_note ? "owner_note" : c.type === "note" ? "note" : "card",
		owner_kind: c.owner_note?.kind ?? null,
		reviewed: c.reviewed ?? null,
		folder: true,
		type: c.type,
		at: c.last ?? c.created,
		icon: c.owner_note ? "campaign" : type_icon(c.type),
		title: c.title || "Untitled card",   // never the slug — the owner reads names, not ids
		text: "",
		preview: c.preview ?? null,
		state: c.state ?? null,
		sub: c.owner_note ? c.owner_note.kind + " · " + c.owner_note.text : c.preview || c.state || null,
		tags: c.tags ?? [],
		status: c.status,
		links: [],
	};
}

// Everything one prompt turned into, gathered from the fold's `children` (assistant lines carry `re`).
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
				// A `task` hangs off the card, not the prompt (a grandchild); newest-wins merge keeps it one row: doc/notes.md#task-lines
			task: cards.flatMap(c => kids(c, "task", "tasks"))[0] ?? null,
		};
	});
}

/** The list the page draws: board cards, prompt threads and landings, one row per id: doc/notes.md#items
 *  `groups` (optional) gives a folder row its real last-activity via `groups.real_at(id)`, else the index's `last`. */
export function items({ board, folders, prompts, landed, says, groups }){
	const by_id = new Map();
	const add = item => { by_id.set(item.id, item); return item; };
	const real_at = id => groups?.real_at(id) ?? null;

	// Folders replace the board when Servex answers (each card was migrated); Servex down: board only.
	const from_folders = !!folders?.ok;
	// A card is as new as its newest sub-card (the owner, 2026-09-25).
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

	// A prompt whose `re` names a known card is that card's transcript, not a card (the owner, 2026-09-22).
	const known = new Set(by_id.keys());

	threads(prompts).forEach(({ prompt, card, refined, names, proposals, task }) => {
		// Spoken into a sub-card belongs to its card; into the Live card, to its chat.
		const roots = refs(prompt).map(r => String(r).split("/")[0]);
		if (roots.includes("live")) return;
		// ⚠ With folders, a sentence said into a card is already its `prompt` line: never its own card.
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
				// task.state: queued, working (with `now`), landed, blocked; null for notes and questions.
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
			title: headline(l.sentence), text: plain(l.sentence) === headline(l.sentence) ? "" : plain(l.sentence),
			author: "task", landed: l.sentence,
			links: [{ url, label: "Task page" }],
		});
	});

	// A stalled ask is one more row (`ask:<id>`); its read state is set by resolve_card(), not here: doc/notes.md#stalled-row
	stalled_asks().forEach(ask => {
		const hours = NeedsRule.silent_hours(ask);
		add({
			id: "ask:" + ask.id, kind: "stalled", at: ask.status_at ?? ask.at, icon: "hourglass_disabled",
			title: ask.title || "Untitled ask",
			text: ask.why ? "Stalled — " + ask.why : "",
			author: "task",
			owner: ask.owner,
			hours_silent: hours,
			sub: ["Stalled", ask.owner || null, "silent " + silent_words(hours)].filter(Boolean).join(" · "),
			links: [
				ask.card ? { url: "/framework/ai2/" + ask.card + "/", label: "its card" } : null,
				words_url(ask.words) ? { url: words_url(ask.words), label: "its words" } : null,
				{ url: "/framework/ai/asks/?status=stalled", label: "the asks ledger" },
			].filter(Boolean),
			read: ask_is_read(ask.id),
		});
	});

	const list = [...by_id.values()];
	// A clock from the future would pin its row on top forever: it counts as unknown: doc/notes.md#future-clocks
	list.forEach(it => { if (Date.parse(it.at ?? 0) > Date.now() + 10 * 60 * 1000) it.at = null; });
	list.forEach(it => {
			// ⚠ Always unread: `read` lines are not replayed (see Says).
		it.unread = true;
		it.flag = says.flags.get(it.id) ?? null;
		it.transcript ??= [];
			// importance() falls back to a low default for kinds it does not know.
		it.score = NeedsRule.importance(it, Date.now());
	});
	// A stalled row is the one exception to "always unread".
	list.forEach(it => { if (it.kind === "stalled") it.unread = !it.read; });
	// Archived cards leave the rail and counts; `.archived` on the result feeds the greyed foot (the owner, 2026-09-22).
	const archived = list.filter(it => it.status === "archived");
	const sorted = list.filter(it => it.status !== "archived").sort(inbox_order);
	// Same title within 2 minutes is one row, the newer kept (the owner, 2026-09-25).
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

// A card's sub-cards are read off its own log; `sub` is the 3rd URL segment, kind-prefixed so ids never collide: doc/notes.md#sub-cards
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

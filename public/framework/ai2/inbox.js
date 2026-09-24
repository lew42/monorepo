import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { fold } from "/framework/ai/2026-09-22/log-model/fold.js";

export { fold };

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
export const servex_base = () => new URLSearchParams(location.search).get("servex") || "http://127.0.0.1:8090";

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

	stream.ready = fetch(`${base}/log/${name}?n=400`).then(r => (r.ok ? r.json() : null)).catch(() => null)
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
	const source = demux(base);
	if (!source) return () => {};
	const handler = msg => { try { fn(JSON.parse(msg.data)); } catch {} };
	source.addEventListener("agent", handler);
	return () => source.removeEventListener("agent", handler);
}

export const prompt_stream = (base = servex_base()) => log_stream("prompts", { base, fallback: PROMPTS_FALLBACK });

/** One card's own append-only stream, `cards/<slug>` — the store deliverable 1
 *  adds. No static fallback: a card with Servex down simply shows nothing new
 *  until it comes back, same as the live prompt stream does today. */
export const card_stream = (slug, base = servex_base()) => log_stream(`cards/${slug}`, { base });

/* ── today's landings ───────────────────────────────────────────────────── */

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
	log(value){
		super.log(value);
		if (/^task opened\b/.test(value?.msg ?? "")) this.opened.push({ task: value.task, at: value.at,
			sentence: (value.msg ?? "").replace(/^task opened[\s—–-]+/, "") });
		if (!/^landed\b/.test(value?.msg ?? "")) return;
		this.landings.push({ task: value.task, at: value.at, date: this.date,
			sentence: (value.msg ?? "").replace(/^landed[\s—–-]+/, "") });
	}
	reset(){ this.landings = []; this.opened = []; return super.reset(); }
}

export const day_log = (date = today_str()) =>
	new Day({ url: `/framework/ai/${date}/day.jsonl`, date });

/* ── the one list ───────────────────────────────────────────────────────── */

const AUTHOR_WORD = { owner: "you", assistant: "assistant", mastermind: "mastermind" };
const author_of = c => c.author ?? (/^o-/.test(c.id ?? "") ? "owner" : /^a-/.test(c.id ?? "") ? "assistant" : "mastermind");
export const author_word = a => AUTHOR_WORD[a] ?? a;

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
	await Socket.singleton().async_rpc("append", BOARD_URL, [JSON.stringify(line)]).catch(() => null);
	return id;
}

/** Nothing is ever deleted (the owner, 2026-09-22) — `clear` on a card page
 *  writes one more board line, `status: "archived"`, merged onto whatever is
 *  already there by id; `items()`'s own filter is what then hides it and its
 *  count. Scoped to board-born cards (`+ New card`'s own `topic-…` ids) — the
 *  ones the owner actually meant ("four new cards labelled you"). */
export async function archive_card(id){
	const line = { card: { id, status: "archived", by: "owner", at: stamp() } };
	await Socket.singleton().async_rpc("append", BOARD_URL, [JSON.stringify(line)]).catch(() => null);
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
export function items({ board, prompts, landed, says }){
	const by_id = new Map();
	const add = item => { by_id.set(item.id, item); return item; };

	board.forEach(c => add({
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
		const known = by_id.get(l.task);
		if (known){
			known.landed = l.sentence;
			known.at = known.at ?? l.at;
			if (!known.links.some(k => k.url === url)) known.links.push({ url, label: "Task page" });
			return;
		}
		add({
			id: l.task, kind: "landed", at: l.at, icon: "task_alt",
			title: l.task, text: l.sentence, author: l.task, landed: l.sentence,
			links: [{ url, label: "Task page" }],
		});
	});

	const list = [...by_id.values()];
	list.forEach(it => {
		// ⚠ ALWAYS unread — nothing marks a card read any more, and the `read`
		// lines already in `verdicts.jsonl` are not replayed. See `Says` above.
		it.unread = true;
		it.flag = says.flags.get(it.id) ?? null;
		it.transcript ??= [];
	});
	/* NEWEST FIRST, and nothing else. Unread-first, as the first build had it,
	   is itself a jump: every card you open drops out of the top the instant
	   you read it. A clock order cannot do that. Unread is still on the card —
	   the dot, the edge and the count. */
	// 2026-09-22 20:00, the owner: "if it doesn't help me, it shouldn't be on the board" — an
	// archived card leaves the rail and the counts; item 12's "archived (n)" foot reads
	// `.archived` off the returned array (still a plain array everywhere else) to show them
	// again, greyed, without a second call or a second shape.
	const archived = list.filter(it => it.status === "archived");
	const shown = list.filter(it => it.status !== "archived").sort((a, b) => Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0));
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

import { div, span, small } from "/app.js";
import { when } from "./faces.js";
import { plain, headline } from "./inbox.js";
import { parse_lines } from "./fold.js";

/**
 * WHAT HAPPENED, AND HAVE YOU SEEN IT (the owner, 2026-09-25: card
 * `2026/09/25/inbox-show-what-changed-when-a-card-resu`). A card that jumps to
 * the top of the rail shows one line under its preview — who, and what they
 * did — taken from the newest line that bumped it. Clicking that line opens the
 * card's Activity tab: every line, newest first, the ones you have not seen yet
 * marked. Opening Activity stores the card's newest time, and the line goes.
 *
 * "Seen" is one number per card in this browser: `ai2-seen:<card id>`. A card
 * with no number counts as seen up to a day ago, so a first visit shows only
 * what moved today, not four hundred cards. Storage that throws means nothing
 * is ever remembered — the page still works, the lines just stay.
 */

const AI_ROOT = new URL("../ai/", import.meta.url).pathname;
const DAY = 24 * 60 * 60 * 1000;
// ⚠ Never `Date.parse(at ?? 0)`: `Date.parse("0")` is the year 2000, so "never seen" read as a real time.
const ms = at => (at ? Date.parse(at) || 0 : 0);

/* ── seen, per card ─────────────────────────────────────────────────── */

export function seen(id){
	try { const t = ms(localStorage.getItem("ai2-seen:" + id)); if (t) return t; } catch {}
	return Date.now() - DAY;
}

/** Store `at` as seen, if it is newer than what is stored. True when it moved. */
export function mark_seen(id, at){
	const t = ms(at);
	if (!t) return false;
	try {
		if (t <= ms(localStorage.getItem("ai2-seen:" + id))) return false;
		localStorage.setItem("ai2-seen:" + id, new Date(t).toISOString());
		return true;
	} catch { return false; }
}

export const unseen = (id, at) => ms(at) > seen(id);

/* ── who said it, in plain words ────────────────────────────────────── */

const words = slug => slug.replace(/-\d+$/, "").replace(/\bai2\b/g, "AI 2").replace(/-/g, " ");

/** An agent id as a reader would say it: `task-mastermind-ai2-lead-2` → "the AI 2 lead". */
export function who_word(by){
	const b = String(by ?? "").replace(/\s*\(.*\)$/, "");
	if (!b) return null;
	if (b === "owner") return "you";
	let m;
	if ((m = b.match(/^task-mastermind-(.+)/))) return "the " + words(m[1]);
	if (/^servex-mastermind|^mastermind-servex/.test(b)) return "the Servex mastermind";
	if (b === "master-assistant") return "the master assistant";
	if (/^manager-/.test(b)) return "the card's manager";
	if (/assistant/.test(b)) return "the assistant";
	if (/mastermind/.test(b)) return "the mastermind";
	if ((m = b.match(/^minion-(.+)/))) return "minion " + words(m[1]);
	return b;
}

/* ── one line of a card's log, as one event ─────────────────────────── */

/** `{ at, who, what }` for a line worth showing, else null. `at` may be missing
 *  (most lines carry none); `card_events()` gives it the time before it. */
export function line_event(line){
	if (!line || typeof line !== "object") return null;
	const keys = Object.keys(line);
	if (line.class) return { at: line.created, who: who_word(line.by), what: "Made this card: " + plain(line.title ?? ""), made: true };
	if (line.message){
		const m = line.message;
		return { at: m.at, who: who_word(m.by), what: plain(m.text ?? m.raw ?? m.title ?? m.name ?? "") };
	}
	if (line.prompt){
		const p = line.prompt;
		return { at: p.at, who: who_word(p.by ?? "owner"), what: plain(p.raw ?? p.text ?? "") };
	}
	if (line.item){
		const i = line.item;
		return { at: i.done ? (i.at ?? null) : (i.asked_at ?? i.at), who: who_word(i.by), what: (i.done ? "Delivered: " : "Asked for: ") + plain(i.title ?? "") };
	}
	if (line.type === "refined") return { at: line.at, who: who_word(line.by ?? "assistant"), what: "Tidied your words: " + plain(line.text ?? "") };
	if (typeof line.file === "string" && !line.gone && !/page\.jsonl$/.test(line.file)) return { at: line.at, who: null, what: "Added " + line.file };
	if (line.place) return { at: line.at, who: null, what: "Placed " + String(typeof line.place === "string" ? line.place : line.place.module ?? "").split("/").at(-1) };
	if (keys.length !== 1) return null;
	if (line.status) return { at: line.at, who: null, what: "Marked " + line.status };
	if (typeof line.type === "string") return { at: line.at, who: null, what: "Now a " + line.type };
	if (typeof line.title === "string") return { at: line.at, who: null, what: "Renamed: " + plain(line.title) };
	if (typeof line.group === "string") return { at: line.at, who: null, what: "Filed under " + line.group };
	if (typeof line.text === "string") return { at: line.at, who: null, what: "Its text was rewritten" };
	return null;
}

/* ── the bar in a rail row ──────────────────────────────────────────── */

/** The events a folded card (fold.js) still has times for: made, said, replied. */
function fold_events(fold, sub){
	const out = [
		...fold.messages.map(m => line_event({ message: m })),
		...fold.prompts.map(p => line_event({ prompt: p })),
	];
	if (fold.created) out.push({ at: fold.created, who: who_word(fold.by), what: (sub ? "New request: " : "Made this card: ") + plain(fold.title ?? "") });
	return out.filter(e => e?.at && e.what);
}

/**
 * A rail row's bar — `{ who, what }` — or null when nothing on it is new.
 * `folds` is `Groups.folds` (id → { fold }), which already holds every card and
 * sub-card touched in the last two days: no fetch of its own.
 */
export function news_of(it, folds){
	if (!it?.id || it.kind === "live" || !unseen(it.id, it.at)) return null;
	const evs = [];
	for (const [id, rec] of folds ?? []){
		if (id === it.id || id.startsWith(it.id + "/")) evs.push(...fold_events(rec.fold, id !== it.id));
	}
	const top = evs.sort((a, b) => ms(b.at) - ms(a.at))[0];
	// A task landing bumps a row too, and no card line says so.
	if (it.landed && (!top || ms(it.at) - ms(top.at) > 60 * 1000)) return { who: "task landed", what: headline(it.landed) };
	if (top) return { who: top.who, what: top.what };
	if (it.kind === "prompt") return { who: "you", what: plain((it.said ?? []).join(" ")) || plain(it.title) };
	return { who: null, what: plain(it.text) || "Something changed here." };
}

/** A group row's bar, from its newest member (groups.js `latest()`), or null. */
export function group_news(g, latest, at){
	if (!latest || !unseen(g.card, at)) return null;
	if (latest.kind === "task") return latest.landed ? { who: "task landed", what: latest.title } : { who: latest.title, what: latest.words || "started" };
	if (latest.kind === "said") return { who: null, what: latest.words };
	return { who: latest.title, what: latest.words || "updated" };
}

/* ── the Activity tab ───────────────────────────────────────────────── */

const read = url => fetch(url, { cache: "no-store" })
	.then(r => (r.ok && !(r.headers.get("content-type") ?? "").includes("html") ? r.text() : "")).catch(() => "");

/** Every event in a card's own log and its requests' logs (two levels down). A line
 *  with no time of its own was written after the line before it, so it takes that
 *  time. A request's events say which request: its own title. */
async function log_events(id, depth){
	const lines = parse_lines(await read(AI_ROOT + id + "/page.jsonl"));
	const where = depth ? plain(lines.find(l => l.class)?.title ?? "") || null : null;
	let at = null;
	const out = [], kids = [];
	lines.forEach((line, n) => {
		if (typeof line.file === "string" && /page\.jsonl$/.test(line.file) && !line.gone) kids.push(id + "/" + line.file.replace(/\/?page\.jsonl$/, ""));
		const e = line_event(line);
		if (e?.at) at = e.at;
		if (!e?.what) return;
		if (where && e.made) e.what = e.what.replace(/^Made this card: /, "New request: ");
		out.push({ ...e, at: e.at ?? at, n, where });
	});
	if (depth < 2) (await Promise.all(kids.map(k => log_events(k, depth + 1)))).forEach(evs => out.push(...evs));
	return out;
}

const cache = new Map();

/** A card's events. `key` changes when the card does; the same key reads nothing twice. */
export function card_events(id, key){
	const had = cache.get(id);
	if (had && had.key === key) return had.p;
	const p = log_events(id, 0);
	cache.set(id, { key, p });
	return p;
}

export const newest_first = evs => [...evs].sort((a, b) => ms(b.at) - ms(a.at) || (b.n ?? 0) - (a.n ?? 0));

/** The list itself. `since` is the seen time from BEFORE this visit, so the marks stay while you read. */
export function activity_list(evs, since){
	div.c("ai2-activity", () => {
		if (!evs.length) return void small.c("muted").text("Nothing has happened in this card yet.");
		const fresh = evs.filter(e => ms(e.at) > since).length;
		small.c("ai2-act-sum muted").text(fresh ? fresh + " new since you last looked" : "Nothing new since you last looked.");
		newest_first(evs).slice(0, 300).forEach(e => {
			const is_new = ms(e.at) > since;
			div.c("ai2-act-row" + (is_new ? " ai2-act-new" : ""), () => {
				div.c("ai2-act-head flex v-center gap-25", () => {
					if (e.who) span.c("ai2-act-who").text(e.who);
					if (e.where) small.c("ai2-act-where muted").text("in " + e.where);
					if (is_new) span.c("ai2-act-mark").text("new");
					small.c("ai2-act-when muted").text(when(e.at));
				});
				div.c("ai2-act-what").text(e.what);
			});
		});
	});
}

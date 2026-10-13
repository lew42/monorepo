// AI dashboard v3: the board of idea cards (now, timeline, grid, days, prompts); the notes behind this file are in doc/notes.md
import { Page, View, div, h1, h2, p, a, b, span, pre, small, button, input, textarea, details, summary, demo, md } from "/app.js";
import { icon, select, option } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";
import { JSONL, TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { edit } from "/framework/ext/Ask/edit.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { Versions } from "../Versions.js";
import { Demos } from "./Demos.js";
import { Timeline, BOARD, LOG_URL, VERDICTS_URL, clock, text_lines, author_of, author_label, author_kind, status_word } from "./timeline.js";
import { Composer } from "./Composer.js";
import { AskControls } from "./AskControls.js";
import { AgentsStrip } from "./AgentsStrip.js";
import { Prompts } from "./Prompts.js";
import { usage_rail } from "/framework/ext/AITask/usage.js";
import { current } from "/framework/ext/AITask/card.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";

View.stylesheet(import.meta, "v3.css");

// Verdicts_url (doc/notes.md#verdicts_url)
const VERDICTS_PATH = new URL(new URLSearchParams(location.search).get("verdicts") || VERDICTS_URL, location.origin).pathname;

// Inbox zero (doc/notes.md#inbox-zero)
class Verdicts extends JSONL {
	static verbs = [...JSONL.verbs, "verdict"];
	verdicts = [];
	verdict(value) {
		const i = value.id != null ? this.verdicts.findIndex(v => v.id === value.id) : -1;
		if (i === -1) this.verdicts.push(value); else this.verdicts[i] = value;
	}
	reset() { this.verdicts = []; return super.reset(); }
}

/** The newest verdict on one card, or `undefined` if nobody has judged it yet. */
const verdict_of = (id, verdicts) => verdicts.verdicts.find(v => v.id === id);
const is_approved = (id, verdicts) => verdict_of(id, verdicts)?.say === "approve";

// Eligible for a verdict (doc/notes.md#eligible-for-a-verdict)
const eligible = c => !c.parent && author_of(c) !== "owner" && c.status === "done";

// Whether the owner can speak on a card at all (doc/notes.md#whether-the-owner-can-speak-on-a-card-at-all)
const can_judge = c => !c.parent && author_of(c) !== "owner";

/** An ISO stamp carrying THIS machine's own offset — copied from day-audit's
    page.js, the same reason it gives: `toISOString()` would move it to UTC. */
function stamp() {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
		+ "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

// Today's own day-dir name (doc/notes.md#todays-own-day-dir-name)
function today_str() {
	const d = new Date(), pad = n => String(n).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

// One whole line into a .jsonl under public/, through (doc/notes.md#one-whole-line-into-a-jsonl-under-public-through)
async function append_line(url, line) {
	const answer = await Promise.race([
		FsFile.append(url, line),
		new Promise(done => setTimeout(done, 4000, null)),
	]);
	return answer === true;
}

// One line onto verdicts.jsonl (doc/notes.md#one-line-onto-verdictsjsonl)
async function write_verdict(id, say, note) {
	const line = { verdict: { id, say, at: stamp(), by: window.$VERDICT_AUTHOR || "owner" } };
	if (note) line.verdict.note = note;
	return append_line(VERDICTS_PATH, line);
}

// Improve must reach the mastermind the same way the owner's (doc/notes.md#improve-must-reach-the-mastermind-the-same-way-the-owners)
async function open_mastermind_run() {
	const listing = await Socket.singleton().ls("/framework/ai/");
	const days = (listing?.response ?? [])
		.filter(e => e.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
		.sort((a, b) => (a.name < b.name ? 1 : -1));   // newest date first

	for (const day of days) {
		const runs = (day.children ?? [])
			.filter(e => e.type === "dir" && e.name.startsWith("mastermind-"))
			.sort((a, b) => (a.name < b.name ? 1 : -1));   // newest run first — say.mjs's own tiebreak

		for (const run of runs) {
			if (!(run.children ?? []).some(f => f.type === "file" && f.name === "task.jsonl")) continue;
			// Built from day.name/run.name, never run.full/run.path (doc/notes.md#built-from-daynamerunname-never-runfullrunpath)
			const url = `/framework/ai/${day.name}/${run.name}/task.jsonl`;
			const res = await fetch(url).catch(() => null);
			if (!res?.ok) continue;
			const lines = JSONL.parse(await res.text());
			const state = Object.assign({}, ...lines.filter(l => l.assign).map(l => l.assign));
			if (!state.landed_at) return url;
		}
	}
	return null;
}

// True once the note reached the mastermind's inbox; false (doc/notes.md#true-once-the-note-reached-the-masterminds-inbox-false)
async function relay_to_mastermind(msg) {
	const url = await open_mastermind_run();
	if (!url) return false;
	return append_line(url, { chat: { at: stamp(), from: "owner", via: "inbox-zero", msg } });
}

// Ai dashboard, version 3 (doc/notes.md#ai-dashboard-version-3)
export default new Page({
	meta: import.meta,
	title: "AI v3",
	icon: "dashboard_customize",
	description: "What is going on, ranked by what matters — click a card for the whole thing.",

	// The same guard /framework/ai/'s own page has carried since (doc/notes.md#the-same-guard-frameworkais-own-page-has-carried-since)
	content() { defer_board(this); },
	activated() { defer_board(this); },

	// Two routes under this board, and board_route() below owns (doc/notes.md#two-routes-under-this-board-and-board_route-below-owns)
	route(id) {
		const view = board_route(this, id);
		if (view) return view;
		if (id.includes(".")) return;   // a real file (favicon.ico &c), not a card
		const root_page = this, base = this.url;
		return new Page({
			title: id, icon: "arrow_back", url: base + id + "/",
			content() {
				this.board_build = () => top_level(this, id, null, base);
				defer_board(this);
			},
			activated() { defer_board(this); },
		});
	},
});

// Every view is a url (doc/notes.md#every-view-is-a-url)
export const VIEW_WORDS = ["days", "now", "grid", "timeline", "prompts"];

// The one flag that hides a view (doc/notes.md#the-one-flag-that-hides-a-view)
export const HIDDEN_VIEWS = ["grid"];
export const DEFAULT_VIEW = "days";
const shown_views = () => VIEW_WORDS.filter(v => !HIDDEN_VIEWS.includes(v));

// The board root draws itself exactly once, and only when it (doc/notes.md#the-board-root-draws-itself-exactly-once-and-only-when-it)
export function defer_board(page) { setTimeout(() => draw_board(page), 0); }

export function draw_board(page) {
	if (page.board_drawn) return;
	if (location.pathname !== page.url) return watch_board(page);
	page.board_drawn = true;
	page.board_watch?.disconnect();
	const build = page.board_build ?? (() => top_level(page, null));
	// Inside content() the captor is already this page's own (doc/notes.md#inside-content-the-captor-is-already-this-pages-own)
	if (page.view) page.view.append(build);
	else build();
}

// The last way a board goes blank, and the only one a handoff (doc/notes.md#the-last-way-a-board-goes-blank-and-the-only-one-a-handoff)
function watch_board(page) {
	if (page.board_watch || !page.view) return;
	// Defer_board, not draw_board (doc/notes.md#defer_board-not-draw_board)
	page.board_watch = new MutationObserver(() => defer_board(page));
	page.board_watch.observe(page.view.el, { attributes: true, attributeFilter: ["class"] });
}

export function board_route(root, name) {
	if (!VIEW_WORDS.includes(name)) return;
	const base = root.url;
	// A hidden view's url still resolves, and lands on the (doc/notes.md#a-hidden-views-url-still-resolves-and-lands-on-the)
	const named = HIDDEN_VIEWS.includes(name) ? null : name;
	const view_page = new Page({
		title: named ?? DEFAULT_VIEW, icon: "dashboard_customize", url: base + name + "/",
		content() {
			this.board_build = () => top_level(this, null, named, base);
			defer_board(this);
		},
		// Coming back to this view from a card under it.
		activated() { defer_board(this); },
		route(id) {
			if (id.includes(".")) return;
			return new Page({
				title: id, icon: "arrow_back", url: this.url + id + "/",
				content() {
					this.board_build = () => top_level(this, id, named, base);
					defer_board(this);
				},
				activated() { defer_board(this); },
			});
		},
	});
	return view_page;
}

// Shared by the bare /v/3/ page and every route(id) page (doc/notes.md#shared-by-the-bare-v3-page-and-every-routeid-page)
export function top_level(page, initial_id, url_view, root) {
	// Root is the board's own address (doc/notes.md#root-is-the-boards-own-address)
	root = root || page.url;
	const view_url = v => root + v + "/";
	const card_url = id => root + "timeline/" + id + "/";

	// ?log=/?verdicts= (doc/notes.md#logverdicts)
	const qs = new URLSearchParams(location.search);
	const log = new Weighted({ url: qs.get("log") || LOG_URL });
	const verdicts = new Verdicts({ url: qs.get("verdicts") || VERDICTS_URL });
	const sort = new Page.Prefs({ id: "v3-sort" });
	const prefs = new Page.Prefs({ id: "v3-view" });
	let $board, $wall, $count, $footer, $live_btn, $head, $more_btn, $agents_host;
	const view_btns = new Map();
	let show_approved = prefs.get({ show_approved: false }).show_approved ?? false;
	// Live (doc/notes.md#live)
	let live = prefs.get({ live: true }).live ?? true;

	// Set_live() is the one place that ever changes live (doc/notes.md#set_live-is-the-one-place-that-ever-changes-live)
	function paint_live_btn() {
		if (!$live_btn) return;
		$live_btn.el.classList.toggle("on", live);
		$live_btn.el.classList.toggle("prim", live);
	}
	// Live-select, 2026-09-21 (doc/notes.md#live-select-2026-09-21)
	function set_live(v) {
		if (live === v) return;
		live = v;
		prefs.patch({ live });
		paint_live_btn();
		if (v) md?.deselect();
	}
	// Author filter (doc/notes.md#author-filter)
	let author_filter = prefs.get({ author_filter: "all" }).author_filter ?? "all";

	// Head-mobile (doc/notes.md#head-mobile)
	let more_open = false;
	function set_more(v) {
		more_open = v;
		if ($head) $head.el.classList.toggle("v3-more-open", more_open);
		if ($more_btn) {
			$more_btn.el.setAttribute("aria-expanded", String(more_open));
			$more_btn.el.textContent = more_open ? "Less ▴" : "More ▾";
		}
	}

	// The url decides the view, always (doc/notes.md#the-url-decides-the-view-always)
	const view_param = qs.get("view");
	let view = url_view
		|| (VIEW_WORDS.includes(view_param) ? view_param : null)
		|| (prefs.get({ view: DEFAULT_VIEW }).view ?? DEFAULT_VIEW);
	// A hidden view falls back like a misspelt one (doc/notes.md#a-hidden-view-falls-back-like-a-misspelt-one)
	if (!VIEW_WORDS.includes(view) || HIDDEN_VIEWS.includes(view)) view = DEFAULT_VIEW;

	// A card's own url always shows that card (doc/notes.md#a-cards-own-url-always-shows-that-card)
	if (initial_id) view = "timeline";

	// One truth, and it is the url (doc/notes.md#one-truth-and-it-is-the-url)
	if (!url_view) {
		const keep = new URLSearchParams(location.search);
		keep.delete("view");
		const q = keep.toString();
		history.replaceState(null, "", (initial_id ? card_url(initial_id) : view_url(view)) + (q ? "?" + q : ""));
	}

	const VIEW_TITLES = {
		days: "what happened, newest day first", now: "the newest thing, live",
		grid: "the importance wall", timeline: "rail + detail, newest first",
		prompts: "what you said, and what was made of it",
	};

	// The timeline and now views' own instances survive across a (doc/notes.md#the-timeline-and-now-views-own-instances-survive-across-a)
	let md = null, nv = null, dv = null, pv = null;
	const redraw = () => {
		paint_count();
		paint_view_tabs();
		// Usage footer (doc/notes.md#usage-footer)
		if ($footer) $footer.el.hidden = view !== "timeline";
		// Days (doc/notes.md#days)
		if (view === "days") {
			md = null; nv = null; pv = null;
			if (dv) return dv.update();
			return $wall.empty(() => { dv = days_view(page); });
		}
		if (view === "now") {
			md = null; dv = null; pv = null;
			if (nv) return nv.update();
			return $wall.empty(() => { nv = now_view($wall, log, page, view_url("timeline")); });
		}
		// Prompts (doc/notes.md#prompts)
		if (view === "prompts") {
			md = null; nv = null; dv = null;
			if (pv) return pv.update();
			return $wall.empty(() => { pv = Prompts.view(); });
		}
		if (view !== "timeline") {
			md = null; nv = null; dv = null; pv = null;
			return $wall.empty(() => wall($wall, log, page, sort, verdicts, () => show_approved));
		}
		nv = null; dv = null; pv = null;
		if (md) return md.update();
		$wall.empty(() => { md = master_detail($wall, log, page, prefs, initial_id, verdicts, () => show_approved, () => live, () => author_filter, set_live, card_url, view_url("timeline")); });
	};

	// Tab highlight follows view (doc/notes.md#tab-highlight-follows-view)
	function paint_view_tabs() {
		view_btns.forEach(($btn, val) => $btn.el.classList.toggle("on", val === view));
	}

	// The count is the point (doc/notes.md#the-count-is-the-point)
	function paint_count() {
		if (!$count) return;
		const reviewable = log.cards.filter(eligible);
		const approved = reviewable.filter(c => is_approved(c.id, verdicts));
		const left = reviewable.length - approved.length;
		$count.empty(() => {
			span.c("v3-count-left", `${left} left`);
			if (approved.length) button.c("v3-count-toggle").attr("type", "button")
				.text(show_approved ? "hide approved" : `${approved.length} approved`)
				.click(() => { show_approved = !show_approved; prefs.patch({ show_approved }); redraw(); });
		});
	}

	// The view words, and they are the only chrome left on the (doc/notes.md#the-view-words-and-they-are-the-only-chrome-left-on-the)
	function views_row() {
		div.c("v3-views flex", () => {
			shown_views().forEach(val => {
				view_btns.set(val, a.c("v3-view-btn" + (val === view ? " on" : "")).text(val)
					.href(view_url(val)).attr("title", VIEW_TITLES[val]));
			});
			// Talk (doc/notes.md#talk)
			a.c("v3-view-btn v3-view-talk").text("🎤 talk").href("/framework/ai/talk/")
				.attr("title", "Press the mic and talk — your words fill one card, live, and nothing on it jumps");
		});
	}

	// More (doc/notes.md#more)
	function more_panel() {
		let $today;
		div.c("v3-more", () => {
			div.c("v3-ways-out", () => {
				$today = a.c("v3-ways-out-link").href("/framework/ai/log/").text("Today's board");
				span.c("v3-ways-out-sep muted", "·");
				a.c("v3-ways-out-link").href("/framework/ai/log/").text("Everything");
				span.c("v3-ways-out-sep muted", "·");
				a.c("v3-ways-out-link").href("/framework/ai/process/").text("Process");
				span.c("v3-ways-out-sep muted", "·");
				a.c("v3-ways-out-link").href("/framework/ai/sessions/2026/09/20/start-here/").text("Start here");
			});

			Versions.picker(root);

			// THE COUNT — still the point, still one press away (`paint_count()`).
			$count = div.c("v3-count flex v-center");

			// Live 2 (doc/notes.md#live-2)
			$live_btn = button.c("v3-live-btn" + (live ? " on prim" : "")).text("Live")
				.attr("type", "button")
				.attr("title", "Show me the newest, nothing pinned open. On: the newest card is always what's shown, and stays that way as new ones arrive. Selecting any card turns this off and locks your view on it; click Live again to deselect and jump back to the newest.")
				.click(() => set_live(!live));

			// AUTHOR FILTER — see the `let author_filter` declaration above
			// for its scope (the timeline view's own axis).
			const AUTHOR_OPTS = [["all", "everyone"], ["owner", "you"], ["assistant", "assistant"], ["mastermind", "mastermind"], ["minion", "minions"]];
			const $author = select.c("v3-author-filter auto").attr("title", "Filter the timeline by who wrote the card")
				.append(() => AUTHOR_OPTS.forEach(([val, label]) => option().attr("value", val).text(label)));
			$author.el.value = author_filter;
			$author.on("change", function () { author_filter = this.el.value; prefs.patch({ author_filter }); redraw(); });

			div.c("v3-track", () => {
				span("card width");
				input().attr("type", "range").attr("min", "18").attr("max", "34").attr("step", "1")
					.attr("value", String(prefs.get({ track: 24 }).track ?? 24))
					.on("input", function () {
						const em = this.el.value;
						$board.style({ "--v3-track": em + "em" });
						prefs.patch({ track: Number(em) });
					});
			});
		});
		const today = today_str();
		Socket.singleton().ls("/framework/ai/").then(listing => {
			if ((listing?.response ?? []).some(e => e.type === "dir" && e.name === today)) $today.href(`/framework/ai/${today}/`);
		}).catch(() => {});
	}

	div.c("v3 bleed", () => {
		// Full bleed (doc/notes.md#full-bleed)
		$board = div.c("v3-board grid gap", () => {
			// One quiet line of chrome (doc/notes.md#one-quiet-line-of-chrome)
			$head = div.c("v3-head", () => {
				// The title is the way home (the owner, 2026-09-21: "I want you
				// to make the AI title on the V3 page link back to framework AI").
				h1.c("v3-title", () => a.c("v3-title-link").href("/framework/ai/").text("AI"));
				views_row();
				// Agents strip (doc/notes.md#agents-strip)
				$agents_host = div.c("v3-agents");
				$agents_host.el.hidden = true;
				$more_btn = button.c("v3-more-btn").attr("type", "button")
					.attr("aria-expanded", "false")
					.attr("title", "More: the ways out of this board, the version picker, Live, the author filter, the card-width slider and the count of what is left to review — folded away only to save room, always here")
					.text("More ▾")
					.click(() => set_more(!more_open));
				// Its own line inside the same flex row (doc/notes.md#its-own-line-inside-the-same-flex-row)
				more_panel();
			});
			$wall = div.c("v3-wall");
			// Usage footer 2 (doc/notes.md#usage-footer-2)
			$footer = div.c("v3-footer", async $f => {
				const usage = await fetch("/framework/ai/usage.json").then(r => r.ok ? r.json() : null).catch(() => null);
				$f.append(() => usage ? usage_rail(usage) : p.c("muted", "No usage.json yet."));
			});
			$footer.el.hidden = view !== "timeline";
		});
	});
	$board.style({ "--v3-track": (prefs.get({ track: 24 }).track ?? 24) + "em" });

	// A landed minion/task-mastermind's own last words become a (doc/notes.md#a-landed-miniontask-masterminds-own-last-words-become-a)
	AgentsStrip.show($agents_host, card => { log.card(card); redraw(); });

	// Every card the fast assistant makes of your words lands on (doc/notes.md#every-card-the-fast-assistant-makes-of-your-words-lands-on)
	Promise.all([log.live(redraw), verdicts.live(redraw)]).then(() => {
		Prompts.board_cards(card => { log.card(card); redraw(); });
		redraw();
	});
}

// Days 2 (doc/notes.md#days-2)
const DAYS_PAGE = 7;

function days_view(page) {
	const $days = div.c("v3-days flow");
	load_days($days);
	return { update() {} };
}

async function load_days($days) {
	const dates = await list_days();
	if (!dates.length) return $days.append(() => p.c("muted", "No days logged yet."));
	let shown = DAYS_PAGE;
	const draw = () => $days.empty(() => {
		dates.slice(0, shown).forEach(day_block);
		if (dates.length > shown) button.c("v3-count-toggle").attr("type", "button")
			.text(`Show ${Math.min(DAYS_PAGE, dates.length - shown)} more days`)
			.click(() => { shown += DAYS_PAGE; draw(); });
	});
	draw();
}

async function list_days() {
	const listing = await Socket.singleton().ls("/framework/ai/").catch(() => null);
	return (listing?.response ?? [])
		.filter(e => e.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
		.map(e => e.name).sort().reverse();
}

/* One day's own log — `{at, task, msg}` per line, never merged, never cached:
   this file is history the moment the day rolls over. */
async function day_log(date) {
	const res = await fetch(`/framework/ai/${date}/day.jsonl`).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return [];
	return JSONL.parse(await res.text()).filter(e => e.log).map(e => e.log);
}

function day_block(date) {
	div.c("v3-day", () => {
		h2.c("v3-day-head", date === today_str() ? `Today — ${date}` : date);
		const $rows = div.c("v3-day-rows flex v gap-25");
		load_day_rows($rows, date);
	});
}

async function load_day_rows($rows, date) {
	const lines = await day_log(date);
	const landed = lines.filter(l => /^landed\b/.test(l.msg ?? ""))
		.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
	const opened = new Set(lines.filter(l => /^task opened\b/.test(l.msg ?? "")).map(l => l.task));
	// Unlanded tasks of today only (doc/notes.md#unlanded-tasks-of-today-only)
	const working = date === today_str() ? [...opened].filter(t => !landed.some(l => l.task === t)) : [];
	$rows.append(() => {
		if (!landed.length && !working.length) return p.c("muted", "Nothing landed.");
		working.forEach(slug => day_working(date, slug));
		landed.forEach(l => day_row(date, l));
	});
}

// One finished task, collapsed to the one-line headline it (doc/notes.md#one-finished-task-collapsed-to-the-one-line-headline-it)
function day_row(date, l) {
	const slug = l.task, sentence = (l.msg ?? "").replace(/^landed[\s—-]+/, "");
	let loaded = false;
	details.c("v3-day-row", $r => {
		summary.c("v3-day-summary", () => {
			b(slug);
			if (sentence && sentence !== slug) span(" — " + sentence);
		});
		const $body = div.c("v3-day-body");
		$r.on("toggle", async () => {
			if (loaded || !$r.el.open) return;
			loaded = true;
			$body.append(() => p.c("muted", "Loading…"));
			const t = await new TaskJSONL({ url: `/framework/ai/${date}/${slug}/task.jsonl` }).load();
			$body.empty(() => {
				if (t.loaded && t.outcome) md(t.outcome);
				else p.c("muted", "No landing report on file.");
				if (t.links?.length) div.c("flex wrap gap-25", () =>
					t.links.forEach(link => a(link.label ?? link.url).href(link.url)));
				a("Task page →").href(`/framework/ai/${date}/${slug}/`);
			});
		});
	});
}

// A task that opened today and has not landed yet (doc/notes.md#a-task-that-opened-today-and-has-not-landed-yet)
function day_working(date, slug) {
	const $w = div.c("v3-day-working muted").text(`working — ${slug}`);
	new TaskJSONL({ url: `/framework/ai/${date}/${slug}/task.jsonl` }).load().then(t => {
		if (t.loaded) $w.text(`working — ${current(t) ?? slug}`);
	});
}

// The default view (doc/notes.md#the-default-view)
const hour_start = t => { const d = new Date(t); d.setMinutes(0, 0, 0); return d.getTime(); };
const hour_label = t => new Date(t).toLocaleTimeString([], { hour: "numeric" });

function master_detail($wall, log, page, prefs, initial_id, verdicts, get_show_approved, get_live, get_author_filter, set_live, card_url, timeline_url) {
	// Newest first, top-level only (doc/notes.md#newest-first-top-level-only)
	const by_recency = () => {
		const all = log.cards.filter(c => !c.parent);
		const answered = new Set(all.filter(c => c.re).map(c => c.re));
		const kept = all.filter(c => !(author_of(c) === "owner" && answered.has(c.id)));
		const shown = get_show_approved() ? kept : kept.filter(c => author_of(c) === "owner" || !is_approved(c.id, verdicts));
		const filter = get_author_filter?.() ?? "all";
		return (filter === "all" ? shown : shown.filter(c => author_kind(author_of(c)) === filter))
			.sort((a, b) => Date.parse(b.updated_at ?? b.at ?? 0) - Date.parse(a.updated_at ?? a.at ?? 0));
	};

	let cards = by_recency();
	if (!cards.length) {
		const any = log.cards.some(c => !c.parent && author_of(c) !== "owner");
		$wall.append(() => p.c("muted", any ? "Nothing left to review — the count above brings approved cards back."
			: "Nothing yet — the board is empty."));
		return { update() {} };
	}

	// Live-select, 2026-09-21 2 (doc/notes.md#live-select-2026-09-21-2)
	let selected_id = cards.some(c => c.id === initial_id) ? initial_id : cards[0].id;
	if (initial_id && get_live()) set_live(false);

	let $split_v, $left, $right, $right_body, $back_top, $axis_list, $toast;
	let unseen_count = 0;
	const rows = new Map();
	const axis = new Map();
	let return_id = null;

	$split_v = div.c("v3-split", () => {
		// Live-select, 2026-09-21 3 (doc/notes.md#live-select-2026-09-21-3)
		$left = div.c("v3-inbox", () => {
			$back_top = button.c("v3-back-top").attr("type", "button").attr("title", "Back to top")
				.click(() => { $left.el.scrollTo({ top: 0, behavior: "smooth" }); unseen_count = 0; paint_back_top(); });
			$back_top.el.hidden = true;
			// The verdict toast (doc/notes.md#the-verdict-toast)
			$toast = div.c("v3-toast card");
			$toast.el.hidden = true;
			$axis_list = div.c("v3-axis-list");
		});
		// .v3-mobile-back is css-hidden except under the <40em media (doc/notes.md#v3-mobile-back-is-css-hidden-except-under-the-40em-media)
		$right = div.c("v3-right-col", () => {
			button.c("v3-mobile-back").attr("type", "button")
				.append(() => { span("‹"); span("inbox"); })
				.click(() => $split_v.rc("v3-mobile-detail"));
			$right_body = div.c("v3-right-body");
		});
	});

	// Live-select, 2026-09-21 4 (doc/notes.md#live-select-2026-09-21-4)
	$left.el.addEventListener("scroll", () => paint_back_top(), { passive: true });

	// A click anywhere in the open card's own detail (doc/notes.md#a-click-anywhere-in-the-open-cards-own-detail)
	$right.el.addEventListener("click", () => { if (get_live()) set_live(false); }, { capture: true });

	// Selected (doc/notes.md#selected)
	function mark_row(id, $row) { $row.el.classList.toggle("selected", id === selected_id); }

	// Fix 3 (doc/notes.md#fix-3)
	function paint_back_top() {
		if (!$back_top) return;
		const scrolled = $left.el.scrollTop > 24;
		$back_top.el.hidden = !scrolled;
		$back_top.empty(() => {
			span("↑ Back to top");
			if (unseen_count > 0) span.c("v3-back-top-count", String(unseen_count));
		});
	}

	// Fix 1b (doc/notes.md#fix-1b)
	const is_big_card = (c, focus_id) => c.status === "needs-you" || c.id === focus_id;

	// Timeline (doc/notes.md#timeline)
	function row_classes(c, big) {
		const mine = author_of(c) === "owner";
		if (!big) return "v3-tile-compact v3-inbox-card";
		return "card v3-tile v3-tile-big v3-inbox-card" + (mine ? " v3-tile-owner" : "");
	}
	function paint_row($row, c, big) {
		$row.el.className = row_classes(c, big);
		$row.style({ "--card-edge": edge_of(c.status) });
		const mine = author_of(c) === "owner";
		$row.empty(() => {
			if (big) {
				div.c("v3-tile-head flex v-center gap", () => {
					if (c.icon) icon(c.icon);
					// The owner's own title is only ever the first 90 characters (doc/notes.md#the-owners-own-title-is-only-ever-the-first-90-characters)
					if (!mine) div.c("v3-tile-title", short_title(c));
				});
				const sentence = first_sentence(c);
				if (sentence) div.c("v3-tile-sentence", sentence);
				div.c("v3-tile-foot flex v-center", () => span.c("v3-tile-author", author_label(author_of(c))));
			} else {
				if (c.icon) icon(c.icon);
				div.c("v3-tile-title", short_title(c));
				span.c("v3-tile-author muted", author_label(author_of(c)));
			}
		});
	}
	function row_of(c, big) {
		const $row = button.c(row_classes(c, big)).attr("type", "button").click(() => select(c.id, true));
		paint_row($row, c, big);
		return $row;
	}

	// Timeline 2 (doc/notes.md#timeline-2)
	function decor_of(c, idx, prev_t) {
		const t = Date.parse(c.updated_at ?? c.at ?? 0) || 0;
		const gap_min = Math.max(0, (prev_t - t) / 60000);
		const is_break = gap_min > 45;
		// Rescaled 2026-09-21, measured (doc/notes.md#rescaled-2026-09-21-measured)
		const margin_em = is_break ? 1.5 : Math.min(2, Math.max(0.5, gap_min * 0.2));
		const show_hour = hour_start(t) !== hour_start(prev_t);
		return { t, prev_t, is_break, margin_em, show_hour };
	}

	// The divider above one card (doc/notes.md#the-divider-above-one-card)
	function paint_divider($divider, decor) {
		$divider.empty(() => {
			if (decor.is_break) return void div.c("v3-axis-break", `${clock(decor.prev_t)} … ${clock(decor.t)}`);
			if (decor.show_hour) return void div.c("v3-axis-hour", hour_label(decor.t));
		});
	}

	// One card's own row plus its axis decoration, built together (doc/notes.md#one-cards-own-row-plus-its-axis-decoration-built-together)
	function axis_item(c, big) {
		let $divider, $time, $row;
		const $wrap = div.c("v3-axis-item");
		$wrap.append(() => {
			$divider = div.c("v3-axis-divider");
			$time = small.c("v3-axis-time muted");
			$row = row_of(c, big);
		});
		return { $wrap, $divider, $time, $row };
	}

	// The brief highlight a resurfaced row gets (doc/notes.md#the-brief-highlight-a-resurfaced-row-gets)
	const resurface_timers = new Map();
	function flash_resurface($wrap) {
		$wrap.el.classList.remove("v3-axis-resurfaced");
		void $wrap.el.offsetWidth;
		$wrap.el.classList.add("v3-axis-resurfaced");
		clearTimeout(resurface_timers.get($wrap));
		resurface_timers.set($wrap, setTimeout(() => $wrap.el.classList.remove("v3-axis-resurfaced"), 1600));
	}

	// Full rebuild only on first draw; every later call patches (doc/notes.md#full-rebuild-only-on-first-draw-every-later-call-patches)
	function sync_inbox() {
		const now_ms = Date.now();
		const focus_id = newest_focus_id(log);
		const seen = new Set();
		let prev_el = null;
		cards.forEach((c, i) => {
			seen.add(c.id);
			const big = is_big_card(c, focus_id);
			const prev_t = i === 0 ? now_ms : (Date.parse(cards[i - 1].updated_at ?? cards[i - 1].at ?? 0) || 0);
			const decor = decor_of(c, i, prev_t);
			let had = rows.get(c.id);
			const is_new = !had;
			if (is_new) {
				const { $wrap, $divider, $time, $row } = axis_item(c, big);
				rows.set(c.id, $row);
				axis.set(c.id, { $wrap, $divider, $time });
				// Placed correctly below, in the reconciliation step (doc/notes.md#placed-correctly-below-in-the-reconciliation-step)
				had = $row;
			} else {
				paint_row(had, c, big);
			}
			mark_row(c.id, had);
			const a = axis.get(c.id);
			a.$wrap.style({ "margin-block-start": decor.margin_em + "em" });
			paint_divider(a.$divider, decor);
			a.$time.text(clock(decor.t));

			// Resurfacing (doc/notes.md#resurfacing)
			const wrap = a.$wrap.el;
			if (wrap.previousElementSibling !== prev_el) {
				$axis_list.el.insertBefore(wrap, prev_el ? prev_el.nextSibling : $axis_list.el.firstChild);
				if (!is_new) flash_resurface(a.$wrap);
			}
			prev_el = wrap;
		});
		// A card that vanished (approved and hidden, or the file was reset) loses its row.
		[...rows.keys()].filter(id => !seen.has(id)).forEach(id => {
			rows.get(id)?.el.remove(); rows.delete(id);
			axis.get(id)?.$wrap.el.remove(); axis.delete(id);
		});
		paint_back_top();
	}

	// The jump key (doc/notes.md#the-jump-key)
	function jump_or_return() {
		const newest = cards[0];
		if (!newest) return;
		if (selected_id !== newest.id) { return_id = selected_id; select(newest.id, true); }
		else if (return_id && cards.some(c => c.id === return_id)) { const back = return_id; return_id = null; select(back, true); }
	}

	function draw_right() {
		const c = cards.find(x => x.id === selected_id);
		$right_body.empty(() => c
			? detail(c, log, page, verdicts, { skip_back: true, on_verdict: (say, note) => advance(c.id, say, note) })
			: p.c("muted", cards.length ? "Not found." : "Nothing left to review — the count above brings approved cards back."));
	}

	// The undecided queue (doc/notes.md#the-undecided-queue)
	function queue() { return cards.filter(c => eligible(c) && !is_approved(c.id, verdicts)); }

	// Called right after a verdict is posted on the card (doc/notes.md#called-right-after-a-verdict-is-posted-on-the-card)
	function advance(decided_id, say, note) {
		// Read the decided card's own title before it can disappear (doc/notes.md#read-the-decided-cards-own-title-before-it-can-disappear)
		const decided_title = short_title(cards.find(c => c.id === decided_id) ?? {});
		const before = queue().filter(c => c.id !== decided_id);
		const idx = queue().findIndex(c => c.id === decided_id);
		const next = before[idx] ?? before[idx - 1] ?? before[0] ?? null;
		cards = by_recency();
		sync_inbox();
		// A plain reopen (doc/notes.md#a-plain-reopen)
		if (say === "approve" || say === "improve") show_toast(decided_id, say, note, decided_title);
		// Re-check against the freshly reloaded rail (doc/notes.md#re-check-against-the-freshly-reloaded-rail)
		const next_id = next && cards.some(c => c.id === next.id) ? next.id : queue()[0]?.id ?? null;
		if (next_id) select(next_id, true); else { selected_id = null; draw_right(); }
	}

	// The verdict toast 2 (doc/notes.md#the-verdict-toast-2)
	let toast_timer = null;
	function hide_toast() { clearTimeout(toast_timer); toast_timer = null; $toast.el.hidden = true; }
	function show_toast(id, say, note, title) {
		clearTimeout(toast_timer);
		$toast.el.hidden = false;
		$toast.empty(() => {
			div.c("v3-toast-msg flex v-center gap", () => {
				if (say === "approve") { icon("check_circle"); span(`Approved “${title}” — it left your inbox.`); }
				else { icon("flag"); span(`Sent to improve: “${note}”.`); }
			});
			button.c("v3-toast-undo").attr("type", "button").text("Undo").click(async () => {
				hide_toast();
				const by = window.$VERDICT_AUTHOR || "owner";
				await write_verdict(id, "reopen", "");
				// Mirror the append into the local verdicts model by hand, (doc/notes.md#mirror-the-append-into-the-local-verdicts-model-by-hand)
				verdicts.verdict({ id, say: "reopen", at: stamp(), by });
				cards = by_recency();
				sync_inbox();
				select(id, true);
			});
		});
		toast_timer = setTimeout(hide_toast, 7000);
	}

	// Fix 2 (doc/notes.md#fix-2)
	function select(id, push) {
		selected_id = id;
		if (get_live()) set_live(false);
		rows.forEach((($row, rid) => mark_row(rid, $row)));
		draw_right();
		$split_v.ac("v3-mobile-detail");   // a no-op above the <40em breakpoint
		// Card_url() is built from the board root this page was (doc/notes.md#card_url-is-built-from-the-board-root-this-page-was)
		if (push) history.pushState(null, "", card_url(id));
	}

	function on_pop() {
		if (!document.contains($wall.el)) { window.removeEventListener("popstate", on_pop); return; }
		// The last path segment is the card id on any of the three (doc/notes.md#the-last-path-segment-is-the-card-id-on-any-of-the-three)
		const m = location.pathname.replace(/\/+$/, "").match(/\/([^/]+)$/);
		const id = m && cards.some(c => c.id === m[1]) ? m[1] : null;
		// Landing on a real card's own url (doc/notes.md#landing-on-a-real-cards-own-url)
		if (id) {
			selected_id = id;
			if (get_live()) set_live(false);
			rows.forEach((($row, rid) => mark_row(rid, $row)));
			draw_right();
		} else if (!get_live()) {
			set_live(true);
		}
	}
	window.addEventListener("popstate", on_pop);

	// One at a time, by keyboard (doc/notes.md#one-at-a-time-by-keyboard)
	function on_key(e) {
		if (!document.contains($wall.el)) { window.removeEventListener("keydown", on_key); return; }
		const tag = document.activeElement?.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
		if (e.code === "Space" || e.key === " ") { e.preventDefault(); jump_or_return(); return; }
		const dir = (e.key === "ArrowDown" || e.key === "j") ? 1 : (e.key === "ArrowUp" || e.key === "k") ? -1 : 0;
		if (!dir) return;
		const pool = queue();
		const idx = pool.findIndex(c => c.id === selected_id);
		const next = idx === -1 ? pool[0] : pool[idx + dir];
		if (next) { e.preventDefault(); select(next.id, true); }
	}
	window.addEventListener("keydown", on_key);

	// ── the drag handle (doc/notes.md#the-drag-handle)
	const MIN = 220;
	const $split = $left.el.parentElement;
	const saved_split = prefs.get({ split: null }).split;
	let $grip;

	function apply_split(px) {
		$left.style({ flex: `0 0 ${px}px` });
		$grip.style({ left: px + "px" });
	}

	$split_v.append(() => {
		$grip = grip({
			write(px) {
				const total = $split.getBoundingClientRect().width;
				const w = Math.min(Math.max(px, MIN), Math.max(MIN, total - MIN));
				apply_split(w);
				return w;
			},
			done(w) { prefs.patch({ split: w }); },
			from: "start",
			mirror: false,
		});
		$grip.style({ position: "absolute", inset: "0 auto 0 0" });
	});

	// First layout tick (doc/notes.md#first-layout-tick)
	requestAnimationFrame(() => {
		if (window.matchMedia("(width < 40em)").matches) return;
		const total = $split.getBoundingClientRect().width;
		const split_gap = parseFloat(getComputedStyle($split).gap) || 0;
		apply_split(saved_split ?? (Math.round((total - split_gap) / 2) || 400));
	});

	sync_inbox();
	draw_right();

	return {
		// Fix 2 2 (doc/notes.md#fix-2-2)
		update() {
			const prev_ids = new Set(cards.map(c => c.id));
			cards = by_recency();
			if (!cards.length) { selected_id = null; sync_inbox(); draw_right(); return; }
			// The card the owner had open can vanish the instant its own (doc/notes.md#the-card-the-owner-had-open-can-vanish-the-instant-its-own)
			if (!cards.some(c => c.id === selected_id)) {
				selected_id = cards.find(c => heard_of(c, log)?.id === selected_id)?.id ?? cards[0]?.id ?? selected_id;
				draw_right();
			}
			const newest = cards[0];
			if (get_live()) {
				if (newest && newest.id !== selected_id) { selected_id = newest.id; draw_right(); }
			} else {
				const arrived = cards.filter(c => !prev_ids.has(c.id)).length;
				if (arrived) unseen_count += arrived;
			}
			sync_inbox();
		},

		// Fix 2 3 (doc/notes.md#fix-2-3)
		deselect() {
			selected_id = cards[0]?.id ?? null;
			return_id = null;
			unseen_count = 0;
			history.replaceState(null, "", timeline_url);
			$left.el.scrollTo({ top: 0, behavior: "smooth" });
			rows.forEach((($row, rid) => mark_row(rid, $row)));
			draw_right();
			sync_inbox();
		},
	};
}

// The now view (doc/notes.md#the-now-view)
function now_view($wall, log, page, timeline_url) {
	const STREAM_IDLE_MS = 3000;
	let heard_id = null, following = true, chunks_seen = 0;
	let $box, $stale, $heard, $chip, $answers;
	let stale_painted = null;
	const entries = new Map();

	const newest_owner = () => {
		const owners = log.cards.filter(c => author_of(c) === "owner");
		return owners.length ? owners.reduce((a, b) => Date.parse(b.at ?? 0) >= Date.parse(a.at ?? 0) ? b : a) : null;
	};

	// Stale (doc/notes.md#stale)
	const day_of = at => { const d = new Date(at); return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); };
	const is_today = at => !!at && day_of(at) === day_of(Date.now());
	const day_word = at => new Date(at).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
	const newest_board_at = () => log.cards.reduce((a, c) => Math.max(a, Date.parse(c.updated_at ?? c.at ?? 0) || 0), 0);
	const is_stale = owner => is_today(newest_board_at()) && !is_today(owner?.at);

	function paint_stale(owner) {
		if (!$stale) return;
		const stale = is_stale(owner);
		if (stale === stale_painted) return;
		stale_painted = stale;
		$stale.el.hidden = !stale;
		if (!stale) return;
		$stale.empty(() => {
			div.c("v3-now-stale-body flex v-center gap", () => {
				icon("history");
				span.c("v3-now-stale-text",
					`This thread is from ${day_word(owner.at)} — today's newest activity is in the timeline.`);
			});
			// A real link, not a button (doc/notes.md#a-real-link-not-a-button)
			a.c("v3-now-stale-btn btn prim").href(timeline_url).text("Show today");
		});
	}

	// An answer (doc/notes.md#an-answer)
	const answers_for = owner => !owner ? [] : log.cards.filter(c =>
		c.id !== owner.id && author_of(c) !== "owner" &&
		(c.re === owner.id || Date.parse(c.updated_at ?? c.at ?? 0) >= Date.parse(owner.at ?? 0))
	).sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0));

	function draw_heard(owner) {
		$heard.empty(() => {
			if (!owner) { p.c("muted", "Nothing heard yet."); return; }
			div.c("v3-heard-head flex v-center gap", () => { icon("mic"); span.c("muted", "you, " + clock(owner.at)); });
			div.c("v3-heard-text", owner.text || owner.title || "");
		});
	}

	function answer_row(c) {
		let $title, $body, $time;
		const $card = div.c("v3-now-card flex v gap", () => {
			div.c("flex v-center gap", () => {
				if (c.icon) icon(c.icon);
				span.c("v3-tile-author", author_label(author_of(c)));
				$time = small.c("v3-tile-time", clock(c.updated_at ?? c.at));
				if (c.status) span.c("v3-status", status_word(c.status));
			});
			if (c.title) $title = div.c("v3-tile-title", c.title);
			$body = div.c("v3-now-card-body", (c.text ?? "").trim());
		});
		return { $card, $title, $body, $time, c, caret: null, timer: null };
	}

	// A card not currently mid-stream simply gets a clean rebuild (doc/notes.md#a-card-not-currently-mid-stream-simply-gets-a-clean-rebuild)
	function sync_answers(owner) {
		const list = answers_for(owner);
		const seen = new Set();
		list.forEach(c => {
			const key = c.id ?? c;
			seen.add(key);
			const had = entries.get(key);
			if (!had) { const e = answer_row(c); entries.set(key, e); $answers.append(e.$card); return; }
			if (had.c === c) return;
			had.c = c;
			if (had.caret) { had.$time?.text(clock(c.updated_at ?? c.at)); return; }   // still streaming — leave the growing body alone
			const fresh = answer_row(c);
			had.$card.el.replaceWith(fresh.$card.el);
			entries.set(key, fresh);
		});
		[...entries.keys()].filter(id => !seen.has(id)).forEach(id => { entries.get(id)?.$card.el.remove(); entries.delete(id); });
	}

	// ── streaming (doc/notes.md#streaming)
	function start_stream(e) {
		if (!e.caret) { const $c = span.c("v3-now-caret", "▍"); e.$body?.append($c); e.caret = $c; }
	}
	function stop_stream(e) {
		if (e.timer) clearTimeout(e.timer);
		e.timer = null;
		e.caret?.el.remove();
		e.caret = null;
	}
	// The idle timeout can fire with no further board tick to (doc/notes.md#the-idle-timeout-can-fire-with-no-further-board-tick-to)
	function refresh_entry(e) {
		const key = e.c.id ?? e.c;
		if (entries.get(key) !== e) return;   // already replaced by a newer sync
		const fresh = answer_row(e.c);
		e.$card.el.replaceWith(fresh.$card.el);
		entries.set(key, fresh);
	}
	function chunk_in(chunk) {
		const e = entries.get(chunk.id);
		if (!e?.$body) return;
		start_stream(e);
		e.$body.el.insertBefore(document.createTextNode(chunk.text), e.caret.el);
		if (e.timer) clearTimeout(e.timer);
		e.timer = setTimeout(() => { stop_stream(e); refresh_entry(e); }, STREAM_IDLE_MS);
	}
	function process_chunks() {
		if (log.chunks.length <= chunks_seen) return;
		log.chunks.slice(chunks_seen).forEach(chunk_in);
		chunks_seen = log.chunks.length;
	}

	function show(owner) {
		heard_id = owner?.id ?? null;
		entries.forEach(e => e.timer && clearTimeout(e.timer));
		entries.clear();
		$answers.empty();
		paint_stale(owner);
		draw_heard(owner);
		sync_answers(owner);
		process_chunks();
		following = true;
		$chip.el.hidden = true;
	}

	div.c("v3-now flex v gap", $b => {
		$box = $b;
		$stale = div.c("v3-now-stale card");
		$stale.el.hidden = true;
		$heard = div.c("v3-heard");
		$chip = button.c("v3-now-chip", "new ↓").attr("type", "button").click(() => show(newest_owner()));
		$chip.el.hidden = true;
		$answers = div.c("v3-now-answers flex v gap");
		Composer.box();
	});

	function on_scroll() {
		if (!document.contains($box.el)) { window.removeEventListener("scroll", on_scroll); return; }
		following = false;
	}
	window.addEventListener("scroll", on_scroll, { passive: true });

	show(newest_owner());

	return {
		update() {
			const owner = newest_owner();
			paint_stale(owner);
			if (owner?.id !== heard_id) {
				following ? show(owner) : ($chip.el.hidden = false);
				return;
			}
			sync_answers(owner);
			process_chunks();
		},
	};
}

// Raw hit counts and per-id history, over timeline's own (doc/notes.md#raw-hit-counts-and-per-id-history-over-timelines-own)
class Weighted extends Timeline {
	hits = new Map();
	history = new Map();
	card(value) {
		if (value.id != null) {
			this.hits.set(value.id, (this.hits.get(value.id) ?? 0) + 1);
			(this.history.get(value.id) ?? this.history.set(value.id, []).get(value.id)).push(value);
		}
		super.card(value);
	}
	reset() { this.hits = new Map(); this.history = new Map(); return super.reset(); }
}

// How much a card matters, right now (doc/notes.md#how-much-a-card-matters-right-now)
function weight(c, log, focus_id) {
	const hits = log.hits.get(c.id) ?? 1;
	const first_word = (c.title ?? "").trim().split(/\s+/)[0]?.toLowerCase();
	const mentions = log.cards.filter(o => author_of(o) === "owner" && (
		o.text?.includes(c.id) || (first_word && o.text?.toLowerCase().includes(first_word))
	)).length;
	const at = Date.parse(c.updated_at ?? c.at ?? 0) || 0;
	const recency = Math.max(0, 1 - (Date.now() - at) / (2 * 60 * 60 * 1000));
	const focus_bonus = c.id === focus_id ? Math.max(0, 1 - (Date.now() - at) / (10 * 60 * 1000)) * 2000 : 0;
	return (c.status === "needs-you" ? 1000 : 0) + focus_bonus + hits * 3 + mentions * 8 + recency * 12;
}

// The one card currently in focus (doc/notes.md#the-one-card-currently-in-focus)
function newest_focus_id(log) {
	const focused = log.cards.filter(c => c.focus);
	if (!focused.length) return null;
	return focused.reduce((a, b) =>
		Date.parse(b.updated_at ?? b.at ?? 0) > Date.parse(a.updated_at ?? a.at ?? 0) ? b : a).id;
}

const short_title = c => c.title ?? c.say ?? "(untitled)";
const children_of = (id, log) => log.cards.filter(c => c.parent === id);

// .card's own status edge (doc/notes.md#cards-own-status-edge)
const EDGE = { "needs-you": "var(--prime)", working: "var(--warn)", done: "var(--ok)" };
const edge_of = status => EDGE[status];

// The owner's own card that this one answers (doc/notes.md#the-owners-own-card-that-this-one-answers)
function heard_of(c, log) {
	return c.re ? log.cards.find(o => o.id === c.re) ?? null : null;
}

// Text up to its first full stop (doc/notes.md#text-up-to-its-first-full-stop)
function strip_md(s) {
	return s
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")            // # heading
		.replace(/^\s{0,3}[-*+]\s+/gm, "")             // - bullet
		.replace(/^\s{0,3}\d+\.\s+/gm, "")             // 1. bullet
		.replace(/^\s{0,3}>\s?/gm, "")                 // > quote
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")     // [label](url) -> label
		.replace(/`{1,3}([^`]*)`{1,3}/g, "$1")         // `code`
		.replace(/(\*\*|__)(.*?)\1/g, "$2")            // **bold**
		.replace(/(\*|_)(.*?)\1/g, "$2")               // *italic*
		.replace(/^\s*[-*_]{3,}\s*$/gm, "")            // --- rule
		.trim();
}

function first_sentence(c) {
	const text = strip_md((c.text ?? "").trim());
	if (!text) return "";
	// The first non-empty line, not split(\n)[0] (doc/notes.md#the-first-non-empty-line-not-splitn0)
	const line = text.split("\n").map(l => l.trim()).find(Boolean) ?? "";
	const stop = line.indexOf(". ");
	return stop === -1 ? line : line.slice(0, stop + 1);
}

function ranked_of(cards, log) {
	const focus_id = newest_focus_id(log);
	return cards.map(c => ({ c, w: weight(c, log, focus_id) })).sort((a, b) => b.w - a.w).map(r => r.c);
}

function wall($wall, log, page, sort, verdicts, get_show_approved) {
	// The owner's own words are the log's business, not an idea (doc/notes.md#the-owners-own-words-are-the-logs-business-not-an-idea)
	const every_card = log.cards.filter(c => author_of(c) !== "owner" && !c.parent);
	const top_level = get_show_approved() ? every_card : every_card.filter(c => !is_approved(c.id, verdicts));
	if (!every_card.length) return p.c("muted", "Nothing yet — the board is empty.");
	if (!top_level.length) return p.c("muted", "Nothing left to review — the count above brings approved cards back.");

	const newest = sort.get({ order: "weight" }).order === "newest";
	div.c("v3-sort flex v-center gap", () => {
		span.c("v3-sort-note muted", newest ? "sorted newest first"
			: "sorted by importance: needs you, then most discussed, then newest");
		button.c("v3-sort-toggle").text(newest ? "sort by importance" : "sort by newest").click(() => {
			sort.patch({ order: newest ? "weight" : "newest" });
			$wall.empty(() => wall($wall, log, page, sort, verdicts, get_show_approved));
		});
	});

	const ordered = newest
		? [...top_level].sort((a, b) => Date.parse(b.updated_at ?? b.at ?? 0) - Date.parse(a.updated_at ?? a.at ?? 0))
		: ranked_of(top_level, log);
	const top = newest ? new Set() : new Set(ordered.slice(0, 2).map(c => c.id));

	div.c("v3-cards grid gap", () => ordered.forEach(c => tile(c, top.has(c.id), log, page)));
}

function tile(c, big, log, page) {
	const kids = children_of(c.id, log);
	const sentence = first_sentence(c);
	a.c("card v3-tile" + (big ? " v3-tile-big" : ""))
		.style({ "--card-edge": edge_of(c.status) })
		.href(page.url + c.id + "/")
		.append(() => {
			if (c.icon) div.c("v3-tile-head flex v-center", () => icon(c.icon));
			div.c("v3-tile-title", short_title(c));
			if (sentence) div.c("v3-tile-sentence", sentence);
			if (kids.length) preview(kids, log);
			div.c("v3-tile-foot flex v-center", () => {
				span.c("v3-tile-author", author_label(author_of(c)));
				small.c("v3-tile-time", clock(c.updated_at ?? c.at));
			});
		});
}

/** Top three children by weight, one line each, "+N more" past that — the
    glance the owner asked a parent card to give without opening it. */
function preview(kids, log) {
	const ordered = ranked_of(kids, log);
	div.c("v3-preview flex v", () => {
		ordered.slice(0, 3).forEach(k => div.c("v3-preview-row flex v-center", () => {
			span.c("v3-preview-dot" + (k.status ? " v3-dot-" + k.status : ""));
			span.c("v3-preview-title", short_title(k));
		}));
		if (ordered.length > 3) div.c("v3-preview-more muted", `+${ordered.length - 3} more`);
	});
}

// The right column's content (doc/notes.md#the-right-columns-content)
function detail(c, log, page, verdicts, { skip_back = false, on_verdict } = {}) {
	// Not a regex trim of c.id off page.url (doc/notes.md#not-a-regex-trim-of-cid-off-pageurl)
	const up = page.url.split("/").slice(0, -2).join("/") + "/";
	const mine = author_of(c) === "owner";
	const heard = heard_of(c, log);

	div.c("v3-detail card").style({ "--card-edge": edge_of(c.status) }).append(() => {
		if (!skip_back) a.c("v3-back flex v-center").href(up).append(() => { span("‹"); span("back to the wall"); });

		// The owner's own words this card answers (doc/notes.md#the-owners-own-words-this-card-answers)
		if (heard) div.c("v3-heard", () => {
			div.c("v3-heard-head flex v-center gap", () => { icon("mic"); span.c("muted", "you said, " + clock(heard.at)); });
			div.c("v3-heard-text", heard.text || heard.title || "");
		});

		div.c("v3-detail-head flex v-center", () => {
			if (c.icon) icon(c.icon);
			// Same rule as the inbox row (doc/notes.md#same-rule-as-the-inbox-row)
			if (!mine) div.c("v3-detail-title", short_title(c));
			if (c.status) span.c("v3-status", status_word(c.status));
		});
		span.c("v3-time muted", author_label(author_of(c)) + " · " + clock(c.updated_at ?? c.at));

		// Full markdown, not one p() per line (doc/notes.md#full-markdown-not-one-p-per-line)
		if (String(c.text ?? "").trim()) div.c("v3-detail-text").md(String(c.text));
		if (c.demo && typeof Demos[c.demo] === "function") demo(Demos[c.demo], c.caption ?? "");
		if (c.code) pre.c("v3-code", c.code);
		if (c.links?.length) div.c("v3-links flex wrap", () => c.links.forEach(l => a(l.label ?? l.url).href(l.url)));

		// Resurfacing's other half (doc/notes.md#resurfacings-other-half)
		if (c.see) {
			const seen_card = log.cards.find(x => x.id === c.see);
			if (seen_card) a.c("v3-see flex v-center gap").href(BOARD + seen_card.id + "/").append(() => {
				if (seen_card.icon) icon(seen_card.icon);
				span.c("v3-see-title", short_title(seen_card));
				if (seen_card.status) span.c("v3-status", status_word(seen_card.status));
			});
		}

		// Prompt cards (doc/notes.md#prompt-cards)
		if (Array.isArray(c.ask) && c.ask.length && edit()) {
			div.c("v3-ask-block").append(() => {
				if (c.answer) small.c("muted", `you answered: ${c.answer}`);
				else AskControls.draw(c, () => {});
			});
		}

		const kids = children_of(c.id, log);
		if (kids.length) div.c("v3-children", () => {
			div.c("v3-history-head muted", `${kids.length} inside`);
			div.c("v3-cards grid gap", () => ranked_of(kids, log).forEach(k => tile(k, false, log, page)));
		});

		const past = (log.history.get(c.id) ?? []).slice(0, -1);
		if (past.length) div.c("v3-history flex v", () => {
			div.c("v3-history-head muted", `${past.length} earlier update${past.length === 1 ? "" : "s"}`);
			past.forEach(h => div.c("v3-history-row muted", `${clock(h.at)} — ${h.title ?? h.say ?? h.text ?? ""}`));
		});

		// Inbox zero 2 (doc/notes.md#inbox-zero-2)
		if (!mine && edit()) {
			if (can_judge(c)) verdict_controls(c, verdicts, on_verdict);
			else div.c("v3-verdict muted", ineligible_reason(c));
		}
	});
}

/** Why a card carries no Approve/Improve — one plain sentence, never a bare
    blank where a control used to be. */
function ineligible_reason(c) {
	if (c.status === "working") return "Still in progress — nothing finished yet to judge.";
	if (c.status === "needs-you") return "This is asking for your decision directly, not a verdict on finished work.";
	if (!c.status) return "No status yet, so nothing finished to judge — check back once it reports done.";
	return "Not eligible for a verdict.";
}

// Approve / improve, right on the card's own detail (doc/notes.md#approve-improve-right-on-the-cards-own-detail)
function verdict_controls(c, verdicts, on_verdict) {
	const $box = div.c("v3-verdict");
	draw();

	function draw() {
		const state = verdict_of(c.id, verdicts);
		$box.empty(() => {
			if (state?.say === "approve") {
				div.c("flex wrap v-center gap", () => {
					small.c("v3-verdict-state", () => { icon("check_circle"); span(" approved · " + clock(state.at)); });
					button("undo").attr("type", "button").click(() => send("reopen", ""));
				});
				return;
			}
			if (state?.say === "improve") {
				div.c("flex wrap v-center gap", () => {
					small.c("v3-verdict-state", () => { icon("flag"); span(" improve requested · " + clock(state.at)); });
					button("approve instead").attr("type", "button").click(() => send("approve", ""));
					button("change").attr("type", "button").click(note_box);
				});
				if (state.note) small.c("v3-verdict-note muted", `“${state.note}”`);
				return;
			}
			// Say what the button will do (doc/notes.md#say-what-the-button-will-do)
			div.c("v3-verdict-hint muted",
				"Approve marks this done and clears it from your inbox (undo brings it right back). Improve sends a one-sentence note to the mastermind and keeps this here.");
			div.c("flex wrap v-center gap", () => {
				button.c("prim").attr("type", "button")
					.attr("title", "Marks this done and removes it from your inbox. You can undo it right after.")
					.text("Approve").click(() => send("approve", ""));
				button("Improve").attr("type", "button")
					.attr("title", "Write one sentence saying what to change — it goes to the mastermind's inbox and this card stays here until it's fixed.")
					.click(note_box);
			});
		});
	}

	// Improve with no sentence tells nobody anything (doc/notes.md#improve-with-no-sentence-tells-nobody-anything)
	function note_box() {
		$box.empty(() => {
			const $t = textarea().attr("rows", "2").attr("placeholder", "What is wrong with it? One sentence is enough.");
			let $warn;
			div.c("flex wrap v-center gap", () => {
				button.c("prim").attr("type", "button").text("Send: improve").click(() => {
					const note = $t.el.value.trim();
					if (!note) {
						if (!$warn) $warn = small.c("v3-verdict-note muted", "Say what to improve first — the mastermind needs a sentence to act on.");
						return;
					}
					send("improve", note);
				});
				button("cancel").attr("type", "button").click(draw);
			});
		});
	}

	async function send(say, note) {
		// Not a bare owner literal (doc/notes.md#not-a-bare-owner-literal)
		const ok = await write_verdict(c.id, say, note);
		if (!ok) { $box.empty(() => small.c("muted", "The dev server would not take that — is it running?")); return; }
		if (say === "improve" && note) {
			const delivered = await relay_to_mastermind(`Improve on "${short_title(c)}" (${c.id}): ${note}`);
			if (!delivered) console.warn("inbox-zero: no open mastermind run right now — the note is saved on the card but was not relayed.");
		}
		on_verdict?.(say, note);
	}
}

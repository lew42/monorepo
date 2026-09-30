import { Page, View, div, p, span, small, a, button, label, input, details, summary, h1, h4 } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { Groups } from "./groups.js";
import { task_of, task_region } from "./tasks.js";
import { when } from "./faces.js";
import grip from "/framework/ext/grip/grip.js";
import composer from "./compose.js";
import { row, full, flag_box, toc, sub_full, news_bar } from "./faces.js";
import { news_of, group_news } from "./activity.js";
import { inbox_order, plain, first_sentence, Board, Says, BOARD_URL, VERDICTS_URL, prompt_stream, card_stream, day_log, items, sub_rows, sub_row, say, new_card, archive_card, refs, CardList, create_card, resolve_card, is_folder_id, servex_up } from "./inbox.js";

/* Servex down: the page is read-only — the write buttons quietly go away. */
servex_up().then(ok => { if (!ok) document.head.append(Object.assign(document.createElement("style"), { textContent: "@layer site { .ai2-newcard { display: none } }" })); });
import Card, { card_link } from "./card.js";
import overview from "./overview.js";
import needs_view, { watch_needs, score_for } from "./needs.js";
import log_view from "./log.js";
import chat from "./chat.js";
import mount_chat from "/framework/ux/Dictate/chat.js";
import { LIVE, live_model, live_row, live_full, usage_head } from "./live.js";
import { money, cost_of } from "/framework/ext/AITask/cost.js";
import { progress_of, meter } from "./meter.js";
import { agent_cost } from "./agents.js";
import workspace from "./workspace.js";
import { RealPage, page_events, page_face, real_title } from "./real.js";
import { unseen } from "./activity.js";
import { is_read, mark_read, archive_row, is_resolved } from "./rules.js";

View.stylesheet(import.meta, "ai2.css");

/**
 * AI 2 — A LIST ON THE LEFT, ONE PAGE ON THE RIGHT, AND NOTHING EVER JUMPS
 * (the owner, 2026-09-22: "as a new card is added, the whole thing gets pushed
 * down. It's jumpy… We need a left sidebar that previews the things, and then
 * when we click on one it stays selected and then I have a persistent page").
 *
 * THE SELECTION IS THE URL. A preview is a plain `<a>` to `/framework/ai2/<id>/`
 * and `route()` below makes that a real address, so the Router navigates it,
 * marks the row, and Back, a reload and a pasted link all just work. Nothing
 * here draws a selection by hand.
 *
 * NOTHING JUMPS, for three separate reasons: the page on the right is a
 * DIFFERENT PAGE from the list; the rail and the page each SCROLL INSIDE
 * THEMSELVES; and a new row only enters the list WHEN THE LIST IS QUIET —
 * otherwise it waits behind the pill. `doc/decisions.md` has the measurements
 * and what was tried instead.
 *
 * The parts: `inbox.js` decides what there is to draw, `card.js` draws a card
 * (small in the rail, whole on the page), `compose.js` is the box you talk to,
 * `ai2.css` is the look. This file is the shell and the selection.
 */
export default new Page({
	meta: import.meta,
	title: "AI 2",
	description: "Everything that happened and everything you said, as one inbox.",
	icon: "smart_toy",
	classes: "full fill",

	/* ⚠ "I present myself, not my children" (core/Page). Without it every card
	   you open becomes a row in the SITE'S nav tree: `route()` memoises each
	   card page into `children` and the sidebar walks that map. */
	leaf: true,

	/* THE DEFAULT VIEW IS INBOX AGAIN (the owner, 2026-09-30: "the AI 2 root is confusing and
	   jumpy" — Needs You as the bare-url default, tried 2026-09-29, is reverted). The rail + a
	   card's own page is back at the bare url, same as every day before 2026-09-29; "Needs
	   you" moved to its own address, `needs/`, drawn exactly like `overview/` — a routed page
	   that takes over the whole shell. EVERY view here is a url, never a class flipped by a
	   button (the owner, 2026-09-23: "we can't just have these buttons that when clicked
	   switch the view manually").
	   ⚠ CARD PAGES STILL LIVE AT `this.url + id + "/"`, unchanged. Inbox alone wears
	     `.tab-default` (ext/tabs' own "not really a match" flag — see `.tab-bar` rules,
	     `tabs.css`) because its href IS the root url, a prefix of every other route — without
	     it `.in-path` would light Inbox for a card, Needs you or Overview too. With nothing
	     else matching, `ext/tabs`' own fallback lights the tab-bar's DOM `:first-child` — which
	     is Inbox, kept first in the markup on purpose (`ai2.css`'s `order` then draws it
	     wherever it visually belongs). A card route matches no tab's own href, so it always
	     falls through to that same fallback: Inbox lights, same as the bare url itself. */
	/* ⚠ "NEEDS YOU" LEFT THE TAB STRIP, 2026-09-30 (the mastermind's own correction to this
	   task's brief): it is now the rail's own filter CHIP — the "Needs review" checkbox in
	   `board()`, below, relabelled "Needs you" and carrying the same count badge this tab
	   used to. `needs/` is still a real, working address (`route()` still answers it, just
	   below) for an old link or a bookmark — it is only unlinked from the strip. */
	content(){
		div.c("ai2-head", () => {
			div.c("doc-well", () => h1.c("doc-title h2", "AI 2"));
			div.c("tabs block", () => div.c("tab-bar", () => {
				a.c("tab tab-default ai2-tab-inbox").href(this.url).text("Inbox");
				a.c("tab ai2-tab-log").href(this.url + "log/").text("Log");
				a.c("tab ai2-tab-overview").href(this.url + "overview/").text("Overview");
			}));
		});
		// THE RAIL IS ALWAYS MOUNTED (reverted 2026-09-29's root-level "Needs you" swap) — every
		// route, including the bare url, shows it; `needs/` and `overview/` take over the whole
		// shell instead, the same `:has(.active-page)` trick `overview/` already used.
		div.c("ai2-shell", () => { this.ai2 = board(this); });
	},

	/* A card's own address — or the overview's, Needs you's, or the Log's. ⚠ A name with a dot
	   in it is a real file, and claiming it would answer a 404 with a card page that can
	   never load. `overview`, `needs`, `log`, `live` and `now` are reserved: no card can be
	   called any of them. `live` is an ordinary card page whose card comes from `live.js`;
	   `now` (followup.md item 2, 2026-09-30) is a REAL card folder, `ai/now/`, routed the
	   same plain way as any other card id below — the only thing special about it is that
	   `board()` also pins its preview at the top of the rail, imported by hand. */
	route(id){
		if (id.includes(".")) return undefined;
		if (id === "overview") return this.overview_page ??= overview_page(this);
		if (id === "needs") return this.needs_page ??= needs_page(this);
		if (id === "log") return this.log_page ??= log_page(this);
		// THE OLD ADDRESS STILL WORKS (2026-09-29 to 2026-09-30, briefly the default) — a link
		// or a bookmark made during that window still opens the same rail-and-card view the
		// bare url shows again now.
		if (id === "inbox") return this.inbox_page ??= inbox_page(this);
		if (id === LIVE) return this.live_page ??= card_page(this, LIVE);
		if (id === "now") return this.now_page ??= card_page(this, "now");
		// A CARD FOLDER'S ADDRESS starts with its year — `2026/09/24/<slug>/`,
		// sub-cards one segment deeper, any depth. The year, month and day are
		// pages too (`Card.Folder`), each reading the next one down from the
		// folder, so nothing is probed. `view` is reserved like `overview`.
		if (/^\d{4}$/.test(id)) return new Card.Folder({ id, title: id, shell: this });
		// A REAL SITE PAGE, shown here as itself: `framework/core/Page/` is the page at
		// `/framework/core/Page/` — the same Page object and view (real.js).
		if (id === "framework") return new RealPage({ path: "/framework/", title: "framework", shell: this });
		if (id === "view") return this.views_page ??= views_page(this);
		return card_page(this, id);
	},
});

const RAIL_KEY = "ai2-rail-w";
const AUTO_KEY = "ai2-auto-transcribe";
const LIVEVIEW_KEY = "ai2-live-default";

/* ⚠ Storage can throw (a private window, blocked site data) and a bare read here stopped the
   whole rail drawing. Every read and write on this page goes through `store`. */
const store = {
	get: k => { try { return localStorage.getItem(k); } catch { return null; } },
	set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
	drop: k => { try { localStorage.removeItem(k); } catch {} },
};

/** On by default (item 10) — a card you just opened starts listening unless
 *  you turned this off, remembered in this browser like `DEVICE_KEY`. */
const auto_transcribe = () => store.get(AUTO_KEY) !== "off";

/* The id "+ New card" just minted, waiting for its page to be built.
   ⚠ NOT a `?new=1` in the url, which is the obvious way and is silently wrong:
     `Router.go()` LOADS FIRST AND PUSHES THE URL SECOND, so while the new page's
     `content()` runs `location.search` still belongs to the page you are
     LEAVING. One variable, set before the navigation and taken by the page that
     was asked for, cannot be read at the wrong moment. */
// It lives on the page itself (`page.opening`), because `card.js` reads it too.

/* The Overview tab: one big card per concept (overview.js), as a page of its own — it
   mounts in the detail column like a card does, and `ai2.css` hands it the whole width
   while it is the active page. */
function overview_page(root){
	return new Page({
		title: "Overview",
		url: root.url + "overview/",
		classes: "ai2-overview-page",
		content(){ overview(); },
	});
}

/* The Needs you tab (was the bare url, 2026-09-29 to 2026-09-30): one ranked list of
   everything waiting on the owner, `needs_view()` (needs.js), as a page of its own — it takes
   over the whole shell like Overview does, right below. */
function needs_page(root){
	return new Page({
		title: "Needs you",
		url: root.url + "needs/",
		classes: "ai2-needs-page",
		content(){ needs_view(); },
	});
}

/* The Log tab (the owner, 2026-09-30): everything in flight, one row per task, each with a
   status dot — `log_view()` (log.js). It reads the SAME task list Overview and a card's own
   Tasks tab already load (`root.ai2.on_tasks`, the group-cost hook below), so nothing is
   fetched twice; it takes over the whole shell like Overview and Needs you do. */
function log_page(root){
	return new Page({
		title: "Log",
		url: root.url + "log/",
		classes: "ai2-log-page",
		content(){ log_view(root.ai2.on_tasks); },
	});
}

/* The Inbox tab: exactly what the bare url used to show — nothing of its own beyond the
   rail (`board()`, always mounted) and its usual empty state, so a first click here (or the
   `LIVEVIEW_KEY` redirect below) reads the same as it always has. */
function inbox_page(root){
	return new Page({
		title: "Inbox",
		url: root.url + "inbox/",
		classes: "ai2-inbox-page",
		content(){
			div.c("ai2-empty muted", () => {
				span("Pick something on the left.");
				small("It opens here and stays here while the list keeps filling.");
			});
		},
	});
}

function board(page){
	const log = new Board({ url: BOARD_URL });
	const says = new Says({ url: VERDICTS_URL });
	const day = day_log();
	const stream = prompt_stream();
	const live = live_model({ prompts: stream, day });
	/* A CARD MADE FOR YOU OPENS ON YOUR SCREEN (the owner, 2026-09-25: "if I say 'create a new card',
	   you put a card called New card and FOCUS it on my screen, and whatever I ask you to do starts
	   populating"). An agent writes `{"type": "focus", "ref": "<card id>"}` to the Live card's log
	   (`append_log` name `cards/live`); every open AI 2 page hears it over the push stream and
	   goes to that card. Live pushes only, never a replay: a focus older than two minutes, or one
	   already followed, is ignored. Other new cards never jump the screen. */
	const followed = new Set();
	live.log.on(e => {
		if (e?.type !== "focus" || !e.ref || followed.has(e.ref + e.at)) return;
		if (Date.now() - Date.parse(e.at ?? 0) > 2 * 60 * 1000) return;
		followed.add(e.ref + e.at);
		folders.refresh?.().finally(() => page.app?.router?.go(workspace.url(page.url + String(e.ref).replace(/^\/+|\/+$/g, "") + "/")));
	});
	// Every card folder, as Servex lists them; `board.jsonl` is only read when this is not `ok`.
	const folders = new CardList();
	// The familiar groups the work is filed under — `groups.json`, `groups.js`.
	const groups = new Groups();
	page.auto_transcribe = auto_transcribe;

	let list = [], shown = [], current = null, hovering = false, flagging = null, only_notes = false, show_archived = false;
	// IDS ARCHIVED FROM THIS LIST (× or "clear all") whose write to Servex may still be in
	// flight, or may never land (this worktree's own CORS gap on the card-write route) — kept
	// forever for the session, harmless at this size, so `paint()` can keep re-filing them under
	// `list.archived` no matter how many times the real data gets rebuilt from scratch under
	// them. See `paint()`'s own comment, and `apply_pending_archives()`, below.
	const archived_pending = new Set();
	// BRIEF E — "Needs review": on, the rail shows only the rows `needs.js`'s shared rule
	// (the same one the Needs you tab reads) says still need the owner. Its state lives in the
	// url (`?review=1`), never in a variable alone, so a reload keeps the filter on.
	let review_only = new URLSearchParams(location.search).get("review") === "1";
	// INBOX ZERO — THE DISPLAY RULE (followup.md §4, item 3, 2026-09-30): the Inbox shows only
	// rows scoring `min` or higher; `?min=0` shows everything, and the default (90) is what
	// makes the Inbox actually reach zero most days. A missing `?min=` and a missing `it.score`
	// both read as their usual defaults — `min` 90, a score 0 — never a thrown `NaN`.
	const min_score = Number(new URLSearchParams(location.search).get("min") ?? 90) || 0;
	// Is the floor on right now? Off while searching, showing archived, or at ?min=0.
	const floored = () => min_score > 0 && !search_q && !show_archived;
	let needs_ids = new Set();
	let group_order = [];
	const rows = new Map();        // id → { $row, sig }
	const at_of = new Map();       // row id (a group's as "group:<id>") → when it was last updated
	const group_rows = new Map();  // group id → { $row, sig }
	const page_rows = new Map();   // a real page's path → { $row, sig } (real.js)
	const waiting = new Set();     // ids that arrived while the list was busy
	const watching = new Set();    // the card pages on screen, each watching for its own card
	const list_watchers = new Set();   // the overview's own subscription onto this list
	// THE ORDER NEVER MOVES ON ITS OWN WHILE YOU ARE LOOKING (the owner, 2026-09-30: "the rail
	// reorders live and jumps as cards get new lines"). `applied_at` is a snapshot of each
	// row's `at_of` the LAST TIME the DOM was actually reordered; `pending_ids` is everyone
	// whose `at_of` has since moved on — shown as a count on `$updated`, never applied to the
	// DOM, until a tap on that pill (or a fresh load) asks for it. See `order_rows()`.
	let applied_at = new Map();
	const pending_ids = new Set();
	// A fresh mount keeps applying every reorder for a couple of seconds while the board, the
	// groups and the task folders each finish their own first load — see `order_rows()`.
	const settle_until = Date.now() + 2500;
	let $shell, $count, $pill, $updated, $rows, $detail, $sub, $flagger, $notes, $archived, $ws;
	let $groups, $pinned, $unfiled, $unfiled_head, $list, $needs_count, $search;
	// DELIVERABLE 5 — SEARCH: a plain substring match on a card's title and text, kept in this
	// closure only (not the url — the smallest version the brief asks for; `review_only` and
	// `only_notes` already show the pattern for making a filter a real address later).
	let search_q = "";
	// THE ONE THING SHOWING IN `$detail` — a top-level card (`open()`'s `h.top`), never a sub-card
	// beside it: drilling into a request must not hide the workspace word for the card still open
	// next to it. `null` while nothing top-level is open (the bare inbox, a real site page, a view).
	let ws_owner = null;

	/* `bleed` is the page grid's own word for "the whole region" — without it
	   this draws inside the prose track and the rail and the page share 52em. */
	$shell = div.c("ai2 bleed", () => {
		// ⚠ No `flex v` utility: util beats theme, so a `.flex` here could never
		// be hidden by the `< 40em` rule. The column is declared in ai2.css.
		div.c("ai2-rail", () => {
			/* THE WHOLE CHROME IS TWO LINES: one composer, one row of words.
			   Nothing else — the owner counted the rows above the first card and
			   called it "a third of my screen". */
			div.c("ai2-top", () => {
				// The rail names itself (the owner, 2026-09-25): "a small H4 above the progress bars that
				// says AI inbox. This is the inbox mode, and it identifies this as the navigation rail."
				h4.c("ai2-rail-name", () => {
					span("AI inbox");
					// THE WORKSPACE VIEW, an experiment (workspace.js): a full navigation to this same
					// page with `?view=workspace` flipped. `target` keeps the Router's hands off it.
					// ⚠ SHOWN ONLY WHEN IT WOULD DO SOMETHING (the owner, 2026-09-28: "what is this
					// workspace link?? it doesn't do anything") — hidden here at rest, then toggled by
					// `render_ws()`, which only ever runs for a TOP-LEVEL card (`open()`'s `h.top`), never
					// for a sub-card beside it, a real site page, or the bare inbox. `.el.hidden` starts
					// true so a slow first paint never flashes a dead-looking word.
					$ws = a.c("ai2-word ai2-ws-word").attr("target", "_self").attr("hidden", "")
						.click(e => { e.preventDefault(); location.assign(workspace.flipped()); })
						.on("pointerenter", e => { e.currentTarget.href = workspace.flipped(); });
				});
				usage_head(live);
				// THE TEXT AREA AND SEND BUTTON THAT USED TO SIT HERE ARE GONE (brief E — the
				// owner, 2026-09-29: "I don't need that text area or the send button… I've never
				// used that. I think a new card is supposed to do what it needs to"). The row
				// below is the toolbar now: "+ New card" and the filters.
				div.c("ai2-chrome flex v-center gap-25", () => {
					// A blank workspace that listens: the card exists on the board
					// the moment you press this, and the url becomes its own.
					button.c("ai2-newcard").attr("type", "button")
						.attr("title", "an empty card that starts listening — everything you say goes into it")
						.text("+ New card")
						.click(async () => {
							// A FOLDER, made by Servex — the only writer of card folders.
							// Servex down or without the card routes: the old board card.
							const made = await create_card({ title: "New card" });
							const id = made?.ok ? made.id : await new_card();
							if (!id) return;
							if (made?.ok) await folders.refresh();
							page.opening = id;
							page.app?.router?.go(workspace.url(page.url + id + "/"));
						});
					// THE FIRST FILTER (brief E, "room for more filters later"), RELABELLED "Needs
					// you" 2026-09-30 and carrying the count badge the old "Needs you" TAB used to
					// wear, now that the tab itself is gone (deliverable 1) — the SAME rows the
					// `needs/` page still lists, never a second idea of what needs the owner. Its
					// own state is the url, so a reload or a pasted link keeps the filter on.
					label.c("ai2-review flex v-center gap-25 muted")
						.attr("title", "show only what's waiting on you").append(() => {
							const $review = input().attr("type", "checkbox");
							$review.el.checked = review_only;
							$review.on("change", e => {
								review_only = e.target.checked;
								const url = new URL(location.href);
								if (review_only) url.searchParams.set("review", "1");
								else url.searchParams.delete("review");
								history.replaceState({}, "", url.pathname + url.search + url.hash);
								relist();
							});
							span("Needs you");
							$needs_count = small.c("ai2-tab-badge").attr("hidden", "");
						});
					// LIVE IS THE DEFAULT VIEW. The "Live" toggle that sat here is gone (ai2-lead
					// audit, 2026-09-25): it looked like a link to Live, and the Live row just below
					// already is one. A stored "off" from it is still honoured.
					label.c("ai2-auto flex v-center gap-25 muted").attr("title", "a new card starts listening on its own — turn off to start it silent").append(() => {
						const $auto = input().attr("type", "checkbox");
						$auto.el.checked = auto_transcribe();
						$auto.on("change", e => store.set(AUTO_KEY, e.target.checked ? "on" : "off"));
						// "-transcribe" is its own span so a rail dragged narrow can say just
						// "auto" and keep the head at two lines (ai2.css, `.ai2-auto-tail`).
						span(() => { span("auto"); span.c("ai2-auto-tail").text("-transcribe"); });
					});
					// DELIVERABLE 5 — SEARCH, over the rail's own plain cards (not the groups or
					// real-page rows, which draw and filter themselves — the smallest version of
					// this ask; widening it to those is a separate, later change).
					$search = input.c("ai2-search").attr("type", "search").attr("placeholder", "Search…")
						.attr("title", "filter the list below by title or text")
						.on("input", e => { search_q = e.target.value.trim().toLowerCase(); relist(); });
					$count = div.c("ai2-count flex v-center gap-25");
				});
			});
			// The box the pill floats over — in the flow, its own arrival pushed
			// every row down 36px.
			div.c("ai2-stream", () => {
				$pill = button.c("ai2-new prim").attr("type", "button").click(() => flush(true));
				// THE GROUPS FIRST (the owner, 2026-09-24: "the left list of
				// previews should primarily be GROUPS, familiar groups"), then the
				// Live card, then — folded and quiet — everything no group holds yet.
				$rows = div.c("ai2-rows", () => {
					// NEW ACTIVITY ON A ROW ALREADY ON SCREEN — never moves it out from under you
					// on its own; this pill says how many rows have new activity, and a tap
					// re-sorts. ⚠ STICKY, INSIDE the scrolling box, NOT `.ai2-new`'s floating
					// `position: absolute` — that sat on top of the Live row's own head, hiding it
					// (review finding 3, 2026-09-30). Sticky pushes the row below it down instead.
					$updated = button.c("ai2-updated").attr("type", "button").attr("hidden", "")
						.click(() => order_rows(true));
					$groups = div.c("ai2-groups");
					$pinned = div.c("ai2-pinned");
					$groups.el.before($pinned.el);
					$unfiled = div.c("ai2-unfiled", () => {
						$unfiled_head = div.c("ai2-unfiled-head muted");
						$list = div.c("ai2-list");
					});
				});
			});
			// Archived, never deleted — hidden by default; this word shows the
			// count and, on click, shows them again in the same list, greyed.
			// The foot of the rail: the card views — today, open, all, a tag, each
			// its own address — the notes filter, and the archived word. Down here, not in the
			// chrome row above, which is already full at the rail's narrowest.
			div.c("ai2-rail-foot flex v-center", () => {
				a.c("ai2-word page-link").href(page.url + "view/today/").attr("title", "today, open, all, or a tag").text("views");
				// Moved down from the chrome row (2026-09-24), which spilled past the
				// rail's edge at its default width — a filter on this list, like archived.
				$notes = button.c("ai2-word").attr("type", "button")
					.attr("title", "only the mastermind's notes to you")
					.text("notes").click(() => { only_notes = !only_notes; $notes.el.classList.toggle("on", only_notes); relist(); });
				$archived = button.c("ai2-word ai2-archived-word").attr("type", "button")
					.click(() => { show_archived = !show_archived; $archived.el.classList.toggle("on", show_archived); relist(); });
				// "CLEAR ALL" — INBOX ZERO, item 2 (the owner, 2026-09-30, followup.md §4):
				// archives every row the Inbox is CURRENTLY SHOWING (`visible()`, so it already
				// respects search, the Needs-you filter, notes, and — once item 3 lands — the
				// score floor), through the exact same `archive_row()` write the × button makes,
				// one row at a time. `clear_all()` is below, right after `render_pinned()`.
				button.c("ai2-word ai2-clear-all").attr("type", "button")
					.attr("title", "archive every row shown here right now")
					.text("clear all").click(() => clear_all());
			});
			grip({ from: "start", write: size, done: w => store.set(RAIL_KEY, w + "px"),
				reset: () => { store.drop(RAIL_KEY); size(); } });
		});

		// ⚠ THE MIDDLE COLUMN IS `page.$pages` — core's own word for "where my
		// child pages mount" (`Page.container()`), and that is the whole
		// master–detail: a card's page renders here, so the list never has to
		// know what one looks like.
		$detail = div.c("ai2-detail", () => {
			div.c("ai2-empty muted", () => {
				span("Pick something on the left.");
				small("It opens here and stays here while the list keeps filling.");
			});
		});

		// THE THIRD COLUMN — a sub-card (a task, a proposal, a transcript
		// paragraph), opened to the right of the card that owns it (deliverable
		// 2-3, ai2-nested: "dig down and move back up"). A card's own page sets
		// ITS `$pages` to point here instead of to a region inside itself, so a
		// sub-card page mounts as a peer of the detail column, not nested inside
		// it — which is what lets `.ai2:has(.ai2-sub > .page.active-page)` grow
		// the shell to three columns with no JS state of its own to get stale.
		$sub = div.c("ai2-sub");

		$flagger = button.c("ai2-selection-flag").attr("type", "button")
			.attr("title", "flag the text you selected").text("⚑");
	});

	page.$pages = $detail;
	// With the workspace view on, every AI 2 link clicked in here keeps `?view=workspace` (workspace.js).
	$shell.el.addEventListener("click", e => workspace.keep(e));
	// LIVE IS INBOX'S DEFAULT — the bare url (Inbox again, 2026-09-30) goes to it once per load
	// (Back returns here, no loop); the old `inbox/` address still works too, for a link or a
	// bookmark made during the 2026-09-29 to 2026-09-30 window when that was the real address.
	if ((location.pathname === page.url || location.pathname === page.url + "inbox/") && store.get(LIVEVIEW_KEY) !== "off" && !page.went_live){
		page.went_live = true;
		setTimeout(() => page.app?.router?.go(workspace.url(page.url + "live/")), 0);
	}
	page.$sub = $sub;

	size(parseInt(store.get(RAIL_KEY), 10) || null);

	/* ── the rail's width ───────────────────────────────────────────────── */

	// ⚠ Returns the width it actually applied, which is what `grip` then
	// remembers — clamped, so a drag past either end cannot hide a column.
	function size(px){
		const w = px ? Math.round(Math.max(200, Math.min(px, innerWidth - 320))) : null;
		$shell.style("--ai2-rail", w ? w + "px" : "");
		return w;
	}

	/* THE WORKSPACE WORD — called from `open()`/`close()` below, whenever the top-level
	   card in `$detail` changes. `ws_owner` is null for anything that toggle can never
	   affect (the bare inbox, a real site page, the Live page, an old non-folder card),
	   so the word simply stays hidden for all of them — no per-page special-casing here. */
	function render_ws(){
		const eligible = !!ws_owner?.ws;
		$ws.el.hidden = !eligible;
		if (!eligible) return;
		$ws.el.classList.toggle("on", workspace.on);
		$ws.el.href = workspace.flipped();
		$ws.el.title = workspace.title;
		$ws.text(workspace.label());
	}

	/* ── drawing the list ───────────────────────────────────────────────── */

	// THE LIST IS QUIET when you are at the top of it and not pointing at it.
	// That is the whole test a new card has to pass to enter on its own.
	const quiet = () => $rows.el.scrollTop <= 2 && !hovering;

	/* THE `notes` WORD — the mastermind's explanations to the owner, which are
	   `card` lines whose title starts "Note:" (`inbox.js` gives them
	   `kind: "note"`). They are always in the rail like any other card; this
	   word hides everything that is not one, so they can be found.
	   ⚠ Not a url, unlike the board's view words: `route()` above claims every
	     path segment as a card id, so `/framework/ai2/notes/` would open a card
	     called "notes". The url-backed views are item 14, deferred. */
	const visible = () => {
		// A thing filed in a group is shown THROUGH its group, never twice.
		// ...EXCEPT one active in the last half hour: a card the owner just made must be in sight at the top, as its own row, even when it is filed in a group (the group row rises too).
		const fresh = it => Date.now() - Date.parse(it.at ?? 0) < 30 * 60 * 1000;
		// A group's own card IS its group row: never a second row beside it.
		const group_cards = new Set((groups.list ?? []).map(g => g.card));
		// "now" is pinned in `$pinned` (`render_pinned()`) — it is in `list` only so its own
		// card page can find it in `by_id`, never as a second, ordinary row here.
		const pool = list.filter(it => it.id !== "now" && !group_cards.has(it.id) && (!groups.filed(it) || fresh(it)));
		let base = only_notes ? pool.filter(it => it.kind === "note") : pool;
		// DELIVERABLE 4 — AUTOMATIC RESOLUTION: a resolved row (`rules.js`'s `is_resolved()`,
		// this task's one written-down rule) leaves the Inbox itself, same as the brief asks —
		// not a dimmer shade of the same row, an actual absence. It still exists on its own
		// card page and in the Log; this is only the Inbox's own list.
		base = base.filter(it => !is_resolved(it));
		// BRIEF E's "Needs review" filter — `needs_ids` is the SAME set the Needs you tab lists
		// (`needs.js`'s one shared scan), so the two can never disagree about what still needs you.
		if (review_only) base = base.filter(it => needs_ids.has(it.id));
		// DELIVERABLE 5 — SEARCH FINDS ARCHIVED TOO (review finding #3: the brief's own words,
		// "including archived ones"). A non-empty query always pulls the archived pile in,
		// regardless of the separate "archived" toggle below — the two are different questions
		// ("show me archived" vs. "find this, wherever it is").
		const archived = (list.archived ?? []).filter(it => !groups.filed(it));
		if (search_q){
			const hit = it => (it.title + " " + (it.text ?? "")).toLowerCase().includes(search_q);
			return [...base.filter(hit), ...archived.filter(hit)];
		}
		// Archived cards join the SAME list, greyed by `refill()` — a second word
		// to click, never a second view to build.
		if (show_archived) return [...base, ...archived];
		// THE SCORE FLOOR — search and "archived" above both ignore it (they answer "find this
		// anywhere", a different question); the Live card is exempt too, the same way it is
		// exempt from resolution and archiving everywhere else in this file, since hiding the
		// page's own always-there row under a score it was never meant to carry would be a
		// regression, not a filter. No write happens here — a row below `min` still exists,
		// still answers search, still lands in the Log; it only leaves THIS list.
		return base.filter(it => it.kind === "live" || (it.score ?? 0) >= min_score);
	};

	function relist(){
		rows.forEach(rec => rec.$row.el.remove());
		rows.clear();
		shown = [];
		waiting.clear();
		flush(true);
	}

	function paint(){
		list = items({ board: log.cards, folders, prompts: stream.entries, landed: day.landings, says, groups });
		// DELIVERABLE 2 — READ/UNREAD: `items()` itself always says `unread: true` (its own
		// comment explains why: opening a card must never mark it read on its own). This is
		// the explicit control layered on top — `rules.js`'s `is_read`, set only by a press on
		// the row's own dot (`faces.js` `row()`'s `on.toggle_read`).
		list.forEach(it => { it.unread = !is_read(it.id); });
		// THE LIVE CARD joins the same list and the same newest-first sort, so an
		// update to anything in it lifts it to the top like any other arrival. It is always
		// shown as fresh — never read/archived/resolved, so it is left out of the line above.
		const it = live.item();
		it.unread = true;
		list.push(it);
		// THE NOW CARD joins the same list too, so its own `/framework/ai2/now/` page can find
		// it in `by_id` below — `visible()` is what keeps it OUT of the ordinary rows, since
		// `render_pinned()` is its only row, in `$pinned`.
		if (now_item) list.push(now_item);
		// A card row's importance badge is its highest open need (needs.js); a stalled-ask row
		// brings its own. Then one order: score 60+ on top, the rest newest first (inbox.js).
		// ⚠ `?? x.score`, not a bare overwrite (minion-priority, 2026-09-30) — `items()` now
		// carries the real age-decay score the INBOX ZERO filter reads; `score_for()` (needs.js)
		// only ever answers the narrower "needs you" question and is null for most rows, which
		// used to WIPE the real score out on every single paint().
		list.forEach(x => { if (x.kind !== "stalled") x.score = score_for(x.id) ?? x.score; });
		apply_pending_archives();
		list.sort(inbox_order);
		[...list, ...list.archived].forEach(it => { it.cost = row_cost(it); });
		// What bumped each row, while it is new to you (activity.js) — part of the row's signature.
		list.forEach(it => { it.news = news_of(it, groups.folds); });
		// Archived cards are findable too — a card page left open on one the
		// owner just cleared should still draw it (greyed, via `full()`), not
		// suddenly say "no card by that name".
		const by_id = new Map([...list, ...list.archived].map(it => [it.id, it]));

		count();
		watching.forEach(h => h.draw(by_id.get(h.id) ?? null));

		visible().forEach(it => { if (!rows.has(it.id)) waiting.add(it.id); });
		if (quiet()) flush();
		else pill();

		// Everything already on screen redraws in place, wherever it sits.
		shown.forEach(id => { const it = by_id.get(id); if (it) refill(rows.get(id), it); });
		draw_groups();

		// The overview (deliverable 7) reads the SAME list — one data pipeline,
		// two views — rather than opening its own copy of every log this page
		// already streams.
		list_watchers.forEach(fn => fn(list));
	}

	/* WHAT A ROW SHOWS — a progress bar and one dollar figure, written onto the item
	   itself so the whole-record signature in `refill()` redraws the row when either
	   moves. The dollars are the card's task when it has one, else what its own
	   agents spent (`agents.js` `agent_cost()`); nothing recorded yet is null. */
	function row_cost(it){
		if (it.kind === "live") return null;
		const url = task_of(it) ?? task_of(groups.folds.get(it.id)?.fold);
		const t = groups.task_member(url);
		const c = cost_of(t);
		it.usd = c ? c.usd : (it.folder ? agent_cost(it.id, () => paint()) : null);
		it.usd_open = !!c?.open;
		it.progress = progress_of(t, it.status);
		return null;
	}

	/* Let the waiting cards in — a STRUCTURAL change (a row appearing or leaving) is the only
	   thing `flush()` itself forces a reorder for, because a brand new row has no old position
	   to preserve and a removed one leaves nothing behind to jump. `to_top` is the pill's own
	   press (new cards, or the owner's explicit ask) and always forces one too. An EXISTING row
	   simply moving because its `at` changed is NOT forced here — `order_rows()` (called via
	   `draw_groups()` below) defers that behind the "N updated ↑" pill on its own, exactly like
	   it does for the ordinary `paint()` → `draw_groups()` path that runs when the list is not
	   quiet. ⚠ Before this, `flush()` ALWAYS forced a reorder, so the rail still jumped on
	   every quiet poll — a card's `at` moving is common (a group's member updates, a real page's
	   new event) and used to resort the instant the pointer merely sat off the rail, which is
	   most of an owner's actual reading time (2026-09-30 proof:
	   `/framework/ai/2026-09-30/ai2-inbox-log-fix/rail-stability-proof.md`). */
	function flush(to_top){
		const here = visible();
		const by_id = new Map(here.map(it => [it.id, it]));
		waiting.clear();

		const had_new = here.some(it => !rows.has(it.id));
		$list.append(() => { here.forEach(it => { if (!rows.has(it.id)) rows.set(it.id, make(it)); }); });
		let removed = false;
		rows.forEach((rec, id) => { if (!by_id.has(id)){ rec.$row.el.remove(); rows.delete(id); removed = true; } });

		// `appendChild` MOVES a node that is already in the tree, so this is the
		// sort applied to the DOM that already exists, with nothing rebuilt. The
		// Live card sits under the groups, in sight; the rest inside the fold.
		shown = here.map(it => it.id);
		// A box whose rows already stand in this order is left alone: re-appending
		// an in-place row still removes and re-adds it, dropping hover, focus and
		// a text selection, and each one is a mutation for nothing.
		here.forEach(it => at_of.set(it.id, it.at));
		draw_groups(!!to_top || had_new || removed);

		pill();
		if (to_top) $rows.el.scrollTo({ top: 0 });

		// ⚠ THE ROWS ARRIVE AFTER THE ROUTER HAS MARKED THE PAGE. On a cold load
		// of a card's url the Router marks during `activate()`, when this list
		// is still empty — without this line a pasted url opened the right card
		// and marked nothing. `mark_links()` is callable bare for exactly this.
		page.app?.router?.mark_links?.();
	}

	/* THE GROUP ROWS — one per group, a link to its card. Each redraws in place
	   when its newest member changes; the ORDER (newest activity first) is only
	   applied when the list is quiet, like any other row, or when `force`d by a
	   flush that is already moving rows. */
	function draw_groups(force){
		const order = groups.ordered();
		order.forEach(g => {
			let rec = group_rows.get(g.id);
			if (!rec){
				rec = { sig: null };
				$list.append(() => { rec.$row = a.c("ai2-row ai2-group-row").href(page.url + g.card + "/"); });
				group_rows.set(g.id, rec);
			}
			const latest = groups.latest(g.id);
			const size = groups.members(g.id).filter(m => m.kind !== "said");
			const tasks_cost = groups.cost(g.id);
			// The name is the card's LATEST title (Servex reads the newest `title` line); groups.json only names it first.
			const name = folders.card(g.card)?.title || g.name;
			// Money: the member tasks, else what the card's own assistant + manager spent (agents.js).
			const agents = tasks_cost?.tracked ? null : agent_cost(g.card, () => draw_groups());
			const spent = tasks_cost?.tracked ? tasks_cost : (agents ? { tracked: true, usd: agents, open: false } : tasks_cost);
			const news = group_news(g, latest, groups.at(g));
			const sig = JSON.stringify([g, name, latest, size.length, spent, news]);
			if (rec.sig === sig) return;
			rec.sig = sig;
			rec.$row.empty(() => { group_face(g, latest, size, spent, name); if (news) news_bar(news); });
		});
		order.forEach(g => at_of.set("group:" + g.id, groups.at(g)));
		// BRIEF E's "Needs review" filter — a group is not itself an "ask", so it shows only
		// while ITS OWN card is one of the rows `needs.js`'s shared scan lists; run every call
		// (not gated by the `sig` check above), so flipping the filter hides these at once.
		// INBOX ZERO: a group row obeys the same score floor as a card row — it shows only while
		// its own card, or one of its members, scores `min` or more (search, "archived" and ?min=0 lift it).
		const pressing = g => !floored() || [list.find(x => x.id === g.card), ...groups.members(g.id)].some(x => (x?.score ?? 0) >= min_score);
		order.forEach(g => { const rec = group_rows.get(g.id); if (rec) rec.$row.style({ display: ((review_only && !needs_ids.has(g.card)) || !pressing(g)) ? "none" : "" }); });
		draw_pages();
		order_rows(force);
	}

	/* THE REAL PAGES — one row per site page an event has named (`"page": "/framework/…/"`
	   on a line of the day log or a task log). The row is a link to that page shown here,
	   at `/framework/ai2/<its path>`; it sorts by its newest event, like everything else. */
	function draw_pages(){
		page_events(day, groups).forEach((evs, path) => {
			let rec = page_rows.get(path);
			if (!rec){
				rec = { sig: null };
				$list.append(() => { rec.$row = a.c("ai2-row ai2-page-row").href(page.url + path.slice(1)); });
				page_rows.set(path, rec);
			}
			// A real site page is never one of the owner's own asks — BRIEF E's "Needs review"
			// filter hides it outright rather than greying it.
			rec.$row.style({ display: (review_only || floored()) ? "none" : "" });  // a changed page is never pressing: Log only
			real_title(path, page.app?.router, () => draw_groups());
			at_of.set("page:" + path, evs[0].at);
			const sig = JSON.stringify([evs[0], RealPage.known.get(path), unseen("page:" + path, evs[0].at)]);
			if (rec.sig === sig) return;
			rec.sig = sig;
			rec.$row.empty(() => { page_face(path, evs); });
		});
	}

	/* ONE TIMELINE, NEWEST FIRST — BUT THE ORDER NEVER MOVES WHILE YOU ARE LOOKING (the owner,
	   2026-09-30: "the rail reorders live and jumps as cards get new lines"). Groups, the Live
	   card and cards share one list, sorted by when each was last updated. The OLD rule
	   reordered the moment the pointer happened to be off the rail and the scroll position was
	   at the top (`quiet()`) — which is most of the time the owner is actually reading the
	   detail column beside it, so the rail kept jumping under a gaze that was never on it.
	   ⚠ THE NEW RULE: a reorder is only EVER applied (1) the first time this list has any order
	   at all (`!group_order.length` — a fresh load, or right after a reload), (2) when `force`d
	   — `flush()` passes `true` for a row that is genuinely NEW (nothing on screen to jump: it
	   has no old position to move away from), and the "N updated ↑" pill's own tap does too. Any
	   other change in ORDER ALONE — an existing row simply moving because its `at` changed —
	   is counted into `pending_ids` and shown as a count on `$updated`, DOM untouched, until one
	   of those two moments. `applied_at` is a snapshot of every row's `at_of` from the last time
	   the DOM was actually reordered, which is what lets a later call tell "moved since" from
	   "always was there". */
	function order_rows(force){
		const entries = [
			...shown.filter(id => rows.has(id)).map(id => [id, at_of.get(id), rows.get(id).$row.el]),
			...[...group_rows].map(([id, rec]) => ["group:" + id, at_of.get("group:" + id), rec.$row.el]),
			...[...page_rows].map(([path, rec]) => ["page:" + path, at_of.get("page:" + path), rec.$row.el]),
		].sort((x, y) => (Date.parse(y[1] ?? 0) || 0) - (Date.parse(x[1] ?? 0) || 0));
		const want = entries.map(e => e[2]);
		const have = [...$list.el.children].filter(c => c.classList.contains("ai2-row"));
		const in_place = want.length === have.length && want.every((el, i) => el === have[i]);

		// Drop anything that left the list (archived, filtered out) from the pending count, then
		// add anyone whose `at` moved since the order on screen was last applied.
		const ids_now = new Set(entries.map(e => e[0]));
		for (const id of [...pending_ids]) if (!ids_now.has(id)) pending_ids.delete(id);
		entries.forEach(([id, at]) => { if (applied_at.has(id) && applied_at.get(id) !== (at ?? null)) pending_ids.add(id); });

		// STILL LOADING COUNTS AS A RELOAD, NOT "THE OWNER IS LOOKING" (review finding, 2026-09-30:
		// a fresh load showed "1 updated ↑" immediately — several independent streams (the board,
		// the groups, the task folders) each arrive and call `paint()` on their own, so an early
		// `order_rows()` call can apply a PROVISIONAL `at` for a group before its own task data has
		// loaded, then a later call within the same first second or two corrects it — a real
		// change in the data, but not one the owner had any chance to be reading yet). A short
		// grace window after mount keeps applying freely, same as "re-sort on reload" already
		// promises; `settle_until` is set once, below, from `Date.now()` at mount.
		const should_apply = force || !group_order.length || Date.now() < settle_until;
		if (!in_place && !should_apply) return update_updated_pill();   // defer — leave the DOM exactly as it is

		if (!in_place){
			group_order = want;
			want.forEach(el => $list.el.appendChild(el));
			page.app?.router?.mark_links?.();
		}
		applied_at = new Map(entries.map(([id, at]) => [id, at]));
		pending_ids.clear();
		update_updated_pill();
	}

	function update_updated_pill(){
		$updated.el.hidden = !pending_ids.size;
		if (pending_ids.size) $updated.text(pending_ids.size + " updated ↑");
	}

	/* A group's preview: its icon and name, the newest member's own words
	   WHOLE, and when — never a slug. */
	/* ⚠ ONE UPDATE, NOT THE MEMBER'S WHOLE STORY: all seven groups must fit the
	   rail at 1000px tall. A running task's first sentence plus its `now` made
	   one row 319px and pushed two groups off screen (measured, 1920). The
	   update is the `now` alone — the task's own sentence heads its section on
	   the group's card, one click away. */
	/* Its dollars sit in the same quiet line as its time: the member tasks
	   summed, each once, with a "+" while one of them still runs.
	   ⚠ The dollars TAKE THE PLACE of the "2 tasks" count, not a seat beside it:
	     all three words made the line wide enough to wrap three group titles
	     and push the Live card below the fold at 1920×1080. The count is still
	     one click away — the group's card lists every task and its cost. */
	function group_face(g, latest, members, spent, name = g.name){
		/* The same face as any card: name, a bar (member tasks landed of all), the money. */
		const tasks = members.filter(m => m.kind === "task");
		const done = tasks.filter(m => m.landed).length;
		div.c("ai2-row-head flex gap-25", () => {
			icon(g.icon);
			span.c("ai2-row-title").text(name);
			small.c("ai2-row-when muted").text(when(groups.at(g)));   // last updated, top-right, on every row
		});
		meter({ pct: tasks.length ? Math.round(100 * done / tasks.length) : 0, live: tasks.length > done, done, total: tasks.length, unit: "tasks" },
			spent?.tracked ? spent.usd : null, !!spent?.open);
	}

	function pill(){
		$pill.el.classList.toggle("on", waiting.size > 0);
		if (waiting.size) $pill.text(waiting.size + (waiting.size === 1 ? " new card ↑" : " new cards ↑"));
	}

	function count(){
		const n = visible().length;
		const count_sig = n + "|" + only_notes + "|" + stream.ok;
		if (count_sig !== count.sig) $count.empty(() => {
			// No "328 cards" count (ai2-lead audit, 2026-09-25): it answered nothing anyone asked.
			if (!stream.ok) span.c("ai2-off muted").text("· the assistant is off");
		});
		count.sig = count_sig;
		document.title = n ? "(" + n + ") AI 2" : "AI 2";

		const loose = visible().filter(it => it.id !== LIVE).length;
		// No "Cards (N)" heading: groups and cards are one timeline now, so it headed nothing.
		$unfiled_head.el.hidden = true;

		const a_n = list.archived.length;
		$archived.el.hidden = !a_n && !show_archived;
		$archived.text("archived (" + a_n + ")");
	}

	/* A ROW IS AN ANCHOR, and that is why there is no click handler here: the
	   Router navigates it, `Router.mark_links()` gives it `.active`, and Back
	   works for free. */
	function make(it){
		const rec = { sig: null, $row: a.c("ai2-row").href(page.url + it.id + "/") };
		refill(rec, it);
		return rec;
	}

	/* THE ONE PINNED ROW — the Now card. `now_item` is built once from `resolve_card("now")`'s
	   fold, in the SAME `it` shape `full()` (faces.js) already knows how to draw — `text`,
	   `links`, `kind`, `flag` — so the card's own `/framework/ai2/now/` page (`card_page()`
	   below) can find it. `paint()` pushes `now_item` into `list`, exactly like the Live card's
	   own `live.item()` does, which is what puts it in `by_id` for that page; `visible()`
	   excludes id `"now"` from the ordinary rail list right below, since this function is its
	   only row — filled into `$pinned`, above `$groups`, so `order_rows()`/`flush()` never
	   touch it and it is simply always first. */
	let now_item = null;
	function build_now_item(fold){
		const said = [...(fold.messages ?? []).map(m => ({ at: m.at, text: m.text ?? m.raw })),
			...(fold.prompts ?? []).map(p => ({ at: p.at, text: p.text ?? p.raw }))]
			.filter(x => x.text).sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0)).at(-1);
		now_item = { id: "now", kind: "card", icon: "push_pin", title: plain(fold.title || "Now"),
			at: fold.last ?? fold.created, text: said?.text ?? "", links: [], flag: null, author: fold.by,
			unread: false, status: "open" };
	}
	function render_pinned(){
		if (!now_item) return;
		$pinned.empty(() => { a.c("ai2-row ai2-row-pinned").href(page.url + "now/")
			.empty(() => row({ ...now_item, sub: first_sentence(plain(now_item.text)) }, {})); });
		// A cold load straight onto `/framework/ai2/now/` marks the Router during `activate()`,
		// before this fetch has landed — the same race `flush()`'s own comment names, below.
		page.app?.router?.mark_links?.();
	}

	/* THE ONE PLACE `archived_pending` TURNS INTO A REAL LIST MOVE — called from `paint()` on
	   every real rebuild (so a row already asked to leave never reappears under it, see
	   `paint()`'s own comment) and right after a click here, so the row leaves at once instead
	   of waiting for the next stream event to trigger a paint(). Safe to call with nothing
	   pending: the `for` loop below then touches nothing. */
	function apply_pending_archives(){
		for (let i = list.length - 1; i >= 0; i--){
			if (!archived_pending.has(list[i].id)) continue;
			const [removed] = list.splice(i, 1);
			removed.status = "archived";
			(list.archived ??= []).push(removed);
		}
	}

	/* "CLEAR ALL" (INBOX ZERO, followup.md §4, item 2, 2026-09-30: "a button in the rail head
	   that archives every row currently shown in the Inbox in one press… there are about 336
	   open cards today, so it must batch and not freeze"). One `confirm()`, then the SAME
	   `archive_row()` write the × button makes, BATCHED — a handful of these run at once, never
	   all 336, so the page (and Servex) stay responsive. The Live card and the pinned Now card
	   are never candidates: `visible()` already leaves them out. */
	async function clear_all(){
		const targets = visible().filter(it => it.kind !== "stalled");
		if (!targets.length) return;
		if (!confirm(`Archive ${targets.length} row${targets.length === 1 ? "" : "s"}?`)) return;
		targets.forEach(it => archived_pending.add(it.id));
		apply_pending_archives();
		flush();
		const BATCH = 20;
		for (let i = 0; i < targets.length; i += BATCH)
			await Promise.all(targets.slice(i, i + BATCH).map(it => archive_row(it).catch(() => null)));
		folders.soon();
	}

	/** DELIVERABLES 2 AND 3's two buttons on a plain row (`faces.js` `row()`'s `on`) — built
	 *  once per `rec`, not once per redraw, so a click during a redraw never reaches a stale
	 *  closure. Both mutate `it` OPTIMISTICALLY (the write is fire-and-forget, the same
	 *  pattern the card page's own "clear" button already uses, `on.clear` below) and force
	 *  this one row to redraw at once — never a wait for the next poll. */
	function row_on(rec, it){
		const on = {
			toggle_read(){
				mark_read(it.id, !is_read(it.id));
				it.unread = !is_read(it.id);
				rec.sig = null;
				refill(rec, it);
			},
			archive(){
				// ⚠ 2026-09-30 FIX (the owner: "pressing × only toggled read/unread and the row
				// stayed — it must archive: the row leaves the Inbox"). `refill()` alone only
				// re-styles THIS row in place (the `.ai2-archived` class, a dim look) — it never
				// removes it from `visible()`'s output. `archived_pending` (declared with the
				// rest of this closure's state, above) is what makes it actually leave, and KEEPS
				// it left out even though `list` is rebuilt from scratch on every real `paint()` —
				// `archive_row()`'s own write can be slow, or (this worktree's own dev server) can
				// fail outright on a CORS gap on the card-write route; either way, the very next
				// stream update used to silently undo a plain one-off splice here (proved
				// headless, `ai2-hang/test-clearall.mjs`). It still exists: the Log's own
				// "archived" filter and the rail's search both read `list.archived`.
				archived_pending.add(it.id);
				apply_pending_archives();
				rec.sig = null;
				flush();
				archive_row(it).catch(() => null);
				// A folder card's row comes from `folders.cards` (polled every 20s) — asking
				// now is what makes the grey "archived" state show up at once instead of lagging.
				folders.soon();
			},
		};
		// A stalled ask has no card to archive: it leaves by itself once the asks ledger moves on.
		if (it.kind === "stalled") delete on.archive;
		return on;
	}

	// ⚠ The signature is the card's WHOLE record, never a hand-listed set of the
	// fields the face reads: the first build listed them, forgot one, and the
	// feature it belonged to silently never rendered. doc/decisions.md.
	function refill(rec, it){
		const sig = JSON.stringify(it);
		if (rec.sig === sig) return;
		rec.sig = sig;
		rec.$row.el.classList.toggle("ai2-unread", it.unread);
		rec.$row.el.classList.toggle("ai2-flagged", !!it.flag);
		rec.$row.el.classList.toggle("ai2-archived", it.status === "archived");
		// A note from the mastermind reads as a note in the rail too, not just on
		// its own page — the `notes` word above is how you find them, this is how
		// you recognise one when it arrives on its own.
		rec.$row.el.classList.toggle("ai2-note", it.kind === "note");
		rec.$row.el.classList.toggle("ai2-row-live", it.kind === "live");
		rec.$row.empty(() => { it.kind === "live" ? live_row(it) : row(it, row_on(rec, it)); });
	}

	/* THE BAR OPENS ACTIVITY, NOT OVERVIEW. The row is a link to the card, and a link
	   cannot hold another link, so the bar's click is caught here — before the Router's
	   own document listener — and goes to the card's Activity page, `…/<card>/activity/`
	   (card.js `tab_route()`). */
	$rows.on("click", e => {
		const bar = e.target.closest?.(".ai2-news");
		const $a = bar?.closest("a.ai2-row:not(.ai2-page-row)");   // a page row's bar just opens the page
		if (!$a || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
		e.preventDefault();
		e.stopPropagation();
		page.app?.router?.go(workspace.url($a.getAttribute("href") + "activity/"));
	});

	$rows.on("pointerenter", () => { hovering = true; });
	$rows.on("pointerleave", () => { hovering = false; draw_groups(); });

	/* ── flagging a sentence you selected ───────────────────────────────── */

	/* ⚠ IT MUST LAND INSIDE THE WINDOW. A `position: fixed` button at a negative
	   top is simply gone — no error, no overflow — so selecting text near the
	   top of the screen made the gesture silently do nothing. Above the
	   selection when there is room, below it when there is not. */
	const FLAG_H = 38, FLAG_W = 44;

	function show_flagger(){
		const sel = document.getSelection();
		const text = (sel?.toString() ?? "").trim();
		const node = sel?.anchorNode;
		const host = node && (node.nodeType === 1 ? node : node.parentElement)?.closest?.(".ai2-full");
		if (!text || !host || !current) return hide_flagger();

		const box = sel.getRangeAt(0).getBoundingClientRect();
		const above = box.top - FLAG_H;
		const top = above >= 4 ? above : Math.min(box.bottom + 8, window.innerHeight - FLAG_H);
		const left = Math.min(Math.max(box.left + box.width / 2, FLAG_W), window.innerWidth - FLAG_W);

		flagging = text.slice(0, 240);
		$flagger.style({ left: Math.round(left) + "px", top: Math.round(Math.max(top, 4)) + "px" });
		$flagger.el.classList.add("on");
	}

	function hide_flagger(){ flagging = null; $flagger.el.classList.remove("on"); }

	$flagger.click(() => {
		const quote = flagging;
		hide_flagger();
		if (quote && current) current.$box.append(() => flag_box(current.on, quote));
	});

	$detail.on("mouseup", () => setTimeout(show_flagger, 0));
	$detail.on("keyup", () => setTimeout(show_flagger, 0));
	document.addEventListener("mousedown", e => { if (!e.target.closest(".ai2-selection-flag")) hide_flagger(); });

	/* ── the data ───────────────────────────────────────────────────────── */

	/* NOTHING HERE EVER RELOADS THE PAGE. Three logs stream over the dev socket
	   line by line (`JSONL.live()`); the owner's own sentences come over
	   Servex's `EventSource`. The one thing that still reloads this page is an
	   edit to its OWN modules — which is why a minion editing AI 2 works in a
	   worktree. readme.md. */
	Promise.all([log.live(paint), says.live(paint), day.live(paint)]).then(paint);
	stream.ready.then(paint);
	stream.on(() => paint());
	live.on(paint);
	folders.on(paint);
	folders.start();
	groups.on(paint);
	groups.start({ folders, socket: page.app?.socket });

	// THE NOW CARD — pinned above everything, including the Live row (followup.md item 2,
	// 2026-09-30: "a quick card to go to and edit right now… pinned at the top of the rail,
	// above Live, and imported by hand, not found by a scan"). `resolve_card` reads its real
	// folder (`ai/now/page.jsonl`, Servex-made) directly by id — never through `folders`'s own
	// scan, which only walks dated card folders — and `$pinned` already sits above `$groups`
	// in the DOM (declared where the shell is built, above), so filling it is the whole fix.
	resolve_card("now").then(fold => { if (fold){ build_now_item(fold); render_pinned(); paint(); } });

	// THE "NEEDS REVIEW" FILTER READS THE SAME SHARED SCAN THE NEEDS YOU TAB DOES (needs.js) —
	// so when that scan refreshes (a poll, or right after answering something), the filtered
	// rail redraws too, and the two can never show a different answer to "what needs the owner".
	let last_needs_ids = "";
	watch_needs(s => {
		needs_ids = s.ids;
		if (review_only) relist();
		// THE CHIP'S OWN COUNT (deliverable 1, moved off the old tab) — hidden at zero, same
		// shared scan the chip's own filter already reads, so the two can never disagree.
		const n = s.rows.length;
		$needs_count.el.hidden = !n;
		if (n) $needs_count.text(String(n));
		// `rules.js`'s `is_resolved()` reads this SAME scan, but a row's own signature
		// (`refill()`) has no way to know the scan just changed on its own. ⚠ 2026-09-30 FIX
		// (review finding #6): the first cut repainted the WHOLE rail on every poll, whether or
		// not the set of waiting ids actually changed — a quiet rail still jumped every few
		// seconds. Comparing the ids as one string is the cheapest "did anything really change".
		const key = [...s.ids].sort().join(",");
		if (key === last_needs_ids) return;
		last_needs_ids = key;
		rows.forEach(rec => { rec.sig = null; });
		paint();
	});

	/* What a card's own page is allowed to ask of the list.
	   ⚠ OPENING A CARD USED TO MARK NOTHING, on purpose — it once wrote a SHARED `read` line
	     here (`verdicts.jsonl`), and the owner's answer was "when I click on them, they're
	     disappearing… No no no. I need them all unread again." That is still true of THAT idea:
	     `inbox.js`'s `Says` still ignores those old lines, and nothing here writes one again.
	     2026-09-30's read/unread (ask 2, `rules.js`) is a different, smaller thing the owner
	     asked for by name — a per-BROWSER flag that only un-bolds a title, never removes the
	     row — and `card.js`'s `activated()` does mark that one on open, because this task's own
	     brief says so in as many words: "opening a row marks it read". */
	return {
		open(h){
			watching.add(h);
			current = h;
			// `h.top` — only a top-level card (or the old, never-eligible `card_page()`) sets
			// this; a sub-card opening beside it must never touch the word for the card still
			// open in `$detail`.
			if (h.top){ ws_owner = h; render_ws(); }
			paint();
			return h;
		},
		close(h){
			watching.delete(h);
			if (current === h) current = null;
			if (ws_owner === h){ ws_owner = null; render_ws(); }
		},
		repaint: paint,
		live,
		// The card folders — `card.js` reads sub-card titles off this, and asks
		// for a refresh after it writes a line.
		cards: folders,
		cards_changed: () => folders.soon(),
		// The groups — a group card reads its members off this (`card.js`).
		groups,
		flag(id, note, quote){
			says.flags.set(id, { id, say: "improve", note, quote });
			say(id, "improve", { note, quote });
			paint();
		},
		unflag(id){ says.flags.delete(id); say(id, "reopen"); paint(); },
		// The overview's own hook onto this list — see `paint()`'s own comment.
		// Registered synchronously, inside the same `content()` call that built
		// this shell, always before the first `paint()` (which only ever fires
		// later, off an async fetch or a live subscription) — so there is no
		// "already missed the first list" case to special-case here.
		on_tasks(fn){ const go = () => fn([...groups.tasks.values()]); go(); return groups.on(go); },
		on_list(fn){ list_watchers.add(fn); if (list?.length) fn(list); return () => list_watchers.delete(fn); },
	};
}

/** Two sentences are the same sentence when they say the same words — whisper
    re-guesses punctuation between the copy this page committed and the copy
    Servex logged back, so a raw `===` would show every sentence twice. */
const norm = t => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * ONE CARD'S OWN PAGE — the thing on the right that does not move.
 *
 * TWO FIXED REGIONS, and that is the whole design (the owner, 2026-09-22: "I
 * don't like that my words disappear… that card could have, in a footer, the
 * transcription — the last paragraph always on screen"):
 *
 *   THE IDEAS, above, scrolling in their own box — the title, the reading, the
 *   names, the links, each updated in place as the assistant answers.
 *   THE TRANSCRIPT FOOTER, below, pinned to the bottom of the column — the live
 *   words as they arrive, grey while they are still a guess and solid once they
 *   settle, with the newest always visible and a scroll for the rest. The
 *   composer is one line inside it, and everything you say here is posted with
 *   `re: <this card's id>`, so it goes INTO this card instead of becoming one.
 *
 * Neither region can move the other: the page is a two-row grid, the footer is
 * a fixed height, and its transcript scrolls inside itself. Measured — both
 * tops identical across five streamed sentences.
 */
function card_page(root, id){
	let $box, box, talk, sig = null, held = false, handle, stop_clog, stop_live, chat_mount;
	let latest_it = null, $tasks = null;
	const task_state = {};

	// THE CARD'S OWN LOG (decision `card-storage`) — the store deliverable 1
	// built, and what the table of contents below is read off, per deliverable
	// 1's own words: "AI 2 switches its reader". `clog.ready` is the backlog;
	// `.on()` is every event that lands after, over the shared `EventSource`.
	const clog = card_stream(id);

	/* ⚠ `held` is the one thing that stops a redraw: tearing the box down under
	   a half-typed sentence is exactly the bug the old board had. */
	const on = {
		held: v => { held = v; },
		flag(note, quote){
			root.ai2.flag(id, note, quote);
			setTimeout(() => { held = false; sig = null; root.ai2.repaint(); }, 1200);
		},
		unflag: () => root.ai2.unflag(id),
		// Archive, never delete (item 12) — the same board write `+ New card`
		// uses, merged onto this id; `items()`'s own filter then hides it.
		clear: () => { archive_card(id); sig = null; root.ai2.repaint(); },
	};

	function draw(it){
		latest_it = it;
		talk?.sync();
		// A card that points at a task shows that task's page below it — outside
		// `$box`, and ahead of the early return below, so it fills as soon as the
		// directory listing is in and is never refetched by a redraw (`tasks.js`).
		if ($tasks) task_region($tasks, root.ai2.groups.task_at(task_of(it)), task_state, { head: false });
		const next = JSON.stringify(it) + "|" + clog.entries.length;
		if (held || next === sig) return;
		sig = next;
		$box.empty(() => {
			if (it?.kind === "live") return live_full(it, root.ai2.live);
			if (it) full(it, on);
			else small.c("muted").text("No card by that name yet — it may still be on its way, or it has scrolled out of the log.");
			// THE TABLE OF CONTENTS — every task, proposal, refined reading and
			// transcript paragraph in this card's own log, each a sub-card row
			// that opens in the third column (deliverable 3).
			const rows = sub_rows(clog.entries);
			if (rows.length) toc(rows, root.url + id + "/");
		});
	}

	/* THE CHAT (chat.js) — this card's own log as a conversation. A card shows
	   the lines said into IT, never into one of its sub-cards (those open in
	   the third column with their own chat); the Live card shows its updates
	   and today's task lines too. */
	const mine = e => { const r = refs(e); return !r.length || r.includes(id) || e.type !== "prompt" && e.type !== "reply"; };
	const source = () => (id === LIVE ? root.ai2.live.entries() : clog.entries);

	return new Page({
		title: id,
		url: root.url + id + "/",
		classes: "ai2-card-page" + (id === LIVE ? " ai2-card-live" : ""),

		content(){
			// THE THIRD COLUMN belongs to THIS card, not to AI 2's own shell — a
			// sub-card is this card's child, so it mounts beside the rail's own
			// detail column rather than inside it (see `page.js`'s `$sub` above).
			this.$pages = root.$sub;

			// Only ever shown below 40em, where the rail is the whole screen and
			// this page is the second one. See ai2.css.
			a.c("ai2-back page-link").href(root.url).text("← all cards");
			// ⚠ The Live card keeps `.ai2-full` as its own box: its columns are
			// laid out on that box's direct children (live.js, `.ai2-card-live`).
			if (id === LIVE) $box = div.c("ai2-full");
			else div.c("ai2-full", () => { $box = div.c("ai2-full-card"); $tasks = div.c("ai2-tasks"); });

			const foot = () => div.c("ai2-foot", () => {
				talk = chat({ source, keep: mine });
				// ⚠ `re` is a FUNCTION, asked fresh on every send: this composer
				// belongs to this card and nothing else, and saying so once here
				// is what makes "talk into the card you selected" true.
				const fresh = root.opening === id;
				if (fresh) root.opening = null;
				box = composer({
					re: () => id,
					placeholder: id === LIVE ? "talk to the assistant about what is running" : "talk into this card",
					on_text: text => talk.echo(text),
					autostart: fresh && auto_transcribe(),   // a brand-new card opens listening, unless turned off
				});
			});

			/* THE LIVE CARD'S OWN FOLD, v2 (minion-polish, item 3, 2026-09-30 — the
			 * brief: "Make it a `chat()` mount… Keep the old one reachable as a
			 * named v1"). `foot()` above IS that v1: the OLD per-card assistant —
			 * this card's own log read as a conversation (`./chat.js`) plus its own
			 * `composer()` — exactly the "second and third paths" this whole task
			 * retires (`requirements.md` ask 1). This is the SAME `mount_chat`
			 * (`ux/Dictate/chat.js`) every other surface now builds: the ✦ sheet,
			 * the ☰ drawer's AI tab, and a folder card's own sidebar (`card.js`).
			 * `card: LIVE` is only a HINT for the very first sentence ever said in
			 * the tab's one global session (see `chat.js`'s own class doc) — it
			 * does not start a second, Live-only conversation, and today's task
			 * lines (the old `source()`'s own extra read of `root.ai2.live`) are
			 * not folded in here: that context lives on the page itself, above
			 * this fold, not duplicated into the chat a second time.
			 * To bring v1 back: call `foot()` instead of `live_foot_v2()` in the
			 * branch below. */
			const live_foot_v2 = () => div.c("ai2-foot ai2-foot-chat", () => {
				chat_mount = mount_chat(div.c("ai2-foot-chat-slot").el, {
					path: root.url + id + "/",
					card: id,
					placeholder: "talk to the assistant about what is running",
				});
			});
			/* ON LIVE THE ASSISTANT IS ONE ROW, and pressing it opens the chat (the owner,
			   2026-09-25: "don't render the fast assistant's chat messages inline, taking space.
			   Show the assistant as a small card or row, and clicking it opens its chat"). */
			if (id === LIVE) details.c("ai2-live-assistant", () => {
				summary.c("ai2-live-assistant-row").text("Assistant: ask it about what is running");
				live_foot_v2();
			});
			else foot();
		},

		// A sub-card's own address — a task, a proposal, a transcript paragraph,
		// each a real url under this card's own (deliverable 2-3). `sub_row()`
		// reads it straight off this card's own log; nothing is fetched twice.
		route(sub){ return sub.includes(".") ? undefined : sub_card_page(root, id, sub, clog); },

		// ⚠ `activated()`, not `content()`: `content()` runs once and the view is
		// cached, so a card you come back to would watch nothing.
		activated(){
			// AN OLD ADDRESS STILL OPENS ITS CARD: Servex answers an old board id
			// with the folder it was migrated into, and the url is swapped for
			// the new one in place — `replaceState`, so Back never lands on the
			// old address and bounces forward again.
			if (id !== LIVE && !is_folder_id(id)) resolve_card(id).then(found => {
				if (!found || !is_folder_id(found.id) || location.pathname !== this.url) return;
				const url = root.url + found.id + "/";
				history.replaceState({}, "", url);
				root.app?.router?.load(url);
			});
			// `top: true` — this IS what fills `$detail`; `ws: false` — the old, non-folder card
			// page (and the Live page) has no floating view, so the workspace word never shows here.
			handle = root.ai2.open({ id, draw, on, $box, top: true, ws: false });
			// A LIVE UPDATE ON THIS CARD'S OWN LOG redraws the table of contents
			// (and the body, in case a `refined` or `task` line just landed) —
			// `sig` carries the log's length precisely so this cannot loop with
			// `draw()`'s own board-driven calls. `stop_clog` unsubscribes below so
			// a deactivated (cached, off-screen) card page does not keep spending
			// work on a stream nobody is reading.
			stop_clog = clog.on(() => { sig = null; draw(latest_it); });
			clog.ready.then(() => { sig = null; draw(latest_it); });
			// v1 only: the OLD per-card chat re-synced on today's task lines, off
			// the day log. `live_foot_v2()`'s mount watches its own session file
			// directly (`chat.js`'s own `watch()`), so `talk` stays unset on Live
			// now — the guard below keeps this a no-op for it.
			if (id === LIVE) stop_live = root.ai2.live.on(() => talk?.sync());
		},

		/* ⚠ AND THE MICROPHONE STOPS. A card page's view is CACHED — it stays in
		   the DOM, deactivated, with its own composer and its own `re`. A mic
		   left running there would go on posting into a card the owner has
		   navigated away from, and nothing would say so. Found by the proof run,
		   which resolved two `.ai2-foot` composers on one page and picked the
		   wrong one. `chat_mount` is `live_foot_v2()`'s own mic (Live, v2) — `box`
		   stays unset there, so the two stop-checks never both fire on one page. */
		deactivated(){
			root.ai2.close(handle);
			try { if (box?.mic && !["idle", "error"].includes(box.mic.state)) box.mic.stop(); } catch {}
			try { chat_mount?.panel?.stop_mic?.(); } catch {}
			stop_clog?.();
			stop_live?.();
		},
	});
}

/**
 * ONE SUB-CARD'S OWN PAGE — the third column. A task, a proposal, a refined
 * reading or one transcript paragraph, opened to the right of the card that
 * owns it (deliverable 2-3: "the sub-items within that card open to the right
 * of it"). Its own transcript footer talks INTO the sub-card — `re:
 * "<slug>/<sub>"` — so a follow-up sentence about this one task never has to
 * be re-typed as "about the task where...".
 *
 * ⚠ THE LOG IS SHARED, NOT REFETCHED. `clog` is the same live stream the
 * parent card page already opened — a sub-card is a VIEW of one row in it,
 * never a second subscription to the same url.
 */
function sub_card_page(root, id, sub, clog){
	let $box, box, talk, sig = null, held = false;
	const re = () => id + "/" + sub;

	function draw(){
		talk?.sync();
		const it = sub_row(clog.entries, sub);
		const next = JSON.stringify(it);
		if (held || next === sig) return;
		sig = next;
		$box.empty(() => {
			if (it) sub_full(it);
			else small.c("muted").text("Still on its way, or it has scrolled out of the log.");
		});
	}

	let stop_clog;

	return new Page({
		title: sub,
		url: root.url + id + "/" + sub + "/",
		classes: "ai2-card-page ai2-sub-page",

		content(){
			// "Closes when the detail is clicked again" (deliverable 2) — a plain
			// link back to the card's own url, which the Router navigates like any
			// other; the third column then has nothing mounted in it and
			// `.ai2:has(.ai2-sub > .page.active-page)` in `ai2.css` drops back to
			// two columns on its own, no JS state to keep in sync.
			a.c("ai2-back ai2-sub-back page-link").href(root.url + id + "/").text("← " + id);
			$box = div.c("ai2-full");

			div.c("ai2-foot", () => {
				// Its own chat: only what was said into THIS sub-card, and the replies to it.
				talk = chat({ source: () => clog.entries, keep: e => refs(e).includes(re()) });
				box = composer({ re, placeholder: "talk into this sub-card", on_text: text => talk.echo(text) });
			});
		},

		activated(){
			draw();
			stop_clog = clog.on(() => { sig = null; draw(); });
		},

		deactivated(){
			try { if (box?.mic && !["idle", "error"].includes(box.mic.state)) box.mic.stop(); } catch {}
			stop_clog?.();
		},
	});
}

/* ── the views: today, open, all, a tag ──────────────────────────────────
 *
 * EACH VIEW IS AN ADDRESS — `/framework/ai2/view/open/` — drawn in the middle
 * column like a card, so Back and a pasted link work. The words mean what
 * `GET /cards?view=` means (`Servex/cards/Cards.js`'s `list()`), filtered here
 * from the list this page already holds, so a view keeps up with no second
 * request: `today` is made or touched today, `open` is not done, `all` is
 * everything, and any other word is a tag.
 */
const VIEW_TITLE = { today: "Today's cards", open: "Open cards", all: "Every card" };

function in_view(c, word){
	if (c.status === "archived" && word !== "all") return false;
	if (word === "all") return true;
	if (word === "open") return c.status !== "done";
	if (word === "today"){
		const d = new Date(), pad = n => String(n).padStart(2, "0");
		const day = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
		return [c.created, c.last].some(t => String(t ?? "").startsWith(day));
	}
	return (c.tags ?? []).includes(word);
}

function view_words(root, word){
	div.c("ai2-view-words flex wrap v-center gap-25", $row => {
		const draw = () => $row.empty(() => {
			const tags = [...new Set(root.ai2.cards.cards.flatMap(c => c.tags ?? []))].sort().slice(0, 12);
			["today", "open", "all", ...tags].forEach(w => {
				a.c("ai2-word page-link" + (w === word ? " on" : "")).href(root.url + "view/" + w + "/")
					.text(VIEW_TITLE[w] ? w : "#" + w);
			});
		});
		draw();
		root.ai2.cards.on(draw);
	});
}

function views_page(root){
	return new Page({
		title: "Views",
		url: root.url + "view/",
		classes: "ai2-index-page",
		content(){
			view_words(root, null);
			small.c("muted").text("Each view is its own address — pick one.");
		},
		route(word){ return word.includes(".") ? undefined : view_page(root, word); },
	});
}

function view_page(root, word){
	return new Page({
		title: VIEW_TITLE[word] ?? "#" + word,
		url: root.url + "view/" + word + "/",
		classes: "ai2-index-page",
		content(){
			view_words(root, word);
			div.c("ai2-index", $box => {
				const draw = () => $box.empty(() => {
					const list = root.ai2.cards.cards.filter(c => in_view(c, word));
					if (!root.ai2.cards.ok) return void small.c("muted").text("Servex is not answering, so there are no card folders to list.");
					if (!list.length) return void small.c("muted").text("No cards in this view.");
					list.forEach(c => card_link(c, root.url + c.id + "/"));
				});
				draw();
				root.ai2.cards.on(draw);
			});
		},
	});
}

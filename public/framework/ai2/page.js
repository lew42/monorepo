import { Page, View, div, p, span, small, a, button, label, input, details, summary } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { Groups } from "./groups.js";
import { task_of, task_region } from "./tasks.js";
import { when } from "./faces.js";
import grip from "/framework/ext/grip/grip.js";
import composer from "./compose.js";
import { row, full, flag_box, toc, sub_full } from "./faces.js";
import { Board, Says, BOARD_URL, VERDICTS_URL, prompt_stream, card_stream, day_log, items, sub_rows, sub_row, say, new_card, archive_card, refs, CardList, create_card, resolve_card, is_folder_id } from "./inbox.js";
import Card, { card_link } from "./card.js";
import overview from "./overview.js";
import chat from "./chat.js";
import { LIVE, live_model, live_row, live_full } from "./live.js";

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

	/* THE DEFAULT VIEW IS THE INBOX — the rail + a card's own page (the owner,
	   2026-09-23: "I prefer the inbox view"). The four-column overview is its
	   own page with its own address, `overview/`, routed like a card: EVERY
	   view here is a url, never a class flipped by a button, because a view the
	   Router does not know about is one the nav cannot get you out of (the
	   owner, same day: "we can't just have these buttons that when clicked
	   switch the view manually"). */
	content(){
		div.c("ai2-shell", () => { this.ai2 = board(this); });
	},

	/* A card's own address — or the overview's. ⚠ A name with a dot in it is a
	   real file, and claiming it would answer a 404 with a card page that can
	   never load. `overview` and `live` are reserved: no card can be called
	   either. `live` is an ordinary card page whose card comes from `live.js`. */
	route(id){
		if (id.includes(".")) return undefined;
		if (id === "overview") return this.overview_page ??= overview_page(this);
		if (id === LIVE) return this.live_page ??= card_page(this, LIVE);
		// A CARD FOLDER'S ADDRESS starts with its year — `2026/09/24/<slug>/`,
		// sub-cards one segment deeper, any depth. The year, month and day are
		// pages too (`Card.Folder`), each reading the next one down from the
		// folder, so nothing is probed. `view` is reserved like `overview`.
		if (/^\d{4}$/.test(id)) return new Card.Folder({ id, title: id, shell: this });
		if (id === "view") return this.views_page ??= views_page(this);
		return card_page(this, id);
	},
});

const RAIL_KEY = "ai2-rail-w";
const AUTO_KEY = "ai2-auto-transcribe";

/** On by default (item 10) — a card you just opened starts listening unless
 *  you turned this off, remembered in this browser like `DEVICE_KEY`. */
const auto_transcribe = () => localStorage.getItem(AUTO_KEY) !== "off";

/* The id "+ New card" just minted, waiting for its page to be built.
   ⚠ NOT a `?new=1` in the url, which is the obvious way and is silently wrong:
     `Router.go()` LOADS FIRST AND PUSHES THE URL SECOND, so while the new page's
     `content()` runs `location.search` still belongs to the page you are
     LEAVING. One variable, set before the navigation and taken by the page that
     was asked for, cannot be read at the wrong moment. */
// It lives on the page itself (`page.opening`), because `card.js` reads it too.

/* The four columns by importance, as a page of its own — it mounts in the
   detail column like a card does, and `ai2.css` hands it the whole width while
   it is the active page. */
function overview_page(root){
	return new Page({
		title: "Overview",
		url: root.url + "overview/",
		classes: "ai2-overview-page",
		content(){ overview(root, root.ai2); },
	});
}

function board(page){
	const log = new Board({ url: BOARD_URL });
	const says = new Says({ url: VERDICTS_URL });
	const day = day_log();
	const stream = prompt_stream();
	const live = live_model({ prompts: stream, day });
	// Every card folder, as Servex lists them; `board.jsonl` is only read when this is not `ok`.
	const folders = new CardList();
	// The familiar groups the work is filed under — `groups.json`, `groups.js`.
	const groups = new Groups();
	page.auto_transcribe = auto_transcribe;

	let list = [], shown = [], current = null, hovering = false, flagging = null, only_notes = false, show_archived = false;
	let group_order = [];
	const rows = new Map();        // id → { $row, sig }
	const group_rows = new Map();  // group id → { $row, sig }
	const waiting = new Set();     // ids that arrived while the list was busy
	const watching = new Set();    // the card pages on screen, each watching for its own card
	const list_watchers = new Set();   // the overview's own subscription onto this list
	let $shell, $count, $pill, $rows, $detail, $sub, $flagger, $notes, $archived;
	let $groups, $pinned, $unfiled, $unfiled_head, $list;

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
				// Typed-only (item 10) — the mic lives on the card's own page now,
				// one per card, so it never talks into whatever happens to be open.
				composer({ placeholder: "say anything — it starts a new card", mic: false });
				div.c("ai2-chrome flex v-center gap-25", () => {
					// "Reachable... and back" (deliverable 7) — closes whatever card
					// is open (a real navigation to the root) and drops the manual
					// inbox toggle, so the overview is what shows either way.
					a.c("ai2-word ai2-ov-back page-link").href(page.url + "overview/").text("overview");
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
							page.app?.router?.go(page.url + id + "/");
						});
					label.c("ai2-auto flex v-center gap-25 muted").attr("title", "a new card starts listening on its own — turn off to start it silent").append(() => {
						const $auto = input().attr("type", "checkbox");
						$auto.el.checked = auto_transcribe();
						$auto.on("change", e => localStorage.setItem(AUTO_KEY, e.target.checked ? "on" : "off"));
						// "-transcribe" is its own span so a rail dragged narrow can say just
						// "auto" and keep the head at two lines (ai2.css, `.ai2-auto-tail`).
						span(() => { span("auto"); span.c("ai2-auto-tail").text("-transcribe"); });
					});
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
					$groups = div.c("ai2-groups");
					$pinned = div.c("ai2-pinned");
					$unfiled = details.c("ai2-unfiled", () => {
						$unfiled_head = summary.c("ai2-unfiled-head muted");
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
					.text("notes").click(() => { only_notes = !only_notes; $notes.el.classList.toggle("on", only_notes); if (only_notes) $unfiled.el.open = true; relist(); });
				$archived = button.c("ai2-word ai2-archived-word").attr("type", "button")
					.click(() => { show_archived = !show_archived; $archived.el.classList.toggle("on", show_archived); relist(); });
			});
			grip({ from: "start", write: size, done: w => localStorage.setItem(RAIL_KEY, w + "px"),
				reset: () => { localStorage.removeItem(RAIL_KEY); size(); } });
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
	page.$sub = $sub;

	// The fold remembers itself in this browser; closed until you open it.
	const UNFILED_KEY = "ai2-unfiled";
	try { $unfiled.el.open = localStorage.getItem(UNFILED_KEY) === "open"; } catch {}
	$unfiled.on("toggle", () => { try { localStorage.setItem(UNFILED_KEY, $unfiled.el.open ? "open" : "closed"); } catch {} });
	size(parseInt(localStorage.getItem(RAIL_KEY), 10) || null);

	/* ── the rail's width ───────────────────────────────────────────────── */

	// ⚠ Returns the width it actually applied, which is what `grip` then
	// remembers — clamped, so a drag past either end cannot hide a column.
	function size(px){
		const w = px ? Math.round(Math.max(200, Math.min(px, innerWidth - 320))) : null;
		$shell.style("--ai2-rail", w ? w + "px" : "");
		return w;
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
		const pool = list.filter(it => !groups.filed(it));
		const base = only_notes ? pool.filter(it => it.kind === "note") : pool;
		// Archived cards join the SAME list, greyed by `refill()` — a second word
		// to click, never a second view to build.
		return show_archived ? [...base, ...(list.archived ?? []).filter(it => !groups.filed(it))] : base;
	};

	function relist(){
		rows.forEach(rec => rec.$row.el.remove());
		rows.clear();
		shown = [];
		waiting.clear();
		flush(true);
	}

	function paint(){
		list = items({ board: log.cards, folders, prompts: stream.entries, landed: day.landings, says });
		// THE LIVE CARD joins the same list and the same newest-first sort, so an
		// update to anything in it lifts it to the top like any other arrival.
		const it = live.item();
		it.unread = true;
		list.push(it);
		list.sort((a, b) => Date.parse(b.at ?? 0) - Date.parse(a.at ?? 0));
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

	/* Let the waiting cards in, and apply the sort — which is the ONLY moment
	   any row moves. `to_top` is the pill's own press: the owner asked for them,
	   so put them where they can be seen. */
	function flush(to_top){
		const here = visible();
		const by_id = new Map(here.map(it => [it.id, it]));
		waiting.clear();

		$list.append(() => { here.forEach(it => { if (!rows.has(it.id)) rows.set(it.id, make(it)); }); });
		rows.forEach((rec, id) => { if (!by_id.has(id)){ rec.$row.el.remove(); rows.delete(id); } });

		// `appendChild` MOVES a node that is already in the tree, so this is the
		// sort applied to the DOM that already exists, with nothing rebuilt. The
		// Live card sits under the groups, in sight; the rest inside the fold.
		shown = here.map(it => it.id);
		// A box whose rows already stand in this order is left alone: re-appending
		// an in-place row still removes and re-adds it, dropping hover, focus and
		// a text selection, and each one is a mutation for nothing.
		[[$pinned, id => id === LIVE], [$list, id => id !== LIVE]].forEach(([$box, mine]) => {
			const want = shown.filter(mine).map(id => rows.get(id).$row.el);
			const have = [...$box.el.children].filter(c => c.classList.contains("ai2-row"));
			if (want.length === have.length && want.every((el, i) => el === have[i])) return;
			want.forEach(el => $box.el.appendChild(el));
		});
		draw_groups(true);

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
				$groups.append(() => { rec.$row = a.c("ai2-row ai2-group-row").href(page.url + g.card + "/"); });
				group_rows.set(g.id, rec);
			}
			const latest = groups.latest(g.id);
			const size = groups.members(g.id).filter(m => m.kind !== "said");
			const sig = JSON.stringify([g, latest, size.length]);
			if (rec.sig === sig) return;
			rec.sig = sig;
			rec.$row.empty(() => { group_face(g, latest, size); });
		});
		const next = order.map(g => g.id);
		if (next.join() !== group_order.join() && (force || quiet() || !group_order.length)){
			group_order = next;
			group_order.forEach(id => $groups.el.appendChild(group_rows.get(id).$row.el));
			page.app?.router?.mark_links?.();
		}
	}

	/* A group's preview: its icon and name, the newest member's own words
	   WHOLE, and when — never a slug. */
	/* ⚠ ONE UPDATE, NOT THE MEMBER'S WHOLE STORY: all seven groups must fit the
	   rail at 1000px tall. A running task's first sentence plus its `now` made
	   one row 319px and pushed two groups off screen (measured, 1920). The
	   update is the `now` alone — the task's own sentence heads its section on
	   the group's card, one click away. */
	function group_face(g, latest, members){
		const tasks = members.filter(m => m.kind === "task").length, cards = members.length - tasks;
		const size = [tasks && tasks + (tasks === 1 ? " task" : " tasks"), cards && cards + (cards === 1 ? " card" : " cards")];
		div.c("ai2-row-head flex v-center gap-25", () => {
			icon(g.icon);
			span.c("ai2-row-title").text(g.name);
			small.c("ai2-row-when muted").text([...size, latest && when(latest.at)].filter(Boolean).join(" · "));
		});
		if (!latest) return void small.c("ai2-group-line muted").text("Nothing yet.");
		const words = latest.kind === "said" ? "You said: " + latest.words
			: latest.kind === "task" && !latest.landed ? latest.words || latest.title
			: latest.title || latest.words;
		div.c("ai2-group-what").text(words);
	}

	function pill(){
		$pill.el.classList.toggle("on", waiting.size > 0);
		if (waiting.size) $pill.text(waiting.size + (waiting.size === 1 ? " new card ↑" : " new cards ↑"));
	}

	function count(){
		const n = visible().length;
		const count_sig = n + "|" + only_notes + "|" + stream.ok;
		if (count_sig !== count.sig) $count.empty(() => {
			span.c("ai2-unread-count").text(String(n));
			span.c("muted").text(only_notes ? "notes" : "cards");
			if (!stream.ok) span.c("ai2-off muted").text("· the assistant is off");
		});
		count.sig = count_sig;
		document.title = n ? "(" + n + ") AI 2" : "AI 2";

		const loose = visible().filter(it => it.id !== LIVE).length;
		$unfiled_head.text("Not filed yet (" + loose + ")");

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
		rec.$row.empty(() => { it.kind === "live" ? live_row(it) : row(it); });
	}

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

	/* What a card's own page is allowed to ask of the list.
	   ⚠ OPENING A CARD MARKS NOTHING. It used to write a `read` line here, and
	     the owner's answer was "when I click on them, they're disappearing…
	     No no no. I need them all unread again." Looking at a thing is not a
	     decision about it. `inbox.js`'s `Says` ignores the old lines too. */
	return {
		open(h){
			watching.add(h);
			current = h;
			paint();
			return h;
		},
		close(h){ watching.delete(h); if (current === h) current = null; },
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
		on_list(fn){ list_watchers.add(fn); return () => list_watchers.delete(fn); },
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
	let $box, box, talk, sig = null, held = false, handle, stop_clog, stop_live;
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

			div.c("ai2-foot", () => {
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
					on_partial: text => talk.partial(text),
					autostart: fresh && auto_transcribe(),   // a brand-new card opens listening, unless turned off
				});
			});
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
			handle = root.ai2.open({ id, draw, on, $box });
			// A LIVE UPDATE ON THIS CARD'S OWN LOG redraws the table of contents
			// (and the body, in case a `refined` or `task` line just landed) —
			// `sig` carries the log's length precisely so this cannot loop with
			// `draw()`'s own board-driven calls. `stop_clog` unsubscribes below so
			// a deactivated (cached, off-screen) card page does not keep spending
			// work on a stream nobody is reading.
			stop_clog = clog.on(() => { sig = null; draw(latest_it); });
			clog.ready.then(() => { sig = null; draw(latest_it); });
			// The Live card's chat also carries today's task lines, off the day log.
			if (id === LIVE) stop_live = root.ai2.live.on(() => talk.sync());
		},

		/* ⚠ AND THE MICROPHONE STOPS. A card page's view is CACHED — it stays in
		   the DOM, deactivated, with its own composer and its own `re`. A mic
		   left running there would go on posting into a card the owner has
		   navigated away from, and nothing would say so. Found by the proof run,
		   which resolved two `.ai2-foot` composers on one page and picked the
		   wrong one. */
		deactivated(){
			root.ai2.close(handle);
			try { if (box?.mic && !["idle", "error"].includes(box.mic.state)) box.mic.stop(); } catch {}
			talk?.partial("");
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
				box = composer({ re, placeholder: "talk into this sub-card", on_text: text => talk.echo(text), on_partial: text => talk.partial(text) });
			});
		},

		activated(){
			draw();
			stop_clog = clog.on(() => { sig = null; draw(); });
		},

		deactivated(){
			try { if (box?.mic && !["idle", "error"].includes(box.mic.state)) box.mic.stop(); } catch {}
			talk?.partial("");
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

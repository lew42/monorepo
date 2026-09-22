import { div, span, p, a, img, button, blockquote } from "../../core/View/View.js";
import md from "../markdown/md.js";
import { TaskJSONL } from "../JSONL/JSONL.js";
import { warm } from "./dashboard.js";
import { fold } from "./message.js";
import { shot_thumb } from "./shots.js";
import { state } from "./stats.js";
import { links_row, web_url } from "./card.js";
import { needs_of, needs_strip } from "./needs.js";
import { Ranking } from "./rank.js";
import { reply, dictate } from "../Ask/reply.js";

/**
 * The Asks tab — everything the owner asked for in this session, as preview
 * cards, each linked back to the sentence they said it in.
 *
 * One card is one glance: a picture of what the work produced, a title, one
 * line of what was asked, a status chip, and how many of the tasks serving it
 * have landed. Nothing else is on the first screen. Clicking a card opens the
 * second level **in place** — a sheet that joins the wall directly under that
 * card's own row — carrying the verbatim quote and, per serving task, the
 * headline of what it shipped and the log lines where a decision was weighed.
 * The full report and the rest of the log are one more fold below that. That
 * is the iceberg: what was decided at level 2, how it was done at level 3.
 *
 * The data is `ext/JSONL`'s `ask` verb, written into the run's own task.jsonl
 * by whoever is running the session. See `doc/asks.md`.
 */

/* ── the small derivations ─────────────────────────────────────────────────── */

const ACRONYM = { ai: "AI", ui: "UI", ux: "UX", css: "CSS", js: "JS", cli: "CLI", api: "API" };

/** `ai-log-click-through` → `AI log click through`. A title, from the id the writer chose. */
export const ask_title = ask => ask.title ?? (ask.id ?? "")
	.split("-")
	.map((w, i) => ACRONYM[w] ?? (i === 0 ? w[0]?.toUpperCase() + w.slice(1) : w))
	.join(" ");

/* The owner's own words, 2026-09-18: "conclusions that summarize what I've been
   asking are the best things to put at the top of any report… lead with the
   conclusion as the title; if I'm curious I drill down and see what I asked."
   A card's title IS the mastermind's `conclusion` once one has been weighed —
   verbatim, no markdown, no trimming of its own punctuation — and falls back to
   the id-derived `ask_title()` for an ask nothing has concluded on yet, exactly
   as `ask_title()` always rendered it. */
export const card_title = ask => ask.conclusion ?? ask_title(ask);

/** How many of the tasks serving this ask have landed, out of how many there are. */
const tally = (ask, found) => {
	const rows = (ask.tasks ?? []).map(slug => found.get(slug)).filter(Boolean);
	return { done: rows.filter(m => m.landed_at).length, total: ask.tasks?.length ?? 0 };
};

/* The report line, deliverable by deliverable: the status the writer claimed, and
   the count derived from the serving tasks' own `landed_at`. Two numbers that can
   disagree, on purpose — a "landed" ask whose task never landed is exactly the
   thing the owner wants to see. */
function report_line(ask, found){
	const { done, total } = tally(ask, found);
	if (!total) return "no task yet";
	return `${done} of ${total} task${total === 1 ? "" : "s"} landed`;
}

/* Which log lines read as a decision. A keyword filter, and it is a guess — so no
   line is ever thrown away by it: what the filter misses is still in the fold at
   the bottom of the task's section, just not on the first screen of the sheet. */
const DECISION = /\b(decid|decision|chose|chosen|verdict|instead|rather than|rejected|dropped|trade-?off|because|why)\b/i;
const decisions = m => (m?.logs ?? []).filter(l => DECISION.test(l.msg ?? ""));

/* How many decision lines the sheet shows before the rest joins the fold. */
const SHOWN = 6;

/* A manifest's answer in one line: its outcome's first line, still markdown.
   ⚠ Rendered as plain text it printed its own source — "…on each one.
     [/layouts/browse/](/layouts/browse/)" — so it goes through `md()` inline. */
const headline = s => (s ?? "").trim().split("\n")[0].replace(/^#+\s*/, "");

/** The first picture a task embedded in its own landing report, if it embedded one. */
const first_image = s => s?.match(/!\[[^\]]*\]\(\s*([^)\s]+)/)?.[1];

/* A serving task's `outcome` is written to be read on ITS OWN page, so its image
   and link paths are relative to ITS directory. Rendered inside the run's page
   they resolve against the RUN's url instead: four screenshots 404'd that way
   (picker.jpg, chip.jpg, browse-1920.jpg, color-1280.jpg — measured 2026-09-17).
   Rewrite them once, after the markdown is in the DOM. */
function relative_to($view, dir){
	$view?.el?.querySelectorAll("img[src], a[href]").forEach(el => {
		const attr = el.tagName === "IMG" ? "src" : "href";
		const raw = el.getAttribute(attr);
		if (raw && !/^([a-z]+:|[/#])/i.test(raw)) el.setAttribute(attr, dir + raw);
	});
	return $view;
}

/* ── the tab ───────────────────────────────────────────────────────────────── */

/**
 * @param m         the run's own manifest (a TaskJSONL carrying `asks`)
 * @param base      this task's dir url, e.g. `/framework/ai/2026-09-17/run/`
 * @param to_prompt (uuid) => void — opens the Session tab at that message
 */
export function asks(m, base, to_prompt, redraw){
	const day = base.replace(/[^/]+\/$/, "");
	const date = day.split("/").filter(Boolean).at(-1);

	// One ranking for the cards, whatever band they are drawn in — see `rank.js`.
	const rank = new Ranking({ m, list: "asks", redraw });
	// A second ranking for the BANDS themselves. Its items are the topic names,
	// plain strings, so `id` is overridden to the identity function — every other
	// list here ranks objects that already carry `.id`.
	const topic_rank = new Ranking({ m, list: "topics", redraw, id: t => t });
	// How many cards a band shows before the rest folds under "N more" — the same
	// `rank: {list: "asks"}` line, one more field. `undefined` means no fold.
	const fold_at = m.fold("asks");

	return div.c("ai-asks-tab flow", async $tab => {
		const found = await serving(m.asks, day, date);
		// ⚠ No DOM after the await — the captor is gone. Build inside the callback.
		$tab.append(() => {
			/* Talk, and the wall fills in. Say what you want into this one box and
			   each thing you name comes back as its own `ask` line in this task's
			   log, landing on the wall below within seconds — `ext/Ask/reply.js`.
			   It is the first thing on the tab because it is what the owner came to
			   press, and it is two small buttons tall until it is opened. */
			dictate({ m, about: { kind: "dictation", id: "asks" } });

			// Above the wall, and above the count of it: the things this run cannot
			// finish without the owner. They are not asks-among-asks, they are the
			// reason a thread is stopped. `needs.js`.
			needs_strip(needs_of(m, base));

			const sheets = [];
			summary(m.asks, found);

			// One drop zone for every band heading in the tab — dragging a heading
			// reorders the BANDS; dragging a card (its own `band` below) reorders
			// the cards inside one. Two different lists, two different Rankings.
			const topic_band = topic_rank.band($tab);

			groups(m.asks, topic_rank).forEach(([topic, group]) => {
				if (topic) heading(topic, group, topic_band);
				let $detail;
				// The detail sheet is a member of the wall, not a box below it, so
				// `open()` can slot it in under the row of whichever card was clicked.
				// One per group, because a group is its own grid.
				div.c("ai-asks", $wall => {
					// Each topic is its own drop zone: dragging inside a band is a
					// rank, dragging ACROSS bands would be a change of topic, which
					// is an edit of the ask and not an order.
					const band = rank.band($wall);
					const sorted = rank.sort(group);
					const cut = fold_at && sorted.length > fold_at ? fold_at : sorted.length;
					sorted.forEach((ask, i) =>
						card(ask, m, found, base, to_prompt, () => $detail, sheets, band, i >= cut));
					if (cut < sorted.length) fold_toggle($wall, sorted.length - cut);
					$detail = div.c("ai-ask-detail");
				});
				sheets.push(() => $detail);
			});
		});
	});
}

/**
 * The wall, grouped by the ask's own `topic`.
 *
 * The owner's sentence: *"combine items that are similar, at least when they
 * pertain to the same parent topic … so that tomorrow morning I can click
 * through and remember, ah yes, that's what I asked for."* Thirty-four cards in
 * one undifferentiated grid is a list you read; five labelled groups is a thing
 * you navigate.
 *
 * Topics come out in the order they first appear in the log — the order the
 * owner said them — not alphabetically, unless a `rank: {list: "topics"}` line
 * says otherwise (`topic_rank`, optional — callers with nothing to rank by pass
 * none and get the first-seen order, same as always). An ask with no topic
 * joins a last group called "Other", pinned there whatever the rank says —
 * the wall's one undifferentiated catch-all stays the easiest one to find. A
 * task whose asks carry NO topic at all is one unlabelled group: exactly the
 * wall it was before, so nothing changes for the archive.
 */
function groups(asks, topic_rank){
	const order = [];
	const by = new Map();

	asks.forEach(ask => {
		const topic = ask.topic || "Other";
		if (!by.has(topic)){ by.set(topic, []); order.push(topic); }
		by.get(topic).push(ask);
	});

	const named = order.filter(t => t !== "Other");
	const sorted = topic_rank ? topic_rank.sort(named) : named;
	const all = by.has("Other") ? [...sorted, "Other"] : sorted;
	return all.map(topic => [named.length ? topic : null, by.get(topic)]);
}

/** landed / building / open, the three words `summary()` uses for the whole
    board — counted here for one band, so its heading reads the same way. */
function band_counts(list){
	const landed = list.filter(a => a.status === "landed").length;
	const building = list.filter(a => a.status === "building").length;
	return `${landed} landed · ${building} building · ${list.length - landed - building} open`;
}

/**
 * One band's own heading: its name, its landed/building/open counts, and — on
 * a dev server — the grip that reorders the BANDS (`rank: {list: "topics"}`,
 * `rank.js`). The grip drags this whole heading among its neighbours; the wall
 * of cards under it follows within the round trip (~9ms, measured in
 * `doc/ranking.md`) when the appended line comes back and the tab redraws.
 */
function heading(topic, list, band){
	div.c("ai-asks-topic flex split v-baseline wrap", $h => {
		band?.grip($h, topic);
		span.c("ai-group-title", topic);
		span.c("muted", band_counts(list));
	});
}

/**
 * "N more" — the footnote line a `rank: {list: "asks", fold: 6}` puts under a
 * band once it is carrying more than `fold` cards. The cards past the cut are
 * ordinary cards, still direct children of the wall's own grid (never nested
 * inside this bar) — CSS alone hides them, so the grip on every one of them
 * keeps working the moment the reader opens the fold, and dragging any of the
 * ones still visible is exactly the same gesture it always was.
 */
function fold_toggle($wall, n){
	const $bar = div.c("ai-asks-fold-toggle", `${n} more`);
	$bar.on("click", () => {
		const open = $wall.el.classList.toggle("show-folded");
		$bar.text(open ? "show fewer" : `${n} more`);
	});
}

/** Every serving task's manifest, by slug. A task dir that holds no log is simply absent. */
async function serving(asks, day, date){
	const slugs = [...new Set(asks.flatMap(a => a.tasks ?? []))];
	const known = warm(date).value;          // the day's directory listing, if it has landed
	const found = new Map();
	await Promise.all(slugs.map(async slug => {
		if (known && !known[slug]?.includes("task.jsonl")) return;
		const t = new TaskJSONL({ url: day + slug + "/task.jsonl" });
		await t.load();
		if (t.loaded) found.set(slug, t);
	}));
	return found;
}

/* What this wall IS, in one line, before the count of it. "13 ASKS" is a number
   and a piece of our jargon; a stranger reading the tab cold has to be told what
   they are looking at in the fewest words that actually say it. */
function summary(asks, found){
	div.c("ai-asks-head flex split v-baseline wrap", () => {
		span.c("ai-group-title muted", `${asks.length} things you asked for`);
		span.c("muted", `conclusions first · ${band_counts(asks)}`);
	});
}

/* ── one card ──────────────────────────────────────────────────────────────── */

function card(ask, m, found, base, to_prompt, detail_of, sheets, band, folded){
	div.c("ai-ask surface" + (folded ? " ai-ask-folded" : ""), $card => {
		// The grip, when there is a dev server to write the new order to. Off it,
		// no grip is drawn and the order still comes out of the file.
		band?.grip($card, ask.id);
		if (ask.needs?.owner) span.c("ai-ask-needs", `needs you · ${ask.needs.minutes ?? "?"} min`);
		div.c("ai-ask-title", card_title(ask));
		// The summary is what was asked; once a conclusion has taken the title's
		// place, the summary moves to level 2 (`detail()`, under "you asked")
		// instead of repeating here. No conclusion yet: this line is unchanged.
		if (!ask.conclusion) p.c("ai-ask-line", ask.summary ?? "");
		picture(ask, found, base);

		div.c("ai-ask-foot flex wrap v-center", () => {
			span.c("ai-ask-status").ac(ask.status ?? "open").text(ask.status ?? "open");
			// Most items say nothing here — `minutes` is only set when digging in
			// takes the owner more than a glance, so it earns a small note beside
			// the status rather than a number buried in prose. Muted, not a chip:
			// this is an estimate, not a state, and most cards never show it.
			if (ask.minutes) span.c("muted", `~${ask.minutes} min`);
			span.c("muted", report_line(ask, found));
		});

		/* Two or three links, never more, and never two to the same place: the
		   owner's own budget for this card is "a title, one line, a status, two
		   links". Everything else — the other serving tasks, the rest of their
		   deliverables — is in the sheet a click below, which is the point of the tab. */
		div.c("ai-ask-links flex wrap v-center", () => {
			const seen = new Set();
			const add = (label, href, on_click) => {
				if (!href || seen.has(href)) return;
				seen.add(href);
				link(label, href, on_click);
			};
			if (ask.prompt) add("the prompt", base + "?m=" + ask.prompt, e => {
				e.preventDefault();
				to_prompt(ask.prompt);
			});
			(ask.tasks ?? []).slice(0, 2).forEach(slug => add(slug, task_url(base, slug)));
			deliverable(ask, found, add, seen);
		});

		/* Reply to THIS ask without having to say which one it is — two small
		   buttons, and under them whatever has already been said about it.
		   `ext/Ask`'s `reply()` stops its own clicks, so pressing it never opens
		   the sheet the rest of the card opens. */
		reply({ m, about: { kind: "ask", id: ask.id, summary: ask.summary,
			quote: ask.quote, status: ask.status, topic: ask.topic, tasks: ask.tasks } });

		$card.on("click", () => open(ask, found, base, $card, detail_of(), sheets));
	});
}

const task_url = (base, slug) => base.replace(/[^/]+\/$/, "") + slug + "/";

/* A pill is one line wide, and a deliverable's label is often a whole sentence
   ("The layout browser · three walls, 99 items"). Clipped to fit, a sentence
   names nothing you can act on — so a label with a clause break is cut at the
   break instead, which leaves the part that identifies the thing. The full text
   is always in `title`. */
const short = (s, n = 22) => { s = String(s ?? ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const pill_label = s => {
	s = String(s ?? "").trim();
	const head = s.split(/\s+[·•—–:,;(-]\s*/)[0].trim() || s;
	if (head.length <= 22) return head;
	// A path names itself at its end: `.claude/skills/minion/SKILL.md` clipped from
	// the front reads `.claude/skills/minion…`, which is every skill in the repo.
	const tail = head.split("/").filter(Boolean).slice(-2).join("/");
	return short(tail.length < head.length && tail.length <= 22 ? tail : head);
};

/* Down in the sheet there is room, so a pill keeps its whole label and the CSS
   clips it at 24em — the card's hard 22 characters is a rule for a 17em column. */
const sheet_link = (label, href) =>
	a.c("ai-link", String(label ?? href)).href(href).attr("title", label);

/* A link inside a card whose whole body is a click target: the click must stop
   here, or following the link also opens the details region behind it. */
function link(label, href, on_click){
	return a.c("ai-link", pill_label(label)).href(href).attr("title", label).on("click", e => {
		e.stopPropagation();
		on_click?.(e);
	});
}

/* ONE deliverable, not all of them: a serving task can log a dozen links, and a
   card that wears them all is three times the height of its neighbours, which
   leaves a ragged hole in the wall. The first one this card does not already
   link to — a second pill onto the same url is a control that does nothing new. */
function deliverable(ask, found, add, seen){
	const all = [...(ask.links ?? []), ...(ask.tasks ?? []).flatMap(slug => found.get(slug)?.links ?? [])];
	/* ⚠ And it has to be somewhere the browser can GO. One task's only three
	     deliverables were repo paths (`.claude/skills/minion/SKILL.md`), and that
	     pill navigated to a 404 — a card's two or three pills are its promises,
	     so a card with no reachable deliverable shows none (2026-09-17). The
	     sheet below still lists everything the task logged. */
	const first = all.find(l => l?.url && web_url(l.url) && !seen.has(l.url));
	if (first) add(first.label ?? first.url, first.url);
}

/* The preview the owner asked for: a picture of what the work produced. A logged
   `shot` first; failing that, the first screenshot a serving task embedded in its
   own landing report — six of the seven tasks serving this run had one and not
   one of them logged a `shot` verb, so the whole wall was text (2026-09-17). The
   card gets the newest, not the wall: the wall is on the task's own page. */
function picture(ask, found, base){
	const rows = (ask.tasks ?? []).map(slug => [slug, found.get(slug)]).filter(([, m]) => m);
	const shot = rows.map(([, m]) => m).filter(m => m.landed_at).flatMap(m => m.shots ?? []).at(-1);
	if (shot) return div.c("ai-ask-shot", () => { shot_thumb(shot); });

	for (const [slug, m] of rows){
		const src = first_image(m.outcome);
		if (!src) continue;
		const url = /^([a-z]+:|[/#])/i.test(src) ? src : task_url(base, slug) + src;
		return div.c("ai-ask-pic", () => {
			img.c("ai-ask-img").attr("src", url).attr("loading", "lazy")
				.attr("alt", "what " + slug + " shipped");
		});
	}
}

/* ── level 2, in place ─────────────────────────────────────────────────────── */

/* One card at a time, and clicking the open card closes it — the same toggle a
   disclosure has, so there is nothing new to learn and no way to get stuck. */
function open(ask, found, base, $card, $detail, sheets){
	const was = $card.el.classList.contains("active");
	close_all(sheets);
	if (was) return;

	$card.el.classList.add("active");
	row_end($card.el).after($detail.el);
	$detail.empty(() => detail(ask, found, base, sheets));

	/* The sheet now opens directly under its own card's row, so the card does not
	   move — scroll only when the card is off screen or sitting on the fold. */
	const r = $card.el.getBoundingClientRect();
	if (r.top < 0 || r.bottom > innerHeight - 120)
		$card.el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* The last card on the same grid row as this one; the sheet goes after it, so a
   full-width detail belongs to the row it opened from. Before this, the sheet
   was a box below the ENTIRE wall: measured on all 13 cards at 1280, the card
   you clicked was 29 to 1,029px above the top of the viewport by the time its
   detail appeared (2026-09-17). */
function row_end(el){
	const row = Math.round(el.offsetTop);
	const peers = [...el.parentElement.children]
		.filter(c => c.classList.contains("ai-ask") && Math.round(c.offsetTop) === row);
	return peers.at(-1) ?? el;
}

/* Every group has its own sheet, so closing is a sweep over all of them — a card
   open in one topic must close when a card in another is clicked. */
function close_all(sheets){
	const root = sheets[0]?.().el.closest(".ai-asks-tab");
	root?.querySelectorAll(".ai-ask.active").forEach(el => el.classList.remove("active"));
	sheets.forEach(get => get().empty());
}

function detail(ask, found, base, sheets){
	div.c("ai-ask-sheet surface flow", () => {
		div.c("flex split v-baseline gap wrap", () => {
			div.c("ai-ask-title", card_title(ask));
			button.c("ai-ask-close", "close").on("click", () => close_all(sheets));
		});

		// The summary displaced from the card's own title (deliverable 1: the
		// title became the conclusion, so what was asked moves one click down)
		// opens the sheet, under a small label — the owner's own drill-down
		// order: "what I asked, the conclusion, the thought process…".
		if (ask.conclusion && ask.summary) div.c("ai-ask-asked", () => {
			span.c("ai-group-title", "you asked");
			p(ask.summary);
		});

		if (ask.quote) blockquote.c("ai-ask-quote", () => { md(ask.quote); });
		if (ask.links?.length) div.c("ai-ask-links flex wrap v-center", () =>
			ask.links.forEach(l => sheet_link(l.label ?? l.url, l.url)));

		(ask.tasks ?? []).forEach(slug => task_section(slug, found.get(slug), base));
		if (!ask.tasks?.length) p.c("muted", "Nothing has been dispatched for this one yet.");
	});
}

/**
 * One serving task at level 2: what it shipped, in a line, and the lines of its
 * log where something was weighed. Everything else — the full landing report,
 * every remaining log line — is behind the fold at the bottom.
 *
 * ⚠ This section used to print the whole report and every log line outright, and
 * the three-task sheet measured 8,038px — nine screens (2026-09-17). "We tend to
 * get into too much detail too early" is the owner's sentence; level 2 answers
 * what was discussed and decided, level 3 shows the work.
 */
function task_section(slug, m, base){
	const dir = task_url(base, slug);
	div.c("ai-ask-task flow", () => {
		div.c("flex gap wrap v-baseline", () => {
			a.c("ai-ask-task-name", slug).href(dir);
			span.c("muted", m ? state(m) : "no log yet");
		});

		if (!m) return;
		const head = headline(m.outcome) || m.now;
		if (head) relative_to(p.c("ai-ask-head").md(head), dir);
		links_row(m);

		const logs = m.logs ?? [];
		const shown = decisions(m).slice(0, SHOWN);
		if (shown.length) div.c("ai-ask-weighed", () => shown.forEach(l => p.c("ai-ask-decision", l.msg)));
		else if (logs.length) p.c("muted", "No line in this task's log reads as a decision.");

		const rest = logs.filter(l => !shown.includes(l));
		if (m.outcome || rest.length) fold(more_label(m, rest), () => {
			if (m.outcome) relative_to(md(m.outcome), dir);
			rest.forEach(l => p.c("muted", l.msg));
		});
	});
}

/* A fold says what it hides, in the reader's words, not "more". */
const more_label = (m, rest) => [
	m.outcome && "the full report",
	rest.length && `${rest.length} more log line${rest.length === 1 ? "" : "s"}`,
].filter(Boolean).join(" · ");

export default asks;

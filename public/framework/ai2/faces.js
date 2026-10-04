import { div, p, span, small, a, details, summary, button, input, md } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { mentions } from "/framework/ext/Mention/Mention.js";
import { author_word, plain } from "./inbox.js";
import { md_into } from "./chat.js";
import { meter } from "./meter.js";
import { prompt_modes } from "/framework/ext/Refine/prompt-card.js";

/**
 * THE TWO FACES OF A CARD — the preview in the rail, and the whole thing on the
 * page. Beside each other in one file on purpose: whatever the full page learns
 * to draw, you can see here whether the preview has to learn to summarise it.
 */

export const clock = at =>
	at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

/** Today's time alone; any other day with its date — a list spans weeks. */
export const when = at => {
	if (!at) return "";
	const d = new Date(at);
	if (d.toDateString() === new Date().toDateString()) return clock(at);
	return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + clock(at);
};

/** EVERY ROW SAYS WHO (the owner, 2026-09-22: "the items in the inbox need an
    author so I know who it's coming from, whether it's something I said"). One
    word — `you`, `assistant`, `mastermind`, or the minion's own name — and `you`
    wears its own mark so the owner's sentences read apart from everything else.
    `is_you` rather than a string test, because a minion could be named "you". */
export const is_you = it => it.author === "owner";

export function who(it){
	span.c("ai2-who" + (is_you(it) ? " ai2-who-you" : "")).text(author_word(it.author));
}

/** A PREVIEW: the title, a progress bar and the money — nothing else (the owner,
    2026-09-24: "way too much summary on the cards"). The words a card used to
    show live one click down, on its page. `it.progress` and `it.usd` are set by
    AI 2's `paint()`. `it.sub`, when a caller sets it (a stalled-ask row), is one
    quiet line under the title — the same shape `live_row()` already draws for the
    Live card (`.ai2-row-foot` + `.ai2-row-line`). `ai2-row-ask` on the head
    (stalled rows only) is what lets `ai2.css` make an UNREAD one bold and a READ
    one plain. `it.score`, when set, is the importance badge (needs-rule.js).
 *
 *  `on` (added 2026-09-30, `rules.js`): `toggle_read()` and `archive()`, the two
 *  row-level actions a minion's brief asked for. Both are OPTIONAL — `live_row()`
 *  and any other caller of the plain preview shape can still call `row(it)` bare,
 *  same as before; the dot and the archive × simply do nothing without them. */
export function row(it, on = {}){
	div.c("ai2-row-head flex gap-25" + (it.kind === "stalled" ? " ai2-row-ask" : ""), () => {
		// THE DOT IS THE READ/UNREAD BUTTON NOW (deliverable 2) — a REAL `<button>`,
		// not a `<span role="button">` with hand-written key handling (log.js's own
		// review finding, 2026-09-30, applies here too). `e.stopPropagation()` keeps
		// the click from also activating the row's own link — the row is an `<a>`
		// (page.js `make()`), and a button inside it still bubbles a click up to it.
		button.c("ai2-dot").attr("type", "button")
			.attr("title", it.unread ? "mark read" : "mark unread")
			.click(e => { e.preventDefault(); e.stopPropagation(); on.toggle_read?.(); });
		if (it.icon) icon(it.icon);
		// A NUMBER NEVER SITS ALONE (the owner, 2026-10-03: "unexplained 94/99 badges" — a
		// badge either explains itself on hover or goes). `it.reason` is the same rule
		// `needs-rule.js` already picked this score FROM (rail.js's `decorate()`), in five
		// words — the title is never a second idea of why, just that rule read back.
		if (it.score != null) span.c("ai2-score" + (it.score >= 70 ? " ai2-score-hot" : ""))
			.attr("title", it.reason ? `${it.score} — ${it.reason}` : String(it.score)).text(String(it.score));
		mentions(span.c("ai2-row-title").text(it.title).el);   // the Inbox row's title — ext/Mention
		small.c("ai2-row-when muted").text(when(it.at));   // last updated, top-right, on every row
		// ARCHIVE, RIGHT ON THE ROW (deliverable 3) — the exact same write the card's
		// own "clear" button already makes (`rules.js` `archive_row`, `full()`'s own
		// `on.clear` just below); `.ai2-clear` is that same button's existing look,
		// reused rather than styled twice.
		if (on.archive) button.c("ai2-clear").attr("type", "button")
			.attr("title", "archive — nothing is deleted").text("×")
			.click(e => { e.preventDefault(); e.stopPropagation(); on.archive(); });
	});
	if (it.sub) div.c("ai2-row-foot flex v-center gap-25", () => { small.c("ai2-row-line muted").text(it.sub); });
	meter(it.progress, it.usd, it.usd_open);
	if (it.news) news_bar(it.news);
}

/** WHAT HAPPENED, ONE LINE (activity.js `news_of()`): who, then what, from the newest
    line that bumped this row. Only while it is new to you. Clicking it opens the
    card's Activity tab — page.js catches the click, since the row is itself a link. */
export function news_bar(n){
	div.c("ai2-news", () => {
		if (n.who) span.c("ai2-news-who").text(n.who + ": ");
		span.c("ai2-news-what").text(n.what);
	}).attr("title", "what happened — click to see it in Activity").attr("role", "link");
}

/**
 * THE WHOLE CARD, on the page that does not move. It reads top down in the order
 * you came to know it: what the assistant made of what you said, the names it
 * minted, your own words, any sketch, the links. `on` is the two things this
 * face cannot do itself — `flag()` and `unflag()`.
 */
export function full(it, on){
	// ITEM D, 2026-09-30: `/framework/ai2/ask:…/` is a STALLED ASK with no card of its own
	// (`resolve_card()`, inbox.js, redirects straight to the card when it has one — this page
	// only draws when it does not) — say PLAINLY what the page is, before anything else, so it
	// never reads like a broken or half-built card. `it.owner` and `it.at` (the stall's own
	// `status_at`) are already on the row (`inbox.js`'s stalled `add({...})`); `when()` is this
	// file's own clock formatter, just above.
	if (it.kind === "stalled") div.c("ai2-ask-banner muted flex wrap gap-25", () => {
		span("An ask from the ledger. Owner: " + (it.owner || "unknown") + ". Quiet since " + (when(it.at) || "unknown") + ".");
		a.c("page-link").href("/framework/ai/asks.jsonl").text("ai/asks.jsonl");
	});
	div.c("ai2-full-head flex v-center gap-25", () => {
		if (it.icon) icon(it.icon);
		// `.md()` — the fast assistant wraps a known page mention in a real link
		// (`[AI 2](/framework/ai2/)`), open-mic's item 6.
		span.c("ai2-full-title").md(it.title);
		button.c("ai2-flag" + (it.flag ? " on" : "")).attr("type", "button")
			.attr("title", it.flag ? "flagged — press to withdraw" : "not this — say why")
			.text("⚑").click(() => (it.flag ? on.unflag() : flag_box(on)));
		if (on.clear) button.c("ai2-clear").attr("type", "button")
			.attr("title", "archive this card — nothing is deleted").text("clear").click(on.clear);
	});

	div.c("ai2-meta flex v-center gap-25", () => {
		who(it);
		small.c("muted").text(clock(it.at));
	});

	if (it.refined) p.c("ai2-refined").md(it.refined);
	if (it.text) div.c("ai2-text md", $t => { md_into($t.el, it.text); });
	if (it.landed && it.landed !== it.text) div.c("ai2-landed md", $t => { md_into($t.el, it.landed); });

	if (it.kind === "prompt"){
		if (it.names.length) div.c("ai2-chips flex wrap gap-25", () => {
			it.names.forEach(n => { span.c("ai2-chip").text(n); });
		});

		// Before the assistant has answered there is no reading and no title yet,
		// so the fold stands open on its own — which is the card you see the
		// instant you stop speaking, and it is already the right card.
		details.c("ai2-said", $d => {
			summary.c("ai2-said-head muted").text(it.refined ? "your words" : "just now, in your words");
			it.said.filter(Boolean).forEach(s => { p.c("ai2-sentence md", $t => { md_into($t.el, s, true); }); });
			if (!it.refined) $d.el.open = true;
		});

		it.proposals.forEach(pr => {
			div.c("ai2-proposal", () => {
				small.c("muted").text("first sketch");
				span.c("ai2-proposal-title").text(pr.title);
				pr.shape.forEach(s => { p.c("ai2-sentence md", $t => { md_into($t.el, s, true); }); });
			});
		});
	}

	// THE PINNED "Your prompts" CARD'S OWN PAGE (deliverable 5's ai2 addition, 2026-10-02):
	// every prompt, newest-first, each a mode-switch card (`prompt_timeline()`, below).
	if (it.kind === "prompts-pin") prompt_timeline(it.prompts ?? []);

	// ⚠ `page-link` is the site's class for a link that is NOT inside prose, and
	// it is why these are no longer browser-blue: framework.css scopes link
	// colour to prose, so an anchor in a bare div got no rule at all (measured:
	// rgb(0, 0, 238) on all twelve). `ux/Card/Card.css` says the rest.
	if (it.links.length) div.c("ai2-links flex wrap gap-25", () => {
		it.links.forEach(l => { a.c("ai2-link page-link").href(l.url).text(l.label ?? l.url); });
	});

	if (it.flag) small.c("ai2-flag-said muted")
		.text("flagged" + (it.flag.quote ? " on “" + it.flag.quote + "”" : "") + " — " + (it.flag.note ?? ""));
}

/**
 * THE "YOUR PROMPTS" TIMELINE — every prompt, newest-first (`prompts` is already sorted
 * that way, `rail.js`'s `build_prompts_pin_item()`). Two rules straight from the brief:
 *
 *   1. TOPIC WRAPPERS COME FROM THE DATA, NEVER A GUESS: consecutive prompts sharing one
 *      `p.topic` render inside ONE labelled wrapper; a prompt with no topic (every prompt,
 *      today — minion-echo's `refined` line is adding this field, not landed yet) renders
 *      on its own, with no wrapper and no label, exactly as it does now. Nothing here
 *      invents a topic by looking at the words.
 *   2. CONDENSED IS THE SUMMARY: each prompt is `prompt_modes()` (`ext/Refine/
 *      prompt-card.js`), defaulting to Condensed — the SAME component and the SAME
 *      "show it, don't guess at a shorter version" rule deliverable 5 already built for
 *      the live thread, just mounted here with a different starting mode.
 */
function prompt_timeline(prompts){
	if (!prompts.length){ small.c("muted").text("nothing said yet"); return; }
	let i = 0;
	while (i < prompts.length){
		const topic = prompts[i].topic;
		const group = [prompts[i]];
		if (topic) while (i + 1 < prompts.length && prompts[i + 1].topic === topic) group.push(prompts[++i]);
		i++;
		if (topic) div.c("ai2-prompts-group", () => {
			small.c("ai2-prompts-topic muted").text(topic);
			group.forEach(prompt_timeline_row);
		});
		else group.forEach(prompt_timeline_row);
	}
}

/** ONE PROMPT IN THE TIMELINE: when it was said, the mode-switch card (what was said), and
 *  — "beside each prompt, collapsed by default" — the assistant's own reading, the best
 *  stand-in today for "my reply" until a real one exists (`it.refined`, the exact text
 *  `full()` already shows for a live `kind: "prompt"` row elsewhere on this page). */
function prompt_timeline_row(row){
	div.c("ai2-prompts-row", () => {
		small.c("ai2-prompts-when muted").text(when(row.at));
		prompt_modes({
			raw: row.text ?? (row.said ?? []).join(" "),
			sentences: null, structured: null,
			fallback_text: row.refined || row.title || (row.said ?? [])[0] || "",
		}, { mode: "condensed" });
		if (row.refined) details.c("ai2-prompts-reply", () => {
			summary.c("ai2-prompts-reply-head muted").text("my reply");
			p.c("ai2-refined").md(row.refined);
		});
	});
}

/**
 * THE TABLE OF CONTENTS (deliverable 3) — every task, proposal, refined
 * reading and transcript paragraph in a card's own log, each a row that opens
 * in the third column. `rows` is `sub_rows()`'s own output from `inbox.js`;
 * `base` is this card's own url, so a row is a plain `<a>` and the Router
 * does the navigating — same reason a rail row is a plain `<a>` and not a
 * click handler (`page.js`'s own comment on `make()`).
 */
export function toc(rows, base){
	details.c("ai2-toc", $d => {
		summary.c("ai2-toc-head muted").text(rows.length + (rows.length === 1 ? " sub-card" : " sub-cards"));
		div.c("ai2-toc-rows", () => {
			rows.forEach(r => {
				a.c("ai2-toc-row page-link").href(base + r.sub + "/").append(() => {
					icon(r.icon);
					div.c("ai2-toc-body", () => {
						span.c("ai2-toc-title").text(r.title);
						if (r.line) small.c("ai2-toc-line muted").text(r.line);
					});
				});
			});
		});
		$d.el.open = true;
	});
}

/** ONE SUB-CARD, WHOLE — the third column's own content. Deliberately smaller
 *  than `full()`: a sub-card is one task, one proposal, one reading or one
 *  paragraph, never a second inbox to read. */
export function sub_full(it){
	div.c("ai2-full-head flex v-center gap-25", () => {
		icon(it.icon);
		span.c("ai2-full-title").text(it.title ?? it.kind);
	});

	if (it.kind === "said") it.said.filter(Boolean).forEach(s => { p.c("ai2-sentence md", $t => { md_into($t.el, s, true); }); });
	else if (it.kind === "task") {
		if (it.state) small.c("muted").text("state: " + it.state);
		if (it.now) div.c("ai2-refined md", $t => { md_into($t.el, it.now); });
		if (it.brief) div.c("ai2-text md", $t => { md_into($t.el, it.brief); });
	} else if (it.kind === "proposal") {
		(it.shape ?? []).forEach(s => { p.c("ai2-sentence md", $t => { md_into($t.el, s, true); }); });
	} else if (it.kind === "refined") {
		if (it.text) p.c("ai2-refined").md(it.text);
	}
}

/** The one line you type to say what is wrong. Appended where it is called from,
    so the caller decides where it lands. `on.held()` tells the page to stop
    redrawing under a half-typed sentence — the bug the old board had. */
export function flag_box(on, quote){
	on.held(true);
	div.c("ai2-flag-box flex v gap-25", $box => {
		if (quote) small.c("ai2-flag-quote muted").text("on “" + quote + "”");
		const $why = input().attr("placeholder", "what is wrong with it?").ac("ai2-flag-input");
		$why.on("keydown", e => {
			if (e.key === "Escape"){ on.held(false); $box.el.remove(); return; }
			if (e.key !== "Enter") return;
			$box.empty(() => { small.c("muted").text("sent to the mastermind"); });
			on.flag($why.el.value.trim() || "Not this.", quote);
		});
		setTimeout(() => $why.el.focus(), 0);
	});
}

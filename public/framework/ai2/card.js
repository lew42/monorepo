import { div, p, span, small, a, details, summary, button, input, md } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { author_word } from "./inbox.js";

/**
 * THE TWO FACES OF A CARD — the preview in the rail, and the whole thing on the
 * page. Beside each other in one file on purpose: whatever the full page learns
 * to draw, you can see here whether the preview has to learn to summarise it.
 */

export const clock = at =>
	at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

/** EVERY ROW SAYS WHO (the owner, 2026-09-22: "the items in the inbox need an
    author so I know who it's coming from, whether it's something I said"). One
    word — `you`, `assistant`, `mastermind`, or the minion's own name — and `you`
    wears its own mark so the owner's sentences read apart from everything else.
    `is_you` rather than a string test, because a minion could be named "you". */
export const is_you = it => it.author === "owner";

export function who(it){
	span.c("ai2-who" + (is_you(it) ? " ai2-who-you" : "")).text(author_word(it.author));
}

/** ONE LINE, AND IT IS ALWAYS THE SAME HEIGHT. The preview is the thing that
    must not move when the list repaints, so it is exactly two rows of text: the
    title row, and one clamped line of whatever the card is about. */
export function row(it){
	div.c("ai2-row-head flex v-center gap-25", () => {
		span.c("ai2-dot");                         // always drawn; CSS shows it only when unread
		if (it.icon) icon(it.icon);
		span.c("ai2-row-title").text(it.title);
		small.c("ai2-row-when muted").text(clock(it.at));
	});
	div.c("ai2-row-foot flex v-center gap-25", () => {
		who(it);
		// The card's CURRENT state, not its first sentence — the last thing said
		// into it if it is a card you talk to, otherwise what it is about.
		const last = it.transcript?.length && it.transcript[it.transcript.length - 1].said.filter(Boolean).at(-1);
		const line = last || it.refined || it.text || it.landed || it.said?.find(Boolean) || "";
		if (line) small.c("ai2-row-line muted").text(line);
	});
}

/**
 * THE WHOLE CARD, on the page that does not move. It reads top down in the order
 * you came to know it: what the assistant made of what you said, the names it
 * minted, your own words, any sketch, the links. `on` is the two things this
 * face cannot do itself — `flag()` and `unflag()`.
 */
export function full(it, on){
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
	if (it.text) p.c("ai2-text").text(it.text);
	if (it.landed && it.landed !== it.text) p.c("ai2-landed").text(it.landed);

	if (it.kind === "prompt"){
		if (it.names.length) div.c("ai2-chips flex wrap gap-25", () => {
			it.names.forEach(n => { span.c("ai2-chip").text(n); });
		});

		// Before the assistant has answered there is no reading and no title yet,
		// so the fold stands open on its own — which is the card you see the
		// instant you stop speaking, and it is already the right card.
		details.c("ai2-said", $d => {
			summary.c("ai2-said-head muted").text(it.refined ? "your words" : "just now, in your words");
			it.said.filter(Boolean).forEach(s => { p.c("ai2-sentence").text(s); });
			if (!it.refined) $d.el.open = true;
		});

		it.proposals.forEach(pr => {
			div.c("ai2-proposal", () => {
				small.c("muted").text("first sketch");
				span.c("ai2-proposal-title").text(pr.title);
				pr.shape.forEach(s => { p.c("ai2-sentence").text(s); });
			});
		});
	}

	// ⚠ `page-link` is the site's class for a link that is NOT inside prose, and
	// it is why these are no longer browser-blue: framework.css scopes link
	// colour to prose, so an anchor in a bare div got no rule at all (measured:
	// rgb(0, 0, 238) on all twelve). `ai2.css` says the rest.
	if (it.links.length) div.c("ai2-links flex wrap gap-25", () => {
		it.links.forEach(l => { a.c("ai2-link page-link").href(l.url).text(l.label ?? l.url); });
	});

	if (it.flag) small.c("ai2-flag-said muted")
		.text("flagged" + (it.flag.quote ? " on “" + it.flag.quote + "”" : "") + " — " + (it.flag.note ?? ""));
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

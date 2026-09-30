import View, { div, span, textarea, button } from "/framework/core/View/View.js";
import Decision from "/framework/ux/Content/Decision/Decision.js";
import { servex_url } from "/framework/dev/servex_url.js";
import { fixture_marks } from "./fixtures.js";

View.stylesheet(import.meta, "Understand.css");

/** Where Servex answers `/api/hitl` — same helper every other caller already uses
 *  (`dev/servex_url.js`), so this works on the phone too, not just localhost. */
const HITL_URL = servex_url("/api/hitl");

/**
 * `sentences` in, `{ok, marks, source}` out — never throws. `marks` is
 * `[{i, mark: "ok"|"unclear", purpose, question?: {ask, options: [a, b]}}]`, one entry
 * per sentence. A network failure, or Servex answering `ok:false`, falls back to the
 * FIXTURES rules pass (`source: "fixtures"` says so) — the production site is static,
 * so that fallback is what it actually shows.
 *
 *     import { marks } from "/framework/ux/Understand/Understand.js";
 *     const out = await marks(["I want a green check mark.", "Maybe a yellow one too."]);
 *     // -> {ok: true, marks: [...], source: "assistant" | "fixtures"}
 *
 * Exported on its own (not just used inside the class below) so `ChatPanel` — the real
 * chat this demo is a rehearsal for — can call it directly and hand the result straight
 * to `new Understand({sentences, marks: out.marks})`.
 */
export async function marks(sentences, context){
	try {
		const r = await fetch(HITL_URL, {
			method: "POST", headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ op: "marks", sentences, context }),
		});
		if (r.ok){
			const out = await r.json();
			if (out?.ok && Array.isArray(out.marks)) return { ok: true, marks: out.marks, source: "assistant" };
		}
	} catch { /* Servex isn't up yet — fixtures below, same as Revise.run()'s own fallback */ }

	return { ok: true, marks: fixture_marks(sentences), source: "fixtures" };
}

/* The clarification card, in-memory only — a demo NEVER writes a real log
 * (requirements.md). `Decision` (ux/Content/Decision) already draws "two options,
 * nothing pre-chosen" exactly right; the only two methods a real log needs are its
 * read (`history()`) and its write (`write()`), so overriding just those two keeps
 * every other line of Decision — the options, the "your choice" mark, the
 * scroll-guard against an accidental tap mid-scroll — completely unchanged.
 * `on_chosen(say)` is the one extra seam Understand needs: the ? -> ✓ flip below. */
class ClarifyCard extends Decision {
	async history(){ return this.mem ?? []; }
	async write(line){
		(this.mem ??= []).push(line);
		this.on_chosen?.(line.chose?.option);
		return true;
	}

	// Decision's head() would print "Decided by owner" once an option is picked —
	// true wording for a real record, false here (review.md #2: any visitor can
	// click this demo, not just the owner). This card never sets rank/confidence
	// either, so the head row never had anything real to show; skip it.
	head(){}
}

/**
 * class Understand extends View — sentences in, a small ✓/? mark after each one. `ok`
 * draws a quiet green ✓ (`purpose` as its title tooltip); `unclear` draws a yellow ?,
 * and right after that sentence a clarification card appears — "Did you mean A or B?"
 * Tapping the ? scrolls its card into view and flashes it (the owner's own words:
 * "first it kind of selects that card"). Choosing an option there writes ONE line to
 * an IN-MEMORY log (`this.log`, a plain array the caller can also read) and turns
 * that ? into a ✓.
 *
 *     import Understand, { marks } from "/framework/ux/Understand/Understand.js";
 *     const out = await marks(sentences);
 *     new Understand({ sentences, marks: out.marks, log: [] });
 *
 * This class only ever draws a `marks` array it is GIVEN — it never calls `marks()`
 * itself — so a caller (this module's own demo below, or `ChatPanel` later) decides
 * when to ask and can show a "marking…" state in between.
 */
export default class Understand extends View {

	render(){
		this.log ??= [];
		this.draw();
	}

	draw(){
		return this.empty(() => this.sentences.forEach((text, i) => this.row(text, i)));
	}

	row(text, i){
		const m = this.marks.find(x => x.i === i) ?? { i, mark: "ok", purpose: "" };

		div.c("ux-understand-row", () => {
			// Plain inline flow, NOT flex — a flex row treats the sentence and its
			// mark as two separate boxes and wraps the mark onto its own line the
			// moment the sentence is long. A non-breaking space glues the mark to
			// the sentence's last word instead, so it wraps like any other word
			// would — small, right after the text, same line (the owner: "a green
			// check mark after it").
			div.c("ux-understand-sentence", () => {
				span(text + " ");
				this.badge(m, i);
			});
			if (m.mark === "unclear" && m.question) this.clarify(m, i);
		});
	}

	badge(m, i){
		if (m.mark === "ok"){
			span.c("ux-understand-mark ux-understand-ok").attr("title", m.purpose || "Reads as clear.").text("✓");
			return;
		}

		this.badges ??= {};
		this.badges[i] = span.c("ux-understand-mark ux-understand-unclear")
			.attr("tabindex", "0").attr("role", "button")
			.attr("title", m.purpose || "This sentence might mean more than one thing.")
			.text("?")
			.click(() => this.spotlight(i));
	}

	/* The owner's own words: "first it kind of selects that card" — scroll it into
	 * view and flash its border for a moment, so a tap on the ? plainly points at
	 * the right card instead of leaving the reader to hunt for it. */
	spotlight(i){
		const $card = this.cards?.[i];
		if (!$card) return;
		$card.el.scrollIntoView({ behavior: "smooth", block: "center" });
		$card.ac("ux-understand-flash");
		setTimeout(() => $card.rc("ux-understand-flash"), 900);
	}

	clarify(m, i){
		this.cards ??= {};
		this.cards[i] = div.c("ux-understand-clarify", () => {
			new ClarifyCard({
				id: `understand-${i}`,
				ask: m.question.ask,
				options: m.question.options.map(say => ({ say })),
				on_chosen: say => this.resolve(i, say),
			});
		});
	}

	resolve(i, say){
		this.log.push({ understood: { i, chosen: say, at: new Date().toISOString() } });
		this.badges?.[i]?.rc("ux-understand-unclear").ac("ux-understand-ok").text("✓")
			.attr("title", "Clarified: " + say);
	}
}

Understand.prototype.classes = "ux-understand flex v gap";

/* ---- the demo: a canned paragraph marked on load, plus "try your own" ---------- */

/* Five real sentences from the owner's own words (requirements.md) — one of them
 * ("maybe it's like a yellow question mark…") genuinely hedges, so the fixtures rule
 * (HEDGES, above) catches exactly one without any thumb on the scale. */
const CANNED = [
	"I want to figure out the objective of each statement.",
	"Let's put a green check mark after it, just so we see that visual feedback.",
	"If a statement might have some ambiguity, maybe it's like a yellow question mark that goes after it.",
	"The smart assistant could add clarification UI into the chat where it needs clarity.",
	"Let's see if we can get a demo of that working.",
];

/* Split on sentence-ending punctuation or a blank line — good enough for a textarea
 * of plain prose; a real chat message already arrives one sentence per line. */
function split_sentences(text){
	return text.split(/(?<=[.?!])\s+|\n+/).map(s => s.trim()).filter(Boolean);
}

Understand.Demo = class UnderstandDemo extends View {

	render(){
		this.ac("ux-understand-demo flex v gap");

		div.c("h4 muted", "A canned paragraph, marked on load");
		this.$canned_status = div.c("ux-understand-status muted", "marking…");
		this.$canned = div.c("ux-understand-live");
		this.run(CANNED, this.$canned, this.$canned_status);

		div.c("h4 muted", "Try your own");
		this.$box = textarea.c("ux-understand-box").attr("rows", 4)
			.attr("placeholder", "Paste a paragraph — plain prose is fine, one or more sentences.");
		button.c("prim").attr("type", "button").text("Mark it")
			.click(() => this.run_own());
		this.$own_status = div.c("ux-understand-status muted");
		this.$own = div.c("ux-understand-live");
	}

	async run(sentences, $target, $status){
		const out = await marks(sentences);
		$status.text(out.source === "fixtures" ? "fixtures: Servex /api/hitl not reachable" : "marked live by the fast assistant");
		$target.empty(() => new Understand({ sentences, marks: out.marks }));
	}

	run_own(){
		const sentences = split_sentences(this.$box.el.value);
		if (!sentences.length) return;
		this.run(sentences, this.$own, this.$own_status);
	}
};

export { Understand };

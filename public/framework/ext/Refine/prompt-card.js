import { View, div, span, ol, li, ul, small, s as strike } from "/app.js";

/* Its own stylesheet, loaded once no matter which page imports this file
 * first — `ai/v/3/prompts.js` and `ai2/faces.js` both do, and neither needs
 * to know `.refine-modes-*` exists in its own CSS (same pattern Refine.js
 * uses for its own `.refine-*` ladder, just below). */
View.stylesheet(import.meta, "prompt-card.css");
/* `parse_structured`/`parse_clean` are the exact shapes `Server/refine.mjs`
 * already writes (structured.md's headings+bullets, clean.md's numbered
 * sentences) — reused here rather than re-parsed a second way (law 6). This
 * also pulls in `Refine.css` as a side effect of importing `Refine.js`; that
 * stylesheet only touches `.refine-*` classes, so it never collides with the
 * `.refine-modes-*` classes below. */
import { parse_structured, parse_clean } from "./Refine.js";

export { parse_structured, parse_clean };

/**
 * PROMPT MODES — one small, reusable piece: a 4-way tab strip (Condensed →
 * Structured → Clean → Raw) plus the four render functions behind it.
 *
 *     import { prompt_modes } from "/framework/ext/Refine/prompt-card.js";
 *     prompt_modes({ raw, sentences, structured, fallback_text });
 *
 * Lives here, under `ext/Refine/`, rather than inside either tier that uses
 * it — moved out of `ai/v/3/` (where it was first built, 2026-10-02) the
 * moment `ai2` needed the same mode switch for its "Your prompts" pinned
 * card: `ai2/inbox.js`'s own comment explains why nothing in `ai2` imports
 * from `ai/v/3` ("that board is being replaced and this page must not go
 * down with it"), so a piece both tiers share belongs in neutral ground,
 * same as `ext/Mention` or `ext/JSONL` already do. Both `ai/v/3/prompts.js`
 * and `ai2/faces.js` import it from here.
 *
 * Call it the same way `div.c(...)` is called elsewhere in this house view
 * system: it builds itself into whatever captor is open right now, and hands
 * back `{ el, set_mode, get_mode }` so a caller can read or drive the mode
 * from outside (e.g. remembering the owner's last pick).
 *
 * `source` is plain data about ONE prompt — never a network call, so this
 * file does not care whether it came from a live Servex `refined` event (the
 * fast assistant's cleaned reading, today) or a finished `Server/refine.mjs`
 * run on disk (`clean.md` + `structured.md`, once `minion-core`'s engine or
 * a historical list reads those):
 *
 *   - `raw`:        string — the byte-for-byte original. Always pass this if
 *                   you have it; Raw mode has nothing else to show.
 *   - `sentences`:  `[{n, text}]` or `null` — `clean.md`'s near-verbatim
 *                   sentences (`parse_clean`'s own shape). `null` means the
 *                   clean step hasn't run on this prompt yet.
 *   - `structured`: `[{title, bullets:[{text, cites, label}]}]` or `null` —
 *                   `structured.md`'s heading/bullet outline
 *                   (`parse_structured`'s own shape). `null` means structure
 *                   hasn't run yet.
 *   - `fallback_text`: string — the best text known when `sentences` and
 *                   `structured` are both missing (a live reading's text,
 *                   or the prompt's own text). Every mode falls back to
 *                   this rather than ever showing nothing.
 *   - `strikes`:    `[{sentence_n, struck_text}]` or `[]`/missing — a
 *                   self-correction found in the raw words (parent brief
 *                   step 2: "leave it, shown as a strike"). Shown in Clean
 *                   mode, struck through, right before the sentence it
 *                   belongs to.
 *   - `misheard`:   `[{sentence_n, from, to}]` or `[]`/missing — a word
 *                   fixed against the CLAUDE.md/module glossary (parent
 *                   brief step 2: shown as `misheard → Name`). Shown in
 *                   Clean mode, right after the sentence it belongs to.
 *   - `flags`:      `[{sentence_n, question, confidence, source}]` or
 *                   `[]`/missing — an unclear passage and the clarification
 *                   question saved with it (parent brief step 4). Shown in
 *                   Clean mode as a small red flag on that sentence.
 *
 * `strikes`/`misheard`/`flags` are EXACTLY this same folder's `engine.js`'s
 * own `clean()` return shape (`{text, sentences, strikes, misheard, flags}`,
 * keyed by `sentence_n` against `sentences[].n`) — the current stand-in
 * contract for this card, pending the Servex-side "echo assistant" (built by
 * a sibling task, `minion-echo`) that will eventually write a `refined` log
 * line carrying this same data for a logged prompt. When that lands, a
 * caller passes its fields straight through; nothing in this file needs to
 * change shape.
 *
 * `opts.mode` picks the starting mode (default "clean" — the near-verbatim
 * reading is what most of today's prompts already have); `opts.on_mode`
 * fires `(mode) => {}` on every switch, for a caller that wants to remember
 * the choice. Neither is required.
 */
export const MODES = ["condensed", "structured", "clean", "raw"];
export const MODE_LABEL = { condensed: "Condensed", structured: "Structured", clean: "Clean", raw: "Raw" };

export function prompt_modes(source, opts = {}) {
	let mode = MODES.includes(opts.mode) ? opts.mode : "clean";
	let $tabs, $body;

	const $box = div.c("refine-modes", () => {
		$tabs = div.c("refine-modes-tabs flex gap-25");
		$body = div.c("refine-modes-body");
	});

	paint_tabs();
	paint_body();

	/* `scroll_to` is how Condensed jumps into Structured at the right
	   heading: switch mode, THEN find the heading's own element — both
	   happen synchronously (this view system never renders after an
	   await), so the element is already there to scroll to. */
	function set_mode(next, { scroll_to } = {}) {
		if (!MODES.includes(next)) return;
		mode = next;
		paint_tabs();
		paint_body();
		if (scroll_to != null) $body.el.querySelector(`[data-heading="${scroll_to}"]`)
			?.scrollIntoView({ block: "nearest", behavior: "smooth" });
		opts.on_mode?.(mode);
	}

	function paint_tabs() {
		$tabs.empty(() => {
			MODES.forEach(m => span.c("refine-modes-tab" + (m === mode ? " on" : ""))
				.attr("data-mode", m).text(MODE_LABEL[m])
				.on("click", () => set_mode(m)));
		});
	}

	function paint_body() {
		$body.empty(() => {
			if (mode === "condensed") condensed_view(source, i => set_mode("structured", { scroll_to: i }));
			else if (mode === "structured") structured_view(source);
			else if (mode === "clean") clean_view(source);
			else raw_view(source);
		});
	}

	return { el: $box.el, set_mode, get_mode: () => mode };
}

/* CONDENSED — headings only, each a clickable line that jumps into
   Structured at that heading. Never blank: with no structure yet, the first
   sentence (or the first clause of whatever text is known) stands in. */
function condensed_view(source, jump) {
	const sections = source.structured ?? [];
	if (sections.length) {
		ol.c("refine-modes-condensed", () => sections.forEach((sec, i) =>
			li.c("refine-modes-condensed-item").text(sec.title || `Section ${i + 1}`)
				.on("click", () => jump(i))));
		return;
	}
	const text = source.sentences?.[0]?.text ?? first_sentence(source.fallback_text ?? source.raw ?? "");
	// `fallback_text` can already end in its OWN "…" (a placeholder title such as
	// "You said…", `ai2/inbox.js`'s own default before anything is known) — never
	// double it up into "You said……".
	small.c("refine-modes-empty muted").text(text ? (text.endsWith("…") ? text : `${text}…`) : "nothing said yet");
}

/* STRUCTURED — the full heading/bullet outline. With no structure yet, say
   so plainly and fall back to Clean rather than leaving the pane empty. */
function structured_view(source) {
	const sections = source.structured ?? [];
	if (!sections.length) {
		small.c("refine-modes-empty muted").text("structure hasn't run on this prompt yet — showing Clean instead:");
		clean_view(source);
		return;
	}
	sections.forEach((sec, i) => div.c("refine-modes-section", () => {
		div.c("refine-modes-heading").attr("data-heading", String(i)).text(sec.title || `Section ${i + 1}`);
		ul.c("refine-modes-bullets", () => sec.bullets.forEach(b =>
			li.c("refine-modes-bullet").text(b.label ? `${b.text} [${b.label}]` : b.text)));
	}));
}

/* CLEAN — the near-verbatim text, sentence by sentence, with the three
   things `clean()` found ON TOP of each sentence it belongs to: a struck
   self-correction, a misheard-word fix, or a red flag with its question.
   With no clean step yet (a live Servex reading is already one cleaned
   paragraph, not numbered sentences), the best text known shows as one
   block instead of nothing. */
function clean_view(source) {
	if (!source.sentences?.length) {
		div.c("refine-modes-clean-fallback").text(source.fallback_text || source.raw || "nothing said yet");
		return;
	}
	ol.c("refine-modes-clean", () => source.sentences.forEach(sent => {
		const strikes = (source.strikes ?? []).filter(x => x.sentence_n === sent.n);
		const misheard = (source.misheard ?? []).filter(x => x.sentence_n === sent.n);
		const flags = (source.flags ?? []).filter(x => x.sentence_n === sent.n);
		li.c("refine-modes-clean-sentence" + (flags.length ? " refine-modes-flagged" : ""), () => {
			strikes.forEach(st => strike.c("refine-modes-strike").text(st.struck_text));
			span.c("refine-modes-sentence-text").text(sent.text);
			misheard.forEach(m => small.c("refine-modes-misheard muted").text(`misheard: "${m.from}" → "${m.to}"`));
			flags.forEach(f => small.c("refine-modes-flag").text(`⚑ ${f.question}`));
		}).attr("data-n", String(sent.n));
	}));
}

/* RAW — byte-for-byte, no cleanup at all. */
function raw_view(source) {
	div.c("refine-modes-raw").text(source.raw || source.fallback_text || "nothing said yet");
}

function first_sentence(text) {
	const m = (text || "").match(/^[\s\S]*?[.?!](?=\s|$)/);
	return (m ? m[0] : text || "").trim();
}

export default prompt_modes;

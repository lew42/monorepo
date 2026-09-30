import { View, div, h4, span, textarea, select, option, button } from "../../core/View/View.js";
import { servex_url } from "/framework/dev/servex_url.js";

View.stylesheet(import.meta, "Revise.css");

/** Where Servex answers `/api/tidy` — same helper every other caller on this site
 *  already uses (`dev/servex_url.js`), so this works on the phone too, not just localhost. */
const TIDY_URL = servex_url("/api/tidy");

/* These three prompts are a DISPLAY COPY of `Servex/agents/tidy.js`'s own `LEVELS` —
 * kept here so this page can show what each level actually asks for, and so a caller
 * building its OWN level (see `run()` below) has real examples to start from. The
 * REAL prompt that runs lives only in tidy.js: `run()` sends the level's NAME for
 * these three, never this text, so the two files can never disagree about what a
 * dictation actually got. There is no build step to share one copy of this text
 * between a Node module (Servex) and a browser module (this file) — keep both in
 * sync by hand if a level's wording changes. */
const CLEAN_PROMPT = `You clean up one chunk of dictated (speech-to-text) text. Stay as close to verbatim as possible.

Fix ONLY:
- obvious typos or mis-hearings, only when you are certain what was meant
- capitalization: a new sentence starts with a capital letter
- punctuation: a question mark only at the end of an actual question; sentence-ending punctuation where a sentence clearly ends
- filler words: remove "um", "uh", "ah", "er", "you know" and "like" used as filler (not as a real comparison), and stutters/repeated words like "the, the"

Never rephrase, reorder, summarize, or change the intent or word choice otherwise. Return ONLY the cleaned text — no quotes, no commentary, nothing else.`;

const EDIT_PROMPT = `You lightly edit dictated or rambling text into tighter sentences, in the SAME voice and the same level of informality — this is a light pass, not a rewrite.

Do:
- tighten run-on sentences and cut true filler ("um", "you know", stray repeats)
- fix grammar, punctuation and capitalization
- keep the person's own words and phrasing wherever they already work

Never change the meaning, drop a point they made, or make it sound more formal than they spoke it. Return ONLY the edited text — no quotes, no commentary, nothing else.`;

const SUMMARY_PROMPT = `You take long, rambling dictated text (a prompt, or rambling notes for a piece of writing) and turn it into a short, organized result — this is a HEAVY pass: summarize and reorganize, don't just tidy.

Do:
- pull out the actual points being made, drop the repetition and the thinking-out-loud
- organize into short paragraphs, or a bulleted/numbered list when the content is naturally a list of points
- keep it in the person's own voice and intent — this is their curated writing, not a report about it

Return ONLY the summarized, organized text — no quotes, no commentary, nothing else.`;

/** Three levels to start — near-raw, light, heavy — each a plain
 *  `{label, hint, prompt, model}` a caller can swap out or add to
 *  (`Revise.LEVELS.loud = { label: "Loud", hint: "...", prompt: "...", model: "..." }`). */
export const LEVELS = {
	clean:   { label: "Clean",   hint: "near-raw — fillers, typos, punctuation only",             prompt: CLEAN_PROMPT,   model: "claude-sonnet-5" },
	edit:    { label: "Edit",    hint: "light — tightened sentences, same voice and informality",  prompt: EDIT_PROMPT,    model: "claude-sonnet-5" },
	summary: { label: "Summary", hint: "heavy — summarized and organized into sections or points", prompt: SUMMARY_PROMPT, model: "claude-sonnet-5" },
};

/**
 * **Text in, revised text out, at a LEVEL.** The AI step of dictation: an LLM plus a
 * prompt that cleans or curates rambling speech-to-text, for a PROMPT (ask the
 * assistant something coherent) or for WRITING (turn rambling into a blog post) —
 * same three levels either way.
 *
 *     import Revise from "/framework/ux/Revise/Revise.js";
 *     const out = await Revise.run("so um i was thinking...", "edit");
 *     // -> {ok: true, text: "...", model: "...", ms: 240} or {ok: false, why: "..."}
 *
 * `level` is a key of `Revise.LEVELS` (sends just the level's NAME — Servex's own
 * `Servex/agents/tidy.js` owns the real prompt text, so the two files can never
 * disagree about what ran) or a whole `{prompt, model}` object of your own (sent as
 * an explicit `system` instead) — either way a caller can use a built-in level or
 * add a new one with no change to this file or to Servex.
 *
 * Never throws — a network failure, Servex being down, or a bad reply all come back
 * as `{ok: false, why}` in plain words, because a caller (the dictate path, this
 * page's own demo) must be able to say plainly that revision isn't answering
 * rather than crash or hang.
 */
export default class Revise {

	/** `text` in, `{ok:true, text, model, ms}` or `{ok:false, why}` out — never throws.
	 *  `before` (optional) is already-revised text just before this chunk, for a
	 *  caller stitching several chunks together (the dictate path, the playground) —
	 *  context only, never rewritten, same as `/api/tidy` always meant it. */
	static async run(text, level = "clean", { before, url = TIDY_URL, timeout_ms = 20000 } = {}){
		if (typeof text !== "string" || !text.trim()) return { ok: true, text: "" };

		const named = typeof level === "string" ? LEVELS[level] : null;
		const body = named
			? { text, before, level, model: named.model }
			: { text, before, system: level?.prompt ?? LEVELS.clean.prompt, model: level?.model ?? LEVELS.clean.model };

		try {
			const ctrl = new AbortController();
			const timer = setTimeout(() => ctrl.abort(), timeout_ms);
			const r = await fetch(url, {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body), signal: ctrl.signal,
			});
			clearTimeout(timer);
			if (!r.ok) return { ok: false, why: "Servex answered " + r.status };
			const out = await r.json();
			return out?.ok ? out : { ok: false, why: out?.why ?? "Servex refused" };
		} catch (e){
			return { ok: false, why: "Servex isn't answering (" + (e?.message ?? e) + ")" };
		}
	}
}

Revise.LEVELS = LEVELS;

/* A sample rambling paragraph for each of the two uses this page claims — a spoken
 * PROMPT, and rambling notes meant to become WRITING — so the page's own claim
 * ("usable for prompts AND for writing") is something you can press a button and
 * see, not just read. */
const SAMPLES = {
	prompt: "so um i want you to build a page that shows uh the the recent orders and maybe uh a little chart too if that's not too much trouble, and uh make sure it it works on mobile",
	writing: "ok so today I want to write about why I switched from react to just plain html and css, basically because the build step kept breaking and um every time I onboarded someone new they had to install like twelve tools before they could even see a page and that just felt wrong to me you know so I started this thing called lew42 and uh it has no build step at all",
};

/** **A SAVED result, not a fresh model call** — this page's own first screen (the
 *  owner, 2026-09-29: "show don't tell" — a reader should see what Revise does
 *  before pressing anything). A real answer from `clean`, captured once and kept
 *  here as plain text; it can drift slightly from what the model says today, which
 *  is fine — its job is showing the SHAPE of the change, not standing in for a live
 *  call. Pressing Revise always runs the real thing and replaces this. */
const SAVED_EXAMPLE = "I want you to build a page that shows the recent orders and maybe a little chart too, if that's not too much trouble, and make sure it works on mobile.";

/** **The default view** (the item-ui pattern: `Revise.View` is what `page.js` and any
 *  future caller draw). Paste or pick a sample, pick a level, see the source and the
 *  revised result side by side. */
Revise.View = class ReviseView extends View {

	render(){
		// `wide` opts this widget out of the page's default 40em reading measure — the
		// two side-by-side panels below need more room than that to be worth splitting
		// (`ux/Dictate/playground/Playground.js` does the same, for the same reason).
		this.ac("ux-revise wide flex v gap");
		this.level = "clean";

		div.c("flex gap wrap v-center", () => {
			span.c("muted", "Sample:");
			button.c("ux-revise-sample").attr("type", "button").text("a rambling prompt")
				.on("click", () => this.load(SAMPLES.prompt));
			button.c("ux-revise-sample").attr("type", "button").text("rambling notes for a blog post")
				.on("click", () => this.load(SAMPLES.writing));
		}).style("--gap", "0.6em");

		this.$source = textarea.c("ux-revise-source").attr("rows", 5)
			.attr("placeholder", "Paste rambling text, or pick a sample above.");

		div.c("flex gap wrap v-center", () => {
			span.c("muted", "Level:");
			this.$level = select.c("ux-revise-level", () => {
				Object.entries(LEVELS).forEach(([key, lv]) => option(lv.label).attr("value", key));
			}).attr("aria-label", "Revision level");
			this.$level.on("change", e => { this.level = e.target.value; this.load_level(); });
			this.$hint = span.c("ux-revise-hint muted");
			this.$run = button.c("ux-revise-run prim").attr("type", "button").text("Revise →")
				.on("click", () => this.run());
		}).style("--gap", "0.6em");

		// **The prompt itself, visible and editable** (the owner, 2026-09-29 — revision
		// is "what we really need to work on", partly the prompt itself). Starts as the
		// real prompt for the picked level; press Revise to try YOUR edit on the sample
		// above — nothing here is ever saved. `Reset` throws the edit away and goes back
		// to that level's real prompt (`load_level()` does the same on every level change).
		div.c("flex v gap", () => {
			div.c("flex gap v-center split", () => {
				span.c("muted", "Prompt for this level — edit it and press Revise to try your own wording (never saved):");
				button.c("ux-revise-reset").attr("type", "button").text("Reset to default")
					.on("click", () => this.load_level());
			});
			this.$prompt = textarea.c("ux-revise-prompt").attr("rows", 6);
		}).style("--gap", "0.3em");

		this.load_level();

		this.$status = div.c("ux-revise-status muted");

		div.c("ux-revise-panels grid gap", () => {
			div.c("card", () => { h4.c("muted", "Source (raw)"); this.$raw_out = div.c("ux-revise-out muted"); });
			div.c("card", () => { h4.c("muted", "Revised"); this.$revised_out = div.c("ux-revise-out muted"); });
		}).style("--column", "20em");

		// SHOW, DON'T TELL: the box and both panels open already filled with a real
		// example — a saved one, no model call on load — so what this page does is
		// visible on arrival, not just described. Pressing Revise replaces all three
		// with a live run, on whatever's actually in the box by then.
		this.load(SAMPLES.prompt);
		this.$raw_out.text(SAMPLES.prompt);
		this.$revised_out.text(SAVED_EXAMPLE);
		this.$status.text("a saved example — press Revise for a live one");
	}

	load(text){ this.$source.el.value = text; }

	// Resets BOTH the hint text and the editable prompt box to the picked level's
	// real, unedited prompt — called on every level change, and by its own "Reset
	// to default" button.
	load_level(){
		const lv = LEVELS[this.level];
		this.$hint.text(lv.hint);
		this.$prompt.el.value = lv.prompt;
	}

	async run(){
		const text = this.$source.el.value;
		if (!text.trim()){ this.$status.rc("error").text("Paste or pick some rambling text first."); return; }

		this.$run.el.disabled = true;
		this.$status.rc("error").text("Revising…");

		// Always the box's CURRENT text — whether that's the level's own unedited
		// prompt (same result as naming the level) or your own edit, tried live.
		const level = { prompt: this.$prompt.el.value, model: LEVELS[this.level].model };
		const out = await Revise.run(text, level);

		this.$run.el.disabled = false;
		if (!out.ok){ this.$status.ac("error").text("Servex isn't answering — " + out.why); return; }

		this.$status.rc("error").text(`revised · ${out.model} · ${(out.ms / 1000).toFixed(1)}s`);
		this.$raw_out.rc("muted").text(text);
		this.$revised_out.rc("muted").text(out.text);
	}
};

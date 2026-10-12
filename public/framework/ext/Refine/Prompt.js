import Scorer from "./Scorer.js";
import Outline from "./Outline.js";
import { View, div, span, p, h4, button, a } from "../../core/View/View.js";

View.stylesheet(import.meta, "Prompt.css");

/**
 * class Prompt — ONE prompt, seen at every step of its refinement (the owner's design:
 * `doc/vision-2026-10-08.md`, addendum 2). It only holds data; it does not clean,
 * structure or score anything itself — `RefineSystem` sends the text to Servex
 * (`/api/refine`), which runs the SAME `engine.js` `clean()` and `structure.js`
 * `structure()` Echo runs, so there is still exactly one pipeline.
 *
 *   const prompt = new Prompt({ on_change: () => redraw() });
 *   prompt.load(await (await fetch("/api/refine", …)).json());   // RefineSystem does this for you
 *   prompt.clean[0]      // { n, text, clarity, weight, flags, alternates, names, card }
 *   prompt.refined       // [{ title, cites, cards: [{ text, cites, cards: [...] }] }]
 *   prompt.view          // a Prompt.View: the rendered result (the debug tree is DefaultView)
 *
 * Only plain data lives on an instance (strings, numbers, arrays, objects) so the debug
 * tree (`ux/Content/Object/DefaultView.js`) can show every property by type.
 *
 * Scores come from `Scorer` (rules; see `doc/prompt.md`). The whole system: `doc/architecture.md`.
 */
export default class Prompt {

	static icon = "article";
	static LOW_CLARITY = 0.6;   // below this a sentence gets the yellow flag

	status = "empty";   // empty | working | done | error
	raw = "";
	subject = "";       // the "# heading" of the refined outline: what the prompt is about
	clean = [];
	refined = [];
	ms = 0;
	error = "";
	stages = {};        // { clean_ms, structure_ms, clarity_ms } from the server
	runs = [];          // one per model call: { stage, model, session_id, cost_usd, duration_ms, tokens }
	timings = {};       // { quick_ms } measured in the browser
	model = "";         // the model the server is using for the current run
	prompt_id = "";      // the id this prompt has in its session's log (PromptLog), when it was saved there
	session = "";         // the session whose prompts.jsonl holds it
	quick = false;      // true while `clean` holds the instant (no-model) clean, before the real one lands

	constructor(...args){ Object.assign(this, ...args); }

	/** Fill the instance from one `/api/refine` answer (also how a saved answer is replayed). */
	load({ clean, structure, ms, clarity, stages, runs, notes, prompt: prompt_id, session }){
		const parsed = Prompt.parse_outline(structure?.md ?? "");
		this.subject = parsed.subject;
		this.refined = parsed.sections;
		this.ms = ms ?? 0;
		this.clean = (clean?.sentences ?? []).map(s => ({
			n: s.n, text: s.text, clarity: 1, weight: 0, flags: [], alternates: [], names: [], tags: [], card: "", why: "",
		}));
		Scorer.score(this, { clean, structure });
		// The cheap model's per-sentence score replaces the rule score when it answered; the rule
		// score stays as `rule_clarity` so both can be compared (doc/refine-v3-2026-10-09.md).
		for (const c of clarity ?? []){
			const s = this.sentence(c.n);
			if (s && c.clarity != null){ s.rule_clarity = s.clarity; s.clarity = +c.clarity.toFixed(2); s.why = c.why; }
		}
		// The Haiku pass (Servex/ext/refine/Annotator.js): alternates, names and tags per sentence, by 0-based index.
		for (const n of notes ?? []){
			const s = this.clean[n.i];
			if (s){ s.alternates = n.alternates ?? []; s.names = n.names ?? []; s.tags = n.tags ?? []; }
		}
		this.set({ status: "done", quick: false, stages: stages ?? {}, runs: runs ?? [], prompt_id: prompt_id ?? "", session: session ?? "" });
	}

	set(fields){
		Object.assign(this, fields);
		this.on_change?.(this);
		return this;
	}

	sentence(n){ return this.clean.find(s => s.n === n); }

	/** The instant clean (no model): shown within a moment of each Whisper chunk, before any refinement. */
	load_quick(sentences, quick_ms){
		this.clean = sentences.map(t => ({ n: t.n, text: t.text, clarity: null, weight: 0, flags: [], alternates: [], names: [], tags: [], card: "", why: "" }));
		this.timings = { ...this.timings, quick_ms };
		this.set({ quick: true });
	}

	/**
	 * Replay one prompt from its session log (`PromptLog.fold` row): the saved raw, the final clean sentences,
	 * the cards (their 0-based cites become S numbers again) and the Haiku notes. No model call.
	 */
	static from_log(row, session = ""){
		const up = cards => (cards ?? []).map(c => ({ ...c, cites: (c.cites ?? []).map(i => i + 1), cards: up(c.cards) }));
		const prompt = new Prompt({ raw: row.raw ?? "", subject: row.subject ?? "", prompt_id: row.id, session });
		prompt.clean = row.clean.map((text, i) => ({ n: i + 1, text, clarity: null, weight: 0, flags: [], alternates: [], names: [], tags: [], card: "", why: "" }));
		for (const n of row.notes ?? []){
			const s = prompt.clean[n.i];
			if (s) Object.assign(s, { clarity: n.clarity ?? null, why: n.why ?? "", alternates: n.alternates ?? [], names: n.names ?? [], tags: n.tags ?? [] });
		}
		prompt.refined = up(row.refined);
		prompt.status = row.final ? "done" : "working";
		return prompt;
	}

	/** Sentences worth a yellow flag: unclear enough, or the pipeline asked a question about them. */
	get flagged(){ return this.clean.filter(s => (s.clarity ?? 1) < Prompt.LOW_CLARITY || s.flags.some(f => f.kind === "model" || f.kind === "mechanical")); }

	/** The outline `structure()` writes, as nested cards (`Outline.parse`). */
	static parse_outline(md){ return Outline.parse(md); }

	/** The rendered result. */
	get view(){ return new this.constructor.View({ subject: this }); }

}

/** Prompt.View — raw, clean (with scores and yellow flags), refined cards. A sentence and a
 *  card's source chip are linked: click either and the other side lights up. */
Prompt.View = class extends View {

	/** Each stage names itself: a number, a plain title, what it is in one line, and the class that makes it. */
	static STAGES = {
		said:    { title: "1 · Said",    what: "Exactly what Whisper heard. Type here too.", by: "Dictate", href: "/framework/ux/Dictate/" },
		clean:   { title: "2 · Cleaned", what: "Your words, fixed: fillers out, sentences numbered. Nothing reworded.", by: "Cleaner", href: "/framework/ext/Refine/md/doc/refine-engine/" },
		refined: { title: "3 · Outline", what: "The same ideas as a short outline. Click an S1 chip to jump to its sentence.", by: "Structurer", href: "/framework/ext/Refine/structure.js" },
		scores:  { title: "4 · Scores",  what: "How clear each sentence is (1 = clear). ⚑ marks a sentence worth a second look.", by: "ClarityScorer", href: "/framework/ext/Refine/md/doc/prompt/" },
	};

	render(){
		const prompt = this.subject;
		this.ac("refine-prompt");

		const empty = !prompt.clean.length;
		const working = prompt.status === "working";
		const done = prompt.status === "done";
		const sentence_els = new Map();
		const light = n => {
			sentence_els.forEach(($s, k) => $s.el.classList.toggle("lit", k === n));
			sentence_els.get(n)?.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		};
		const secs = ms => (ms / 1000).toFixed(1) + " s";
		const section = (key, note, fn) => {
			const st = Prompt.View.STAGES[key];
			return div.c("refine-section", () => {
				h4.c("refine-prompt-h", () => { span(st.title); if (note) span.c("refine-s-scores", note); });
				p.c("refine-what", () => { span(st.what + " "); a(st.by).href(st.href).ac("refine-class-key"); });
				fn();
			});
		};

		if (working) p.c("refine-working", `Refining with ${prompt.model || "a model"}… usually about 8 s and about 3 cents. The cleaned text is already usable.`);
		if (prompt.status === "error") p.c("refine-error", "Could not refine: " + prompt.error);
		if (this.show_raw !== false) section("said", "", () => p.c("refine-prompt-raw", prompt.raw));

		section("clean", empty ? "" : prompt.quick || working ? `instant, ${prompt.timings.quick_ms ?? 0} ms, no model` : `by ${prompt.model || "a model"}, ${secs(prompt.stages.clean_ms ?? 0)}`, () => {
			if (empty) return p.c("refine-empty", "Waiting for words.");
			prompt.clean.forEach(s => {
				const $s = div.c("refine-sentence", () => {
					span.c("refine-s-num", "S" + s.n);
					span.c("refine-s-text", s.text);
					if (prompt.flagged.includes(s)){
						const q = s.flags.map(f => f.question).join(" ") || s.why || "This one may be unclear.";
						span.c("refine-flag", "⚑").attr("title", q);
					}
				});
				$s.click(() => light(s.n));
				sentence_els.set(s.n, $s);
			});
		});

		// LIVE, NOT JUST DONE (one-input, 2026-10-12): `RefineSystem.live()` writes `refined`
		// straight onto this same `Prompt` as the mic talks, before a real Refine ever runs —
		// the outline underneath updates live, CLAUDE.md law 2's "the outline refines live
		// underneath". `have` is true the instant there is anything to show, `done` only once
		// a full Refine has actually finished (its own timing label still waits for that).
		const have = done || prompt.refined.length > 0;
		section("refined", done ? secs(prompt.stages.structure_ms ?? 0) : have ? "live" : "", () => {
			if (!have) return p.c("refine-empty", working ? "Working… the model is writing the outline." : "Press Refine.");
			if (prompt.subject) p.c("refine-subject", prompt.subject);
			const cites = list => list.forEach(n => button.c("refine-cite", "S" + n).click(() => light(n)));
			const draw = cards => cards.forEach(c => div.c("refine-card", () => {
				span.c("refine-card-text", c.text);
				cites(c.cites);
				if (c.cards.length) div.c("refine-subcards", () => draw(c.cards));
			}));
			prompt.refined.forEach(sec => div.c("refine-card refine-card-top", () => {
				span.c("refine-card-text refine-card-title", sec.title);
				cites(sec.cites);
				div.c("refine-subcards", () => draw(sec.cards));
			}));
		});

		section("scores", done ? `${prompt.flagged.length} of ${prompt.clean.length} flagged` : "", () => {
			if (!done) return p.c("refine-empty", working ? "Scoring each sentence…" : "Press Refine.");
			prompt.clean.forEach(s => div.c("refine-score", () => {
				span.c("refine-s-num", "S" + s.n);
				span.c("refine-bar").attr("style", `--v:${s.clarity ?? 0}`);
				span.c("refine-s-text", `${s.clarity ?? "–"}`);
				if (s.why) span.c("refine-s-scores", s.why);
				if (s.names.length) span.c("refine-s-scores", "name: " + s.names.join(", "));
				s.tags.forEach(t => span.c("refine-class-key", t));
				if (s.alternates.length) div.c("refine-s-scores", "or: " + s.alternates.join(" / "));
			}));
			if (prompt.session) p.c("refine-what", () => {
				span("Kept in the session log as raw, clean, outline and notes: ");
				a("open the session").href("/framework/ai/sessions/" + prompt.session + "/").ac("refine-class-key");
			});
			h4.c("refine-prompt-h", () => span("Model runs"));
			p.c("refine-what", "Each run is its own session: click one to see exactly what was asked.");
			prompt.runs.forEach(r => div.c("refine-run", () => {
				r.session_id ? a(r.stage).href(`/framework/ai/sessions/${r.session_id}/`) : span(r.stage);
				span.c("refine-s-scores", `${r.model} · ${secs(r.duration_ms)} · $${r.cost_usd}`);
			}));
		});
	}
};

import Scorer from "./Scorer.js";
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
	quick = false;      // true while `clean` holds the instant (no-model) clean, before the real one lands

	constructor(...args){ Object.assign(this, ...args); }

	/** Fill the instance from one `/api/refine` answer (also how a saved answer is replayed). */
	load({ clean, structure, ms, clarity, stages, runs }){
		const parsed = Prompt.parse_outline(structure?.md ?? "");
		this.subject = parsed.subject;
		this.refined = parsed.sections;
		this.ms = ms ?? 0;
		this.clean = (clean?.sentences ?? []).map(s => ({
			n: s.n, text: s.text, clarity: 1, weight: 0, flags: [], alternates: [], names: [], card: "", why: "",
		}));
		Scorer.score(this, { clean, structure });
		// The cheap model's per-sentence score replaces the rule score when it answered; the rule
		// score stays as `rule_clarity` so both can be compared (doc/refine-v3-2026-10-09.md).
		for (const c of clarity ?? []){
			const s = this.sentence(c.n);
			if (s && c.clarity != null){ s.rule_clarity = s.clarity; s.clarity = +c.clarity.toFixed(2); s.why = c.why; }
		}
		this.set({ status: "done", quick: false, stages: stages ?? {}, runs: runs ?? [] });
	}

	set(fields){
		Object.assign(this, fields);
		this.on_change?.(this);
		return this;
	}

	sentence(n){ return this.clean.find(s => s.n === n); }

	/** The instant clean (no model): shown within a moment of each Whisper chunk, before any refinement. */
	load_quick(sentences, quick_ms){
		this.clean = sentences.map(t => ({ n: t.n, text: t.text, clarity: null, weight: 0, flags: [], alternates: [], names: [], card: "", why: "" }));
		this.timings = { ...this.timings, quick_ms };
		this.set({ quick: true });
	}

	/** Sentences worth a yellow flag: unclear enough, or the pipeline asked a question about them. */
	get flagged(){ return this.clean.filter(s => (s.clarity ?? 1) < Prompt.LOW_CLARITY || s.flags.some(f => f.kind === "model" || f.kind === "mechanical")); }

	/**
	 * The outline `structure()` writes ("# subject", "## card", "- sub-card [S1, S2]", indented
	 * deeper bullets) as nested cards. (`Refine.js`'s `parse_structured` flattens the nesting
	 * and drops the "#" line, which this view needs, so this is the nested sibling of it.)
	 */
	static parse_outline(md){
		let subject = "";
		const sections = [];
		let sec = null;
		const stack = [];   // [{indent, card}]
		const cites = text => {
			const found = new Set();
			for (const m of text.matchAll(/S(\d+)\s*[-–]\s*S(\d+)/g))
				for (let n = Math.min(+m[1], +m[2]); n <= Math.max(+m[1], +m[2]); n++) found.add(n);
			for (const m of text.replace(/S\d+\s*[-–]\s*S\d+/g, " ").matchAll(/S(\d+)/g)) found.add(+m[1]);
			return [...found].sort((a, b) => a - b);
		};
		const strip = text => text.replace(/\[[^\]]*S\d[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
		for (const line of String(md).split(/\r?\n/)){
			const h = /^(#{1,3})\s+(.+)$/.exec(line);
			if (h){
				if (h[1] === "#" && !subject){ subject = strip(h[2]); continue; }
				sec = { title: strip(h[2]), cites: cites(h[2]), cards: [] };
				sections.push(sec); stack.length = 0;
				continue;
			}
			const b = /^(\s*)[-*]\s+(.+)$/.exec(line);
			if (!b) continue;
			if (!sec){ sec = { title: subject || "Overview", cites: [], cards: [] }; sections.push(sec); }
			const indent = b[1].replace(/\t/g, "  ").length;
			const card = { text: strip(b[2]), cites: cites(b[2]), cards: [] };
			while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
			(stack.length ? stack[stack.length - 1].card.cards : sec.cards).push(card);
			stack.push({ indent, card });
		}
		return { subject, sections };
	}

	/** The rendered result. */
	get view(){ return new this.constructor.View({ subject: this }); }

}

/** Prompt.View — raw, clean (with scores and yellow flags), refined cards. A sentence and a
 *  card's source chip are linked: click either and the other side lights up. */
Prompt.View = class extends View {

	render(){
		const prompt = this.subject;
		this.ac("refine-prompt");

		if (prompt.status === "empty") return p.c("refine-empty", "Say or type a prompt, then press Refine.");
		if (prompt.status === "error") return p.c("refine-error", "Could not refine: " + prompt.error);
		if (!prompt.raw && !prompt.clean.length) return p.c("refine-empty", "Say or type a prompt, then press Refine.");

		const working = prompt.status === "working";
		const sentence_els = new Map();
		const light = n => {
			sentence_els.forEach(($s, k) => $s.el.classList.toggle("lit", k === n));
			sentence_els.get(n)?.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		};
		const secs = ms => (ms / 1000).toFixed(1) + " s";
		const section = (title, note, fn) => div.c("refine-section", () => {
			h4.c("refine-prompt-h", () => { span(title); if (note) span.c("refine-s-scores", note); });
			fn();
		});

		if (working) p.c("refine-working", `Refining with ${prompt.model || "a model"}… usually about 8 s and about 3 cents. The cleaned text below is already the instant clean.`);

		section("Whisper raw", "as heard", () => p.c("refine-prompt-raw", prompt.raw));

		section("Clean", prompt.quick || working ? `instant clean, ${prompt.timings.quick_ms ?? 0} ms (no model)` : `by model, ${secs(prompt.stages.clean_ms ?? 0)}`, () => {
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

		if (prompt.status === "done") section("Refined — " + (prompt.subject || "cards"), `${secs(prompt.stages.structure_ms ?? 0)}`, () => {
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

		if (prompt.status === "done") section("Scores", `clarity by ${prompt.runs.some(r => r.stage.startsWith("clarity")) ? "a cheap model, one sentence at a time" : "rules"}, ${secs(prompt.stages.clarity_ms ?? 0)}`, () => {
			prompt.clean.forEach(s => div.c("refine-score", () => {
				span.c("refine-s-num", "S" + s.n);
				span.c("refine-bar").attr("style", `--v:${s.clarity ?? 0}`);
				span.c("refine-s-text", `clarity ${s.clarity ?? "–"} · weight ${s.weight}`);
				if (s.why) span.c("refine-s-scores", s.why);
			}));
			p.c("refine-s-scores", `${prompt.clean.length} sentences · ${prompt.flagged.length} flagged`);
		});

		if (prompt.status === "done") section("Model runs", `${secs(prompt.ms)} on the server · ${secs(prompt.timings.total_ms ?? 0)} total · $${prompt.runs.reduce((a, r) => a + r.cost_usd, 0).toFixed(3)}`, () => {
			prompt.runs.forEach(r => div.c("refine-run", () => {
				a(r.stage).href(`/framework/ai/sessions/${r.session_id}/`).attr("title", "this run's own session page");
				span.c("refine-s-scores", `${r.model} · ${secs(r.duration_ms)} · ${r.tokens.in}→${r.tokens.out} tokens · $${r.cost_usd}`);
			}));
		});
	}
};

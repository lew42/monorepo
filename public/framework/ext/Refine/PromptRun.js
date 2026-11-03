import Scorer from "./Scorer.js";
import Outline from "./Outline.js";
import Prompt from "../../core/Task/Prompt.js";   // the one Prompt class (a Task); this file is the refine run's view-model, renamed so there are not two


/**
 * class PromptRun — ONE prompt, seen at every step of its refinement (the owner's design:
 * `doc/vision-2026-10-08.md`, addendum 2). It only holds data; it does not clean,
 * structure or score anything itself — `RefineSystem` sends the text to Servex
 * (`/api/refine`), which runs the SAME `engine.js` `clean()` and `structure.js`
 * `structure()` Echo runs, so there is still exactly one pipeline.
 *
 *   const prompt = new PromptRun({ on_change: () => redraw() });
 *   prompt.load(await (await fetch("/api/refine", …)).json());   // RefineSystem does this for you
 *   prompt.clean[0]      // { n, text, clarity, weight, flags, alternates, names, card }
 *   prompt.refined       // [{ title, cites, cards: [{ text, cites, cards: [...] }] }]
 *   prompt.view          // a PromptRun.View: the rendered result (the debug tree is DefaultView)
 *
 * Only plain data lives on an instance (strings, numbers, arrays, objects) so the debug
 * tree (`ux/Content/Object/DefaultView.js`) can show every property by type.
 *
 * Scores come from `Scorer` (rules; see `doc/prompt.md`). The whole system: `doc/architecture.md`.
 */
export default class PromptRun {

	static icon = "article";
	static LOW_CLARITY = 0.4;   // below this (under the 0.5 default, "not sure") a sentence gets the yellow flag

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
	parts = [];         // THE RECORD (doc/prompt-records.md): [{ id, cites: [n…], kind, text, outcome: { is, ref, why }, parts: [details] }]
	process = "";       // the process that wrote `parts` (live | review), from the parts line
	at = "";            // when the prompt was first logged (its raw line)
	handled = null;     // { by, at, to, note }: whoever routed this prompt's proposals marked it handled

	constructor(...args){ Object.assign(this, ...args); }

	/* COMPLETION (the owner, 2026-10-22: "a prompt is complete when everything it asks is done or documented"). Computed, never stored.
	 * A part is settled when its outcome is one of SETTLED, or it is carried by a task that is complete. A sentence no part cites
	 * is one more unsettled unit: nothing said is allowed to vanish. `task_state(ref)` answers a task's state ("complete", …);
	 * node passes the session's tasks, the browser its replayed Session. */
	static KINDS = Prompt.KINDS;
	static OUTCOMES = Prompt.OUTCOMES;
	static SETTLED = Prompt.SETTLED;
	static settled = Prompt.settled;
	/** Sentence numbers no part (or nested detail) cites. */
	get uncovered(){
		const cited = new Set(), walk = ps => (ps ?? []).forEach(p => { (p.cites ?? []).forEach(n => cited.add(n)); walk(p.parts); });
		walk(this.parts);
		return this.clean.map(s => s.n).filter(n => !cited.has(n));
	}
	/** { done, total }: top-level parts settled, out of parts + uncovered sentences. */
	progress(task_state){
		const done = this.parts.filter(p => Prompt.settled(p, task_state)).length;
		return { done, total: this.parts.length + this.uncovered.length };
	}
	completion(task_state){ const { done, total } = this.progress(task_state); return total ? done / total : 0; }
	complete(task_state){ return this.parts.length > 0 && this.completion(task_state) === 1; }
	/** The parts still open (not settled), for a list of loose ends. */
	open(task_state){ return this.parts.filter(p => !Prompt.settled(p, task_state)); }

	/** The number printed with its meaning (`doc/confidence.md`); a score without `scale: 2` is from the old scorer. */
	static label(s){
		const c = s.clarity;
		if (c == null) return "–";
		if (s.scale !== 2) return `${c} (old scale)`;
		if (c > 0.7) return `${c}: evidence: ${s.evidence || s.why || "none given"}`;
		return `confidence ${c}: ` + (c < 0.3 ? "probably wrong" : c < 0.45 ? "doubtful" : c <= 0.55 ? "not sure" : "leaning yes");
	}

	/** Fill the instance from one `/api/refine` answer (also how a saved answer is replayed). */
	load({ clean, structure, ms, clarity, stages, runs, notes, prompt: prompt_id, session }){
		const parsed = PromptRun.parse_outline(structure?.md ?? "");
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
			if (s && c.clarity != null){ s.rule_clarity = s.clarity; s.clarity = +c.clarity.toFixed(2); s.why = c.why; s.scale = c.scale ?? null; s.evidence = c.clarity > 0.7 ? c.why : ""; }
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
		const prompt = new PromptRun({ raw: row.raw ?? "", subject: row.subject ?? "", prompt_id: row.id, session, at: row.at ?? "" });
		prompt.clean = row.clean.map((text, i) => ({ n: i + 1, text, clarity: null, weight: 0, flags: [], alternates: [], names: [], tags: [], card: "", why: "" }));
		for (const n of row.notes ?? []){
			const s = prompt.clean[n.i];
			if (s) Object.assign(s, { clarity: n.clarity ?? null, why: n.why ?? "", alternates: n.alternates ?? [], names: n.names ?? [], tags: n.tags ?? [] });
		}
		prompt.refined = up(row.refined);
		const num = ps => (ps ?? []).map(p => ({ ...p, cites: (p.cites ?? []).map(i => i + 1), ...(p.parts ? { parts: num(p.parts) } : {}) }));
		prompt.parts = num(row.parts); prompt.process = row.process ?? ""; prompt.handled = row.handled ?? null;
		prompt.status = row.final ? "done" : "working";
		return prompt;
	}

	/** Sentences worth a yellow flag: unclear enough, or the pipeline asked a question about them. */
	get flagged(){ return this.clean.filter(s => (s.clarity ?? 1) < PromptRun.LOW_CLARITY || s.flags.some(f => f.kind === "model" || f.kind === "mechanical")); }

	/** The outline `structure()` writes, as nested cards (`Outline.parse`). */
	static parse_outline(md){ return Outline.parse(md); }

	/** The rendered result. */
	get view(){ return new this.constructor.View({ subject: this }); }

}

import ErrorLog from "../ErrorLog/ErrorLog.js";
import Prompt from "./Prompt.js";
import Whisper from "../../audio/Whisper/Whisper.js";
import { quick_clean } from "./engine.js";

/**
 * class RefineSystem — the boss of the refine system (`doc/architecture.md`). It owns ONE live
 * `Prompt` and runs it through the steps: text in (typed, or from the dictation source) →
 * Servex `/api/refine` (the Cleaner, then the Structurer) → `Prompt.load()` (which runs the
 * `Scorer`). A page only ever talks to this class:
 *
 *   const system = new RefineSystem({ on_change: prompt => redraw(prompt) });
 *   await system.go("so the page should uh show a flag when unclear");
 *   system.prompt          // the live Prompt (status, raw, clean, refined)
 *   system.quick(text);    // the instant clean (no model, ~1 ms): call it on every Whisper chunk
 *   system.next();         // start over with a fresh prompt
 *   system.whisper / system.session   // the Whisper server and this surface's WhisperSession (audio/Whisper)
 *
 * Only plain data besides `on_change`, so the debug tree can show it (`ux/Content/Object/DefaultView`).
 */
export default class RefineSystem {

	static icon = "hub";

	/** The architecture table the demo's class card draws (same rows as `doc/architecture.md`). */
	static parts = [
		{ name: "RefineSystem", job: "boss: runs one prompt through the steps, owns the live Prompt", relation: "composes all below", href: "/framework/ext/Refine/md/doc/architecture/" },
		{ name: "Prompt", job: "in-memory prompt: raw, clean sentences, refined cards, scores, flags", relation: "data; has Prompt.View", href: "/framework/ext/Refine/md/doc/prompt/" },
		{ name: "Prompt.View", job: "draws a Prompt: raw, clean with ⚑ flags, cards with S# links", relation: "extends View", href: "/framework/ext/Refine/Prompt.js" },
		{ name: "Scorer", job: "rules that give each sentence clarity, weight and flags", relation: "used by Prompt.load()", href: "/framework/ext/Refine/Scorer.js" },
		{ name: "Cleaner", job: "raw → numbered near-verbatim sentences (engine.js clean())", relation: "step; runs in Servex", href: "/framework/ext/Refine/md/doc/refine-engine/" },
		{ name: "Structurer", job: "sentences → outline of cards citing them (structure.js)", relation: "step; runs in Servex", href: "/framework/ext/Refine/structure.js" },
		{ name: "DictationSource", job: "where words come from: mic (ux/Dictate) or the text box", relation: "wraps Dictate", href: "/framework/ux/Dictate/" },
		{ name: "Echo", job: "the same steps on every VS Code prompt", relation: "second caller of the steps", href: "/framework/servex/" },
	];

	prompt = new Prompt();
	whisper = Whisper.shared;
	session = this.whisper.session("Refine demo");   // Dictate's on_whisper feeds it: system.session.record(line)
	model = "claude-sonnet-5-5";                    // measured fastest cheap model: doc/refine-v3-2026-10-09.md
	history = [];                                   // finished prompts of this page visit (plain summaries), newest last

	constructor(...args){
		Object.assign(this, ...args);
		this.prompt.on_change = p => this.on_change?.(p, this);
	}

	/** Show the cleaned text NOW, with no model: the instant stage. Cheap enough to run on every chunk. */
	quick(text){
		const t0 = performance.now();
		const prompt = this.prompt;
		if (prompt.status === "done") return;   // a finished result is not overwritten by later chunks
		prompt.raw = text;
		prompt.load_quick(quick_clean(text), +(performance.now() - t0).toFixed(2));
	}

	/** Refine one prompt. Never throws: a failure becomes `prompt.status === "error"`. */
	async go(text, { url } = {}){
		const prompt = this.prompt;
		const t_start = performance.now();
			if (!prompt.quick || prompt.raw !== text) this.quick(text);
			prompt.set({ status: "working", model: this.model, raw: text, subject: "", refined: [], error: "", ms: 0, runs: [], stages: {} });
		try {
			if (!url){
				const { servex_url } = await import("/framework/dev/servex_url.js");
				url = servex_url("/api/refine");
			}
			const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, model: this.model }) });
			const out = await res.json();
			if (!out?.ok) throw new Error(out?.why ?? `Servex answered ${res.status}`);
			prompt.load(out);
			prompt.timings = { ...prompt.timings, total_ms: Math.round(performance.now() - t_start) };
			this.history.push({ at: new Date().toISOString(), words: text.split(/s+/).length, total_ms: prompt.timings.total_ms, cost_usd: +prompt.runs.reduce((a, r) => a + r.cost_usd, 0).toFixed(4), runs: prompt.runs.length });
		} catch (e){
			prompt.set({ status: "error", error: String(e?.message ?? e) });
			ErrorLog.report(e, { where: "RefineSystem.go" });
		}
		return prompt;
	}

	/** Start over: the same Prompt object, emptied (so the debug tree keeps showing the live one). */
	next(){
		this.prompt.set({ status: "empty", raw: "", subject: "", clean: [], refined: [], error: "", ms: 0, runs: [], stages: {}, timings: {}, quick: false });
	}
}

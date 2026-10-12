import ErrorLog from "../ErrorLog/ErrorLog.js";
import Prompt from "./Prompt.js";
import Whisper from "../../audio/Whisper/Whisper.js";
import { quick_clean } from "./engine.js";

/** POST one live-refine batch (`doc/live-refine-2026-10-12.md`, wire shape at
 *  `ai/2026-10-12/refine-haiku-live/contract.md`). Standalone — not a `RefineSystem` method
 *  alone — so a plain `ComposerMic` (`ext/Chat/Mic.js`), with no full `RefineSystem` of its
 *  own, can call it too: CLAUDE.md law 2/6, "every mic refines live", not just the Refine
 *  demo's own page. Fails quietly (`null`) until Servex's own `/api/refine/live` route lands
 *  (`Servex/ext/refine/LiveRefine.js`) and the dev server restarts — a 404, any non-OK status,
 *  or a network error are all exactly "today's behaviour", never thrown, never blocking a send. */
export async function refine_live({ prompt, text, final = false, session, source = "dictated" } = {}){
	if (!prompt || (!text && !final)) return null;
	try {
		const { servex_url } = await import("/framework/dev/servex_url.js");
		const res = await fetch(servex_url("/api/refine/live"), {
			method: "POST", headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt, session, text, final, source }),
		});
		if (!res.ok) return null;
		const out = await res.json();
		return out?.ok ? out : null;
	} catch { return null; }
}

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
	model = "";                                     // empty: the server picks (Haiku, or OpenRouter when session-backend.txt says so): ai/doc/models.md
	session_id = RefineSystem.session_id();            // the session whose log keeps this page's prompts (ai/AISession/PromptLog.js)
	prompt_id = RefineSystem.new_prompt_id();          // names this prompt on the session page (`voice-<id>`); a new one per prompt
	history = [];                                   // finished prompts of this page visit (plain summaries), newest last

	constructor(...args){
		Object.assign(this, ...args);
		this.prompt.on_change = p => this.on_change?.(p, this);
	}

	/** The demo page's own session: a uuid made once per browser and kept, so its prompts pile up in ONE session log
	 *  (`ai/sessions/…/prompts.jsonl`) the way a VS Code tab's do. A caller with a real session passes `session_id`. */
	static session_id(){
		try {
			const asked = new URLSearchParams(location.search).get("session");   // ?session=<uuid>: talk to THAT session's page
			if (/^[0-9a-f-]{36}$/.test(asked ?? "")) localStorage.setItem("refine.session", asked);
			let id = localStorage.getItem("refine.session");
			if (!/^[0-9a-f-]{36}$/.test(id ?? "")) localStorage.setItem("refine.session", id = crypto.randomUUID());
			return id;
		} catch { return crypto.randomUUID(); }
	}

	static new_prompt_id(){ return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

	/** Where the words are shown live: this session's page (every stage lands there as it happens). */
	get page_url(){ return `/framework/ai/sessions/${this.session_id}/`; }

	/** Send the words so far to the session page (stage 1, and the instant draft of stage 2). Trailing-throttled to ~150 ms;
	 *  a failure never stops dictation, it is logged once. */
	stream(text){
		this._text = text;
		if (this._timer) return;
		this._timer = setTimeout(async () => {
			this._timer = null;
			try {
				const { servex_url } = await import("/framework/dev/servex_url.js");
				const res = await fetch(servex_url("/api/voice"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session: this.session_id, prompt: this.prompt_id, text: this._text, source: this.source ?? "dictated" }) });
				const out = await res.json();
				if (!out.ok) throw new Error(out.why ?? "voice route answered " + res.status);
				this.streamed = true;
			} catch (e){ if (!this.stream_failed){ this.stream_failed = true; ErrorLog.report(e, { where: "RefineSystem.stream" }); } }
		}, 150);
	}

	/** Show the cleaned text NOW, with no model: the instant stage. Cheap enough to run on every chunk. */
	quick(text){
		const t0 = performance.now();
		const prompt = this.prompt;
		if (prompt.status === "done") return;   // a finished result is not overwritten by later chunks
		prompt.raw = text;
		prompt.load_quick(quick_clean(text), +(performance.now() - t0).toFixed(2));
		this.stream(text);
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
			const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, model: this.model || undefined, session: this.session_id, prompt: this.prompt_id, source: this.source ?? "typed" }) });
			const out = await res.json();
			if (!out?.ok) throw new Error(out?.why ?? `Servex answered ${res.status}`);
			prompt.load(out);
			prompt.timings = { ...prompt.timings, total_ms: Math.round(performance.now() - t_start) };
			this.history.push({ at: new Date().toISOString(), words: text.split(/\s+/).length, total_ms: prompt.timings.total_ms, cost_usd: +prompt.runs.reduce((a, r) => a + r.cost_usd, 0).toFixed(4), runs: prompt.runs.length });
		} catch (e){
			prompt.set({ status: "error", error: String(e?.message ?? e) });
			ErrorLog.report(e, { where: "RefineSystem.go" });
		}
		return prompt;
	}

	/** Live refine for THIS prompt (`refine_live()` above): keeps only the newest `seq` (a reply
	 *  for an older batch, arrived late, is dropped), and writes the outline straight onto the
	 *  live `Prompt` so any host watching it (its own `on_change`, `Prompt.View`'s "3 · Outline"
	 *  section) sees it update as the words arrive — the same redraw path `go()` and `quick()`
	 *  already use, never a second one. */
	async live(text, { final = false } = {}){
		const out = await refine_live({ prompt: this.prompt_id, text, final, session: this.session_id, source: this.source ?? "dictated" });
		if (!out) return null;
		if ((out.seq ?? 0) < (this._live_seq ?? -1)) return null;
		this._live_seq = out.seq ?? 0;
		this.live_md = out.md; this.live_outline = out.outline; this.live_slots = out.slots;
		if (out.outline) this.prompt.set({ subject: out.outline.subject ?? this.prompt.subject, refined: out.outline.sections ?? this.prompt.refined });
		return out;
	}

	/** Start over: the same Prompt object, emptied (so the debug tree keeps showing the live one). */
	next(){
		this.prompt_id = RefineSystem.new_prompt_id();
		this.prompt.set({ status: "empty", raw: "", subject: "", clean: [], refined: [], error: "", ms: 0, runs: [], stages: {}, timings: {}, quick: false });
	}
}

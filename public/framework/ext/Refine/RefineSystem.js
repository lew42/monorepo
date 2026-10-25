import ErrorLog from "../ErrorLog/ErrorLog.js";
import PromptRun from "./PromptRun.js";
import Placement from "./Placement.js";
import Whisper from "../../audio/Whisper/Whisper.js";
import { quick_clean } from "./engine.js";

/**
 * class RefineSystem — the boss of the refine system (`doc/architecture.md`). It owns ONE live
 * `PromptRun` (built from `chunks`, one per send, so earlier sentences are never replaced) and runs it through the steps: text in (typed, or from the dictation source) →
 * Servex `/api/refine` (the Cleaner, then the Structurer) → `PromptRun.load()` (which runs the
 * `Scorer`). A page only ever talks to this class:
 *
 *   const system = new RefineSystem({ on_change: prompt => redraw(prompt) });
 *   await system.go("so the page should uh show a flag when unclear");
 *   system.prompt          // the live PromptRun (status, raw, clean, refined)
 *   system.quick(text);    // the instant clean (no model, ~1 ms): call it on every Whisper chunk
 *   system.next();         // start over with a fresh prompt
 *   system.whisper / system.session   // the Whisper server and this surface's WhisperSession (audio/Whisper)
 *
 * Only plain data besides `on_change`, so the debug tree can show it (`ux/Content/Object/DefaultView`).
 */
export default class RefineSystem {

	/** POST one live-refine batch (`doc/live-refine-2026-10-12.md`, wire shape at
	 *  `ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/contract.md`). Static, so a plain `ComposerMic` (`ext/Chat/Mic.js`), with no `RefineSystem` instance
	 *  of its own, can call it too: CLAUDE.md law 2/6, "every mic refines live", not just the Refine
	 *  demo's own page. Fails quietly (`null`) until Servex's own `/api/refine/live` route lands
	 *  (`Servex/ext/refine/LiveRefine.js`) and the dev server restarts — a 404, any non-OK status,
	 *  or a network error are all exactly "today's behaviour", never thrown, never blocking a send. */
	static async post_live({ prompt, text, final = false, session, source = "dictated" } = {}){
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

	static icon = "hub";

	/** The architecture table the demo's class card draws (same rows as `doc/architecture.md`). */
	static parts = [
		{ name: "RefineSystem", job: "boss: runs one prompt through the steps, owns the live PromptRun", relation: "composes all below", href: "/framework/ext/Refine/md/doc/architecture/" },
		{ name: "PromptRun", job: "in-memory prompt: raw, clean sentences, refined cards, scores, flags", relation: "data; has PromptRun.View", href: "/framework/ext/Refine/md/doc/prompt/" },
		{ name: "PromptRun.View", job: "draws a PromptRun: raw, clean with ⚑ flags, cards with S# links", relation: "extends View", href: "/framework/ext/Refine/PromptRun.js" },
		{ name: "Scorer", job: "rules that give each sentence clarity, weight and flags", relation: "used by PromptRun.load()", href: "/framework/ext/Refine/Scorer.js" },
		{ name: "Cleaner", job: "raw → numbered near-verbatim sentences (Cleaner.js)", relation: "step; runs in Servex", href: "/framework/ext/Refine/cleaner/" },
		{ name: "Structurer", job: "sentences → outline of cards citing them (structure.js)", relation: "step; runs in Servex", href: "/framework/ext/Refine/structure.js" },
		{ name: "DictationSource", job: "where words come from: mic (ux/Dictate) or the text box", relation: "wraps Dictate", href: "/framework/ux/Dictate/" },
		{ name: "Echo", job: "the same steps on every VS Code prompt", relation: "second caller of the steps", href: "/framework/servex/" },
	];

	prompt = new PromptRun();
	whisper = Whisper.shared;
	session = this.whisper.session("Refine demo");   // Dictate's on_whisper feeds it: system.session.record(line)
	model = "";                                     // empty: the server picks (Haiku, or OpenRouter when session-backend.txt says so): ai/doc/models.md
	session_id = RefineSystem.session_id();            // the session whose log keeps this page's prompts (ai/AISession/PromptLog.js)
	prompt_id = RefineSystem.new_prompt_id();          // names this prompt on the session page (`voice-<id>`); a new one per prompt
	chunks = [];            // one per SENT utterance { raw, clean, refined, subject, runs, stages, ms, status }: the transcript gains one each send, nothing is overwritten
	pending = "";           // the words still in the box (not sent yet)
	sending = null;         // { text, sections }: sent, but its chunk does not exist yet (Mic.js waits on a last live call first)
	live_sections = [];     // the live outline of the box (local sentence numbers)
	history = [];                                   // finished prompts of this page visit (plain summaries), newest last
	placement = new Placement();                    // after the Cleaner: each sentence joins the last paragraph or starts one (`doc/placement.md`)
	paragraphs = Placement.state();                 // the paragraphs so far: [[text, …], …], fed sentence by sentence

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

	/** The words still in the box, cleaned instantly with no model. Cheap enough to run on every chunk. Empty text clears the box's share. */
	quick(text){
		const t0 = performance.now();
		this.pending = this.unsent(String(text ?? "").trim());
		this.compose(+(performance.now() - t0).toFixed(2));
		if (this.pending) this.stream(this.pending);
	}

	/** The box empties a moment AFTER a sentence is delivered, so a box event in between still holds the words just sent: leave those out. */
	unsent(text){
		const last = this.chunks.at(-1);
		if (!last || !text || performance.now() - last.at > 5000) return text;
		const w = t => t.split(/\s+/).filter(Boolean), norm = x => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
		const sent = w(last.raw), now = w(text);
		return sent.length && sent.every((x, i) => norm(x) === norm(now[i] ?? "")) ? now.slice(sent.length).join(" ") : text;
	}

	/** A send has started (Mic.js waits on a last live call before `deliver`): keep those words on the page meanwhile. */
	sending_start(text){
		text = String(text ?? "").trim();
		if (!text) return;
		this.sending = { text, sections: this.live_sections };
		clearTimeout(this._sending_timer);
		this._sending_timer = setTimeout(() => { if (this.sending){ this.sending = null; this.compose(); } }, 20000);   // a send dropped as a duplicate never reaches go()
		this.compose();
	}

	/** The live outline of the box (`/api/refine/live`), kept apart so a sent chunk can take it along. */
	set_live(out){
		this.live_sections = out?.outline?.sections ?? this.live_sections;
		this.compose();
	}

	/** Shift every S-number in a card tree: a chunk's local sentence numbers become the transcript's. */
	static shift(cards, d){ return (cards ?? []).map(c => ({ ...c, cites: (c.cites ?? []).map(n => n + d), cards: RefineSystem.shift(c.cards, d) })); }

	static rows(text){ return quick_clean(text).map(t => ({ n: t.n, text: t.text, clarity: null, weight: 0, flags: [], alternates: [], names: [], tags: [], card: "", why: "" })); }

	/** Rebuild the one `PromptRun` from every sent chunk, then the sentence in flight, then the box: sentences only ever get added. */
	compose(quick_ms){
		const clean = [], refined = [], raws = [];
		let at = 0, working = false, error = "", ms = 0;
		const add = (sentences, sections) => {
			sentences.forEach(s => clean.push({ ...s, n: s.n + at }));
			refined.push(...RefineSystem.shift(sections, at));
			at += sentences.length;
		};
		for (const c of this.chunks){ raws.push(c.raw); add(c.clean, c.refined); working ||= c.status === "working"; error = c.error || error; ms += c.ms; }
		if (this.sending){ raws.push(this.sending.text); add(RefineSystem.rows(this.sending.text), this.sending.sections); }
		if (this.pending){ raws.push(this.pending); add(RefineSystem.rows(this.pending), this.live_sections); }
		const last = this.chunks.at(-1);
		const status = working ? "working" : error ? "error" : this.chunks.length ? "done" : "empty";
		const prompt = this.prompt;
		prompt.timings = { ...prompt.timings, ...(quick_ms != null ? { quick_ms } : {}) };
		prompt.set({
			status, raw: raws.join(" "), clean, refined, error, ms,
			quick: !!(this.sending || this.pending) || working,
			subject: this.chunks.find(c => c.subject)?.subject ?? "",
			runs: this.chunks.flatMap(c => c.runs), stages: last?.stages ?? {}, model: this.model,
			prompt_id: last?.prompt_id ?? "", session: last ? this.session_id : "",
		});
	}

	/** Refine one SENT utterance: it becomes a chunk, its sentences numbered after the ones already there.
	 *  Never throws: a failure is shown on the page and the chunk keeps its instant clean. */
	async go(text, { url } = {}){
		text = String(text ?? "").trim();
		if (!text) return this.prompt;
		const t_start = performance.now();
		const chunk = { raw: text, clean: RefineSystem.rows(text), refined: this.sending?.text === text ? this.sending.sections : this.live_sections, subject: "", runs: [], stages: {}, ms: 0, status: "working", error: "", prompt_id: this.prompt_id, at: performance.now() };
		this.chunks.push(chunk);
		this.sending = null; this.pending = ""; this.live_sections = [];
		this.prompt_id = RefineSystem.new_prompt_id();   // the next utterance is its own prompt on the session page
		this.compose();
		try {
			if (!url){
				const { servex_url } = await import("/framework/dev/servex_url.js");
				url = servex_url("/api/refine");
			}
			const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, model: this.model || undefined, session: this.session_id, prompt: chunk.prompt_id, source: this.source ?? "typed" }) });
			const out = await res.json();
			if (!out?.ok) throw new Error(out?.why ?? `Servex answered ${res.status}`);
			const one = new PromptRun();   // scores this chunk alone (`PromptRun.load`), then compose() renumbers it into the transcript
			one.load(out);
			Object.assign(chunk, { clean: one.clean, refined: one.refined, subject: one.subject, runs: one.runs, stages: one.stages, ms: one.ms, status: "done" });
			for (const s of chunk.clean) s.placed = await this.placement.add(s, this.paragraphs);   // the placement step: one decision per sentence, in order
			const total_ms = Math.round(performance.now() - t_start);
			this.prompt.timings = { ...this.prompt.timings, total_ms };
			this.history.push({ at: new Date().toISOString(), words: text.split(/\s+/).length, total_ms, cost_usd: +one.runs.reduce((a, r) => a + r.cost_usd, 0).toFixed(4), runs: one.runs.length });
		} catch (e){
			Object.assign(chunk, { status: "failed", error: String(e?.message ?? e) });
			ErrorLog.report(e, { where: "RefineSystem.go" });
		}
		this.compose();
		return this.prompt;
	}

	/** Live refine for THIS prompt (`RefineSystem.post_live()` above): keeps only the newest `seq` (a reply
	 *  for an older batch, arrived late, is dropped), and writes the outline straight onto the
	 *  live `PromptRun` so any host watching it (its own `on_change`, `PromptRun.View`'s "3 · Outline"
	 *  section) sees it update as the words arrive — the same redraw path `go()` and `quick()`
	 *  already use, never a second one. */
	async live(text, { final = false } = {}){
		const out = await RefineSystem.post_live({ prompt: this.prompt_id, text, final, session: this.session_id, source: this.source ?? "dictated" });
		if (!out) return null;
		if ((out.seq ?? 0) < (this._live_seq ?? -1)) return null;
		this._live_seq = out.seq ?? 0;
		this.live_md = out.md; this.live_outline = out.outline; this.live_slots = out.slots;
		if (out.outline) this.set_live(out);
		return out;
	}

	/** Start over: the same PromptRun object, emptied (so the debug tree keeps showing the live one). */
	next(){
		this.prompt_id = RefineSystem.new_prompt_id();
		this.chunks = []; this.pending = ""; this.sending = null; this.live_sections = []; this.paragraphs = Placement.state();
		this.prompt.set({ status: "empty", raw: "", subject: "", clean: [], refined: [], error: "", ms: 0, runs: [], stages: {}, timings: {}, quick: false });
	}
}

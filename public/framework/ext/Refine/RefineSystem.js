import Prompt from "./Prompt.js";

/**
 * class RefineSystem — the boss of the refine system (`doc/architecture.md`). It owns ONE live
 * `Prompt` and runs it through the steps: text in (typed, or from the dictation source) →
 * Servex `/api/refine` (the Cleaner, then the Structurer) → `Prompt.load()` (which runs the
 * `Scorer`). A page only ever talks to this class:
 *
 *   const system = new RefineSystem({ on_change: prompt => redraw(prompt) });
 *   await system.go("so the page should uh show a flag when unclear");
 *   system.prompt          // the live Prompt (status, raw, clean, refined)
 *   system.next();         // start over with a fresh prompt
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
		{ name: "Echo", job: "the same steps on every VS Code prompt", relation: "second caller of the steps", href: "/framework/servex/md/doc/echo/" },
	];

	prompt = new Prompt();

	constructor(...args){
		Object.assign(this, ...args);
		this.prompt.on_change = p => this.on_change?.(p, this);
	}

	/** Refine one prompt. Never throws: a failure becomes `prompt.status === "error"`. */
	async go(text, { url } = {}){
		const prompt = this.prompt;
		prompt.set({ status: "working", raw: text, subject: "", clean: [], refined: [], error: "", ms: 0 });
		try {
			if (!url){
				const { servex_url } = await import("/framework/dev/servex_url.js");
				url = servex_url("/api/refine");
			}
			const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
			const out = await res.json();
			if (!out?.ok) throw new Error(out?.why ?? `Servex answered ${res.status}`);
			prompt.load(out);
		} catch (e){
			prompt.set({ status: "error", error: String(e?.message ?? e) });
		}
		return prompt;
	}

	/** Start over: the same Prompt object, emptied (so the debug tree keeps showing the live one). */
	next(){
		this.prompt.set({ status: "empty", raw: "", subject: "", clean: [], refined: [], error: "", ms: 0 });
	}
}

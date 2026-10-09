import { View, div, span, p, h4, button } from "../../core/View/View.js";

View.stylesheet(import.meta, "Prompt.css");

/**
 * class Prompt — ONE prompt, seen at every step of its refinement (the owner's design:
 * `doc/vision-2026-10-08.md`, addendum 2). It only holds data and computes scores; it
 * does not clean or structure anything itself — `refine()` hands the text to Servex
 * (`/api/refine`), which runs the SAME `engine.js` `clean()` and `structure.js`
 * `structure()` Echo runs, so there is still exactly one pipeline.
 *
 *   const prompt = new Prompt({ on_change: () => redraw() });
 *   await prompt.refine("so the thing should uh show a flag when it is unclear");
 *   prompt.clean[0]      // { n, text, clarity, weight, flags, alternates, names, card }
 *   prompt.refined       // [{ title, cites, cards: [{ text, cites, cards: [...] }] }]
 *   prompt.view          // a Prompt.View: the rendered result (the debug tree is DefaultView)
 *
 * Only plain data lives on an instance (strings, numbers, arrays, objects) so the debug
 * tree (`ux/Content/Object/DefaultView.js`) can show every property by type.
 *
 * SCORES ARE RULES, NOT MODEL CALLS (first version; the choice is recorded in
 * `doc/prompt.md`). `clarity` and `weight` are 0–1, computed in `score()` from what the
 * pipeline already reported. Cheap, instant, repeatable, and good enough to show the flag.
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

	constructor(...args){ Object.assign(this, ...args); }

	/** Run the pipeline on `text`. Never throws: a failure becomes `status: "error"`. */
	async refine(text, { url } = {}){
		this.set({ status: "working", raw: text, subject: "", clean: [], refined: [], error: "", ms: 0 });
		try {
			if (!url){
				const { servex_url } = await import("/framework/dev/servex_url.js");
				url = servex_url("/api/refine");
			}
			const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
			const out = await res.json();
			if (!out?.ok) throw new Error(out?.why ?? `Servex answered ${res.status}`);
			this.load(out);
		} catch (e){
			this.set({ status: "error", error: String(e?.message ?? e) });
		}
		return this;
	}

	/** Fill the instance from one `/api/refine` answer (also how a saved answer is replayed). */
	load({ clean, structure, ms }){
		const parsed = Prompt.parse_outline(structure?.md ?? "");
		this.subject = parsed.subject;
		this.refined = parsed.sections;
		this.ms = ms ?? 0;
		this.clean = (clean?.sentences ?? []).map(s => ({
			n: s.n, text: s.text, clarity: 1, weight: 0, flags: [], alternates: [], names: [], card: "",
		}));
		this.score({ clean, structure, parsed });
		this.set({ status: "done" });
	}

	set(fields){
		Object.assign(this, fields);
		this.on_change?.(this);
		return this;
	}

	sentence(n){ return this.clean.find(s => s.n === n); }

	/** Sentences worth a yellow flag: unclear enough, or the pipeline asked a question about them. */
	get flagged(){ return this.clean.filter(s => s.clarity < Prompt.LOW_CLARITY || s.flags.some(f => f.kind === "model" || f.kind === "mechanical")); }

	/**
	 * clarity (can we tell what this sentence means?) starts at 1 and only goes down:
	 *   the model said "unsure" (S2?)          → at most 0.3
	 *   the checker found a word nobody said   → at most 0.5
	 *   a glossary fix (heard "Servex" as…)    → ×0.85 per fix: we guessed a reference
	 *   a spoken self-correction               → ×0.8: the speaker changed their mind here
	 *   under 3 words                          → ×0.7: too short to carry a meaning
	 * weight (does it matter, does it still apply?) = how sure the outline placed it
	 * (`structure()` confidence: once = 1, twice = 0.4, never = 0.2), halved a little for a
	 * sub-point, then pulled down by low clarity.
	 */
	score({ clean, structure, parsed }){
		const depth = new Map();   // sentence n -> shallowest card depth that cites it
		const card_of = new Map();
		const walk = (cards, depth_n, path) => cards.forEach(c => {
			c.cites.forEach(n => {
				if (!depth.has(n) || depth_n < depth.get(n)){ depth.set(n, depth_n); card_of.set(n, path + c.text); }
			});
			walk(c.cards, depth_n + 1, path);
		});
		parsed.sections.forEach(sec => {
			sec.cites.forEach(n => { depth.set(n, 0); card_of.set(n, sec.title); });
			walk(sec.cards, 1, sec.title + " › ");
		});

		this.clean.forEach(s => {
			const flags = [];
			for (const f of clean?.flags ?? []) if (f.sentence_n === s.n) flags.push({ kind: f.source, question: f.question, confidence: f.confidence });
			for (const m of clean?.misheard ?? []) if (m.sentence_n === s.n) flags.push({ kind: "misheard", question: `Heard "${m.from}", read as ${m.to}.`, confidence: 0.85 });
			for (const k of clean?.strikes ?? []) if (k.sentence_n === s.n) flags.push({ kind: "strike", question: `Self-correction: "${k.struck_text}" was struck.`, confidence: 0.8 });

			let clarity = 1;
			for (const f of flags){
				if (f.kind === "model") clarity = Math.min(clarity, 0.3);
				else if (f.kind === "mechanical") clarity = Math.min(clarity, 0.5);
				else clarity *= f.confidence;
			}
			if (s.text.trim().split(/\s+/).length < 3) clarity *= 0.7;
			s.clarity = +clarity.toFixed(2);

			const placed = structure?.confidence?.[s.n] ?? (depth.has(s.n) ? 1 : 0.2);
			const sub = depth.get(s.n) >= 2 ? 0.8 : 1;
			s.weight = +(placed * sub * (0.5 + 0.5 * s.clarity)).toFixed(2);
			s.flags = flags;
			s.card = card_of.get(s.n) ?? "";
		});
	}

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

	/** Who uses this class and what to know first (shown on the class card on the page). */
	static card = {
		icon: "article",
		name: "Prompt",
		api: [
			["refine(text)", "run the pipeline on one prompt; fills everything below"],
			["raw · clean · refined", "what was said, numbered sentences, cards with sub-cards"],
			["clean[i].clarity · weight", "0–1 scores (rules); flags and alternates ride along"],
			["flagged", "the sentences that get the yellow flag"],
			["view", "a Prompt.View of this instance"],
		],
		callers: [["ext/Refine", "/framework/ext/Refine/"], ["Servex /api/refine", "/framework/servex/"]],
	};
}

/** Prompt.View — raw, clean (with scores and yellow flags), refined cards. A sentence and a
 *  card's source chip are linked: click either and the other side lights up. */
Prompt.View = class extends View {

	render(){
		const prompt = this.subject;
		this.ac("refine-prompt");

		if (prompt.status === "empty") return p.c("refine-empty", "Say or type a prompt, then press Refine.");
		if (prompt.status === "working") return p.c("refine-empty", "Refining… (clean, then structure — a few seconds)");
		if (prompt.status === "error") return p.c("refine-error", "Could not refine: " + prompt.error);

		const sentence_els = new Map();
		const light = n => {
			sentence_els.forEach(($s, k) => $s.el.classList.toggle("lit", k === n));
			sentence_els.get(n)?.el.scrollIntoView({ block: "nearest", behavior: "smooth" });
		};

		div.c("refine-prompt-col", () => {
			h4.c("refine-prompt-h", "Raw — as heard");
			p.c("refine-prompt-raw", prompt.raw);

			h4.c("refine-prompt-h", "Clean — numbered, near-verbatim");
			prompt.clean.forEach(s => {
				const $s = div.c("refine-sentence", () => {
					span.c("refine-s-num", "S" + s.n);
					span.c("refine-s-text", s.text);
					if (prompt.flagged.includes(s)){
						const q = s.flags.map(f => f.question).join(" ") || "This one may be unclear.";
						span.c("refine-flag", "⚑").attr("title", q);
					}
					span.c("refine-s-scores", `clarity ${s.clarity} · weight ${s.weight}`);
				});
				$s.click(() => light(s.n));
				sentence_els.set(s.n, $s);
			});
		});

		div.c("refine-prompt-col", () => {
			h4.c("refine-prompt-h", "Refined — " + (prompt.subject || "cards"));
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
			p.c("refine-s-scores", `${prompt.clean.length} sentences · ${prompt.flagged.length} flagged · ${(prompt.ms / 1000).toFixed(1)}s`);
		});
	}
};

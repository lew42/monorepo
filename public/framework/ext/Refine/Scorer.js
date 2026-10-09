/**
 * class Scorer — the rules that give every sentence of a `Prompt` its `clarity`, `weight`,
 * `flags` and `card`. Rules, not model calls (decision in `doc/prompt.md`): instant, free,
 * repeatable. `Scorer.score(prompt, { clean, structure })` writes onto `prompt.clean[i]`.
 */
export default class Scorer {

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
	static score(prompt, { clean, structure }){
		const parsed = { sections: prompt.refined };
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

		prompt.clean.forEach(s => {
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

}

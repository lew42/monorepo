/**
 * class Scorer — the rules that give every sentence of a `Prompt` its `clarity`, `weight`,
 * `flags` and `card`. Rules, not model calls (decision in `doc/prompt.md`): instant, free,
 * repeatable. `Scorer.score(prompt, { clean, structure })` writes onto `prompt.clean[i]`.
 */
export default class Scorer {

	/**
	 * clarity is a probability (`doc/confidence.md`): it starts at 0.5, "not sure", and moves on evidence.
	 *   no flag, cited by exactly one card, 3+ words → 0.75, with that evidence written in `evidence`
	 *   a glossary fix or a spoken self-correction  → at most 0.5 (a guess was made here)
	 *   under 3 words                                → at most 0.4
	 *   the checker found a word nobody said         → 0.25 (probably wrong)
	 *   the model said "unsure" (S2?)                → 0.3
	 * Over 0.7 needs `evidence`; without it the number is clamped to 0.7.
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
			for (const m of clean?.misheard ?? []) if (m.sentence_n === s.n) flags.push({ kind: "misheard", question: `Heard "${m.from}", read as ${m.to}.`, confidence: 0.6 });
			for (const k of clean?.strikes ?? []) if (k.sentence_n === s.n) flags.push({ kind: "strike", question: `Self-correction: "${k.struck_text}" was struck.`, confidence: 0.6 });

			let clarity = 0.5, evidence = "";
			const words = s.text.trim().split(/\s+/).length;
			const placed_once = structure?.confidence?.[s.n] === 1 || (!structure?.confidence && depth.has(s.n));
			if (!flags.length && words >= 3 && placed_once){ clarity = 0.75; evidence = `cited once by "${card_of.get(s.n)}", no flags`; }
			for (const f of flags){
				if (f.kind === "model") clarity = Math.min(clarity, 0.3);
				else if (f.kind === "mechanical") clarity = Math.min(clarity, 0.25);
				else clarity = Math.min(clarity, 0.5);
			}
			if (words < 3) clarity = Math.min(clarity, 0.4);
			if (clarity > 0.7 && !evidence) clarity = 0.7;
			if (clarity <= 0.7) evidence = "";
			s.clarity = +clarity.toFixed(2);
			s.evidence = evidence;
			s.scale = 2;

			const placed = structure?.confidence?.[s.n] ?? (depth.has(s.n) ? 1 : 0.2);
			const sub = depth.get(s.n) >= 2 ? 0.8 : 1;
			s.weight = +(placed * sub * (0.5 + 0.5 * s.clarity)).toFixed(2);
			s.flags = flags;
			s.card = card_of.get(s.n) ?? "";
		});
	}

}

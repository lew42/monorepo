import RefineCall from "./RefineCall.js";

/**
 * class ClarityScorer — asks a cheap model, ONE sentence at a time, how clear that sentence is,
 * showing it only the sentence before and after for context. One new session per sentence, all
 * run in parallel, so the whole text costs about one call's time.
 *
 *   const rows = await ClarityScorer.score(sentences, { model });   // [{ n, clarity, why }]
 *
 * The scale is `ext/Refine/doc/confidence.md` (0.5 = not sure; over 0.7 needs evidence).
 *
 * Why not only the rule-based `ext/Refine/Scorer`: it once started every sentence at 1, so most read 1.0 (measured in `doc/refine-v3-2026-10-09.md`). A model can say
 * "this sentence has no subject" or "refers to something never named", which a rule cannot.
 */
export default class ClarityScorer {

	static SYSTEM = `You rate how clear ONE sentence from a dictated message is, to a reader who sees only it and its neighbours. Clear = a reader knows exactly what is being said or asked. Unclear = vague ("it", "that thing" with no referent), cut off, contradictory, or missing what it is about.
Reply with ONLY compact JSON: {"clarity": <0.0-1.0>, "why": "<under 12 words>"}. The number is a probability that a reader gets the right meaning. 0.5 is your DEFAULT and means "not sure"; start there and move only for a reason. Below 0.3 = probably not understood. Above 0.7 ONLY if "why" names the evidence (what exactly makes it unmistakable); a high number with a vague "why" is wrong. Never answer 0.9 out of habit.`;

	static async score(sentences, { model = RefineCall.model() } = {}){
		return Promise.all(sentences.map(async (s, i) => {
			const prev = sentences[i - 1]?.text, next = sentences[i + 1]?.text;
			const prompt = `${prev ? `Before: ${prev}\n` : ""}SENTENCE: ${s.text}${next ? `\nAfter: ${next}` : ""}`;
			try {
				const r = await RefineCall.run(prompt, { model, system: ClarityScorer.SYSTEM, stage: "clarity S" + s.n });
				const j = JSON.parse(/\{[\s\S]*\}/.exec(r.answer)?.[0] ?? "{}");
				const why = String(j.why ?? "");
				let clarity = Math.max(0, Math.min(1, +j.clarity));
				if (clarity > 0.7 && why.trim().split(/\s+/).length < 3) clarity = 0.7;   // no evidence, no number over 0.7
				return { n: s.n, clarity, why, scale: 2 };
			} catch { return { n: s.n, clarity: null, why: "" }; }
		}));
	}
}

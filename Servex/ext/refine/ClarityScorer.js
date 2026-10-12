import RefineCall from "./RefineCall.js";

/**
 * class ClarityScorer — asks a cheap model, ONE sentence at a time, how clear that sentence is,
 * showing it only the sentence before and after for context. One new session per sentence, all
 * run in parallel, so the whole text costs about one call's time.
 *
 *   const rows = await ClarityScorer.score(sentences, { model });   // [{ n, clarity, why }]
 *
 * Why not the rule-based `ext/Refine/Scorer`: it starts every sentence at 1 and only lowers it
 * for flags, so most read 1.0 (measured in `doc/refine-v3-2026-10-09.md`). A model can say
 * "this sentence has no subject" or "refers to something never named", which a rule cannot.
 */
export default class ClarityScorer {

	static SYSTEM = `You rate how clear ONE sentence from a dictated message is, to a reader who sees only it and its neighbours. Clear = a reader knows exactly what is being said or asked. Unclear = vague ("it", "that thing" with no referent), cut off, contradictory, or missing what it is about.
Reply with ONLY compact JSON: {"clarity": <0.0-1.0>, "why": "<under 12 words>"}. Use the whole range: 1.0 only if nothing could be misread; 0.5 if a reader would have to guess; 0.2 if it cannot be understood.`;

	static async score(sentences, { model = "openai/gpt-6-luna" } = {}){
		return Promise.all(sentences.map(async (s, i) => {
			const prev = sentences[i - 1]?.text, next = sentences[i + 1]?.text;
			const prompt = `${prev ? `Before: ${prev}\n` : ""}SENTENCE: ${s.text}${next ? `\nAfter: ${next}` : ""}`;
			try {
				const r = await RefineCall.run(prompt, { model, system: ClarityScorer.SYSTEM, stage: "clarity S" + s.n });
				const j = JSON.parse(/\{[\s\S]*\}/.exec(r.answer)?.[0] ?? "{}");
				return { n: s.n, clarity: Math.max(0, Math.min(1, +j.clarity)), why: String(j.why ?? "") };
			} catch { return { n: s.n, clarity: null, why: "" }; }
		}));
	}
}

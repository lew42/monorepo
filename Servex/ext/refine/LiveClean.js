import { quick_clean, clean } from "../../../public/framework/ext/Refine/engine.js";

/**
 * class LiveClean — the opt-in per-sentence model clean (`run_refine({ clean_live: true })`).
 * The mechanical split (quick_clean) gives the sentences at once; each one then gets its OWN small
 * Haiku `clean()` call, all at the same time, and lands on the page the moment it returns, so the
 * Clean stage fills in sentence by sentence instead of all at once after ~3 s.
 * It returns the same shape `clean()` returns, plus `live`: the cost and time of each sentence.
 *
 *   const out = await LiveClean.run(text, { call, model, on_sentence: (sentences, done, total) => {} });
 *   out.sentences; out.text; out.live.cost_usd; out.live.rows   // [{ text, cost_usd, ms }]
 *
 * Why opt-in: N small calls cost more than one call for the whole prompt (doc/asks.md, per-sentence-model-clean).
 * `cost_of` reads the cost from the run `call` reports, so the number shown is measured, never guessed.
 */
export default class LiveClean {

	static async run(text, { call, model = "claude-haiku-5-5", on_sentence, cost_of = r => r?.cost_usd ?? 0 } = {}){
		const draft = quick_clean(text).map(s => s.text);
		if (!draft.length) return { text: "", sentences: [], strikes: [], misheard: [], flags: [], live: { cost_usd: 0, rows: [] } };
		const rows = draft.map(t => ({ text: t, cost_usd: 0, ms: 0, sentences: [{ text: t }], flags: [] }));
		let landed = 0;
		const push = () => on_sentence?.(rows.flatMap(r => r.sentences.map(s => s.text)), landed, rows.length);
		await Promise.all(draft.map(async (t, i) => {
			const t0 = Date.now();
			const wrapped = async (p, o) => { const r = await call(p, o); rows[i].cost_usd += cost_of(r); return r; };
			try {
				const c = await clean(t, { call: wrapped, model, prev: draft.slice(Math.max(0, i - 1), i).join(" ") });
				if (c.sentences.length) rows[i].sentences = c.sentences;
				rows[i].flags = c.flags;
			} catch { /* a failed sentence keeps its mechanical draft */ }
			rows[i].ms = Date.now() - t0; landed++;
			push();
		}));
		const sentences = rows.flatMap(r => r.sentences).map((s, i) => ({ ...s, n: i + 1 }));
		return {
			text: sentences.map(s => s.text).join(" "), sentences, strikes: [], misheard: [], flags: rows.flatMap(r => r.flags),
			live: { cost_usd: +rows.reduce((a, r) => a + r.cost_usd, 0).toFixed(5), rows: rows.map(r => ({ text: r.text, cost_usd: +r.cost_usd.toFixed(5), ms: r.ms })) },
		};
	}
}

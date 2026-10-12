import RefineCall from "./RefineCall.js";
import RefineStyle from "../../../public/framework/ext/Refine/RefineStyle.js";

/**
 * class Annotator — the Haiku pass over a CLEAN prompt (the owner's design, `ext/Refine/doc/vision-2026-10-08.md`
 * addenda 2 and 3): for each sentence, one or two shorter ALTERNATE wordings, the NAMES of ideas worth
 * naming again, and TAGS in the repo path form (`core/Page`, `ext/Refine`) so sessions can be found by system.
 * The clean text itself is never changed; alternates are suggestions the owner can ignore.
 *
 *   const notes = await Annotator.annotate(["Sentence one.", "Sentence two."]);   // [{ i, alternates, names, tags }]
 *
 * One call per batch of sentences, never one per word. A batch is capped by characters (`BATCH_CHARS`, about
 * 15k tokens of input), so a very long dictation becomes a few calls and every call stays far under the 60k
 * token budget the owner set for Haiku. `i` is the sentence's 0-based index in `clean`, as the prompt log cites it.
 */
export default class Annotator {

	static MODEL = "openai/gpt-6-luna";
	static BATCH_CHARS = 60000;

	static SYSTEM = `You annotate a dictated message that was split into numbered sentences. For each sentence give:
- "alternates": 0 to 2 shorter or simpler wordings with the same meaning (an empty list if the sentence is already short and plain),
- "names": 0 to 2 short names (one word best, two words great) for a core idea the sentence introduces, only if it deserves a name,
- "tags": 0 to 3 repo paths or class names the sentence is about, in the form "core/Page" or "ext/Refine" (only ones actually mentioned or clearly meant).
Never change the meaning. Never invent.
${RefineStyle.for("notes")}
Reply with ONLY compact JSON: {"notes":[{"i":0,"alternates":[],"names":[],"tags":[]}, ...]} with one entry per sentence.`;

	/** Split sentences into batches no longer than BATCH_CHARS (keeps each call small and cheap). */
	static batches(sentences){
		const out = [];
		let cur = [], size = 0;
		sentences.forEach((text, i) => {
			if (cur.length && size + text.length > Annotator.BATCH_CHARS){ out.push(cur); cur = []; size = 0; }
			cur.push({ i, text }); size += text.length;
		});
		if (cur.length) out.push(cur);
		return out;
	}

	static async annotate(sentences, { model = Annotator.MODEL } = {}){
		const parts = await Promise.all(Annotator.batches(sentences).map(async batch => {
			const prompt = batch.map(s => `${s.i}: ${s.text}`).join("\n");
			try {
				const r = await RefineCall.run(prompt, { model, system: Annotator.SYSTEM, stage: `notes ${batch[0].i}-${batch.at(-1).i}` });
				const j = JSON.parse(/\{[\s\S]*\}/.exec(r.answer)?.[0] ?? "{}");
				return (j.notes ?? []).filter(n => Number.isInteger(n?.i) && n.i >= batch[0].i && n.i <= batch.at(-1).i).map(n => ({
					i: n.i,
					alternates: (n.alternates ?? []).map(String).slice(0, 2),
					names: (n.names ?? []).map(String).slice(0, 2),
					tags: (n.tags ?? []).map(String).slice(0, 3),
				}));
			} catch { return []; }
		}));
		return parts.flat().sort((a, b) => a.i - b.i);
	}
}

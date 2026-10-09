/* run.js — the model calls behind the live demo on /framework/ext/Refine/.
 *
 * One function, no new pipeline (CLAUDE.md law 6): it runs the SAME `clean()` (engine.js) and
 * `structure()` (structure.js) Echo and the prompt-log processor run, on one prompt, and hands
 * back plain data. Every model call is its OWN NEW session (`RefineCall`), reported in `runs`
 * with its model, tokens, cost and duration so the page can show and link it. Structure and the
 * per-sentence clarity scores run at the same time, since they only need the clean sentences.
 * `structure()` is Node-only, which is the only reason this is a route instead of a browser import. */
import { clean } from "../../../public/framework/ext/Refine/engine.js";
import { structure } from "../../../public/framework/ext/Refine/structure.js";
import RefineCall from "./RefineCall.js";
import ClarityScorer from "./ClarityScorer.js";

const MODEL = "claude-sonnet-5-5";   // measured fastest of the cheap models that do the job: doc/refine-v3-2026-10-09.md

export async function run_refine({ text, model = MODEL, clarity_model = "claude-haiku-5-5" } = {}){
	if (typeof text !== "string" || !text.trim()) return { ok: false, why: "text must be a non-empty string" };
	if (text.length > 20000) return { ok: false, why: "text is over 20000 characters" };
	try {
		const t0 = Date.now();
		const stages = {};
		const [result, runs] = await RefineCall.collect(async () => {
			const call = stage => (p, o) => RefineCall.run(p, { ...o, stage });
			const t_clean = Date.now();
			const c = await clean(text, { call: call("clean"), model });
			stages.clean_ms = Date.now() - t_clean;
			const t_next = Date.now();
			const [s, clar] = await Promise.all([
				structure(c.sentences, { call: call("structure"), model }).then(r => (stages.structure_ms = Date.now() - t_next, r)),
				ClarityScorer.score(c.sentences, { model: clarity_model }).then(r => (stages.clarity_ms = Date.now() - t_next, r)),
			]);
			return { c, s, clar };
		});
		return {
			ok: true, ms: Date.now() - t0, stages, clean: result.c, structure: result.s, clarity: result.clar,
			runs: runs.map(r => ({ stage: r.stage, model: r.model, session_id: r.session_id, cost_usd: r.cost_usd, duration_ms: r.duration_ms, tokens: r.tokens })),
		};
	} catch (e){
		return { ok: false, why: String(e?.message ?? e) };
	}
}

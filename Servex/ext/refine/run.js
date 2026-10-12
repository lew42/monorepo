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
import Annotator from "./Annotator.js";
import Outline from "../../../public/framework/ext/Refine/Outline.js";
import TagRouter from "./TagRouter.js";
import PromptLog from "../../../public/framework/ai/AISession/PromptLog.js";

const MODEL = "claude-sonnet-5-5";   // measured fastest of the cheap models that do the job: doc/refine-v3-2026-10-09.md

/* With `session` (a Claude session uuid) the prompt is also kept in that session's own log
 * (ai/AISession/PromptLog.js): raw first and untouched, then the clean sentences set as final, then
 * the refined cards citing sentence indexes, then the Haiku notes (clarity, alternates, names, tags).
 * Logging never fails the refine: a refusal comes back as `log_error`. */
export async function run_refine({ text, model = MODEL, clarity_model = "claude-haiku-5-5", session = "", prompt = "", source = "typed", inbox = null } = {}){
	if (typeof text !== "string" || !text.trim()) return { ok: false, why: "text must be a non-empty string" };
	if (text.length > 20000) return { ok: false, why: "text is over 20000 characters" };
	try {
		const t0 = Date.now();
		const stages = {};
		const id = session ? (prompt || PromptLog.new_id()) : "";
		const log_errors = [];
		let tag_notes = null;
		const log = async line => { if (id) try { await PromptLog.add(session, { prompt: id, ...line }, "refine"); } catch (e){ log_errors.push(String(e.message ?? e)); } };
		await log({ stage: "raw", text, source });
		const [result, runs] = await RefineCall.collect(async () => {
			const call = stage => (p, o) => RefineCall.run(p, { ...o, stage });
			const t_clean = Date.now();
			const c = await clean(text, { call: call("clean"), model });
			stages.clean_ms = Date.now() - t_clean;
			await log({ stage: "clean", sentences: c.sentences.map(x => x.text), final: true });
			const t_next = Date.now();
			const [s, clar, notes] = await Promise.all([
				structure(c.sentences, { call: call("structure"), model }).then(r => (stages.structure_ms = Date.now() - t_next, r)),
				ClarityScorer.score(c.sentences, { model: clarity_model }).then(r => (stages.clarity_ms = Date.now() - t_next, r)),
				id ? Annotator.annotate(c.sentences.map(x => x.text)).then(r => (stages.notes_ms = Date.now() - t_next, r)) : [],
			]);
			if (id){
				const parsed = Outline.parse(s?.md ?? "");
				await log({ stage: "refined", subject: parsed.subject, cards: Outline.indexes(parsed.sections) });
				const by = new Map(notes.map(n => [n.i, n]));
				const rows = c.sentences.map((x, i) => {
					const cl = clar.find(k => k.n === x.n);
					return { i, clarity: cl?.clarity ?? null, why: cl?.why ?? "", alternates: by.get(i)?.alternates ?? [], names: by.get(i)?.names ?? [], tags: by.get(i)?.tags ?? [] };
				});
				await log({ stage: "notes", notes: rows });
				if (inbox) try { tag_notes = new TagRouter({ inbox }).route({ session, prompt: id, notes: rows }); } catch (e){ log_errors.push("tag notes: " + String(e.message ?? e)); }
			}
			return { c, s, clar, notes };
		});
		return {
			ok: true, ms: Date.now() - t0, stages, ...(id ? { prompt: id, session, log_errors, tag_notes } : {}), clean: result.c, structure: result.s, clarity: result.clar, ...(id ? { notes: result.notes } : {}),
			runs: runs.map(r => ({ stage: r.stage, model: r.model, session_id: r.session_id, cost_usd: r.cost_usd, duration_ms: r.duration_ms, tokens: r.tokens })),
		};
	} catch (e){
		return { ok: false, why: String(e?.message ?? e) };
	}
}

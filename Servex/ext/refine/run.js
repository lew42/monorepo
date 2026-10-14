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
import VoicePage from "./VoicePage.js";
import LiveClean from "./LiveClean.js";
import PromptLog from "../../../public/framework/ai/AISession/PromptLog.js";


/* ONE CALL FOR THE BUTTONS AND ECHO (voice-dedupe, 2026-10-13): the Refine buttons reach this through /api/refine;
 * `Servex/agents/Echo.js` calls it too, with `call` (a `stage => (prompt, opts) => answer` factory, so Echo can run
 * local-first and total its cost), `by` (the page writer's name) and `light: true` (raw, clean, structured, then done:
 * no PromptLog lines, no clarity scores, no notes call). The page shows the same stages either way.
 *
 * With `session` (a Claude session uuid) the prompt is also kept in that session's own log
 * (ai/AISession/PromptLog.js): raw first and untouched, then the clean sentences set as final, then
 * the refined cards citing sentence indexes, then the Haiku notes (clarity, alternates, names, tags).
 * Logging never fails the refine: a refusal comes back as `log_error`. */
export async function run_refine({ text, model = RefineCall.model(), clarity_model = RefineCall.model(), session = "", prompt = "", source = "typed", inbox = null, clean_live = false, call: make_call = null, light = false, by: writer } = {}){
	if (typeof text !== "string" || !text.trim()) return { ok: false, why: "text must be a non-empty string" };
	if (text.length > 20000) return { ok: false, why: "text is over 20000 characters" };
	let voice = null;   // outside the try so the catch can mark a generated prompt id as failed too
	try {
		const t0 = Date.now();
		const stages = {};
		const id = session ? (prompt || PromptLog.new_id()) : "";
		const notes_wanted = !!id && !light;
		const log_errors = [];
		let tag_notes = null;
		// Each stage is also written onto the session's page as it lands (VoicePage.js), so a tab watching it sees raw -> cards live.
		voice = id ? VoicePage.get(session, id, writer) : null;
		const page = work => voice ? work(voice).catch(e => log_errors.push("page: " + String(e.message ?? e))) : null;
		await page(v => v.raw(text, { final: true, source }));
		const log = async line => { if (notes_wanted) try { await PromptLog.add(session, { prompt: id, ...line }, "refine"); } catch (e){ log_errors.push(String(e.message ?? e)); } };
		await log({ stage: "raw", text, source });
		const [result, runs] = await RefineCall.collect(async () => {
			const call = make_call ?? (stage => (p, o) => RefineCall.run(p, { ...o, stage }));
			const spent = stage => +(RefineCall.sink ?? []).filter(r => r.stage === stage).reduce((a, r) => a + r.cost_usd, 0).toFixed(5);   // measured, from the calls so far
			const t_clean = Date.now();
			// clean_live (opt-in): one small Haiku call per sentence, each landing on the page as it returns; costs more than one call (LiveClean.js).
			const c = clean_live
				? await LiveClean.run(text, { call: call("clean"), model: clarity_model, on_sentence: (sentences, done, total) => page(v => v.clean(sentences, { final: false, cost: spent("clean") })) })
				: await clean(text, { call: call("clean"), model });
			stages.clean_ms = Date.now() - t_clean;
			await log({ stage: "clean", sentences: c.sentences.map(x => x.text), final: true });
			await page(v => v.clean(c.sentences.map(x => x.text), { ms: stages.clean_ms, cost: spent("clean") }));
			const t_next = Date.now();
			const [s, clar, notes] = await Promise.all([
				structure(c.sentences, { call: call("structure"), model }).then(async r => (stages.structure_ms = Date.now() - t_next, await page(v => v.structured(r?.md ?? "", { ms: stages.structure_ms, cost: spent("structure") })), r)),
				light ? [] : ClarityScorer.score(c.sentences, { model: clarity_model }).then(r => (stages.clarity_ms = Date.now() - t_next, r)),
				notes_wanted ? Annotator.annotate(c.sentences.map(x => x.text)).then(r => (stages.notes_ms = Date.now() - t_next, r)) : [],
			]);
			if (light && id){
				await page(v => v.notes([], { ms: 0 }));
				voice?.done();
			} else if (id){
				const parsed = Outline.parse(s?.md ?? "");
				await log({ stage: "refined", subject: parsed.subject, cards: Outline.indexes(parsed.sections) });
				const by = new Map(notes.map(n => [n.i, n]));
				const rows = c.sentences.map((x, i) => {
					const cl = clar.find(k => k.n === x.n);
					return { i, clarity: cl?.clarity ?? null, why: cl?.why ?? "", alternates: by.get(i)?.alternates ?? [], names: by.get(i)?.names ?? [], tags: by.get(i)?.tags ?? [] };
				});
				await log({ stage: "notes", notes: rows });
				await page(v => v.notes(rows, { ms: Math.max(stages.clarity_ms ?? 0, stages.notes_ms ?? 0) }));
				voice?.done();
				if (inbox) try { tag_notes = new TagRouter({ inbox }).route({ session, prompt: id, notes: rows }); } catch (e){ log_errors.push("tag notes: " + String(e.message ?? e)); }
			}
			return { c, s, clar, notes };
		});
		return {
			ok: true, ms: Date.now() - t0, stages, ...(id ? { prompt: id, session, log_errors, tag_notes } : {}), clean: result.c, ...(result.c.live ? { clean_live: result.c.live } : {}), structure: result.s, clarity: result.clar, ...(id ? { notes: result.notes } : {}),
			runs: runs.map(r => ({ stage: r.stage, model: r.model, session_id: r.session_id, cost_usd: r.cost_usd, duration_ms: r.duration_ms, tokens: r.tokens })),
		};
	} catch (e){
		voice?.failed(e?.message ?? e).catch(() => {});
		return { ok: false, why: String(e?.message ?? e) };
	}
}

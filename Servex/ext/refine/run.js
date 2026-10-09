/* run.js — the model calls behind the live demo on /framework/ext/Refine/.
 *
 * One function, no new pipeline (CLAUDE.md law 6): it runs the SAME `clean()` (engine.js) and
 * `structure()` (structure.js) Echo and the prompt-log processor run, once each, on one prompt,
 * and hands back plain data. The browser's `Prompt` class (ext/Refine/Prompt.js) turns that data
 * into numbered sentences, cards, scores and flags. `structure()` is Node-only, which is the only
 * reason this is a route instead of a browser import. */
import { clean } from "../../../public/framework/ext/Refine/engine.js";
import { structure } from "../../../public/framework/ext/Refine/structure.js";

export async function run_refine({ text } = {}){
	if (typeof text !== "string" || !text.trim()) return { ok: false, why: "text must be a non-empty string" };
	if (text.length > 20000) return { ok: false, why: "text is over 20000 characters" };
	try {
		const t0 = Date.now();
		const c = await clean(text);
		const s = await structure(c.sentences);
		return { ok: true, ms: Date.now() - t0, clean: c, structure: s };
	} catch (e){
		return { ok: false, why: String(e?.message ?? e) };
	}
}

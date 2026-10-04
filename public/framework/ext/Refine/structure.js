/* structure.js — every cleaned sentence placed under a heading, checked by code.
 *
 * A sibling file to `engine.js` (the brief's own call: "a new file, plain ESM... or a
 * sibling structure.js if that reads cleaner — your call") rather than one more export
 * crammed into `engine.js`: `clean()` is the thing EVERY caller needs (Dictate, the
 * prompt-log processor, the litmus test); `structure()` is a second, separate model call
 * only the prompt-log processor needs so far (grouping a whole prompt's sentences into a
 * card). Keeping them in separate files means a caller that only wants `clean()` never
 * has to think about this one.
 *
 * REUSE, NOT A SECOND PROMPT (law 6): the actual wording that tells a model how to turn
 * numbered sentences into an outline already exists — `Server/refine.mjs`'s own
 * `structuredPromptDefault()`, used by its own `--models` drafting step. This file does
 * not rewrite that prompt; it dynamically `import()`s it (Node only — see below) and
 * sends the exact same text.
 *
 * structure(sentences, { call, cwd, model }) -> { ok: true, md } or { ok: false, missing, duplicated, md }
 *   sentences — the SAME [{n, text}] array `clean()` returns.
 *   call      — optional (prompt, {model, cwd}) => {answer, cost_usd}, same shape as
 *               `askOnce` — the same injection point `clean()` uses, for the same reason
 *               (the litmus test, or any other caller that wants a different model).
 *   model     — defaults to `claude-sonnet-5` (the brief: "wording asks correctly matters
 *               more here" is `Server/refine.mjs`'s own reasoning for pinning this rung to
 *               Sonnet by default — see its `RUNGS` table).
 *
 * The check (deliverable 3's actual point): every sentence number S1..Sn must appear in
 * the model's outline EXACTLY once. Fewer than once ("missing") is a real idea the model
 * silently dropped — "the whole run fails loudly," per the brief, rather than returning a
 * card that quietly lost something. More than once ("duplicated") means the same sentence
 * got cited under two different headings, which `structuredPromptDefault()`'s own rules
 * already say never to do — also reported, not silently ignored.
 *
 * This is Node-only for now (no caller needs it live in a browser yet — see `ext/Refine/
 * refine-engine.md`'s "what's left" note); calling it without `{call}` in a browser throws
 * a clear error rather than silently doing nothing, which is the sanctioned failure mode
 * the brief itself names for this function ("throw / return {ok:false, ...}"). */

const isNode = typeof window === "undefined";

// Same small range-expanding citation scanner `Server/refine.mjs`'s own `coverage.md`
// builder uses (`citationsIn()`) — duplicated, not imported, because `refine.mjs` has
// top-level `node:fs`/`node:child_process` imports that would break this file as soon as
// a browser loaded it even once (consistent with `engine.js`'s own note on the same
// choice). This one also COUNTS each citation, because deliverable 3 needs "exactly
// once," not just "at least once."
const RANGE_RE = /\bS(\d+)\s*[-–]\s*S(\d+)\b/g;
function countCitations(text){
	const counts = new Map();
	const bump = n => counts.set(n, (counts.get(n) || 0) + 1);
	for (const m of text.matchAll(RANGE_RE)){
		const a = Number(m[1]), b = Number(m[2]);
		for (let n = Math.min(a, b); n <= Math.max(a, b); n++) bump(n);
	}
	for (const m of text.replace(RANGE_RE, " ").matchAll(/\bS(\d+)\b/g)) bump(Number(m[1]));
	return counts;
}

export async function structure(sentences, { call, cwd, model } = {}){
	if (!Array.isArray(sentences) || !sentences.length) return { ok: true, md: "" };

	let promptText, theCall = call, useModel = model || "claude-sonnet-5";
	if (isNode){
		// Dynamic import, not static — see engine.js's identical note: this must never be
		// resolved at all when a browser loads this module, only when this function actually
		// runs on Node.
		const mod = await import("../../../../Server/refine.mjs");
		promptText = mod.structuredPromptDefault(sentences);
		if (!theCall){
			const { askOnce } = await import("../../../../Server/ask-each.mjs");
			theCall = askOnce;
		}
	} else if (!theCall){
		throw new Error("structure(): no model caller available in the browser yet — pass { call }");
	} else {
		// A caller-supplied `call` with its own browser-side transport could still build the
		// prompt itself and skip straight to a result — but every known caller today is
		// Node-side, so that path isn't built; documented here rather than silently guessed at.
		throw new Error("structure(): running in a browser needs its own prompt source too — not built yet, see this file's doc comment");
	}

	const r = await theCall(promptText, { model: useModel, cwd: cwd || (isNode ? process.cwd() : undefined) });
	const md = (r.answer ?? "").trim() + "\n";

	const counts = countCitations(md);
	const missing = sentences.map(s => s.n).filter(n => !counts.has(n));
	const duplicated = [...counts.entries()].filter(([, c]) => c > 1).map(([n]) => n);

	if (missing.length || duplicated.length) return { ok: false, missing, duplicated, md };
	return { ok: true, md, missing: [], duplicated: [] };
}

export default structure;

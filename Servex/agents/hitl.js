import { query } from "@anthropic-ai/claude-agent-sdk";

/* HITL — the smart assistant's two small model calls for the human-in-the-loop
 * chat (owner's words: per-sentence purpose + ambiguity marks, and title
 * rename suggestions). Same minimal no-tools Sonnet call as `tidy.js` — see
 * that file's own comment for why these options keep the prefix ~800 tokens
 * instead of ~51k. `run_query` is swappable so a proof (or a test) can fake
 * the model call. */

const MODEL = "claude-sonnet-5";

const MARKS_SYSTEM = `You read sentences from a dictation transcript, one at a time, and decide the OBJECTIVE of each one.

For EVERY sentence, in order, return one entry:
- "purpose": one short line saying what the sentence is FOR (a request, an observation, a decision, a comment, a question, an aside, ...).
- "mark": "ok" if the sentence's meaning is reasonably clear, "unclear" only if it is genuinely ambiguous and a reasonable reader could take it two different ways.

Be LENIENT: comments, asides and observations are "ok" even when informal or vague — "unclear" is for a real fork in meaning, not for casual phrasing.

When "mark" is "unclear", also return "question": {"ask": "Did you mean this or that?", "options": ["reading A", "reading B"]} — two concrete, specific readings, not generic ones.

Return ONLY a JSON object, no commentary, no code fence:
{"marks":[{"i":0,"mark":"ok","purpose":"..."},{"i":1,"mark":"unclear","purpose":"...","question":{"ask":"...","options":["...","..."]}}]}`;

const RENAME_SYSTEM = `You suggest alternative titles for one thing the person is naming (a card, a title, a heading).

Given the CURRENT title (and optional context about what it names), suggest exactly five short, distinct, self-evident alternative titles — none of them the current title, none of them near-duplicates of each other.

Return ONLY a JSON object, no commentary, no code fence:
{"names":["Alt one","Alt two","Alt three","Alt four","Alt five"]}`;

/* Strip a ```json fence``` (or a bare ```` fence) a model wraps its JSON in,
 * then JSON.parse — throws on genuinely broken JSON, which callers catch. */
function parse_json(raw){
	const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
	return JSON.parse(stripped);
}

// Same minimal options `tidy.js` uses — see its comment for why.
async function ask(system, prompt, run_query){
	const t0 = Date.now();
	let out = "";
	for await (const m of run_query({ prompt, options: {
		model: MODEL, tools: [], mcpServers: {}, strictMcpConfig: true, skills: [],
		settingSources: [], maxTurns: 1, persistSession: false,
		extraArgs: { "disable-slash-commands": null },
		systemPrompt: system
	} })){
		if (m.type === "result") out = m.result ?? out;
		else if (m.type === "assistant") out = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || out;
	}
	return { out, ms: Date.now() - t0 };
}

function with_context(context, body){
	return (typeof context === "string" && context.trim() ? `Context: ${context.trim()}\n\n` : "") + body;
}

/* {sentences:[string], context?} -> {ok:true, marks:[{i, mark, purpose, question?}], model, ms} or {ok:false, why}. */
export async function marks({ sentences, context } = {}, { run_query = query } = {}){
	if (!Array.isArray(sentences) || !sentences.every(s => typeof s === "string"))
		return { ok: false, why: "sentences must be an array of strings" };
	if (!sentences.length) return { ok: true, marks: [], model: MODEL, ms: 0 };

	const prompt = with_context(context, `Sentences:\n${sentences.map((s, i) => `${i}: ${s}`).join("\n")}`);

	let out, ms;
	try { ({ out, ms } = await ask(MARKS_SYSTEM, prompt, run_query)); }
	catch (e){ return { ok: false, why: String(e.message || e) }; }

	let parsed;
	try { parsed = parse_json(out); }
	catch (e){ return { ok: false, why: `parse failed: ${String(e.message || e)}` }; }
	if (!Array.isArray(parsed?.marks)) return { ok: false, why: "no marks array in model reply" };

	return { ok: true, marks: parsed.marks, model: MODEL, ms };
}

/* {title, context?} -> {ok:true, names:[5 strings], model, ms} or {ok:false, why}. */
export async function rename({ title, context } = {}, { run_query = query } = {}){
	if (typeof title !== "string" || !title.trim()) return { ok: false, why: "title must be a non-empty string" };

	const prompt = with_context(context, `Current title: ${title.trim()}`);

	let out, ms;
	try { ({ out, ms } = await ask(RENAME_SYSTEM, prompt, run_query)); }
	catch (e){ return { ok: false, why: String(e.message || e) }; }

	let parsed;
	try { parsed = parse_json(out); }
	catch (e){ return { ok: false, why: `parse failed: ${String(e.message || e)}` }; }
	if (!Array.isArray(parsed?.names) || parsed.names.length !== 5 || !parsed.names.every(n => typeof n === "string"))
		return { ok: false, why: "no five-name array in model reply" };

	return { ok: true, names: parsed.names, model: MODEL, ms };
}

const OPS = { marks, rename };

/* {op, ...} -> dispatches to the named op above by `op`. Unknown op: {ok:false, why}. */
export async function hitl(body = {}, { run_query = query } = {}){
	const op = OPS[body?.op];
	if (!op) return { ok: false, why: `unknown op "${body?.op}"` };
	return op(body, { run_query });
}

export default hitl;

/* run.js — the model call behind the "Try it" tab on /framework/ext/Refine/
 * (public/framework/ai/2026-10-04/clean-test-page/requirements.md).
 *
 * THE JOB: run the SAME `clean()` Echo runs (`public/framework/ext/Refine/engine.js`)
 * against whichever model the owner picks in the dropdown — a local gguf file, a cheap
 * OpenRouter model, or Haiku — so "try it" shows exactly what Echo would have produced,
 * never a second copy of the clean prompt (law 6: one clean prompt, not two).
 *
 * HOW: `clean(text, {call, model})` already takes a swappable `call` function instead of
 * its own default (`Server/ask-each.mjs`'s `askOnce`, which only ever reaches real
 * Anthropic) — see engine.js's own doc comment on `call`. This file's `call` sends the
 * exact same combined prompt `clean()` builds to one of two plain HTTP endpoints instead:
 *   - a local gguf file, through Servex's own local proxy (`Servex/ext/local/provider.js`,
 *     port 8998) — the same proxy `local_chat()` and the Echo local-first trial both use.
 *   - a cheap OpenRouter model (or Haiku, also reached through OpenRouter — the new-brain
 *     eval that produced the brief's 7-10/10 numbers already priced Haiku this way, as
 *     "anthropic/claude-haiku-4.5": one provider, one real cost field, for every model
 *     that isn't local) — the same `/v1/chat/completions` call this repo's own eval
 *     harness makes (`public/framework/ai/2026-10-03/new-brain/harness.mjs`'s
 *     `callModel()`), reused here rather than re-derived, including its one real cost
 *     source: OpenRouter's own `usage.cost` on the response (never the SDK's
 *     `total_cost_usd`, which `ext/openrouter/provider.js`'s readme explains is wrong for
 *     a proxied call).
 *
 * No new provider code: this file is the "smallest route needed" the brief asked for —
 * it only wires the two providers that already exist to the one clean() this repo
 * already has. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clean } from "../../../public/framework/ext/Refine/engine.js";
import { read_key, spend_guard } from "../openrouter/provider.js";
import { is_local_model, slug_of, available_models, LOCAL_PROXY_PORT } from "../local/provider.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* The owner's test set lives beside the model it tests, not in a global /data/ folder
 * (memory note "data lives with its page") — ext/Refine's own fixture/ dir, next to the
 * hand-built fixture Refine.js already reads. */
const EXAMPLES_FILE = path.join(HERE, "../../../public/framework/ext/Refine/fixture/clean-examples.jsonl");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/* "3-4 cheap OpenRouter ones" (requirements.md item 1) — the same slugs the new-brain
 * eval already scored (eval-results.json, eval-results-sweep.json, 2026-10-03/04):
 * DeepSeek v4.1 flash and Ling 3.0 flash both scored 10/10 on refining the owner's own
 * prompts, so they lead the list; Gemini and GPT-6 Luna are the other two cheap runs
 * that eval already has real numbers for. Haiku is its own entry, kept separate from
 * this list (deliverable 1 names it on its own) though it is reached the same way. */
export const CHEAP_OPENROUTER_MODELS = [
	"deepseek/deepseek-v4.1-flash",
	"inclusionai/ling-3.0-flash-vl",
	"google/gemini-3.8-flash",
	"openai/gpt-6-luna",
];
export const HAIKU_MODEL = "anthropic/claude-haiku-4.5";

/* The dropdown's whole list: every local model file that actually exists on this
 * machine right now (same live check `local/page.js`'s own picker uses), then the
 * cheap OpenRouter set, then Haiku last. */
export function model_choices(){
	return [...available_models().map(slug => `local/${slug}`), ...CHEAP_OPENROUTER_MODELS, HAIKU_MODEL];
}

/* One HTTP call, local or OpenRouter — the two provider halves this repo already has,
 * nothing new. Returns {answer, cost_usd, ms}; throws on a transport or HTTP failure
 * (clean()'s own nodeCall lets that propagate, same as a direct askOnce failure would). */
async function model_reply(model, prompt){
	const t0 = Date.now();
	if (is_local_model(model)){
		const res = await fetch(`http://127.0.0.1:${LOCAL_PROXY_PORT}/v1/chat/completions`, {
			method: "POST", headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ model: slug_of(model), messages: [{ role: "user", content: prompt }], temperature: 0.1 }),
		});
		if (!res.ok) throw new Error(`local proxy answered ${res.status}: ${await res.text()}`);
		const data = await res.json();
		return { answer: data.choices?.[0]?.message?.content ?? "", cost_usd: 0, ms: Date.now() - t0 };
	}

	const guard = spend_guard();
	if (!guard.ok) throw new Error(guard.reason);

	const key = read_key();
	const res = await fetch(OPENROUTER_URL, {
		method: "POST", signal: AbortSignal.timeout(60000),
		headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json",
			"HTTP-Referer": "https://lew42.com", "X-Title": "Lew42 Clean — Try it" },
		body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.1, usage: { include: true } }),
	});
	if (!res.ok) throw new Error(`OpenRouter answered ${res.status}: ${await res.text()}`);
	const data = await res.json();
	const cost_usd = typeof data.usage?.cost === "number" ? data.usage.cost : 0;
	return { answer: data.choices?.[0]?.message?.content ?? "", cost_usd, ms: Date.now() - t0 };
}

/* {text, model} -> {ok:true, model, text, sentences, strikes, misheard, flags, cost_usd, ms}
 * or {ok:false, why}. `text`/`sentences`/`strikes`/`misheard`/`flags` are exactly clean()'s
 * own return shape — the "Try it" page reads them the same way Refine.js's own ladder does. */
export async function run_clean({ text, model } = {}){
	if (typeof text !== "string" || !text.trim()) return { ok: false, why: "text must be a non-empty string" };
	if (typeof model !== "string" || !model.trim()) return { ok: false, why: "model is required" };
	if (!model_choices().includes(model)) return { ok: false, why: `unknown model ${JSON.stringify(model)}` };

	let cost_usd = 0, ms = 0;
	const call = async prompt => {
		const r = await model_reply(model, prompt);
		cost_usd = r.cost_usd; ms = r.ms;
		return { answer: r.answer, cost_usd: r.cost_usd };
	};

	try {
		const result = await clean(text, { call, model });
		return { ok: true, model, ...result, cost_usd, ms };
	} catch (e){ return { ok: false, why: String(e.message || e), model }; }
}

/* THE EXAMPLE SET (owner addition, 2026-10-04: "that turns the owner's picks into the
 * test set"). One line per example: {at, raw, good, notes, verdict}. `verdict` is
 * "good" (this IS the clean text to aim for) or "dont" (a wrong clean, kept so a future
 * model can be checked against the SAME mistake, not just the right answer). Appended
 * with the exact newline-sniffed, re-verified pattern every other hand-made JSONL
 * fixture in this repo uses (Server/decide.mjs's `append()`, copied here rather than
 * imported — that file is a CLI script, not a module meant for another process to
 * import) — never a hand-built JSON string. */
export function list_examples(){
	let text;
	try { text = fs.readFileSync(EXAMPLES_FILE, "utf8"); } catch { return []; }
	return text.split(/\r?\n/).filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

export function save_example({ raw, good, notes, verdict } = {}){
	if (typeof raw !== "string" || !raw.trim()) return { ok: false, why: "raw must be a non-empty string" };
	if (typeof good !== "string" || !good.trim()) return { ok: false, why: "good must be a non-empty string" };
	if (verdict !== "good" && verdict !== "dont") return { ok: false, why: `verdict must be "good" or "dont", got ${JSON.stringify(verdict)}` };

	const line = { at: new Date().toISOString(), raw: raw.trim(), good: good.trim(), notes: String(notes ?? "").trim(), verdict };
	fs.mkdirSync(path.dirname(EXAMPLES_FILE), { recursive: true });
	let out = JSON.stringify(line) + "\n";
	if (fs.existsSync(EXAMPLES_FILE) && fs.statSync(EXAMPLES_FILE).size > 0){
		const fd = fs.openSync(EXAMPLES_FILE, "r"), buf = Buffer.alloc(1);
		fs.readSync(fd, buf, 0, 1, fs.statSync(EXAMPLES_FILE).size - 1); fs.closeSync(fd);
		if (buf[0] !== 0x0a) out = "\n" + out;
	}
	fs.appendFileSync(EXAMPLES_FILE, out, "utf8");

	const bad = fs.readFileSync(EXAMPLES_FILE, "utf8").split(/\r?\n/).filter(l => l.trim())
		.filter(l => { try { JSON.parse(l); return false; } catch { return true; } });
	if (bad.length) return { ok: false, why: `appended, but the file now has ${bad.length} unparseable line(s)` };

	return { ok: true, examples: list_examples() };
}

export default run_clean;

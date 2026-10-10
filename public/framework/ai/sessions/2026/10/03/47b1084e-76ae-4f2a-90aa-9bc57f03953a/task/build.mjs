// build.mjs — the prompt-review data pipeline.
// Reuses ext/Refine's engine.js (clean) and structure.js (structure) rather than writing a
// second cleaning pass (law 6). Pure Node script: no Claude Code agent needed to run it —
// it hits the same model-call helper (Server/ask-each.mjs's askOnce) clean()/structure()
// already use, so a cheap minion's whole job here is just "run this with your assigned
// model" and report the cost this script already totals for you.
//
// Usage:
//   node build.mjs <startIdx> <endIdx> <model> <outFile>
// startIdx/endIdx are 0-based positions into TODAY's prompts (2026-10-02 local), inclusive.
// Writes a JSON array of Prompt items to <outFile>. Does NOT touch the live page — a
// separate commit step (commit.mjs) does that, after comparison/review.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { clean } from "../../../ext/Refine/engine.js";
import { structure } from "../../../ext/Refine/structure.js";

// Refine.js's `parse_structured`/`parse_cites` are pure text parsers, but the file that
// exports them also imports core/View's `app.js` (DOM-only — `Element` doesn't exist in
// plain Node), so importing it here crashes before parsing a single line. Inlined verbatim
// from Refine.js (same source, 2026-10-02) rather than fixed upstream — that file is outside
// this task's fence and the fix (splitting the pure parsers into their own file) is a
// separate, small cleanup logged in this task's log, not blocking this pipeline.
function parse_cites(text) {
	const m = text.match(/\[(S\d+(?:\s*[-–]\s*S?\d+)?(?:\s*,\s*S?\d+(?:\s*[-–]\s*S?\d+)?)*)\]\s*$/);
	if (!m) return { text: text.trim(), cites: [], label: "" };
	const cites = [];
	m[1].split(",").forEach(part => {
		const range = part.trim().match(/^S?(\d+)\s*[-–]\s*S?(\d+)$/);
		if (range) {
			const [lo, hi] = [Number(range[1]), Number(range[2])].sort((a, b) => a - b);
			for (let n = lo; n <= hi; n++) cites.push(n);
			return;
		}
		const single = part.trim().match(/^S?(\d+)$/);
		if (single) cites.push(Number(single[1]));
	});
	return { text: text.slice(0, m.index).trim(), cites, label: m[1].replace(/\s+/g, "") };
}
function parse_structured(md) {
	const sections = [];
	let current = null;
	const start_default = () => { current = { title: "", bullets: [] }; sections.push(current); };
	for (const line of (md || "").split(/\r?\n/)) {
		const h = line.match(/^##\s+(.+)$/);
		if (h) { current = { title: h[1].trim(), bullets: [] }; sections.push(current); continue; }
		const b = line.match(/^[-*]\s+(.+)$/);
		if (b) {
			if (!current) start_default();
			current.bullets.push(parse_cites(b[1]));
		}
	}
	return sections;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../../../../");
const TRANSCRIPT = path.join(REPO_ROOT, "public/framework/ai/sessions/transcripts/361c4d18-e878-4c04-9537-444e847e13d5.json");

const [, , startS, endS, model, outFile] = process.argv;
const start = Number(startS), end = Number(endS);
if (!outFile || Number.isNaN(start) || Number.isNaN(end)) {
	console.error("usage: node build.mjs <startIdx> <endIdx> <model> <outFile>");
	process.exit(1);
}

// local date = UTC-5 (the owner's offset in this transcript); "today" = 2026-10-02.
function localDate(iso) {
	const t = new Date(iso).getTime() - 5 * 3600 * 1000;
	return new Date(t).toISOString().slice(0, 10);
}

// Harness-injected lines, not the owner's own words — found by smoke-testing index 0, which
// turned out to be a whole continuation-summary block, not a prompt (logged in task.jsonl):
// a resumed-session recap, a slash command's own echo, and a file-opened notice. These never
// came from the owner's mouth, so "every owner prompt" excludes them.
function is_owner_prompt(text) {
	if (text.startsWith("This session is being continued")) return false;
	if (/^<(local-command-caveat|command-name|local-command-stdout|ide_opened_file|task-notification)/.test(text.trim())) return false;
	return true;
}

const transcript = JSON.parse(fs.readFileSync(TRANSCRIPT, "utf8"));
const todays = transcript.prompts.filter(p => localDate(p.at) === "2026-10-02" && is_owner_prompt(p.text));

// A short, hand-built list stands in for a live module census (ok for v1 — flagged in
// the task log as a thing to replace with readme_modules()-driven detection later).
const KNOWN_TAGS = [
	"Page", "Dictate", "Servex", "Refine", "Echo", "AITask", "Task", "Panel2", "Panel",
	"LiveList", "Item", "List", "Inbox", "AI2", "AI 2", "Sessions", "Mention", "JSONL",
	"Layout", "DesignTool", "Grip", "Columns", "Models", "OpenRouter", "Dashboard",
];

function mechanical_tags(text) {
	const found = [];
	for (const name of KNOWN_TAGS) {
		const re = new RegExp(`\\b${name.replace(/\s+/g, "\\s+")}\\b`, "i");
		if (re.test(text)) found.push(`#${name.replace(/\s+/g, "")}`);
	}
	return found.length ? found.slice(0, 2) : ["#General"];
}

function first_words(text, n = 12) {
	const words = text.trim().split(/\s+/).slice(0, n);
	return words.join(" ") + (text.trim().split(/\s+/).length > n ? "…" : "");
}

async function run() {
	let cost_usd = 0;
	const askEachUrl = pathToFileURL(path.join(REPO_ROOT, "Server/ask-each.mjs")).href;
	const { askOnce } = await import(askEachUrl);
	const providerUrl = pathToFileURL(path.join(REPO_ROOT, "Servex/ext/openrouter/provider.js")).href;
	const { env_for, provider_for } = await import(providerUrl);
	// A model id with a "/" (deepseek/..., google/..., openai/...) is an OpenRouter slug —
	// askOnce's query() only ever talks to "the Anthropic API" url shape, so it needs the
	// base-url+key swap or an OpenRouter model 400s as an unknown Anthropic model (found by
	// smoke-testing this script on one real prompt before trusting it to a minion batch).
	const isOpenRouter = provider_for(model) === "openrouter";
	const extraEnv = isOpenRouter ? env_for("openrouter") : {};
	const costCall = async (prompt, opts) => {
		const r = await askOnce(prompt, { ...opts, env: { ...extraEnv, ...(opts.env || {}) } });
		cost_usd += r.cost_usd || 0; // unreliable for OpenRouter models — see real_cost_usd below
		return r;
	};
	// provider.js's own doc caveat: the SDK's total_cost_usd prices an OpenRouter turn off
	// Anthropic's table under the wrong model name — the smoke test on this exact script
	// showed $1.25 for two short prompts on DeepSeek, obviously wrong. key_usage() before/
	// after is OpenRouter's own honest running total for the key, so that diff is what this
	// script reports as real_cost_usd; cost_usd above is kept only as a rough same-run signal.
	let usage_before = null;
	if (isOpenRouter) {
		const { key_usage, read_key } = await import(providerUrl);
		try { usage_before = await key_usage(read_key()); } catch { usage_before = null; }
	}

	const items = [];
	for (let i = start; i <= end && i < todays.length; i++) {
		const p = todays[i];
		let c;
		try {
			c = await clean(p.text, { model, call: costCall });
		} catch (e) {
			items.push({ index: i, at: p.at, error: `clean failed: ${e.message}`, raw: p.text });
			continue;
		}
		let sections = [], structure_error = null;
		try {
			const s = await structure(c.sentences, { model, call: costCall });
			if (s.ok) sections = parse_structured(s.md);
			else structure_error = `not ok: missing=${JSON.stringify(s.missing)} duplicated=${JSON.stringify(s.duplicated)}`;
		} catch (e) {
			// structure is a nice-to-have on top of clean; a failure here still leaves raw+clean usable.
			structure_error = e.message;
		}
		const bullets = sections.flatMap(sec => sec.bullets.map(b => b.text)).slice(0, 4);
		const title = sections[0]?.title || first_words(c.text || p.text);
		items.push({
			index: i,
			at: p.at,
			raw: p.text,
			clean: c.sentences,
			structure: sections,
			structure_error,
			title,
			bullets: bullets.length ? bullets : [first_words(c.text || p.text, 20)],
			tags: mechanical_tags(c.text || p.text),
			flags: c.flags || [],
			strikes: c.strikes || [],
			misheard: c.misheard || [],
			model,
		});
	}

	let real_cost_usd = null;
	if (isOpenRouter && usage_before != null) {
		// Billing settles a few seconds after a turn ends (provider.js's own real_turn_cost
		// waits on this) — a read taken right at the last call would undercount.
		await new Promise(r => setTimeout(r, 5000));
		const { key_usage, read_key } = await import(providerUrl);
		try { real_cost_usd = Math.max(0, (await key_usage(read_key())) - usage_before); } catch { real_cost_usd = null; }
	}

	fs.writeFileSync(outFile, JSON.stringify({ model, start, end, cost_usd, real_cost_usd, items }, null, 2));
	console.log(JSON.stringify({ ok: true, model, count: items.length, cost_usd, real_cost_usd }));
}

run().catch(e => { console.error(JSON.stringify({ ok: false, error: e.message })); process.exit(1); });

#!/usr/bin/env node
/**
 * The session-audit experiment (plan.md, decision 4): three ways to find what one owner prompt asked and what came of it,
 * scored against the Opus reference reading (reference.json). Every run appends one line to results.jsonl.
 *
 *   node run.mjs whole <prompt line>      # (b) one Haiku agent, the condensed session transcript on disk, reads it in chunks
 *   node run.mjs loop <prompt line>       # (c) node loop: one Haiku session loaded with what followed, asked chunk by chunk
 *   node run.mjs score <variant> <line>   # one Sonnet judge: which reference asks the variant found, which it invented
 *   node run.mjs lean <line>              # (a) the existing pass 1 + pass 2 lines, put in the same shape (no model call)
 *
 * The condensed transcript is made by condense.mjs (owner prompts, the AI's replies, one line per tool call, no tool results).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import PromptAudit from "../../../../../../../Server/PromptAudit.mjs";
import RefinedCard from "../../../RefinedCard.js";
import { condense } from "./condense.mjs";
import { session_cost } from "./cost.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../../..");
const SESSION = "e00f55c9";
const RESULTS = path.join(HERE, "results.jsonl");
const HAIKU = "claude-haiku-5-5", SONNET = "claude-sonnet-5-5";
const { query } = await import(pathToFileURL(path.join(ROOT, "Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs")).href);

const located = PromptAudit.locate(SESSION);
const prompts = PromptAudit.prompts(located.transcript);
const prompt_at = line => prompts.find(p => p.line === line) ?? (() => { throw new Error(`no owner prompt at :${line}`); })();
const numbered = text => RefinedCard.sentences(text).map((s, i) => `${i}: ${s}`).join("\n");
const append = o => fs.appendFileSync(RESULTS, JSON.stringify({ ...o, at: new Date().toISOString() }) + "\n");

const SHAPE = `{"parts": [{"cites": [0, 1, 2], "kind": "ask|question|rule|idea|conversation", "text": "one line, the owner's words",
  "outcome": {"is": "done|documented|answered|task|no-action|open", "ref": "commit hash, file path or task path that shows it", "why": "one sentence"}}]}`;
const RULES = `A part is a run of sentences with one meaning; cite them all by number. Every sentence belongs to exactly one part (conversation and narration are parts too, kind "conversation", outcome "no-action").
- ask: something should happen. question: the owner wants an answer. rule: a standing direction for agents. idea: thinking aloud, a maybe.
- outcome: done (it was built; ref names the commit, file or task), documented (written into a doc; ref is the file), answered (a reply answered the question), task (an open task carries it), no-action (conversation, or an idea not taken; why says which), open (nothing shows it happened).
- Absence of evidence is open, never done. A reply that only said it would do something is not done.`;

function condensed_file(){
	const f = path.join(os.tmpdir(), "c0abf29c", "condensed.txt");
	if (!fs.existsSync(f)){ fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, condense(located.transcript).join("\n") + "\n"); }
	return f;
}

/** One SDK conversation turn (or a resumed one). Returns { text, usd, session_id, turns, ms, tokens }. */
async function turn(prompt, { model = HAIKU, system, tools = [], resume, max_turns = 30 } = {}){
	const t = Date.now(); let text = "", result = null, session_id = "", turns = 0;
	const q = query({ prompt, options: { model, cwd: ROOT, systemPrompt: system, tools, allowedTools: tools.length ? ["Read", "Grep", "Bash(git log:*)", "Bash(git show:*)"] : [],
		mcpServers: {}, strictMcpConfig: true, skills: [], settingSources: [], maxTurns: max_turns, permissionMode: "default", ...(resume ? { resume } : {}) } });
	for await (const m of q){
		if (m.session_id) session_id = m.session_id;
		if (m.type === "assistant"){ turns++; text = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || text; }
		if (m.type === "result") result = m;
	}
	const u = result?.usage ?? {};
	return { text: result?.result || text, usd: +(result?.total_cost_usd ?? 0), session_id, turns, ms: Date.now() - t,
		tokens: { in: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0), out: u.output_tokens ?? 0 } };
}

/** (b) Haiku with the whole condensed session on disk. */
async function whole(line){
	const p = prompt_at(line), file = condensed_file();
	const system = `You audit ONE prompt the owner of a web-framework repo dictated to an AI coding agent: what it asked, and what came of it. cwd is the repo.
The whole session, condensed (owner prompts, the agent's replies, one line per tool call, no tool results), is the file ${file}. It is too big to read at once: Read it in chunks (offset/limit), starting at the line that holds the prompt (L${line}) and going forward until you can judge every part. Grep it for words of an ask. git log/show and Read of repo files settle a doubt.
${RULES}
Answer at the end with ONE JSON object and nothing else after it:
${SHAPE}`;
	const r = await turn(`The prompt, sentence by sentence:\n${numbered(p.text)}\n\nAudit it.`, { system, tools: ["Read", "Grep", "Bash"], max_turns: 40 });
	let parts = null, error = null; try { parts = PromptAudit.json(r.text).parts; } catch (e){ error = e.message; }
	append({ variant: "whole", line, model: HAIKU, usd: +r.usd.toFixed(4), ms: r.ms, turns: r.turns, tokens: r.tokens, session_id: r.session_id, parts, error });
	return parts;
}

/** (c) node loop: one Haiku session, loaded once with what followed the prompt, then asked chunk by chunk (resumed: the cache is reused). */
async function loop(line, { chunk = 8, max_chars = 240_000 } = {}){
	const p = prompt_at(line), all = fs.readFileSync(condensed_file(), "utf8").split("\n");
	const from = all.findIndex(l => l.startsWith(`L${line} `));
	let after = "", i = from + 1; while (i < all.length && after.length + all[i].length < max_chars) after += all[i++] + "\n";
	const sentences = RefinedCard.sentences(p.text);
	const system = `You audit ONE prompt the owner of a web-framework repo dictated to an AI coding agent, part by part: what it asked, and what came of it. You have the prompt and the condensed record of what the session did after it (owner prompts, the agent's replies, one line per tool call; L<n> is the transcript line). You cannot read anything else.
${RULES}
Each answer is ONE JSON object and nothing else: ${SHAPE}`;
	let r = await turn(`The prompt (L${line}), sentence by sentence:\n${numbered(p.text)}\n\nWhat the session did after it (${i - from - 1} lines${i < all.length ? ", cut at the size limit" : ""}):\n${after}\n\nI will now ask about the prompt a few sentences at a time. Answer this message with {"parts": []}.`, { system });
	let usd = r.usd, ms = r.ms; const sid = r.session_id, parts = [], tokens = { in: r.tokens.in, out: r.tokens.out };
	for (let a = 0; a < sentences.length; a += chunk){
		const b = Math.min(a + chunk, sentences.length) - 1;
		const q = `Sentences ${a} to ${b}. What was asked, what was done, where is the evidence? Cite only sentences ${a}-${b}; a part that continues an earlier one cites its own sentences here.`;
		r = await turn(q, { system, resume: sid });
		usd += r.usd; ms += r.ms; tokens.in += r.tokens.in; tokens.out += r.tokens.out;
		try { parts.push(...PromptAudit.json(r.text).parts); } catch (e){ parts.push({ cites: [], kind: "error", text: `chunk ${a}-${b}: ${e.message}` }); }
	}
	usd = session_cost(sid)?.usd ?? usd;   // a resumed session's total_cost_usd is cumulative: summing it overcounts (measured 12x)
	append({ variant: "loop", line, model: HAIKU, usd: +usd.toFixed(4), ms, turns: Math.ceil(sentences.length / chunk) + 1, tokens, session_id: sid, context_chars: after.length, parts });
	return parts;
}

/** (a) the existing lean pass, reshaped: pass 1 items + pass 2 verdicts (their cost is what pass 1 recorded, plus pass 2's share). */
function lean(line){
	const a = PromptAudit.latest(path.join(located.folder, PromptAudit.AUDIT), "prompt_audit").get(line);
	const v = new Map((PromptAudit.latest(path.join(located.folder, PromptAudit.REVIEW), "prompt_review").get(line)?.verdicts ?? []).map(x => [x.id, x]));
	const parts = a.items.map(i => ({ cites: (i.cites ?? []).map(n => n - 1), kind: i.kind, text: i.text,
		outcome: { is: v.get(i.id)?.status ?? "none", ref: v.get(i.id)?.evidence ?? "", why: v.get(i.id)?.why ?? "" } }));
	append({ variant: "lean", line, model: `${a.model} + ${PromptAudit.REVIEW_MODEL} review`, usd: a.usd, note: "usd is pass 1 only; pass 2 was one call for the whole session", parts });
	return parts;
}

/** The judge: one Sonnet call, no tools. Which reference asks a variant found, and which of its parts are invented. */
async function score(variant, line){
	const ref = JSON.parse(fs.readFileSync(path.join(HERE, "reference.json"), "utf8")).prompts[line];
	const run = fs.readFileSync(RESULTS, "utf8").trim().split("\n").map(JSON.parse).filter(x => x.variant === variant && x.line === line && x.parts).at(-1);
	const parts = run.parts.filter(x => x.kind !== "conversation").map((x, k) => ({ id: `v${k + 1}`, cites: x.cites, kind: x.kind, text: x.text }));
	const system = `You compare two readings of one dictated prompt. The REFERENCE is a careful reading: each item is one thing the owner asked or raised. The CANDIDATE is a cheaper reading. For each reference item, say which candidate parts carry the same want (several can), or none. Then list candidate parts that match no reference item, and for each say "finer" (a real want inside the prompt that the reference folded into a bigger item) or "invented" (not in the prompt). Judge by meaning, not by wording. Answer with ONE JSON object: {"found": {"r1": ["v2"], "r2": []}, "extra": [{"id": "v9", "is": "finer|invented", "why": ""}]}`;
	const p = prompt_at(line);
	const r = await turn(`The prompt, sentence by sentence:\n${numbered(p.text)}\n\nREFERENCE:\n${ref.map(x => JSON.stringify(x)).join("\n")}\n\nCANDIDATE:\n${parts.map(x => JSON.stringify(x)).join("\n")}`, { model: SONNET, system });
	const o = PromptAudit.json(r.text), found = Object.values(o.found ?? {}).filter(v => v.length).length;
	const out = { variant: `score:${variant}`, line, model: SONNET, usd: +r.usd.toFixed(4), ref: ref.length, found, recall: +(found / ref.length).toFixed(2),
		invented: (o.extra ?? []).filter(x => x.is === "invented").length, finer: (o.extra ?? []).filter(x => x.is === "finer").length, parts: parts.length, judge: o };
	append(out);
	return out;
}

const [cmd, a1, a2] = process.argv.slice(2);
const res = cmd === "whole" ? await whole(+a1) : cmd === "loop" ? await loop(+a1) : cmd === "lean" ? lean(+a1) : cmd === "score" ? await score(a1, +a2) : null;
console.log(JSON.stringify(res, null, 1)?.slice(0, 3000) ?? "usage: run.mjs whole|loop|lean <line> | score <variant> <line>");

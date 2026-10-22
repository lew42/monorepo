#!/usr/bin/env node
/**
 * class PromptAudit — the two-pass audit of one session's owner prompts. Doc: public/framework/ai/doc/prompt-audit.md
 *   pass 1, structure (Haiku, no tools, one call per owner prompt) → `<session>/prompt-audit.jsonl`, ONE line per prompt.
 *   pass 2, review (Sonnet, one agent per session, read-only tools) → `<session>/prompt-review.jsonl`, one line per prompt.
 * Both files are append-only (a rerun adds a line; the latest per prompt wins). Nothing is filed as a task.
 * Reused: RefineQueue.owner_text (the prompt filter), RefinedCard.sentences/prompt (numbering), Servex/ext/refine/RefineCall.js (one call).
 *
 *   node Server/PromptAudit.mjs <session-id-or-8hex> --dry          # its owner prompts, and the estimate
 *   node Server/PromptAudit.mjs <session> [--structure] [--review] [--only 172,334] [--parallel 3] [--force]
 *   node Server/PromptAudit.mjs --days 7                            # every session with owner prompts in 7 days, and the estimate
 *   node Server/PromptAudit.mjs <session> --summary                 # counts computed from the two files
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import RefineQueue from "./RefineQueue.mjs";
import RefinedCard from "../public/framework/ext/Refine/RefinedCard.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESSIONS = path.join(ROOT, "public/framework/ai/sessions");

export default class PromptAudit {

	static V = 1;   // schema version of both files; bump it when the brief asks for a new field (doc/prompt-audit.md, "Schema")
	static STRUCTURE_MODEL = "claude-haiku-5-5";
	static REVIEW_MODEL = "claude-sonnet-5-5";
	static AUDIT = "prompt-audit.jsonl";
	static REVIEW = "prompt-review.jsonl";
	static MIN_CHARS = RefineQueue.MIN_CHARS;
	/** Measured on the pilot (7efd07d5, 22 prompts, 81k chars, 376 items): a Haiku call is ~$0.010 + $15.5 per million chars,
	 *  a prompt yields ~4.6 items per 1k chars, and the review costs ~$0.002 an item. doc/prompt-audit.md, "Cost". */
	static estimate(prompts, chars){ const items = chars * 4.6e-3; return { structure: prompts * 0.010 + chars * 15.5e-6, review: items * 0.002 }; }
	static KINDS = ["task", "question", "statement", "update"];
	static STATES = ["accepted", "optional", "option", "back-burner", "rejected"];

	/** Pass 1's system prompt. Short on purpose: when Haiku misses, make a line clearer; don't add rules (the owner, 2026-10-21). */
	static STRUCTURE_BRIEF = `You sort ONE prompt that the owner of a web-framework repo dictated to an AI coding agent. Dictation rambles and repeats; keep every want and lose only the noise. You cannot see the code.

Write one item per distinct want, in the order said. When several sentences say the same want, write ONE item and cite them all. Every sentence that carries a want is cited.
- task: something the owner asks to happen (build, fix, change, check, stop). Say what the owner wants, in their words; never invent a fix they did not suggest. Their suggestions, numbers and examples go in "details".
- question: something they want answered.
- statement: a fact or design decision about how the system is or should be built.
- update: a standing rule for how agents should work from now on ("always", "never", "we don't want X", "keep an eye on Y") or a correction of a doc; it changes a doc, not code. "file": the doc it belongs in if they named one or it is obvious (CLAUDE.md for repo-wide rules, a module's readme.md, a skill's SKILL.md), else "".
Hedged words ("maybe", "I wonder") are a question or statement, not a task. Narration and pleasantries are not items. When the owner corrects themselves or pushes back, the later word wins.
"tags": every page, path, module, class or file the prompt names, as written or as a site path (/framework/ux/Dictate/, AISessionDetail.js, #RefinedCard).

Answer with ONE JSON object and nothing else:
{"subject": "a few of the owner's words", "tags": ["..."], "items": [{"kind": "task|question|statement|update", "text": "one line, the owner's names", "cites": [3, 7], "details": [], "file": ""}]}`;

	/** Pass 2's system prompt. Node hands it the items and where to look; the agent reads what it needs. */
	static REVIEW_BRIEF = `You review ONE finished session of AI coding agents working for the owner of a web-framework repo (cwd is the repo). The user message holds every item the owner said in that session (already structured, each with an id) and where the evidence is: the session's own record, task folders started in its time window, and the commits in that window. Read what you need with your tools: the tail of a session.jsonl or task.jsonl is usually enough; open code or a readme only to settle a doubt. Several agents commit at once, so a commit counts only when its words match the item. Stop reading once you can judge; you have a small budget of turns.

Every item asked is a proposal, not an order. For each task and update, give:
- "state": accepted (needed), optional (nice to have), option (one of several ways; say which), back-burner (later), or rejected (conflicts, cannot happen, too complex, or the owner changed their mind later in the session). "why": one plain sentence a newcomer understands.
- "status": done (name the evidence: a task path, a commit hash, a file), partly, or open. Absence of evidence is open, never done.
- "priority": high or low, for accepted + open only (high = it changes what the owner can see or use, or they said it more than once).
For a question or statement, give "state" and "why": accepted when it is worth keeping in a doc (give "file"; a design decision the owner stated is worth keeping), rejected only when the chat answered it or it is noise.
Each task and update lists "cands": commits whose subject shares words with it, found by code. They are leads, not proof: confirm the words really match.

Answer at the end with ONE JSON object and nothing else after it:
{"verdicts": [{"id": "p172.2", "state": "", "why": "", "status": "", "evidence": "", "priority": "", "file": ""}],
 "feedback": "one paragraph to the designer of this audit: what in the item format or the evidence made a judgment hard, and the change that would fix it"}`;

	/** A session id or its first 8 hex → { id, transcript, folder }. */
	static locate(ref){
		const dir = RefineQueue.transcripts_dir();
		const f = fs.readdirSync(dir).find(x => x.startsWith(ref) && x.endsWith(".jsonl"));
		if (!f) throw new Error(`no transcript for ${ref}`);
		const id = f.slice(0, 36), short = id.slice(0, 8);
		let folder = null;
		(function walk(d, depth){   // sessions/YYYY/MM/DD/<folder>
			for (const e of fs.readdirSync(d, { withFileTypes: true })){
				if (folder || !e.isDirectory()) continue;
				const p = path.join(d, e.name);
				if (depth === 3){ if (e.name === `session-${short}` || e.name === id) folder = p; }
				else if (/^\d+$/.test(e.name)) walk(p, depth + 1);
			}
		})(SESSIONS, 0);
		return { id, transcript: path.join(dir, f), folder };
	}

	/** A line is the owner's own prompt: RefineQueue.owner_text AND the CLI stamped it typed by a human. Without the stamp,
	 *  SDK/CLI calls that inherit the VS Code entrypoint (clean-chunk calls, minion briefs: ~2,600 transcripts in 30 days) pass. */
	static human(l){ return l?.turnOrigin === "human" || l?.origin?.kind === "human"; }

	/** The owner's own prompts of one transcript, in order: { line, uuid, at, text }. */
	static prompts(transcript){
		const out = [];
		fs.readFileSync(transcript, "utf8").split("\n").forEach((raw, i) => {
			if (!raw.includes('"type":"user"')) return;
			let l; try { l = JSON.parse(raw); } catch { return; }
			if (l.entrypoint && l.entrypoint !== "claude-vscode") return;
			if (!PromptAudit.human(l)) return;
			const text = RefineQueue.owner_text(l);
			if (text && text.length >= PromptAudit.MIN_CHARS) out.push({ line: i + 1, uuid: l.uuid, at: l.timestamp, text });
		});
		return out;
	}

	/** Paths and files named in the text, found by code so a tag never depends on the model. */
	static paths(text){
		return [...new Set(text.match(/(?:\/[\w.-]+){2,}\/?|\b[\w-]+\.(?:js|mjs|md|jsonl|json|css)\b/g) ?? [])];
	}

	static read(file){ return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").flatMap(r => { try { return [JSON.parse(r)]; } catch { return []; } }) : []; }
	static append(file, obj){ fs.appendFileSync(file, JSON.stringify(obj) + "\n"); }
	static json(text){ const t = String(text ?? ""), a = t.indexOf("{"), b = t.lastIndexOf("}"); if (a < 0 || b < a) throw new Error("no JSON object"); return JSON.parse(t.slice(a, b + 1)); }

	constructor(ref, { parallel = 3, force = false } = {}){
		Object.assign(this, PromptAudit.locate(ref), { parallel, force });
		if (!this.folder) throw new Error(`no session folder for ${ref}`);
		this.audit_file = path.join(this.folder, PromptAudit.AUDIT);
		this.review_file = path.join(this.folder, PromptAudit.REVIEW);
		this.spent = 0;
	}

	/** Latest line per prompt line, from a file of `{ <verb>: { prompt: { line } } }` lines. */
	static latest(file, verb){ const m = new Map(); for (const l of PromptAudit.read(file)) if (l[verb]) m.set(l[verb].prompt.line, l[verb]); return m; }
	get audits(){ return PromptAudit.latest(this.audit_file, "prompt_audit"); }
	get reviews(){ return PromptAudit.latest(this.review_file, "prompt_review"); }

	async sdk(){ return import(pathToFileURL(path.join(RefineQueue.main_root(), "Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs")).href); }
	async refine_call(){ return (await import(pathToFileURL(path.join(RefineQueue.main_root(), "Servex/ext/refine/RefineCall.js")).href)).default; }

	/** Pass 1 for one prompt: one Haiku call (one retry on unusable JSON) → one `prompt_audit` line. */
	async structure_one(p){
		const RefineCall = await this.refine_call(), n = RefinedCard.sentences(p.text).length;
		let r, o, usd = 0, error = null;
		for (let k = 0; k < 2 && !o; k++){
			r = await RefineCall.run(RefinedCard.prompt(p.text), { model: PromptAudit.STRUCTURE_MODEL, system: PromptAudit.STRUCTURE_BRIEF, stage: "prompt-audit", cwd: os.tmpdir() });
			usd += r.cost_usd;
			try { o = PromptAudit.json(r.answer); if (!Array.isArray(o.items)) throw new Error("no items"); } catch (e){ o = null; error = e.message; }
		}
		this.spent += usd;
		const prompt = { transcript: this.id, uuid: p.uuid, line: p.line, at: p.at, sentences: n, chars: p.text.length, link: RefinedCard.raw_link(this.id, p.line) };
		const run = { model: r.model, usd: +usd.toFixed(5), tokens: r.tokens.in + r.tokens.out, ms: r.duration_ms, written_at: new Date().toISOString(), by: "PromptAudit" };
		if (!o){ PromptAudit.append(this.audit_file, { prompt_audit_failed: { v: PromptAudit.V, prompt, error, ...run } }); return null; }
		const items = o.items.filter(x => x?.text).map((x, i) => ({ id: `p${p.line}.${i + 1}`,
			kind: PromptAudit.KINDS.includes(x.kind) ? x.kind : "task", text: String(x.text).trim(),
			cites: (x.cites ?? []).map(Number).filter(Number.isInteger),
			...(x.details?.length ? { details: x.details.map(String) } : {}), ...(x.file ? { file: String(x.file) } : {}) }));
		const tags = [...new Set([...(o.tags ?? []).map(String), ...PromptAudit.paths(p.text)])];
		const line = { v: PromptAudit.V, prompt, subject: String(o.subject ?? ""), tags, items, ...run };
		PromptAudit.append(this.audit_file, { prompt_audit: line });
		return line;
	}

	/** Pass 1 for the session, N at once; prompts already audited at this version are skipped unless --force. */
	async structure({ only } = {}){
		const done = this.audits;
		const queue = PromptAudit.prompts(this.transcript).filter(p => (only ? only.includes(p.line) : true) && (this.force || only || done.get(p.line)?.v !== PromptAudit.V));
		let next = 0;
		const slot = async () => { while (next < queue.length){ const p = queue[next++], l = await this.structure_one(p);
			console.log(`${l ? "✓" : "✗"} :${p.line} ${p.text.length} chars → ${l?.items.length ?? 0} items, ${l?.tags.length ?? 0} tags  $${l?.usd ?? "?"} (spent $${this.spent.toFixed(3)})`); } };
		await Promise.all(Array.from({ length: this.parallel }, slot));
	}

	/** Where the evidence is, computed: record files started in the window or naming the session, and the window itself. */
	evidence(){
		const audits = [...this.audits.values()].sort((a, b) => a.prompt.line - b.prompt.line);
		const t0 = Date.parse(audits[0].prompt.at), t1 = Date.parse(audits.at(-1).prompt.at) + 3 * 36e5;
		const day = ms => path.join(SESSIONS, new Date(ms).toISOString().slice(0, 10).replace(/-/g, "/"));
		const days = new Set([t0, t1, t0 - 5 * 36e5, t1 - 5 * 36e5].map(day)), tasks = new Set();
		const walk = d => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })){
			const p = path.join(d, e.name);
			if (e.isDirectory()){ walk(p); continue; }
			if (e.name !== "session.jsonl" && e.name !== "task.jsonl") continue;
			const text = fs.readFileSync(p, "utf8");
			let first; try { first = JSON.parse(text.slice(0, text.indexOf("\n") >>> 0)); } catch { continue; }
			const at = Date.parse(first.assign?.requested_at ?? "");
			if (first.assign && (text.includes(this.id) || (at >= t0 && at <= t1))) tasks.add(path.relative(ROOT, p).replace(/\\/g, "/") + (first.assign.agent ? `  (${first.assign.agent})` : ""));
		} };
		for (const d of days) walk(d);
		const git = args => spawnSync("git", args, { cwd: ROOT, encoding: "utf8", windowsHide: true, maxBuffer: 64e6 }).stdout.trim().split("\n").filter(Boolean);
		const win = [`--since=${new Date(t0).toISOString()}`, `--until=${new Date(t1).toISOString()}`];
		const commits = git(["log", "--all", ...win, "--format=%h %s"]).map(l => ({ hash: l.slice(0, l.indexOf(" ")), subject: l.slice(l.indexOf(" ") + 1), words: RefinedCard.words(l) }));
		const docs = [...new Set(git(["log", "--all", ...win, "--name-only", "--format="]).filter(f => /(readme\.md|CLAUDE\.md|SKILL\.md|\/doc\/[^/]+\.md)$/.test(f)))];
		return { commits, docs, record: path.relative(ROOT, this.folder).replace(/\\/g, "/"), from: new Date(t0).toISOString(), to: new Date(t1).toISOString(), tasks: [...tasks] };
	}

	/** Up to 3 commits sharing 2+ content words with a task or update item, as "hash subject": leads for the reviewer, computed. */
	static cands(item, commits){
		if (item.kind !== "task" && item.kind !== "update") return [];
		const w = RefinedCard.words(item.text);
		return commits.map(c => [RefinedCard.shared(w, c.words), c]).filter(([n]) => n >= 2).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, c]) => `${c.hash} ${c.subject.slice(0, 90)}`);
	}

	/** Pass 2: one Sonnet agent, read-only tools, over every item → one `prompt_review` line per prompt and one `review_run` line. */
	async review({ max_turns = 40 } = {}){
		const { query } = await this.sdk(), audits = [...this.audits.values()].sort((a, b) => a.prompt.line - b.prompt.line), ev = this.evidence();
		const item = i => JSON.stringify({ id: i.id, kind: i.kind, text: i.text, ...(i.file ? { file: i.file } : {}), cands: PromptAudit.cands(i, ev.commits) });
		const items = audits.flatMap(a => a.items);
		const prompt = `Session ${this.id}, ${ev.from} to ${ev.to}.
Its folder: ${ev.record}/ (session.jsonl, cache.jsonl).
Task records started in the window or naming it (${ev.tasks.length}):
${ev.tasks.map(t => "- " + t).join("\n")}
Commits in the window: ${ev.commits.length} (all of them: \`git log --all --since=${ev.from} --until=${ev.to} --format="%h %s"\`; Bash is allowed for git and tail only).
Docs changed in the window (${ev.docs.length}): ${ev.docs.join(", ")}

Items (${items.length}), with each prompt's tags:
${audits.map(a => `## prompt :${a.prompt.line} — ${a.subject} — tags: ${a.tags.join(", ")}\n` + a.items.map(item).join("\n")).join("\n")}

Judge every item, then answer with the JSON object.`;
		const t = Date.now(); let result = null, answer = "", turns = 0;
		const q = query({ prompt, options: { model: PromptAudit.REVIEW_MODEL, cwd: ROOT, systemPrompt: PromptAudit.REVIEW_BRIEF,
			tools: ["Read", "Grep", "Glob", "Bash"], allowedTools: ["Read", "Grep", "Glob", "Bash(git log:*)", "Bash(git show:*)", "Bash(tail:*)"],
			mcpServers: {}, strictMcpConfig: true, skills: [], settingSources: [], maxTurns: max_turns, permissionMode: "default", effort: "medium" } });
		for await (const m of q){
			if (m.type === "assistant"){ turns++; answer = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || answer; }
			if (m.type === "result") result = m;
		}
		const usd = +(result?.total_cost_usd ?? 0).toFixed(4); this.spent += usd;
		let o; try { o = PromptAudit.json(result?.result || answer); } catch (e){ PromptAudit.append(this.review_file, { review_failed: { v: PromptAudit.V, usd, error: e.message, tail: String(result?.result ?? answer).slice(-400) } }); throw e; }
		const by = new Map(); for (const v of o.verdicts ?? []){ const k = Number(String(v.id).match(/^p(\d+)\./)?.[1]); by.set(k, [...(by.get(k) ?? []), v]); }
		for (const a of audits) PromptAudit.append(this.review_file, { prompt_review: { v: PromptAudit.V, prompt: { transcript: this.id, uuid: a.prompt.uuid, line: a.prompt.line }, verdicts: by.get(a.prompt.line) ?? [], model: PromptAudit.REVIEW_MODEL, written_at: new Date().toISOString(), by: "PromptAudit" } });
		const run = { v: PromptAudit.V, model: PromptAudit.REVIEW_MODEL, usd, ms: Date.now() - t, turns, items: items.length, verdicts: o.verdicts?.length ?? 0, tasks: ev.tasks.length, feedback: String(o.feedback ?? ""), written_at: new Date().toISOString() };
		PromptAudit.append(this.review_file, { review_run: run });
		return run;
	}

	/** Counts computed from the two files. */
	summary(){
		const a = [...this.audits.values()], vs = [...this.reviews.values()].flatMap(r => r.verdicts);
		const count = (xs, k) => xs.reduce((m, x) => (x[k] && (m[x[k]] = (m[x[k]] ?? 0) + 1), m), {});
		const runs = PromptAudit.read(this.review_file).filter(l => l.review_run).map(l => l.review_run);
		return { prompts: a.length, items: a.reduce((n, x) => n + x.items.length, 0), kinds: count(a.flatMap(x => x.items), "kind"),
			tags: a.reduce((n, x) => n + x.tags.length, 0), verdicts: vs.length, states: count(vs, "state"), status: count(vs, "status"),
			loose_ends_high: vs.filter(v => v.state === "accepted" && v.status !== "done" && v.priority === "high").length,
			usd_structure: +a.reduce((n, x) => n + x.usd, 0).toFixed(3), usd_review: +(runs.at(-1)?.usd ?? 0) };
	}

	static async main(argv){
		const flag = k => argv.includes(k), val = k => argv[argv.indexOf(k) + 1];
		if (flag("--days")){
			const since = Date.now() - +val("--days") * 864e5, dir = RefineQueue.transcripts_dir(), rows = [];
			for (const f of fs.readdirSync(dir)){
				const file = path.join(dir, f);
				if (!/^[0-9a-f-]{36}\.jsonl$/.test(f) || fs.statSync(file).mtimeMs < since) continue;
				const ps = PromptAudit.prompts(file).filter(p => Date.parse(p.at) >= since);
				if (ps.length) rows.push({ s: f.slice(0, 8), n: ps.length, chars: ps.reduce((c, p) => c + p.text.length, 0) });
			}
			const n = rows.reduce((c, r) => c + r.n, 0);
			for (const r of rows) console.log(`  ${r.s}  ${r.n} prompts, ${r.chars} chars`);
			const e = PromptAudit.estimate(n, rows.reduce((c, r) => c + r.chars, 0));
			console.log(`${rows.length} sessions, ${n} prompts: ~$${(e.structure + e.review).toFixed(2)} (structure ~$${e.structure.toFixed(2)}, review ~$${e.review.toFixed(2)})`);
			return;
		}
		const a = new PromptAudit(argv.find(x => /^[0-9a-f-]{8,36}$/.test(x)), { parallel: flag("--parallel") ? +val("--parallel") : 3, force: flag("--force") });
		if (flag("--summary")){ console.log(JSON.stringify(a.summary(), null, 1)); return; }
		if (flag("--dry")){ const ps = PromptAudit.prompts(a.transcript); for (const p of ps) console.log(`  :${p.line} ${p.at} ${p.text.length} chars`); const e = PromptAudit.estimate(ps.length, ps.reduce((c, p) => c + p.text.length, 0)); console.log(`${ps.length} prompts → ${path.relative(ROOT, a.audit_file)}, ~$${(e.structure + e.review).toFixed(2)}`); return; }
		const both = !flag("--structure") && !flag("--review");
		if (both || flag("--structure")) await a.structure({ only: flag("--only") ? val("--only").split(",").map(Number) : null });
		if (both || flag("--review")) console.log(JSON.stringify(await a.review(), null, 1));
		console.log(JSON.stringify(a.summary()));
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	PromptAudit.main(process.argv.slice(2)).catch(e => { console.error(e.stack ?? e); process.exit(1); });

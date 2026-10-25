#!/usr/bin/env node
/**
 * class PromptRecords — every owner prompt of a session as a record with completion. Doc: public/framework/ext/Refine/doc/prompt-records.md
 *
 * One pipeline, run as named PROCESSES (data, below). Steps:
 *   sentences  code    the prompt's raw text + numbered sentences → the session's prompts.jsonl (PromptLog raw, clean)
 *   parts      model   runs of sentences, each with a kind; main asks with their details nested (PARTS_BRIEF) → a `parts` line
 *   outcomes   model   what came of each part, with evidence (OUTCOMES_BRIEF), one call per window of the session → a new `parts` line
 *   file       node    every part still open becomes a task on the session (item tool's run_item); done/documented ones never do
 *   completion code    Prompt.completion(): settled parts out of parts + uncited sentences (ext/Refine/Prompt.js)
 * Sources differ only in how raw text arrives: a VS Code tab transcript (PromptAudit.prompts), a Whisper/Dictate session's own
 * prompts.jsonl raw lines, the cloud voice log. Live: `live` (parts, then proposals). After the fact: `review`.
 *
 *   node Server/PromptRecords.mjs <session 8hex> --dry                 # the unique prompts, what is recorded, the estimate
 *   node Server/PromptRecords.mjs <session> --process review [--steps parts,outcomes] [--only 4136,5965] [--file]
 *   node Server/PromptRecords.mjs <session> --summary                  # completion per prompt, computed
 *   node Server/PromptRecords.mjs <session> --tasks [prompt id or line]   (the splitter's tasks for a prompt; default the latest)
 *   node Server/PromptRecords.mjs <session> --handled <prompt uuid> --to <task path or agent> [--note …]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import PromptAudit from "./PromptAudit.mjs";
import AIIndex from "./AIIndex.mjs";
import RefineQueue from "./RefineQueue.mjs";
import RefinedCard from "../public/framework/ext/Refine/RefinedCard.js";
import PromptLog from "../public/framework/ai/AISession/PromptLog.js";
import Prompt from "../public/framework/ext/Refine/Prompt.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HAIKU = "claude-haiku-5-5";

export default class PromptRecords {

	static BY = "PromptRecords";
	/** A task made from a prompt: `source` {session, line, prompt, part} (since 2026-10-23), or the older "prompt:<id>" string. */
	static from_prompt(source){ return typeof source === "object" ? !!source?.prompt : String(source ?? "").startsWith("prompt:"); }

	/** The processes: the same steps, different instructions and context. Measured on tab e00f55c9 (doc, "The experiment"). */
	static PROCESSES = {
		live:   { steps: ["sentences", "parts", "file"], parts: { model: HAIKU }, file: "proposals", file_kinds: ["ask"], file_cap: 5,
		          why: "fast and blind: a prompt's asks become proposals before anything is done; no evidence search" },
		review: { steps: ["sentences", "parts", "outcomes", "file"], parts: { model: HAIKU }, outcomes: { model: HAIKU, window_chars: 150_000, max_turns: 12 }, file: "open", file_kinds: ["ask", "rule"],
		          why: "after the fact: parts need no context (recall 0.95-1.0 blind), outcomes read what the session did and confirm in the repo" },
	};

	/** The parts step's system prompt. The live and review processes share it: what a prompt says does not depend on what was done. */
	static PARTS_BRIEF = `You break ONE prompt the owner of a web-framework repo dictated to an AI coding agent into parts. Dictation rambles and repeats; keep every want, lose nothing said. You cannot see the code.
A part is a run of sentences with one meaning; cite them all by number. Every sentence is cited by exactly one part.
- ask: something should happen. Give every ask the prompt really holds, as many as there are, and never merge two asks into one: better safe than sorry, include everything. Nest an ask's own specific suggestions, numbers and sub-asks under it in "parts" (same shape). Never invent a fix the owner did not suggest. Where the owner's words carry a degree or a qualifier ("a bit", "mostly", "at least"), or are unclear, keep them in "text" in quotation marks as the owner's words, so a later agent can go back to the source.
- rule: a standing direction for agents ("always", "never", "we don't want X", "the mastermind manages these"). It becomes a doc note, never a task; "file" is the doc it belongs in when obvious (CLAUDE.md, a module's readme.md), else "".
- question: the owner wants an answer. idea: thinking aloud, a maybe, a hedge ("maybe", "I wonder"). conversation: narration, thanks, filler.
When the owner corrects themselves, the later word wins: cite both sentences in one part.
Answer with ONE JSON object and nothing else:
{"subject": "a few of the owner's words", "parts": [{"cites": [0, 1], "kind": "ask|rule|question|idea|conversation", "text": "one line, the owner's names", "file": "", "module": "", "parts": []}]}
"module": the site module a main ask concerns when the prompt names one (ext/Refine, core/Task, ai/sessions), else "".`;

	/** The outcomes step's system prompt. */
	static OUTCOMES_BRIEF = `You judge what came of the owner's prompts in ONE session of AI coding agents working on a web-framework repo (cwd is the repo). The user message gives each prompt's parts (already found, each with an id) and the condensed record of what the session did (owner prompts, the agent's replies, one line per tool call; L<n> is the transcript line).
For each part id give an outcome:
- done: it was built or changed; ref is a file, commit hash or task path that shows it.
- documented: it is written in a doc; ref is that file. Confirm with Grep before you say so.
- answered: a reply answered the question; ref is the L<n> line.
- task: an open task now carries it; ref is the task path.
- no-action: conversation, an idea that was not taken, or the owner changed their mind; why says which.
- open: nothing shows it happened. Absence of evidence is open, never done. A reply that only promised it is not done.
Read only what settles a doubt (Grep the repo for a doc note, git log for a commit). You have a small budget of turns.
Answer at the end with ONE JSON object and nothing else after it:
{"outcomes": {"<part id>": {"is": "done|documented|answered|task|no-action|open", "ref": "", "why": "one plain sentence"}}}`;

	/** A session's condensed transcript: what a reviewer needs to see both sides, without tool results. */
	static condense(transcript){
		const owner = new Map(PromptAudit.prompts(transcript).map(p => [p.line, p])), seen = new Map(), out = [];
		fs.readFileSync(transcript, "utf8").split("\n").forEach((raw, i) => {
			const n = i + 1;
			if (owner.has(n)){
				const p = owner.get(n), k = p.at + p.text.length;
				if (seen.has(k)){ out.push(`L${n} OWNER| (the prompt at L${seen.get(k)} again, replayed after a compaction)`); return; }
				seen.set(k, n); out.push(`L${n} ${p.at.slice(5, 16)} OWNER| ${p.text.replace(/\s+/g, " ")}`); return;
			}
			if (!raw.includes('"type":"assistant"')) return;
			let l; try { l = JSON.parse(raw); } catch { return; }
			for (const b of l.message?.content ?? []){
				if (b.type === "text" && b.text.trim()) out.push(`L${n} AI| ${b.text.replace(/\s+/g, " ").slice(0, 1500)}`);
				if (b.type === "tool_use"){
					const x = b.input ?? {}, what = x.file_path ?? x.path ?? x.command ?? x.pattern ?? x.prompt ?? x.description ?? JSON.stringify(x);
					out.push(`L${n} TOOL| ${b.name.replace(/^mcp__\w+__/, "")}: ${String(what).replace(/\s+/g, " ").slice(0, 160)}`);
				}
			}
		});
		return out;
	}

	/** The owner's prompts, each once: a compaction replays earlier prompts with their first timestamp, so (at, length) repeats are dropped. */
	static unique(prompts){ const seen = new Set(); return prompts.filter(p => { const k = p.at + "|" + p.text.length; return !seen.has(k) && seen.add(k); }); }

	/** `folder` given (the live process knows its session's folder): no transcript lookup; `by` is who writes (the item tool's caller). */
	constructor(ref, { process = "review", parallel = 3, folder = null, by = PromptRecords.BY } = {}){
		Object.assign(this, folder ? { id: ref, folder, transcript: null } : PromptAudit.locate(ref), { process, parallel, by });
		this.def = PromptRecords.PROCESSES[process] ?? (() => { throw new Error(`no process "${process}": ${Object.keys(PromptRecords.PROCESSES).join(", ")}`); })();
		this.spent = 0;
		this.file_url = path.join(this.folder, PromptLog.FILE);
	}

	get prompts(){ return this._prompts ??= PromptRecords.unique(PromptAudit.prompts(this.transcript)); }
	/** prompts.jsonl, folded: { uuid → row }. Read fresh each time: other writers (Dictate, Echo) append too. */
	rows(){ return PromptLog.fold(PromptAudit.read(this.file_url)); }

	/** The record id of a prompt: an existing row with the same raw text (the live process wrote it first), else its transcript uuid. */
	rid(p){ if (p.id) return p.id; const rows = this.rows(); return p.id = Object.values(rows).find(r => r.raw === p.text)?.id ?? p.uuid; }

	async add(line){ return PromptLog.add(this.id, line, this.by, pathToFileURL(this.folder + path.sep)); }

	/** Step 1, code: raw text and numbered sentences, once per prompt (raw is immutable, a final clean is set in stone). */
	async sentences(ps){
		const rows = this.rows();
		for (const p of ps){
			if (rows[this.rid(p)]?.raw == null) await this.add({ prompt: this.rid(p), stage: "raw", text: p.text, source: "vscode", ref: { transcript: this.id, line: p.line, at: p.at, link: RefinedCard.raw_link(this.id, p.line) } });
			if (!rows[this.rid(p)]?.final) await this.add({ prompt: this.rid(p), stage: "clean", sentences: RefinedCard.sentences(p.text), final: true });
		}
	}

	async call(prompt, opts){ const r = await PromptRecords.ask(prompt, opts); this.spent += r.usd; return r; }

	/** One model call through the Agent SDK, never resumed: { text, usd }. With tools it reads the repo (Read, Grep, Glob, git log/show) and
	 * writes nothing. Shared by Server/UndoneVerify.mjs --run. */
	static async ask(prompt, { model, system, tools = [], max_turns = 4 }){
		const { query } = await import(pathToFileURL(path.join(RefineQueue.main_root(), "Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs")).href);
		let text = "", result = null;
		const q = query({ prompt, options: { model, cwd: tools.length ? ROOT : os.tmpdir(), systemPrompt: system, tools,
			allowedTools: tools.length ? ["Read", "Grep", "Glob", "Bash(git log:*)", "Bash(git show:*)"] : [], mcpServers: {}, strictMcpConfig: true, skills: [], settingSources: [], maxTurns: max_turns, permissionMode: "default" } });
		try { for await (const m of q){ if (m.type === "assistant") text = (m.message?.content ?? []).filter(b => b.type === "text").map(b => b.text).join("") || text; if (m.type === "result") result = m; } }
		catch (e){ if (!text) throw e; }   // a run out of turns still keeps its last answer
		const usd = +(result?.total_cost_usd ?? 0);   // one query, never resumed: total_cost_usd is this call's own cost
		return { text: result?.result || text, usd };
	}

	/** Step 2, model: one call per prompt, no context (blind recall measured 0.95-1.0 against an Opus reading). */
	async parts_one(p){
		const sentences = RefinedCard.sentences(p.text);
		const r = await this.call(`The prompt, sentence by sentence:\n${sentences.map((s, i) => `${i}: ${s}`).join("\n")}`, { model: this.def.parts.model, system: PromptRecords.PARTS_BRIEF });
		const o = PromptAudit.json(r.text), ids = { n: 0 };
		const clean = ps => (ps ?? []).filter(x => x?.text).map(x => ({ id: `a${++ids.n}`, cites: (x.cites ?? []).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < sentences.length),
			kind: Prompt.KINDS.includes(x.kind) ? x.kind : "ask", text: String(x.text).trim(), ...(x.file ? { file: String(x.file) } : {}), ...(x.module ? { module: String(x.module) } : {}), ...(x.parts?.length ? { parts: clean(x.parts) } : {}),
			outcome: x.kind === "conversation" ? { is: "no-action", why: "conversation" } : { is: "open" } }));
		const parts = clean(o.parts);
		await this.add({ prompt: this.rid(p), stage: "parts", process: this.process, step: "parts", subject: String(o.subject ?? ""), parts, model: this.def.parts.model, usd: +r.usd.toFixed(5) });
		return parts;
	}

	/** Step 3, model: the session in windows of about window_chars; each call judges the prompts that start inside its window. */
	async outcomes(ps){
		const all = PromptRecords.condense(this.transcript), want = new Set(ps.map(p => p.line)), rows = this.rows(), max = this.def.outcomes.window_chars;
		const windows = []; let cur = null;
		for (const [i, l] of all.entries()){
			const n = +l.slice(1, l.indexOf(" "));
			if (want.has(n) && (!cur || cur.chars > max / 2)) windows.push(cur = { from: i, lines: [] , chars: 0 });
			if (want.has(n)) cur.lines.push(n);
			if (cur) cur.chars += l.length;
		}
		for (const w of windows){
			let text = "", i = w.from; while (i < all.length && text.length + all[i].length < max) text += all[i++] + "\n";
			const items = w.lines.map(n => this.prompts.find(p => p.line === n)).map(p => ({ p, row: rows[this.rid(p)] })).filter(x => x.row?.parts?.length);
			const flat = [], walk = (uuid, ps) => ps.forEach(x => { if (x.kind !== "conversation") flat.push({ id: `${uuid.slice(0, 8)}.${x.id}`, kind: x.kind, text: x.text }); });
			for (const { p, row } of items) walk(p.uuid, row.parts);
			if (!flat.length) continue;
			const msg = `Parts (${flat.length}), by prompt:\n${items.map(({ p }) => `## prompt L${p.line} (${p.at})\n` + flat.filter(f => f.id.startsWith(p.uuid.slice(0, 8))).map(f => JSON.stringify(f)).join("\n")).join("\n")}\n\nWhat the session did from the first of these prompts (${i - w.from} lines${i < all.length ? ", cut at the size limit" : ", to the end"}):\n${text}`;
			const r = await this.call(msg, { model: this.def.outcomes.model, system: PromptRecords.OUTCOMES_BRIEF, tools: ["Read", "Grep", "Glob", "Bash"], max_turns: this.def.outcomes.max_turns });
			let o; try { o = PromptAudit.json(r.text).outcomes ?? {}; } catch (e){ console.log(`✗ window L${w.lines[0]}: ${e.message}`); continue; }
			for (const { p, row } of items){
				const set = ps => ps.map(x => { const v = o[`${p.uuid.slice(0, 8)}.${x.id}`]; return { ...x, ...(v && Prompt.OUTCOMES.includes(v.is) ? { outcome: { is: v.is, ref: String(v.ref ?? ""), why: String(v.why ?? "") } } : {}) }; });
				await this.add({ prompt: this.rid(p), stage: "parts", process: this.process, step: "outcomes", subject: row.subject ?? "", parts: set(row.parts), model: this.def.outcomes.model, usd: +(r.usd / items.length).toFixed(5) });
			}
			console.log(`✓ window L${w.lines.join(",L")}: ${flat.length} parts judged, $${r.usd.toFixed(3)} (spent $${this.spent.toFixed(2)})`);
		}
	}

	/** Step 4, node: every top-level ask or rule still open becomes a task on the session; the part's outcome then names that task. */
	async file(ps){
		const { run_item } = await import(pathToFileURL(path.join(ROOT, "Servex/agents/page_tools.js")).href);
		const record = "/" + path.relative(path.join(ROOT, "public"), path.join(this.folder, "session.jsonl")).replace(/\\/g, "/"), rows = this.rows(), made = [];
		// A prompt the live process (or the older brief-v3 PromptTasks) already filed proposals for is not filed again: proposals
		// made within 15 minutes after it, with a prompt: source. Its router closes them with --handled.
		const live = PromptAudit.read(path.join(this.folder, "session.jsonl")).filter(l => PromptRecords.from_prompt(l.tasks?.add?.source)).map(l => Date.parse(l.ts ?? l.at ?? ""));
		for (const p of ps){
			const row = rows[this.rid(p)]; if (!row?.parts?.length) continue;
			const t0 = Date.parse(p.at); if (this.def.file !== "proposals" && live.some(t => t >= t0 && t - t0 < 15 * 6e4)){ console.log(`  L${p.line}: live proposals exist; not filed again`); continue; }
			let changed = false;
			const parts = [];
			let n = 0;
			for (const x of row.parts){   // past file_cap an ask stays an open part on the record: never lost, never a sixth proposal
				if (!this.def.file_kinds.includes(x.kind) || x.outcome?.is !== "open" || n >= (this.def.file_cap ?? Infinity)){ parts.push(x); continue; }
				n++;
				const add = { title: (x.kind === "rule" ? "Write down: " : "") + x.text.slice(0, 180), state: "idle", from: "owner",   /* open work for the session, idle: never waiting on the owner (one writer, 2026-10-24) */
					source: { session: this.id, line: p.line, prompt: this.rid(p), part: x.id }, description: [x.outcome?.why, ...(x.parts ?? []).map(d => "- " + d.text)].filter(Boolean).join("\n").slice(0, 800), ...(x.file ? { file_hint: x.file } : {}), ...(x.module ? { module_hint: x.module } : {}) };
				const r = await run_item({ path: record, delta: { tasks: { add } } }, { caller: this.by }, true);
				const ref = r?.homes?.[0]?.path ?? r?.ids?.[0];
				if (r?.ok && ref){ parts.push({ ...x, outcome: { is: "task", ref, why: x.outcome?.why ?? "" } }); made.push(ref); changed = true; }
				else { parts.push(x); console.log(`✗ ${p.line} ${x.id}: ${r?.why ?? "refused"}`); }
			}
			if (changed) await this.add({ prompt: this.rid(p), stage: "parts", process: this.process, step: "file", subject: row.subject ?? "", parts });
		}
		return made;
	}

	/** A task's state by its ref (a folder path or a nested id), read from the files: what completion needs. */
	task_state(){
		const session = PromptAudit.read(path.join(this.folder, "session.jsonl")), nested = new Map();
		for (const l of session){ const a = l.tasks?.add; if (a?.id) nested.set(a.id, a.state ?? "idle"); for (const [k, v] of Object.entries(l)) if (nested.has(k) && v && typeof v === "object"){ const verb = Object.keys(v)[0]; if (["complete", "finish"].includes(verb)) nested.set(k, "complete"); else if (["stop", "reject"].includes(verb)) nested.set(k, "stopped"); else if (["start", "approve", "resume"].includes(verb)) nested.set(k, "running"); } }
		// A ref names a task folder however the model wrote it ("/framework/…/", "public/framework/…/requirements.md", "…/session.jsonl").
		// Its state is AIIndex.fold's (Task.replay): the one rule every board uses.
		return ref => {
			if (nested.has(ref)) return nested.get(ref);
			let rel = String(ref).trim().split(/[#\s]/)[0].replace(/\\/g, "/").replace(/^\//, "").replace(/^public\//, "");
			if (/\.[a-z]+$/i.test(rel)) rel = path.posix.dirname(rel);
			const f = [rel, "framework/" + rel].flatMap(r => ["task.jsonl", "session.jsonl"].map(n => path.join(ROOT, "public", r, n))).find(n => fs.existsSync(n));
			if (!f) return null;
			const state = AIIndex.fold(PromptAudit.read(f), path.join(ROOT, "public")).state;
			return state === "complete" ? "complete" : state === "stopped" ? "stopped" : "open";
		};
	}

	/** Completion per prompt, computed (Prompt.completion). */
	summary(){
		const rows = this.rows(), state = this.task_state(), out = [];
		for (const p of this.prompts){
			const row = rows[this.rid(p)]; if (!row) { out.push({ line: p.line, recorded: false }); continue; }
			const pr = Prompt.from_log(row, this.id), { done, total } = pr.progress(state);
			const kinds = {}; for (const x of pr.parts) kinds[x.outcome?.is ?? "?"] = (kinds[x.outcome?.is ?? "?"] ?? 0) + 1;
			out.push({ line: p.line, at: p.at, subject: row.subject || pr.parts[0]?.text?.slice(0, 60) || "", parts: pr.parts.length, uncovered: pr.uncovered.length, done, total, complete: pr.complete(state), outcomes: kinds });
		}
		return out;
	}

	/** The router's verb: a whole prompt's open (idle or waiting) tasks are handled (routed to one task or agent): each is completed with that note. */
	async handled(uuid, to, note = ""){
		const { run_item } = await import(pathToFileURL(path.join(ROOT, "Servex/agents/page_tools.js")).href);
		const record = "/" + path.relative(path.join(ROOT, "public"), path.join(this.folder, "session.jsonl")).replace(/\\/g, "/");
		const done = [];
		for (const t of this.tasks(uuid)){   // current state, so a task a tab already started is never closed as "routed"
			if (!["waiting", "idle"].includes(t.state)) continue;
			const r = await run_item({ path: record, delta: { [t.id]: { complete: { outcome: `routed to ${to}${note ? ": " + note : ""}` } } } }, { caller: this.by }, true);
			if (r?.ok) done.push(t.id);
		}
		try { await this.add({ prompt: uuid, stage: "handled", to, note }); } catch (e){ console.log(`no record for ${uuid} (${e.message}); the proposals are closed anyway`); }
		return done;
	}

	/** The tasks the splitter filed for a prompt (default: the newest), with their state folded from the record: what a tab finds instead of adding its own.
	 *  The tab then starts one with the item tool: {"tasks":{"<id>":{"start":{}}}} on the session record, setting `path` to the brief and `agent`. */
	tasks(prompt = null){
		const ps = this.prompts, p = prompt ? ps.find(x => this.rid(x) === prompt || String(x.line) === String(prompt)) : ps[ps.length - 1];
		if (!p) return [];
		const rid = this.rid(p), by = new Map();
		for (const l of PromptAudit.read(path.join(this.folder, "session.jsonl"))){
			const a = l.tasks?.add; if (a?.id && (a.source?.prompt === rid || String(a.source ?? "").includes(rid))) by.set(a.id, { id: a.id, title: a.title, state: a.state ?? "idle", line: p.line, prompt: rid });
			if (l.decide?.task && by.has(l.decide.task)) by.get(l.decide.task).state = l.decide.is === "reject" ? "stopped" : l.decide.is === "approve" ? "idle" : by.get(l.decide.task).state;
			for (const [k, v] of Object.entries(l.tasks ?? {})) if (by.has(k) && v && typeof v === "object"){ const verb = Object.keys(v)[0]; by.get(k).state = ["complete", "finish"].includes(verb) ? "complete" : ["stop", "reject"].includes(verb) ? "stopped" : ["start", "resume"].includes(verb) ? "running" : verb === "approve" ? "idle" : by.get(k).state; }
		}
		return [...by.values()];
	}

	async run({ steps = this.def.steps, only = null, file = false } = {}){
		const ps = this.prompts.filter(p => !only || only.includes(p.line));
		if (steps.includes("sentences")) await this.sentences(ps);
		if (steps.includes("parts")){
			const rows = this.rows(), queue = ps.filter(p => !rows[this.rid(p)]?.parts?.length);
			let next = 0;
			await Promise.all(Array.from({ length: this.parallel }, async () => { while (next < queue.length){ const p = queue[next++];
				try { const parts = await this.parts_one(p); console.log(`✓ L${p.line} ${p.text.length} chars → ${parts.length} parts (spent $${this.spent.toFixed(2)})`); }
				catch (e){ console.log(`✗ L${p.line}: ${e.message}`); } } }));
		}
		if (steps.includes("outcomes") && this.def.outcomes) await this.outcomes(ps);
		if (steps.includes("file") && file) console.log(`filed ${(await this.file(ps)).length} tasks`);
		return this.spent;
	}

	static async main(argv){
		const flag = k => argv.includes(k), val = k => argv[argv.indexOf(k) + 1];
		const r = new PromptRecords(argv.find(x => /^[0-9a-f-]{8,36}$/.test(x)), { process: flag("--process") ? val("--process") : "review", parallel: flag("--parallel") ? +val("--parallel") : 3 });
		if (flag("--tasks")){ console.log(JSON.stringify(r.tasks(val("--tasks")?.startsWith("--") ? null : val("--tasks")), null, 1)); return; }   // --tasks [prompt id or line]; none = the latest prompt
		if (flag("--handled")){ console.log(await r.handled(val("--handled"), val("--to"), flag("--note") ? val("--note") : "")); return; }
		if (flag("--summary")){ const s = r.summary(); for (const x of s) console.log(x.recorded === false ? `  L${x.line} not recorded` : `${x.complete ? "✅" : "⬜"} L${x.line} ${x.done}/${x.total} ${x.uncovered ? `(${x.uncovered} uncited) ` : ""}${JSON.stringify(x.outcomes)} ${x.subject}`); console.log(`${s.filter(x => x.complete).length} of ${s.length} prompts complete`); return; }
		if (flag("--dry")){ const rows = r.rows(); for (const p of r.prompts) console.log(`  L${p.line} ${p.at} ${p.text.length} chars ${rows[r.rid(p)]?.parts?.length ? "recorded" : ""}`); console.log(`${r.prompts.length} unique prompts (of ${PromptAudit.prompts(r.transcript).length} in the transcript), process ${r.process}: ${r.def.steps.join(" → ")}`); return; }
		const spent = await r.run({ steps: flag("--steps") ? val("--steps").split(",") : undefined, only: flag("--only") ? val("--only").split(",").map(Number) : null, file: flag("--file") });
		console.log(`spent $${spent.toFixed(2)}`);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
	PromptRecords.main(process.argv.slice(2)).catch(e => { console.error(e.stack ?? e); process.exit(1); });

#!/usr/bin/env node
/**
 * class ProposalTriage — sorts the proposed tasks (state waiting, waiting_on "owner") under the three big things in priority.md.
 * What plainly serves one is approved into it; the rest stay proposals but wait on "backlog", which the inbox does not count.
 * Doc: public/framework/ai/asks/readme.md (Triage), public/framework/ai/doc/undone-asks-2026-10-17.md (last section).
 *
 *   node Server/ProposalTriage.mjs --count                    how many proposals wait on the owner right now (replayed, not read as text)
 *   node Server/UndoneVerify.mjs --batches <dir> --question priority    writes the Haiku batches (25 each) from this class's list
 *   node Server/UndoneVerify.mjs --run <dir>                  runs them (answers only; no task changes); cost in <dir>/runs.jsonl
 *   node Server/ProposalTriage.mjs --plan <dir>               dry run: every change printed, nothing written; accepted + backlog = count
 *   node Server/ProposalTriage.mjs --apply <dir>              approve or backlog each one through run_item, write triage.jsonl
 *   --list <jsonl>   proposals come from this manifest (default asks/undone-to-tasks.jsonl); used by the tests on scratch tasks
 *   --out <jsonl>    where the manifest of changes goes (default asks/triage.jsonl)
 *   --root <repo>    where the data lives (default: the repo this file is in)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import AIIndex from "./AIIndex.mjs";

const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NL = String.fromCharCode(10);

export default class ProposalTriage {

	static LIST = "public/framework/ai/asks/undone-to-tasks.jsonl";
	static OUT = "public/framework/ai/asks/triage.jsonl";
	static PRIORITY = "public/framework/ai/priority.md";
	static BY = "mastermind-deputy";
	static OWNER_WORDS = "The owner, 2026-10-23: don't wait for approval; accept what serves a top priority";

	constructor({ root = HERE, list = ProposalTriage.LIST, out = ProposalTriage.OUT, now = () => new Date().toISOString() } = {}){
		this.root = root; this.list = list; this.out = out; this.now = now;
	}
	file(rel){ return path.isAbsolute(rel) ? rel : path.join(this.root, rel); }

	// ---- the three big things, read from priority.md ----------------------------------------------------

	/** [{ n, name, text }] from the `### N. name` headings of priority.md; text = the paragraph under the heading. */
	priorities(){
		const lines = fs.readFileSync(this.file(ProposalTriage.PRIORITY), "utf8").split(NL), out = [];
		for (let i = 0; i < lines.length; i++){
			const m = lines[i].match(/^###\s+(\d+)\.\s+(.+?)\s*$/);
			if (!m) continue;
			const body = []; for (let j = i + 1; j < lines.length && !/^#{1,3}\s/.test(lines[j]); j++) if (lines[j].trim()) body.push(lines[j].trim());
			out.push({ n: +m[1], name: m[2], text: body.join(" ").replace(/\]\([^)]*\)/g, "]").slice(0, 700) });
		}
		return out;
	}

	// ---- the proposals ----------------------------------------------------------------------------------

	/** Every proposal still waiting on the owner: [{ id (the first ask id), task (url), module, title, description }]. Replayed with AIIndex.fold. */
	proposals(){
		const seen = new Set(), out = [];
		const lines = fs.existsSync(this.file(this.list)) ? AIIndex.read_lines(this.file(this.list)) : [];
		for (const l of lines){
			if (!l.task || seen.has(l.task)) continue;
			seen.add(l.task);
			const f = this.file("public" + l.task.replace(/\/?$/, "/") + "task.jsonl");
			if (!fs.existsSync(f)) continue;
			const tl = AIIndex.read_lines(f), s = AIIndex.fold(tl, path.join(this.root, "public"));
			if (s.state !== "waiting" || s.waiting_on !== "owner") continue;
			const d = tl.find(x => x.description)?.description ?? "";
			out.push({ id: l.ask ?? l.task, task: l.task, module: l.module ?? s.module, title: s.title, description: String(d).replace(/\s+/g, " ").slice(0, 300) });
		}
		return out;
	}

	// ---- the Haiku question (the batches are written by UndoneVerify.write_batches4, from here) -----------

	brief(items, results_path){
		const P = this.priorities();
		return [
			"# Which big thing does each proposed task plainly serve? (" + items.length + " tasks)",
			"",
			"You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `" + results_path + "`).",
			"",
			"The owner has three big things:",
			"",
			...P.map(p => p.n + ". **" + p.name + "** — " + p.text),
			"",
			"For each task below answer ONE question: which of the three big things does finishing it **plainly** serve: 1, 2, 3, or none? Answer `none` when in doubt. A task that merely touches the same folder is `none`; it must plainly be part of the thing's own description above.",
			"",
			"## Output",
			"",
			"A JSON array, one object per task, same ids, nothing else in your message:",
			"",
			"```json",
			'[{"id":"abc1234567","priority":1,"why":"one short line"}]   // priority is 1, 2, 3 or "none"',
			"```",
			"",
			"## The " + items.length + " tasks",
			"",
			...items.map((t, i) => (i + 1) + ". `" + t.id + "` [" + t.module + "] " + t.title + (t.description ? " — " + t.description : "")),
			"",
		].join(NL);
	}

	/** { id -> { priority: 1|2|3|null, why } } from every <dir>/*\/results.json. Anything not 1, 2 or 3 is null (the backlog). */
	answers(dir){
		const out = new Map();
		for (const b of fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory())){
			let got; try { got = JSON.parse(fs.readFileSync(path.join(dir, b.name, "results.json"), "utf8")); } catch { continue; }
			const want = new Set(JSON.parse(fs.readFileSync(path.join(dir, b.name, "asks.json"), "utf8")));
			for (const r of got){
				if (!want.has(r.id) || out.has(r.id)) continue;
				const n = Number(r.priority);
				out.set(r.id, { priority: [1, 2, 3].includes(n) ? n : null, why: String(r.why ?? "").slice(0, 200) });
			}
		}
		return out;
	}

	// ---- the plan and the pass --------------------------------------------------------------------------

	/** [{ task, module, title, priority|null, action: "approve"|"backlog", why }]: a proposal with no answer goes to the backlog (none is the default). */
	plan(dir){
		const ans = this.answers(dir), P = new Map(this.priorities().map(p => [p.n, p]));
		return this.proposals().map(t => {
			const a = ans.get(t.id), n = a?.priority && P.has(a.priority) ? a.priority : null;
			return { task: t.task, module: t.module, title: t.title, priority: n, action: n ? "approve" : "backlog", why: a?.why ?? "", name: n ? P.get(n).name : null };
		});
	}

	static counts(plan){
		const by = { 1: 0, 2: 0, 3: 0, backlog: 0 };
		for (const p of plan) by[p.priority ?? "backlog"]++;
		return { total: plan.length, accepted: by[1] + by[2] + by[3], ...by, agree: by[1] + by[2] + by[3] + by.backlog === plan.length };
	}

	/** One change through the item tool's own function. Approve: the verdict, then the priority. Backlog: waiting_on "backlog". */
	async write(p, run_item){
		const ctx = { caller: ProposalTriage.BY };
		const lines = p.action === "approve"
			? [{ approve: { by: ProposalTriage.BY, note: `serves priority ${p.priority}: ${p.name}. ${ProposalTriage.OWNER_WORDS}` } },
			   // Task.rank reads a bigger score as higher, so big thing 1 is score 3; `big` keeps the owner's own number
			   { priority: { score: 4 - p.priority, big: p.priority, why: `serves priority ${p.priority}: ${p.name}`, by: ProposalTriage.BY } }]
			: [{ waiting_on: "backlog" }];
		for (const delta of lines){
			const r = await run_item({ path: p.task, delta }, ctx, true);
			if (!r.ok) return { ok: false, why: r.why };
		}
		return { ok: true };
	}

	async apply(dir){
		const plan = this.plan(dir), { run_item } = await import(pathToFileURL(path.join(this.root, "Servex/agents/page_tools.js")).href);
		const out = this.file(this.out), done = [], refused = [];
		fs.mkdirSync(path.dirname(out), { recursive: true });
		for (const p of plan){
			const r = await this.write(p, run_item);
			if (!r.ok){ refused.push({ task: p.task, why: r.why }); continue; }
			const row = { task: p.task, module: p.module, priority: p.priority, action: p.action, at: this.now() };
			fs.appendFileSync(out, JSON.stringify(row) + NL);   // one line as soon as the task changed, so a crash leaves an honest manifest
			done.push(row);
		}
		return { plan, done, refused, counts: ProposalTriage.counts(plan) };
	}

	static report(plan){
		const c = ProposalTriage.counts(plan);
		return [
			...plan.map(p => `${p.action === "approve" ? "approve P" + p.priority : "backlog   "}  ${p.module}  ${p.title}`),
			`total ${c.total} = priority 1: ${c[1]} + priority 2: ${c[2]} + priority 3: ${c[3]} + backlog: ${c.backlog}  (${c.agree ? "the numbers agree" : "THEY DISAGREE"})`,
		].join(NL);
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const argv = process.argv.slice(2), val = f => argv.includes(f) ? argv[argv.indexOf(f) + 1] : null;
	const t = new ProposalTriage({ root: path.resolve(val("--root") ?? HERE), list: val("--list") ?? undefined, out: val("--out") ?? undefined });
	if (argv.includes("--count")) console.log(t.proposals().length + " proposals waiting on the owner");
	else if (argv.includes("--plan")) console.log(ProposalTriage.report(t.plan(path.resolve(val("--plan")))));
	else if (argv.includes("--apply")){
		const r = await t.apply(path.resolve(val("--apply")));
		console.log(`changed ${r.done.length}, refused ${r.refused.length}`, r.counts);
		for (const x of r.refused) console.log("  refused " + x.task + ": " + x.why);
		if (!r.counts.agree || r.refused.length) process.exitCode = 1;
	} else console.log("usage: node Server/ProposalTriage.mjs --count | --plan <dir> | --apply <dir>");
}

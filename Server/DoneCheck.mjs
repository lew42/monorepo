#!/usr/bin/env node
/**
 * class DoneCheck — "marked done, not done" (completion item 4, doc: public/framework/core/Task/doc/completion.md).
 * Every COMPLETED owner ask that claims proof (an outcome and evidence) is checked twice:
 *   1. code: each piece of evidence that names a repo path or a commit must exist (`evidence_missing`);
 *   2. one Haiku call per batch of 25: does the outcome answer what the owner asked (the task title, and its `expected` lines)? ok | not-done | unclear.
 * A `not-done` or missing-evidence ask gets ONE log line in the log that holds the task (`{log:{msg, done_check, url, id}}`); the list goes to
 * queue/done-check.json (gitignored; the queue page reads it). Nothing is reopened or edited: the owner reopens from the page (Task `start` from complete).
 *
 *   node Server/DoneCheck.mjs --dry            how many asks would be sent, and the cost estimate
 *   node Server/DoneCheck.mjs [--limit 100]    check the asks not yet checked (a verdict is kept per ask+outcome), at most --limit of them
 *   node Server/DoneCheck.mjs --list           print the flagged asks from the last run
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Dropped from "../Servex/Dropped.js";
import PromptRecords from "./PromptRecords.mjs";
import PromptAudit from "./PromptAudit.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default class DoneCheck {

	static MODEL = "claude-haiku-5-5";
	static BATCH = 25;   // asks per call: well under 60k tokens
	static OUT = "public/framework/ai/queue/done-check.json";
	static SYSTEM = `You check whether finished work answers what the owner asked. For each item you get "ask" (the owner's request as a task title, with the "expected" lines when there are some), "outcome" (what the agent says is now true) and "evidence" (what it points to).
Answer ok when the outcome plausibly delivers what the ask wants, even if worded differently. Answer not-done when the outcome is about something else, is only a plan, a note or a partial step, or leaves out the main thing asked. Answer unclear only when the ask is too vague to judge.
Reply with ONE JSON object and nothing else: {"verdicts":[{"n":<item number>,"verdict":"ok"|"not-done"|"unclear","why":"<one short sentence>"}]} with one entry per item.`;

	constructor(opts = {}){
		Object.assign(this, { root: ROOT, limit: Infinity, dry: false, ask: (p, o) => PromptRecords.ask(p, o), clock: () => Date.now() }, opts);
		this.out = path.join(this.root, DoneCheck.OUT);
		this.dropped = new Dropped({ root: this.root, clock: this.clock });
	}

	key(a){ return `${a.url}#${a.id}:${a.outcome.slice(0, 80)}`; }

	read_out(){ try { return JSON.parse(fs.readFileSync(this.out, "utf8")); } catch { return { checked: {}, flagged: [] }; } }

	/** Code check: does every path or commit in the evidence exist? Returns the evidence items that name something missing. */
	missing_evidence(a){
		return a.evidence.map(String).filter(e => {
			if (/^[0-9a-f]{7,40}$/.test(e)) return spawnSync("git", ["cat-file", "-e", e + "^{commit}"], { cwd: this.root, windowsHide: true }).status !== 0;
			const m = e.match(/^(\/[\w.\-\/]+|(?:public|Server|Servex|\.claude)\/[\w.\-\/]+)(?:[:#].*)?$/);
			if (!m) return false;   // prose, a test name, a URL or a module-relative path: not checkable by code
			const rel = m[1].replace(/^\/+/, "");
			return !["", "public"].some(base => fs.existsSync(path.join(this.root, base, rel)));
		});
	}

	todo(){
		const prior = this.read_out().checked;
		return this.dropped.completed_asks().filter(a => !prior[this.key(a)]).slice(0, this.limit);
	}

	async run(){
		const state = this.read_out(), todo = this.todo(), batches = [];
		for (let i = 0; i < todo.length; i += DoneCheck.BATCH) batches.push(todo.slice(i, i + DoneCheck.BATCH));
		if (this.dry) return { asks: todo.length, calls: batches.length, est_usd: +(batches.length * 0.04).toFixed(2) };
		let spent = 0;
		for (const batch of batches){
			const items = batch.map((a, i) => ({ n: i + 1, ask: a.title, ...(a.expected ? { expected: [].concat(a.expected) } : {}), outcome: a.outcome, evidence: a.evidence }));
			let verdicts = [];
			try {
				const r = await this.ask(JSON.stringify(items, null, 1), { model: DoneCheck.MODEL, system: DoneCheck.SYSTEM });
				spent += r.usd; verdicts = PromptAudit.json(r.text).verdicts ?? [];
			} catch (e){ console.log(`✗ batch of ${batch.length}: ${e.message}`); continue; }
			for (const [i, a] of batch.entries()){
				const v = verdicts.find(x => Number(x.n) === i + 1);
				if (!v || !["ok", "not-done", "unclear"].includes(v.verdict)) continue;
				const missing = this.missing_evidence(a), bad = v.verdict === "not-done" || missing.length > 0;
				const why = [v.verdict === "not-done" ? v.why : null, missing.length ? `evidence not found: ${missing.join(", ")}` : null].filter(Boolean).join("; ");
				state.checked[this.key(a)] = { verdict: v.verdict, ...(missing.length ? { missing } : {}), at: this.stamp() };
				if (!bad) continue;
				state.flagged = state.flagged.filter(f => !(f.url === a.url && f.id === a.id));
				state.flagged.push({ url: a.url, id: a.id, title: a.title, outcome: a.outcome, why });
				await this.log_flag(a, why);
			}
		}
		state.at = this.stamp(); state.spent_usd = +((state.spent_usd ?? 0) + spent).toFixed(4);
		fs.mkdirSync(path.dirname(this.out), { recursive: true }); fs.writeFileSync(this.out, JSON.stringify(state));
		return { asks: todo.length, calls: batches.length, flagged: state.flagged.length, usd: +spent.toFixed(4) };
	}

	/** One line per flagged ask, in the log that holds the task; never twice for the same ask. */
	async log_flag(a, why){
		let text = ""; try { text = fs.readFileSync(a.file, "utf8"); } catch { return; }
		const mark = `"done_check":"not-done","url":${JSON.stringify(a.url)},"id":${JSON.stringify(a.id)}`;
		if (text.includes(mark)) return;
		fs.appendFileSync(a.file, JSON.stringify({ log: { at: this.stamp(), msg: `marked done, not done: ${String(a.title).slice(0, 100)}: ${why}`, done_check: "not-done", url: a.url, id: a.id } }) + "\n");
	}

	stamp(){ return this.dropped.stamp(this.clock()); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
	const dc = new DoneCheck({ dry: process.argv.includes("--dry"), limit: arg("--limit") ? Number(arg("--limit")) : Infinity });
	if (process.argv.includes("--list")) for (const f of dc.read_out().flagged) console.log(`${f.url} #${f.id}  ${f.title}\n   ${f.why}`);
	else console.log(JSON.stringify(await dc.run()));
}

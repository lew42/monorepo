#!/usr/bin/env node
// Server/Asked.mjs — "Didn't I ask for X?": when it was asked, what was done, what was decided against and why. Script only, no AI reads.
// Doc: public/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/asked-for.md
//   node Server/Asked.mjs <topic words...> [--json]
// Joins: ai/doc/asks-outcomes.jsonl (AskTally: feature rows + each dictated ask with its date and outcome), PastWork (landed tasks),
// and the `decision` lines of the matching tasks' task.jsonl (question, options, chose, why).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PastWork from "./PastWork.mjs";
import SessionRecord from "./SessionRecord.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTCOMES = path.join(REPO, "public/framework/ai/doc/asks-outcomes.jsonl");
const clip = (s, n) => { s = String(s ?? "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

export default class Asked {
	constructor(topic) { this.topic = topic; this.words = PastWork.words(topic); }

	/** Count of topic words found in a string; a match needs at least half the words (one word topics need that word). */
	hit(s) { const t = String(s ?? "").toLowerCase(); return this.words.filter(w => t.includes(w)).length; }
	match(s) { return this.words.length > 0 && this.hit(s) >= Math.ceil(this.words.length / 2); }

	/** AskTally's records: features whose name matches, and the dictated asks that match (raw words, date, source, outcome). */
	asks() {
		const feats = [], asks = [];
		let lines = []; try { lines = fs.readFileSync(OUTCOMES, "utf8").split("\n").filter(Boolean); } catch {}
		for (const l of lines) {
			let o; try { o = JSON.parse(l); } catch { continue; }
			if (o.feature && this.match(o.feature.name)) feats.push(o.feature);
			else if (o.ask && (this.match(o.ask.feature) || this.match(o.ask.ask))) asks.push(o.ask);
		}
		asks.sort((a, b) => String(a.date).localeCompare(String(b.date)));
		return { feats, asks };
	}

	/** Decision lines of the matching tasks that name an alternative (options / not-chosen) or a reason. */
	decisions(tasks) {
		const out = [];
		for (const t of tasks) {
			let text; try { text = fs.readFileSync(SessionRecord.log_or_old(REPO, t.dir), "utf8"); } catch { continue; }
			for (const l of text.split("\n")) {
				if (!l.includes('"decision"')) continue;
				let d; try { d = JSON.parse(l).decision; } catch { continue; }
				if (!d || !(d.chose && d.why)) continue;
				out.push({ at: String(d.at ?? "").slice(0, 10), question: d.question, options: d.options ?? d.alternative ?? d.rejected, chose: d.chose, why: d.why, task: t.url });
			}
		}
		return out.slice(0, 8);
	}

	run() {
		const { feats, asks } = this.asks();
		const found = PastWork.search(this.topic, 8);
		const tasks = found.tasks.filter(t => this.match(`${t.title} ${t.slug} ${t.request}`));
		const first = asks[0]?.date ?? feats.map(f => f.first).sort()[0] ?? null;
		return { topic: this.topic, first, last: asks.at(-1)?.date ?? null, times: asks.length, features: feats, asks, tasks, decisions: this.decisions(tasks), routed: found.asks.filter(a => this.match(a.title)) };
	}

	format(r) {
		const o = [`# Asked: "${r.topic}"`, ""];
		if (!r.first && !r.tasks.length && !r.routed.length) return o.concat("Nothing found. Not asked, or asked in words these keywords miss: try fewer or other words.").join("\n");
		o.push("## When it was asked");
		if (r.asks.length) {
			o.push(`${r.times} dictated ask${r.times > 1 ? "s" : ""}, first ${r.first}, last ${r.last}.`);
			for (const a of r.asks.slice(0, 3)) o.push(`- ${a.date} — "${clip(a.ask || a.raw, 160)}" (${a.source ?? "?"})`);
		} else o.push("No dictated ask matches (AskTally covers prompts since 2026-09-15).");
		for (const a of r.routed.slice(0, 3)) o.push(`- routed ask: ${a.at?.slice(0, 10)} "${clip(a.title, 100)}" → ${a.owner} [${a.status}]`);
		o.push("", "## What was done");
		for (const f of r.features.slice(0, 3)) o.push(`- feature "${f.name}": **${f.status}** — ${clip(f.proof, 200)}`);
		for (const t of r.tasks.slice(0, 5)) o.push(`- ${t.landed ? "landed " + t.date : "NOT landed"}: ${clip(t.title, 80)} — ${clip(t.outcome, 160)} ${t.url}`);
		if (!r.features.length && !r.tasks.length) o.push("- No landed task or feature matches: it was asked and nothing names it.");
		o.push("", "## Decided against, and why");
		if (!r.decisions.length) o.push("- No decision line with an alternative matches.");
		for (const d of r.decisions) o.push(`- ${d.at} ${clip(d.question, 90)}: chose ${clip(d.chose, 80)}${d.options ? " over " + clip(JSON.stringify(d.options), 100) : ""} — ${clip(d.why, 160)} ${d.task}`);
		return o.join("\n");
	}

	static main(argv) {
		const json = argv.includes("--json"), topic = argv.filter(a => !a.startsWith("--")).join(" ");
		if (!topic) { console.error("usage: node Server/Asked.mjs <topic words...> [--json]"); process.exit(2); }
		const a = new Asked(topic), r = a.run();
		console.log(json ? JSON.stringify(r, null, 1) : a.format(r));
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) Asked.main(process.argv.slice(2));

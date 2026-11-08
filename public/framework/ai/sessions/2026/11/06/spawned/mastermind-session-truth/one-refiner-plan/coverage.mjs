#!/usr/bin/env node
// coverage.mjs: per channel, how many of the owner's sentences this week were refined and placed in a task.
// Read-only study; writes coverage.json beside itself. Window 2026-11-01..2026-11-08 (session folders by day).
//   prompts   = same rules as mentions-plan/count.mjs (agreement checked against count-ref.json, a copy of it for this window)
//   sentences = VS Code: Ask.split of the counted Prompt text (the shared splitter every channel's writer uses);
//               web dictation: the stored `sentences.add` rows; cloud voice: none stored (no owner words in the record)
//   refined   = sentences cited by a `parts` line in the session's prompts.jsonl, or by a `refined` line's section item (`cites`)
//   placed    = refined AND the item becomes a task: a parts line with a task whose source.part names it, or a `refined` line
//               carrying v:2 (Session.refine_turn turns each section item into a child task). A v1 `refined` outline item is not a task.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "../../../../../../../../../../");
const SESS = path.join(REPO, "public/framework/ai/sessions/2026/11");
const DAYS = ["01", "02", "03", "04", "05", "06", "07", "08"];
const { default: Ask } = await import(pathToFileURL(path.join(REPO, "Server/Ask.mjs")).href);

const walk = (dir, out = []) => { let e; try { e = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
	for (const x of e){ if (x.name === "node_modules" || x.name === ".git") continue; const p = path.join(dir, x.name); x.isDirectory() ? walk(p, out) : out.push(p); } return out; };
const rows = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } }); } catch { return []; } };

const files = DAYS.flatMap(d => walk(path.join(SESS, d)).filter(f => path.basename(f) === "session.jsonl"));
const is_v = f => /[/\\]v-[^/\\]+$/.test(path.dirname(f));
const ch = { vscode: { prompts: 0, sentences: 0, refined: 0, placed: 0 }, "cloud voice": { prompts: 0, sentences: 0, refined: 0, placed: 0 }, "web dictation": { prompts: 0, sentences: 0, refined: 0, placed: 0 } };
const seen_ts = new Set(), notes = { v1_refined_lines: 0, v2_refined_lines: 0, parts_lines: 0, prompts_jsonl_files: 0, source_part_tasks: 0 };

// cited sentence numbers per `refined` line: distinct n over its section items
const cites_of = r => new Set((r.sections ?? []).flatMap(s => (s.items ?? []).flatMap(i => i.cites ?? [])));

for (const f of files){
	const R = rows(f), v = is_v(f), cloud = /cloud-voice-app-2026110[68]/.test(f);
	// prompts.jsonl beside the record: legacy PromptRecords (`parts` lines cite sentence numbers; tasks name source.part)
	const pj = path.join(path.dirname(f), "prompts.jsonl");
	let parts_cited = 0, parts_placed = 0;
	if (fs.existsSync(pj)){ notes.prompts_jsonl_files++;
		const part_rows = rows(pj).filter(x => x.parts); notes.parts_lines += part_rows.length;
		const task_parts = new Set(R.flatMap(x => x.tasks?.add?.source?.part ? [x.tasks.add.source.part] : []));
		for (const p of part_rows){ const flat = (a, o = []) => { for (const q of a ?? []){ o.push(q); flat(q.parts, o); } return o; };
			for (const q of flat(p.parts?.parts ?? p.parts)){ parts_cited += (q.cites ?? []).length; if (task_parts.has(q.id)) parts_placed += (q.cites ?? []).length; } } }
	if (v){
		const groups = new Map(); let sentences = 0;
		for (const x of R){
			if (x.refined) continue;
			const s = x.sentences?.add, m = x.messages?.add;
			if (!s || !m || m.type !== "Prompt" || m.by !== "owner" || !m.prompt) continue;
			if (!groups.has(m.prompt)) groups.set(m.prompt, []); groups.get(m.prompt).push(s.text); sentences++; if (m.at) seen_ts.add(m.at);
		}
		let refined = 0, placed = 0;
		for (const x of R) if (x.refined){ const c = cites_of(x.refined).size; refined += c; x.refined.v === 2 ? (notes.v2_refined_lines++, placed += c) : notes.v1_refined_lines++;
			if (x.refined.re && !seen_ts.has(x.refined.re) && Array.isArray(x.refined.sentences)){ /* count.mjs adds an unmatched refined turn as a prompt */ groups.set("refined:" + x.refined.re, [""]); } }
		ch["web dictation"].prompts += groups.size; ch["web dictation"].sentences += sentences;
		ch["web dictation"].refined += Math.min(sentences, refined + parts_cited); ch["web dictation"].placed += Math.min(sentences, placed + parts_placed);
	} else if (cloud){
		const n = R.filter(x => x.tasks?.add?.type === "Task").length;   // count.mjs's proxy: tasks.add title (+why); no owner sentences are stored
		ch["cloud voice"].prompts += n;
	} else {
		for (const x of R){
			const a = x.content?.add; if (!a || a.type !== "Prompt" || !a.counted) continue;
			const n = Ask.split(a.text ?? "").length; ch.vscode.prompts++; ch.vscode.sentences += n; if (x.ts) seen_ts.add(x.ts);
			const rl = R.find(y => y.refined?.re && y.refined.at && Ask.now && y.refined.re === x.refined?.re);   // none expected; see notes
			void rl;
		}
		for (const x of R) if (x.refined?.re){ const c = cites_of(x.refined).size; ch.vscode.refined += c; x.refined.v === 2 ? (notes.v2_refined_lines++, ch.vscode.placed += c) : notes.v1_refined_lines++; }
		ch.vscode.refined += parts_cited; ch.vscode.placed += parts_placed;
	}
	notes.source_part_tasks += R.filter(x => x.tasks?.add?.source?.part).length;
}
for (const c of Object.values(ch)) c.coverage = c.sentences ? +(c.placed / c.sentences).toFixed(3) : 0;
const total = Object.values(ch).reduce((s, c) => s + c.prompts, 0);
const ref = JSON.parse(fs.readFileSync(path.join(here, "count-ref.json"), "utf8"));
const out = {
	window: "2026-11-01..2026-11-08", prompts_total: total,
	agrees_with_count_mjs: { this_script: total, count_mjs_same_window: ref.prompts_total, by_source: ref.prompts_by_source, equal: total === ref.prompts_total },
	channels: ch, notes,
	why_zero: {
		vscode: "the counted Prompt item exists only on 2026-11-04; PromptTasks (the live parts+tasks step) is switched off (prompt-tasks.off in the Servex home) and no prompts.jsonl in the window has a parts line; Ask.write's v:2 refined line has not been written yet.",
		"cloud voice": "the record holds tool calls and logs, no owner sentences, so there is nothing to refine; prompts here are tasks the voice agent filed (count.mjs's proxy).",
		"web dictation": "sentences are stored and placed into the live outline (`place` lines), and some turns have a v1 `refined` outline, but a v1 outline item is not a task; no v:2 line exists, so placed is 0 until Ask.write's v:2 lines flow.",
	},
};
fs.writeFileSync(path.join(here, "coverage.json"), JSON.stringify(out, null, 2) + "\n");
console.log(JSON.stringify({ prompts_total: total, count_mjs: ref.prompts_total, equal: out.agrees_with_count_mjs.equal, channels: ch, notes }, null, 1));

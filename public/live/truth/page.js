import { Page, View, div, h2, p, span, table, tr, th, td, ul, li } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

View.stylesheet(import.meta, "truth.css");

/* /live/truth/: how true is the session record? One run of `node Server/Truth.mjs --write` appends one line to truth.jsonl; this page streams it.
 * Every figure is a count over the real classes (Task.tally, SessionFolders); nothing here counts. Doc: readme.md beside this file. */
class TruthLog extends JSONL {
	static verbs = [...JSONL.verbs, "truth"];
	runs = [];
	truth(v){ this.runs.push(v); }
}

const n = v => Number(v ?? 0).toLocaleString("en-US");
const pct = (a, d) => d ? Math.round(a / d * 1000) / 10 + "%" : "n/a";
const of = (a, d) => `${n(a)} of ${n(d)} (${pct(a, d)})`;
const ROWS = [
	["Sessions", b => n(b.sessions), "One per session id (SessionFolders.homes), counted once."],
	["with a work log", b => n(b.with_log), "Its record has assign, log or agent lines."],
	["with only digest tags", b => n(b.tag_only), "Its session.jsonl holds tags and nothing about the work."],
	["transcript only", b => n(b.transcript_only), "Only index.json or cache.jsonl: the cost is counted, nothing was recorded."],
	["with any task", b => of(b.with_tasks, b.sessions), "With any task + with no task = sessions."],
	["with no task (needs review)", b => of(b.no_tasks, b.sessions), "The work was never filed as a task."],
	["complete (score 1)", b => of(b.complete, b.with_tasks) + " of those with tasks", "Task.completion_score()."],
	["done tasks without outcome or evidence", b => of(b.unproven, b.done_tasks), "Task.proof_problem."],
	["with no commit line", b => of(b.no_commit, b.sessions), "No commit line in the session's record or any task log under it."],
	["owner prompts in sessions with no task", b => `${n(b.prompts_unfiled)} in ${n(b.sessions_unfiled)} sessions`, "Asks said but never filed."],
];

export default new Page({
	meta: import.meta,
	title: "Truth",
	description: "How true the session and task record is, counted by code each day.",
	icon: "fact_check",

	content(){
		const log = new TruthLog({ url: import.meta.resolve("./truth.jsonl") });
		const $out = div.c("truth");
		const draw = () => $out.empty(() => {
			const runs = log.runs, last = runs.at(-1);
			if (!last){ p("No run yet. Run `node Server/Truth.mjs --write`."); return; }
			const base = runs.findLast(r => /^baseline/.test(r.label ?? "")) ?? runs[0];
			p(`Counted by code once a day. The baseline is the run of ${base.at.slice(0, 10)}; the newest run is ${last.at.replace("T", " ").slice(0, 16)} UTC.`);
			div.c("truth-twins", () => { span.c("truth-big", n(last.twins + last.flat)); span(`sessions are held by two folders (${n(last.twins)} twin folders, ${n(last.flat)} flat folders). This must be 0. The 1,410 twins in the first brief were folded before the first run.`); });
			div.c("truth-body", () => {
				table.c("truth-table", () => {
					tr(() => { th("What"); th("All sessions"); th("Last 7 days"); th("Baseline"); });
					for (const [name, f] of ROWS) tr(() => { td(name); td(f(last.all)); td(f(last.week)); td(f(base.all)); });
				});
				div.c("truth-notes", () => {
					h2("How each row is counted");
					ul(() => { for (const [name, , note] of ROWS) li(`${name}: ${note}`); });
					p(`Folders under the day folders: ${n(last.folders?.total)}. ${n(last.folders?.no_session_file)} hold no session file at all (${n(last.folders?.empty)} are empty). They are not sessions and are not in the table.`);
				});
			});
			h2("Trend: sessions with any task");
			const top = Math.max(...runs.map(r => r.all.with_tasks / Math.max(1, r.all.sessions)));
			div.c("truth-trend", () => {
				for (const r of runs) div.c("truth-bar").style("height", `${Math.max(2, r.all.with_tasks / Math.max(1, r.all.sessions) / top * 100)}%`).attr("title", `${r.at.slice(0, 10)}: ${pct(r.all.with_tasks, r.all.sessions)}`);
			});
			p(`${n(runs.length)} run${runs.length > 1 ? "s" : ""}.`);
		});
		log.live(draw).then(draw);
	},
});

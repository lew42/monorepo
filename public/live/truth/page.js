import { Page, View, div, h2, p, span, table, tr, th, td, md } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

View.stylesheet(import.meta, "truth.css");

/* /live/truth/: how true is the session record? One run of `node Server/Truth.mjs --write` appends one line to truth.jsonl; this page streams it.
 * Every figure is a count over the real classes (Task.tally, SessionFolders); nothing here counts. Doc: readme.md beside this file. */
class TruthLog extends JSONL {
	static verbs = [...JSONL.verbs, "truth"];
	runs = [];
	truth(v){ this.runs.push(v); }
}

const pct = (n, d) => d ? Math.round(n / d * 100) + "%" : "n/a";
const ROWS = [
	["Sessions", b => b.sessions, "every session id the store holds once (SessionFolders.homes)"],
	["  with a task log", b => b.with_log, "record with assign/log/agent lines (SessionRecord.log_file); a spawned agent's record is found in its nested task folder"],
	["  tag-only record", b => b.tag_only, "session.jsonl holds only digest tags: no log of the work"],
	["  transcript only", b => b.transcript_only, "only index.json/cache.jsonl: cost is counted, nothing was recorded"],
	["  with any task", b => `${b.with_tasks} (${pct(b.with_tasks, b.sessions)})`, "with + without = sessions"],
	["  no tasks: needs review", b => `${b.no_tasks} (${pct(b.no_tasks, b.sessions)})`, "the work was never recorded"],
	["  complete (score 1)", b => `${b.complete} of ${b.with_tasks} with tasks (${pct(b.complete, b.with_tasks)})`, "Task.completion_score()"],
	["Done tasks with no outcome or evidence", b => `${b.unproven} of ${b.done_tasks} (${pct(b.unproven, b.done_tasks)})`, "Task.proof_problem"],
	["Sessions with no commit line", b => `${b.no_commit} of ${b.sessions} (${pct(b.no_commit, b.sessions)})`, "no \"commit\" line in the session's record or its task logs"],
	["Owner asks not filed as a task", b => `${b.prompts_unfiled} prompts in ${b.sessions_unfiled} sessions with no task`, "Prompt lines in a session with no tasks"],
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
			const first = runs[0];
			p(`Baseline (${first.label ?? "first run"}, ${first.at.slice(0, 10)}) was measured before the fixes of the truth job merged; the Baseline column is that run, and the other columns are the newest run (counted daily by Servex). Newest run: ${last.at.replace("T", " ").slice(0, 16)} UTC.`);
			div.c("truth-twins", () => { span.c("truth-big", String(last.twins + last.flat)); span(` sessions held by two folders (twin folders: ${last.twins}, flat folders: ${last.flat}); must be 0`); });
			p(`Folders under sessions/YYYY/MM/DD: ${last.folders?.total ?? "?"} in all, of which ${last.folders?.no_session_file ?? "?"} hold no session file at all (${last.folders?.empty ?? "?"} are empty). The twins in the brief (1,410) were folded before ${first.at.slice(0, 10)}; the check has found none since.`);
			table.c("truth-table", () => {
				tr(() => { th("What"); th("All sessions"); th("Last 7 days"); th("Baseline, all"); th("Counted by"); });
				for (const [name, f, note] of ROWS) tr(() => { td(name.trim()); td(String(f(last.all))); td(String(f(last.week))); td(String(f(first.all))); td(note); });
			});
			h2("Trend: sessions with any task");
			div.c("truth-trend", () => {
				for (const r of runs) div.c("truth-bar").style(`height:${Math.max(2, r.all.with_tasks / Math.max(1, r.all.sessions) * 100 * 8)}px`).title(`${r.at.slice(0, 10)}: ${pct(r.all.with_tasks, r.all.sessions)}`);
			});
			p(`${runs.length} run${runs.length > 1 ? "s" : ""}.`);
		});
		log.live(draw).then(draw);
	},
});

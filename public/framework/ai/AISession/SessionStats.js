import View, { div, span, small, strong, a } from "/framework/core/View/View.js";
import { names } from "/framework/core/Router/listing.js";
import TaskView from "/framework/core/Task/TaskView.js";
import Task from "/framework/core/Task/Task.js";
import SessionWork from "./SessionWork.js";
import { span_active } from "/framework/ai/AITask/stats.js";
import AICost from "/framework/ai/AITask/AICost.js";

View.stylesheet(import.meta, "SessionOverview.css");

/** The session page's sticky stats bar (Figma band E, A): cost, model, running for, done X of Y, the one segmented bar and
 *  its caption. Read from the tree the Tasks tab (SessionWork) loads: `ready` is a promise of that loaded SessionWork. Stays under the page head on every tab. */
export default class SessionStats extends View {

	/** "2 d 4 h", "3 h 12 min", "14 min": the two biggest units. */
	static elapsed(ms){
		const m = Math.round((ms ?? 0) / 6e4);
		if (m <= 0) return "—";
		return m < 60 ? m + " min" : m < 1440 ? Math.floor(m / 60) + " h " + (m % 60) + " min" : Math.floor(m / 1440) + " d " + Math.floor(m % 1440 / 60) + " h";
	}

	initialize(){
		this.ac("sov-stats");
		this.ready.then(work => this.draw(work));
	}

	/** The session's total cost, from the item tool's `summary` (the same answer, and the same cache, as the Report tab's AICost.report):
	 *  one computation of a session's cost for every surface. SessionWork's own sum adds the day snapshots' older, inflated `usd`. */
	static cost($v, work, { row, open } = {}){
		const base = work.id ? AICost.session_url(work.id) : work.dir, own_usd = work.tree?.snap?.usd ?? null;
		const draw = (cost, tab) => $v.text(AICost.cost_line({ cost, own_usd, tab }).text);
		Promise.all([AICost.summary(base), Promise.resolve(row).catch(() => null)]).then(([{ summary, why }, r]) => {
			const tab = AICost.is_tab(r, summary);
			if (summary?.cost) return draw(summary.cost, tab);
			draw(null, tab); $v.attr("title", why ?? "Servex gave no total for this session.");
		});
		draw(null, false);
		if (open) $v.attr("title", "Open the Cost tab: what this session spent and every child session behind the total").on("click", open);
	}

	draw(work){
		const { tree } = work;
		if (!tree) return void (this.el.hidden = true);
		const root = tree.root, part = SessionWork.split(root);
		const { done, total } = Task.progress_of(part.counted);
		this.empty(() => {
			div.c("sov-stat-row", () => {
				div.c("sov-stat", () => { small.c("sov-k", "Cost"); SessionStats.cost(strong.c("sov-v" + (this.open_cost ? " sov-link" : ""), "…"), work, { row: this.row, open: this.open_cost }); });
				const running = { el: null };
				for (const [label, value] of [["Model", tree.snap?.model ?? "—"], ["Running for", SessionStats.elapsed(root.ms())], ["Task folders done", total ? `${done} of ${total}` : "no task folders"]])
					div.c("sov-stat", () => { small.c("sov-k", label); const v = strong.c("sov-v", value); if (label === "Running for") running.el = v; });
				if (work.id && running.el) AICost.summary(AICost.session_url(work.id)).then(({ summary: s }) => { const ms = s?.span_ms ?? (s?.first_at && s?.last_at ? Date.parse(s.last_at) - Date.parse(s.first_at) : 0); if (ms > 0) running.el.text(span_active(ms, s.cost?.own?.active_ms)).attr("title", "From the session's first line to its last (a stop and restart does not reset it), and the hours it was actually working"); });
			});
			if (part.counted.length) div.c("sov-bar", () => TaskView.draw_bar(part.counted.map(n => n.state), 12));
			small.c("sov-caption", `Task folders: ${done} done · ${part.running} running · ${total - done - part.running} queued or waiting · ${part.dropped.length} dropped (not counted)`);   // one count each, so the parts add up to the total
			const folders = root.folders ?? [work.dir];   // the session's folders, one per day it filed work under (SessionTree.load)
			small.c("sov-links", () => {
				span("This session's record: ");
				folders.forEach((f, i) => { const have = names(f), log = !have ? "session.jsonl" : ["session.jsonl", "task.jsonl"].find(n => have.includes(n)); if (!log) return; if (i) span(" · "); a.c("", folders.length > 1 ? `log, ${f.match(/\d{4}\/\d\d\/\d\d/)?.[0] ?? f}` : `the session log (${log})`).href(f + log).attr("target", "_blank"); });
				if (work.id) { span(" · "); a.c("", "the transcript").href("/ai-logs/" + work.id).attr("target", "_blank"); }
			});
		});
		this.el.hidden = false;
	}
}

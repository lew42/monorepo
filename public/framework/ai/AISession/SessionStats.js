import View, { div, span, small, strong } from "/framework/core/View/View.js";
import TaskView from "/framework/core/Task/TaskView.js";
import Task from "/framework/core/Task/Task.js";
import SessionWork from "./SessionWork.js";

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

	draw(work){
		const { tree } = work;
		if (!tree) return void (this.el.hidden = true);
		const root = tree.root, part = SessionWork.split(root), rolled = work.figures(root).rolled;
		const { done, total } = Task.progress_of(part.counted);
		this.empty(() => {
			div.c("sov-stat-row", () => {
				for (const [label, value] of [["Cost", "$" + rolled.toFixed(2)], ["Model", tree.snap?.model ?? "—"], ["Running for", SessionStats.elapsed(root.ms())], ["Done", total ? `${done} of ${total}` : "no tasks"]])
					div.c("sov-stat", () => { small.c("sov-k", label); strong.c("sov-v", value); });
			});
			if (part.counted.length) div.c("sov-bar", () => TaskView.draw_bar(part.counted.map(n => n.state), 12));
			small.c("sov-caption", `${done} done · ${part.running} running · ${part.open.length - part.running} open · ${part.dropped.length} dropped (not counted)`);
		});
		this.el.hidden = false;
	}
}

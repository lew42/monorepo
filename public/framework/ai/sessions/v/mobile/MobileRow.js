import View, { div, span, a, small, strong, icon } from "/framework/core/View/View.js";
import TaskView from "/framework/core/Task/TaskView.js";
import MobileData from "./MobileData.js";

View.stylesheet(import.meta, "mobile.css");

/* One tappable session row: a status dot, the title, a line of facts, and (when the session has tasks) the one task bar.
   `snap` is a day-index snapshot, `tasks` its SessionTree or null, `group` needs | running | done | rest.
   `kids` (page 2) are the child rows drawn under it. */
export default class MobileRow extends View {

	static DOT = { needs: "is-blocked", running: "is-running", done: "is-done", rest: "is-open" };

	initialize(){
		const { snap, tasks, group, tree, line } = this;
		this.ac("mob-row", "mob-" + group);
		a.c("mob-row-link", () => {
			span.c("mob-dot").ac(this.constructor.DOT[group]);
			div.c("mob-row-body", () => {
				strong.c("mob-row-title", snap.title || snap.id);
				small.c("mob-row-sub", () => {
					span.c("mob-kind", MobileData.kind(snap, tree));
					span(" · " + MobileData.ago(snap.last_activity) + (snap.usd ? " · " + MobileData.usd(snap.tree_usd || snap.usd) : ""));
				});
				if (line && group === "done") small.c("mob-row-line", line);
				if (tasks?.root.kids.length > 1) div.c("mob-row-bar", () => TaskView.draw_bar(MobileData.states(tasks.root.kids), 12));
			});
			icon("chevron_right").ac("mob-go");
		}).href(MobileData.session_url(snap.id));
	}
}

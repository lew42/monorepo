import View, { div, span, a, small, strong, icon } from "/framework/core/View/View.js";
import TaskView from "/framework/core/Task/TaskView.js";
import MobileData from "./MobileData.js";
import MobileRun from "./MobileRun.js";

View.stylesheet(import.meta, "mobile.css");

/* One task as a flat row: the run indicator and its buttons, the title (a link to the task page), its one-line outcome or state,
   and the one bar when it has 2 or more children. `node` is a SessionTree.Node, `sid` the session id it belongs to. */
export default class MobileTaskRow extends View {

	initialize(){
		const { node } = this, kids = MobileData.states(node.kids);
		this.ac("mob-task-row", "is-" + node.state);
		this.empty(() => {
		new MobileRun({ node });
		a.c("mob-task-link", () => {
			div.c("mob-row-body", () => {
				strong.c("mob-row-title", node.title);
				small.c("mob-row-sub", node.line && node.done ? node.line : this.sub(kids));
				if (node.kids.length > 1) div.c("mob-row-bar", () => TaskView.draw_bar(kids, 12));
			});
			icon("chevron_right").ac("mob-go");
		}).href(this.href());
		});
	}

	/** Where the row goes; a subclass on another page (the desktop Overview) sends it to the full task page. */
	href(){ return MobileData.task_url(this.sid, this.node.rel); }

	/** The second line of an unfinished task: its progress and when it started; the dot already says its state, so the word is not repeated. */
	sub(kids){
		const { node } = this, ago = node.started && MobileData.ago(node.started);
		return [kids.length && `${kids.filter(s => s === "complete").length} of ${kids.length} done`, ago && "started " + ago].filter(Boolean).join(" · ") || node.state;
	}
}

import { Page, md } from "/app.js";
import { div, span, a, small, strong, p, h1, button, icon } from "/framework/core/View/View.js";
import TaskView from "/framework/core/Task/TaskView.js";
import TaskPage from "/framework/core/Task/TaskPage.js";
import MobileData from "./MobileData.js";
import MobileRun from "./MobileRun.js";
import MobileTaskRow from "./MobileTaskRow.js";

/* Page 4, one task: status and the bar on top, its content first, its subtasks as flat rows, then its open questions.
   `sid` is the session id, `segs` the task's path under the session folder (deeper folders extend it through route()). */
export default class MobileTask extends Page {

	constructor({ sid, segs }){
		super({ sid, segs, title: segs.at(-1), width: "fill", classes: "mob-page", url: MobileData.task_url(sid, segs.join("/")) });
	}

	route(name){
		if (name.includes(".")) return;
		return new this.constructor({ sid: this.sid, segs: [...this.segs, name] });
	}
	child(name, levels){ return Page.prototype.child.call(this, name, levels); }

	content(){
		const root = div.c("mob-session mob-task");
		this.load(root);
		return root;
	}

	async load(root){
		const snap = await MobileData.find(this.sid), tree = snap && await MobileData.tasks(snap).catch(() => null);
		const node = tree?.root.all().find(n => n.rel === this.segs.join("/"));
		if (!node) return void root.empty(() => p.c("mob-empty", "This task is not in the session's task tree."));
		this.retitle?.(node.title);
		const task = await new TaskPage({ url: node.url }).load_task().catch(() => null);
		const kids = MobileData.states(node.kids);
		root.empty(() => {
			div.c("mob-card", () => {
				div.c("mob-card-head", () => {
					a.c("mob-back", icon("arrow_back")).href(MobileData.session_url(this.sid)).attr("title", "back to the session");
					strong.c("mob-bar-title", node.title);
				});
				div.c("mob-status", () => {
					new MobileRun({ node });
					strong.c("mob-state is-" + node.state, node.state);
					small.c("mob-head-sub", node.kids.length ? `${kids.filter(s => s === "complete").length} of ${kids.length} done` : (node.landed ? "landed" : ""));
				});
				if (node.kids.length > 1) div.c("mob-row-bar", () => TaskView.draw_bar(kids, 12));
			});
			div.c("mob-card", () => {
				div.c("mob-card-head", () => { icon("notes").ac("mob-group-icon"); strong("Content"); });
				const body = div.c("mob-body", () => this.body(node, task));
				const more = button.c("mob-more", "More").click(() => { const open = body.el.classList.toggle("is-open"); more.el.textContent = open ? "Less" : "More"; });
				requestAnimationFrame(() => { if (![...body.el.children].some(l => l.scrollHeight > l.clientHeight + 1)) more.el.remove(); });
			});
			if (node.kids.length) div.c("mob-card", () => {
				div.c("mob-card-head", () => { icon("checklist").ac("mob-group-icon"); strong("Subtasks"); small.c("mob-count", String(node.kids.length)); });
				node.kids.forEach(k => new MobileTaskRow({ node: k, sid: this.sid }));
			});
			const open = this.questions(task);
			div.c("mob-card", () => {
				div.c("mob-card-head", () => { icon("help").ac("mob-group-icon"); strong("Open questions"); small.c("mob-count", String(open.length)); });
				if (!open.length) div.c("mob-empty", "No open questions.");
				open.forEach(q => div.c("mob-question", q));
			});
		});
	}

	/** The one-line outcome, what was expected, then the task's content items. */
	body(node, task){
		const done = task?.get?.("outcome") ?? node.line;   // the whole outcome; the index line is cut
		if (done) md(String(done)).ac("mob-line mob-md");   // an outcome is markdown (ai/AITask/AITask.js draws it the same way)
		for (const line of [task?.expected].flat()) if (line) p.c("mob-line", () => { small.c("mob-fact-k", "expected "); span(String(line)); });
		for (const item of task?._content ?? []){
			const text = item.get?.("text") ?? item.get?.("title") ?? item.data?.text ?? item.data?.title;
			if (text) p.c("mob-line", String(text));
		}
		if (!done && !task?.expected && !(task?._content?.length)) p.c("mob-empty", "No content recorded on this task.");
	}

	/** A task's waiting_on, plus any unanswered Question in its content. */
	questions(task){
		const items = [...(task?._content ?? [])].filter(i => (i.data?.type ?? i.get?.("type")) === "Question" && !(i.data?.answer ?? i.get?.("answer")));
		return [task?.get?.("waiting_on"), ...items.map(i => i.data?.text ?? i.get?.("text"))].filter(Boolean).map(String);
	}
}

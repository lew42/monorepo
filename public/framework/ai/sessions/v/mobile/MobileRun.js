import View, { span, button, icon } from "/framework/core/View/View.js";
import TaskPage from "/framework/core/Task/TaskPage.js";
import { Task } from "/framework/core/Task/Task.js";
import TaskView from "/framework/core/Task/TaskView.js";

View.stylesheet(import.meta, "mobile.css");

/* Is it running? One small indicator on a task row (a dot while it runs, a play triangle when it could start), the buttons
   that fit its state, and a "next" mark when it will start by itself. The buttons are TaskView.VERBS where Task.can(state) allows; a press
   appends the task's own verb line ({"pause":{}}) through task.act, so an agent following that log gets it; there is no second state machine.
   `node` is a SessionTree.Node (rel, url, state); `next` says it is first in line under a running series parent. */
export default class MobileRun extends View {

	/** Computed, never stored: the first child of a running series parent that is not complete, when that child is idle (Task.js start_children). */
	static is_next(node){
		const up = node.parent;
		if (!up || up.state !== "running" || node.state !== "idle") return false;
		return up.kids.find(k => k.state !== "complete") === node;
	}

	initialize(){
		this.ac("mob-run");
		this.next ??= this.constructor.is_next(this.node);
		this.draw();
	}

	draw(){
		const { node } = this, state = node.state;
		this.empty(() => {
			icon(state === "running" ? "fiber_manual_record" : state === "complete" ? "check" : "play_arrow").ac("mob-run-dot", "is-" + state).attr("title", state);
			if (this.next) span.c("mob-run-next", "next").attr("title", "starts by itself when the one before it is done");
			for (const [verb, glyph, title] of TaskView.VERBS.filter(([verb]) => Task.can(state, verb)))
				button.c("mob-run-btn").attr("title", title).attr("aria-label", title).append(icon(glyph)).click(e => { e.preventDefault(); e.stopPropagation(); this.press(verb); });
		});
	}

	async press(verb){
		const task = await new TaskPage({ url: this.node.url }).load_task();
		task.act(verb, verb === "stop" ? "owner pressed stop" : undefined);   // saves the verb line, {"pause":{}} etc. (Item.act)
		this.node.state = task.state;
		this.draw();
		this.on_change?.(this.node);
	}
}

// SessionTasks.js — a session's tasks, live on its page: the session's session.jsonl streamed, replayed into a Session, each task
// drawn as a row; a proposed one (waiting on the owner) gets Approve and Not now, which append one {"decide":{task,is}} line.
// Servex files an owner prompt's asks there as proposals (Servex/agents/PromptTasks.js). Doc: doc/prompt-tasks.md.
import View, { div, span, button, h3 } from "../View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";
import TaskView from "../Task/TaskView.js";
import Session from "./Session.js";
View.stylesheet(import.meta, "SessionMenu.css");

export default class SessionTasks extends JSONL {

	lines = [];

	// { url: the session.jsonl url, $box: the View to draw into, session_class }
	read(entries){ this.lines.push(...entries); this.draw(); return this; }
	reset(){ this.lines = []; return super.reset(); }
	live(){ super.live(() => {}); return this; }

	draw(){
		const Class = this.session_class ?? Session, s = Class.replay(this.lines), tasks = [...(s._tasks ?? [])];
		this.$box?.empty(() => {
			if (!tasks.length) return;
			const waiting = tasks.filter(t => t.state === "waiting").length;
			h3.c("session-tasks-title", waiting ? `Tasks · ${waiting} waiting on you` : "Tasks");
			for (const t of tasks) div.c("session-task flex gap-50", () => {
				TaskView.row(t);
				if (t.state === "waiting") span.c("session-task-actions flex gap-50", () => {
					button.c("session-task-approve", "Approve").attr("type", "button").click(() => this.decide(t, "approve"));
					button.c("session-task-reject", "Not now").attr("type", "button").click(() => this.decide(t, "reject"));
				});
			});
		});
	}

	// The answer is a line in the log; the stream brings it back and redraws, so nothing changes here until it is written.
	decide(task, is){ return FsFile.append(this.url, { decide: { task: task.id, is, by: "owner" } }); }
}

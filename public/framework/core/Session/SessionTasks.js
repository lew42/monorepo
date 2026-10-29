// SessionTasks.js — a session's tasks, live on its page: the session's session.jsonl streamed, replayed into a Session, each task
// drawn as a row; a proposed one (waiting on the owner) gets Approve, Reject and Make it a project, each one {"decide":{task,is}} line.
// Approved with a module named, node moves it to <module>/tasks/<slug>/ within 5 minutes (PromptTasks.sweep).
// Servex files an owner prompt's asks there as proposals (Servex/agents/PromptTasks.js). Doc: doc/prompt-tasks.md.
import View, { div, span, a, button, h3, details, summary } from "../View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";
import TaskView from "../Task/TaskView.js";
import Session from "./Session.js";
import Ref from "../Item/Ref.js";
import RefView from "../Item/RefView.js";
View.stylesheet(import.meta, "SessionMenu.css");

export default class SessionTasks extends JSONL {

	static REFS = 8;   // child-session rows shown before "+ N more"
	lines = [];
	refs = new Map();   // "<child folder>#<task id>" -> its Ref, kept across redraws so each resolves once

	// { url: the session.jsonl url, $box: the View to draw into, session_class }
	// A streamed batch is applied to the one live Session, line by line: the whole record is not replayed again, and a child
	// already read is not fetched again (data-shapes plan step 1a). The first batch builds it with Class.replay, as before.
	read(entries){
		this.lines.push(...entries);
		// Only a record that opens with its {"session":{…}} line (a tab, a voice call): its id and shape are fixed by line 1, so
		// applying a new line gives what a full replay would. Any other record is replayed whole, as before.
		if (this.session && this.session._shape === "record" && typeof this.lines[0]?.session === "object"){
			for (const line of entries) if (line && typeof line === "object") this.session.replay_line(line);
			this.session.replay_end?.();   // a record's replay_end only clears its own clock: safe after every batch
		} else this.session = null;   // a spawned agent's record (task shape) infers its state once all lines are in: replayed whole
		this.draw();
		return this;
	}
	reset(){ this.lines = []; this.session = null; return super.reset(); }
	live(){ super.live(() => {}); return this; }

	draw(){
		const Class = this.session_class ?? Session, s = this.session ??= Class.replay(this.lines), all = [...(s._tasks ?? [])];
		this.on_session?.(s, this.lines);   // the session page's Overview list and Timeline read the same replay and lines
		this.follow(s);
		// A stopped task was dropped on purpose (noise, superseded, rejected): folded at the end and left out of the count (Task.progress_of).
		const tasks = all.filter(t => t.state !== "stopped"), stopped = all.filter(t => t.state === "stopped");
		this.$box?.empty(() => {
			if (!all.length) return;
			const waiting = tasks.filter(t => t.state === "waiting").length, { done, total } = s.progress();
			h3.c("session-tasks-title", `Tasks · ${done} of ${total} done` + (waiting ? ` · ${waiting} waiting on you` : ""));
			for (const t of tasks) this.row(t);
			this.child_refs(s);
			if (stopped.length) details.c("session-tasks-stopped", () => {
				summary.c("muted", `${stopped.length} stopped, not counted`);
				for (const t of stopped) div.c("session-task flex gap-50", () => TaskView.row(t));
			});
		});
	}

	// A child session reads its own file after the first draw (Task.open_ref) and tails it: redraw once it has, and on each line it
	// reads later ("read" bubbles up from the child's Store, core/Item/Store.js), at most once per 200 ms.
	follow(s){
		const soon = this.soon ??= () => { clearTimeout(this.soon_timer); this.soon_timer = setTimeout(() => this.draw(), 200); };
		if (this.followed !== s){ this.followed?.off("read", soon); this.followed = s; s.on("read", soon); }
		s.walk(t => { if (t.ready && !t._ready_followed){ t._ready_followed = true; t.ready.then(() => { t._opened = true; soon(); }, soon); } });
	}

	/* Each child session's open tasks, drawn in this session as "child › task" through a Ref ({url: the child's folder, path:
	   "tasks.<id>"}, core/Item/Ref.js): the parent holds where the task is, never a copy, so the row is the child's live task.
	   This is how a task handed to a child shows in its parent (data-shapes plan, fork F2). Only in memory: nothing is written. */
	child_refs(s){
		const rows = s.sessions_below().flatMap(c => {
			const url = c.get_one("path");
			// Only once the child's own row has opened its file (open_ref): a Ref opening it first would make a second root for that
			// url, and the row would fall back to a snapshot (seen on a slow load, 2026-10-28).
			if (typeof url !== "string" || (c.ready && !c._opened)) return [];
			return [...(c._tasks ?? [])].filter(k => k.state !== "stopped" && k.state !== "complete").map(k => {
				const key = url + "#" + k.id;
				if (!this.refs.has(key)) this.refs.set(key, Object.assign(new Ref({ url, path: "tasks." + k.id }), { child: c }));
				return this.refs.get(key);
			});
		});
		if (!rows.length) return;
		const shown = this.all_refs ? rows : rows.slice(0, SessionTasks.REFS);
		details.c("session-task-refs", () => {
			summary.c("muted", `In child sessions · ${rows.length} open`);
			// One heading per child session ("session ›"), its tasks under it: the long child title is said once, not on every row.
			let last;
			for (const r of shown){
				if (r.child !== last){ last = r.child; div.c("ref-view-group", () => { a.c("ref-view-where", r.child.get_one?.("title") ?? r.child.id ?? r.url).href(r.url); span.c("ref-view-sep", "›"); }); }
				div.c("session-task", () => new RefView({ ref: r, where: false }));
			}
			if (shown.length < rows.length) button.c("session-task-more", `+ ${rows.length - shown.length} more`).attr("type", "button").click(() => { this.all_refs = true; this.draw(); });
		}).el.open = true;
	}

	// One live task: its row, and Approve / Reject / Make it a project while it waits on the owner.
	row(t){
		div.c("session-task flex gap-50", () => {
			TaskView.row(t);
			if (t.state === "waiting") span.c("session-task-actions flex gap-50", () => {
				button.c("session-task-approve", "Approve").attr("type", "button").click(() => this.decide(t, "approve"));
				button.c("session-task-reject", "Reject").attr("type", "button").click(() => this.decide(t, "reject"));
				if (t.constructor.name !== "Project") button.c("session-task-project", "Make it a project").attr("type", "button").click(() => this.decide(t, "project"));
			});
		});
	}

	// The answer is a line in the log; the stream brings it back and redraws, so nothing changes here until it is written.
	decide(task, is){ return FsFile.append(this.url, { decide: { task: task.id, is, by: "owner" } }); }
}

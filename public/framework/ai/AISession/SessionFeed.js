import View, { div, span, small, strong, a, p, details, summary } from "/framework/core/View/View.js";
import TaskView from "/framework/core/Task/TaskView.js";
import MobileData from "../sessions/v/mobile/MobileData.js";
import SessionTaskRow from "./SessionTaskRow.js";
import AISession from "./AISession.js";

View.stylesheet(import.meta, "SessionFeed.css");

/** The session page's Overview: every task and child session of the session in one list, newest first.
 *  Two sources are merged: the task folders (`ready`, a promise of the loaded SessionWork; its tree nodes) and the tasks in the session's own record
 *  (`record(session)`, called with each replay of session.jsonl by SessionTasks). A folder an agent session ran draws as that session: its model, cost and a link.
 *  A record task that points at a folder already listed is not drawn twice. Subtasks fold under their parent; a dropped task is dimmed, not hidden. */
export default class SessionFeed extends View {

	initialize(){
		this.ac("sfeed");
		this.ready.then(work => { this.tree = work.tree; this.draw(); });
	}

	/** Called with the replayed Session each time its record changes. */
	record(session){ this.session = session; if (this.tree !== undefined) this.draw(); }

	// A folder node's start; a record task's `created_at` (the time of the line that added it, Task.created_at), so both sort together.
	static time(x){ return Date.parse(x?.started ?? x?.created_at ?? x?._at ?? x?._rp?.at ?? x?._last_ts ?? "") || 0; }

	// The counts, computed: own = the record's direct tasks (all of them); total = the drawn record tasks with their subtasks plus every folder
	// node under the session. A record task that points at a listed folder is counted once, as the folder (the review of 2026-10-24 found it twice).
	counts(all, drawn, folders){
		const deep = t => 1 + [...(t._tasks ?? [])].reduce((n, k) => n + deep(k), 0);
		return { own: all.length, total: drawn.reduce((n, t) => n + deep(t), 0) + folders.reduce((n, k) => n + k.all().length, 0) };
	}

	draw(){
		const folders = this.tree?.root.kids ?? [], urls = new Set(folders.flatMap(k => k.all().map(n => n.url)).filter(Boolean));
		const all = [...(this.session?._tasks ?? [])], own = all.filter(t => !urls.has(t.get_one("path")));
		const { own: n_own, total } = this.counts(all, own, folders);
		const items = [...folders.map(n => ({ at: SessionFeed.time(n), n })), ...own.map((t, i) => ({ at: SessionFeed.time(t) || i, t }))].sort((a, b) => b.at - a.at);
		this.empty(() => {
			p.c("sfeed-head", `${n_own} tasks of its own · ${total} counting subtasks and child sessions · newest first`);
			if (!items.length) return void p.c("mob-empty", "No tasks or child sessions recorded for this session yet.");
			div.c("sfeed-list mob-card", () => items.forEach(i => i.n ? this.folder(i.n) : this.task(i.t)));
		});
	}

	// "N of M done" over a node's subtasks (dropped ones are not counted).
	static progress(kids){ const live = kids.filter(k => k !== "stopped"); return `${live.filter(k => k === "complete").length} of ${live.length} done`; }

	folder(n){
		const kid = n.kids.length, row = () => div.c("sfeed-row", () => {
			new SessionTaskRow({ node: n, sid: this.sid });
			if (typeof n.session === "string") div.c("sfeed-agent", () => {
				small.c("muted", [n.model && n.model.replace(/^claude-/, ""), n.usd != null && MobileData.usd(n.usd)].filter(Boolean).join(" · "));
				a.c("sfeed-link", "session →").href(AISession.page_url(n.session));
			});
		});
		const cls = "sfeed-item" + (n.state === "stopped" ? " is-dropped" : "");
		if (!kid) return void div.c(cls, row);
		details.c(cls, () => {
			summary.c("sfeed-sum", () => { row(); small.c("muted sfeed-prog", SessionFeed.progress(n.kids.map(k => k.state))); });
			div.c("sfeed-kids", () => [...n.kids].sort((a, b) => SessionFeed.time(b) - SessionFeed.time(a)).forEach(k => this.folder(k)));
		});
	}

	task(t){
		const kids = [...(t._tasks ?? [])], cls = "sfeed-item sfeed-rec" + (t.state === "stopped" ? " is-dropped" : "");
		if (!kids.length) return void div.c(cls, () => TaskView.row(t));
		details.c(cls, () => {
			summary.c("sfeed-sum", () => { strong.c("sfeed-title", t.get_one("title") ?? t.id); small.c("muted sfeed-prog", SessionFeed.progress(kids.map(k => k.state))); });
			div.c("sfeed-kids", () => [...kids].reverse().forEach(k => div.c("sfeed-item" + (k.state === "stopped" ? " is-dropped" : ""), () => TaskView.row(k))));
		});
	}
}

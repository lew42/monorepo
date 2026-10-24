import View, { div, span, small, strong, a, p, icon } from "/framework/core/View/View.js";
import TaskView from "/framework/core/Task/TaskView.js";
import Task from "/framework/core/Task/Task.js";
import SessionWork from "./SessionWork.js";
import SessionTaskRow from "./SessionTaskRow.js";
import MobileData from "../sessions/v/mobile/MobileData.js";

View.stylesheet(import.meta, "SessionOverview.css");

/** The session page's Overview tab (Figma band E, A and B): four cards, in the frames' order: Open, Project, Done, Dropped.
 *  Side by side where the screen is wide, one column on a phone. Read from the tree the Tasks tab (SessionWork) loads: `ready` is a promise of that loaded SessionWork.
 *  A row opens the task's full page; "+ N more" opens the Tasks tab (`go("tasks")`). `sid` = the session id. */
export default class SessionOverview extends View {

	static LIMIT = { open: 5, done: 5, dropped: 4 };

	initialize(){
		this.ac("sov");
		this.ready.then(work => this.draw(work));
	}

	draw(work){
		const { tree } = work;
		if (!tree) return void this.empty(() => p.c("mob-empty", "No task records for this session."));
		const part = SessionWork.split(tree.root), L = this.constructor.LIMIT;
		this.empty(() => div.c("sov-cards", () => {
			this.card("Open", part.open, part.open.length, "open", "pending_actions", L.open, n => new SessionTaskRow({ node: n, sid: this.sid }));
			this.card("Project", part.projects, part.projects.length, "project", "folder_open", 3, n => this.project(n));
			this.card("Done", part.done, part.done.length, "done", "check_circle", L.done, n => new SessionTaskRow({ node: n, sid: this.sid }));
			this.card("Dropped · not counted", part.dropped, part.dropped.length, "dropped", "remove_circle_outline", L.dropped, n => this.dropped(n));
		}));
	}

	/** One card: a head (label, count), at most `limit` rows, then "+ N more" into the Tasks tab. Nothing to show draws no card. */
	card(label, list, count, kind, glyph, limit, row){
		if (!list.length) return;
		div.c("mob-card sov-card sov-card-" + kind, () => {
			div.c("mob-card-head", () => { icon(glyph).ac("mob-group-icon"); strong(label); small.c("mob-count", String(count)); });
			list.slice(0, limit).forEach(row);
			if (list.length > limit) a.c("mob-more", `+ ${list.length - limit} more ${kind}`).on("click", () => this.go?.("tasks"));
		});
	}

	/** A project row: title, done of all, what it holds, and its one bar (a child's state is a segment). */
	project(n){
		const below = n.all().slice(1).filter(k => k.state !== "stopped"), { done, total } = Task.progress_of(below);
		const sessions = new Set(below.map(k => k.session).filter(s => s && s !== true)).size, since = n.started && new Date(n.started).toLocaleDateString(undefined, { month: "short", day: "numeric" });
		return a.c("sov-project", () => {
			div.c("sov-project-head", () => { strong.c("mob-row-title", n.title); small.c("sov-cost", `${done} / ${total}`); });
			small.c("mob-row-sub", [`${total} task${total === 1 ? "" : "s"}`, sessions && `${sessions} helper session${sessions === 1 ? "" : "s"}`, since && "since " + since].filter(Boolean).join(" · "));
			div.c("mob-row-bar", () => TaskView.draw_bar(MobileData.states(n.kids), 12));
		}).href(n.url ?? "#");
	}

	/** A dropped task: plain, no run buttons, and no count toward done. */
	dropped(n){
		return a.c("sov-dropped", () => {
			icon("remove_circle_outline").ac("mob-group-icon");
			div.c("mob-row-body", () => { strong.c("mob-row-title", n.title); small.c("mob-row-sub", "dropped " + (MobileData.ago(n.ended ?? n.started) || "")); });
		}).href(n.url ?? "#");
	}
}

import { View, div, a, span, small, h2, button } from "/framework/core/View/View.js";

/** Local YYYY-MM-DD of a time, the same rule Server/TaskState.mjs uses for each row's `day`. */
const local_day = t => { const d = new Date(t), p2 = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
import Browse from "/framework/ux/Browse/Browse.js";
import TaskStateLog from "./TaskStateLog.js";

View.stylesheet({ url: import.meta.url }, "tasks.css");

/** TasksPage's list: In flight, Queued, Landed today, from Server/TaskState.mjs, tailed live. Doc: doc/architecture.md */
export default class TasksPage extends Browse {
	key = "tasks";
	log = new TaskStateLog();

	static GROUPS = [
		{ key: "in_flight", title: "In flight", empty: "Nothing is working right now." },
		{ key: "queued", title: "Queued", empty: "Nothing is waiting." },
		{ key: "landed", title: "Landed", empty: "Nothing has landed in this window." },
	];
	/** The landed group's window chips; the state carries seven days, each row with its local `day`. */
	static WINDOWS = [["today", "Today"], ["yesterday", "Yesterday"], ["week", "This week"]];
	window = new URLSearchParams(location.search).get("landed") ?? "today";

	/** The rows of a group under the current window (only the landed group is filtered). */
	rows(s, key){
		if (key !== "landed") return s[key] ?? [];
		const day = back => local_day(Date.parse(s.today + "T12:00:00") - back * 864e5);
		return (s.landed ?? []).filter(r => this.window === "week" || r.day === day(this.window === "yesterday" ? 1 : 0));
	}

	static when(iso){ return iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""; }
	static age_min(s){ return Math.round((Date.now() - Date.parse(s.at)) / 60000); }
	static quiet(r){ return r.quiet_min == null ? "" : r.quiet_min < 1 ? "just now" : r.quiet_min + " min ago"; }

	draw_list(){
		this.$rows = div.c("inbox-rows tasks-rows");
		this.draw();
	}

	start(){ this.log.live(() => this.draw()).then(() => this.draw());
		setInterval(() => this.draw(), 60000);   // only re-checks the age of the last line; the data itself is the stream
	}

	draw(){
		if (!this.$rows) return;
		const s = this.log.state;
		this.$rows.empty(() => {
			if (s && TasksPage.age_min(s) >= 3) div.c("tasks-note tasks-stale", () => span(`Not live: the last update was ${TasksPage.age_min(s)} min ago. Start node Server/TaskState.mjs --watch.`));
			if (s?.check?.ok === false) TasksPage.bad(s.check);
			if (!s) return div.c("tasks-note muted", () => span("No live task state yet: this page tails ai/tasks/state.jsonl, written while the dev server runs (node Server/TaskState.mjs --watch)."));
			TasksPage.GROUPS.forEach(g => this.group(g, this.rows(s, g.key)));
		});
		this.router?.mark_links?.();
	}

	group(g, rows){
		div.c("tasks-group", () => {
			h2.c("tasks-group-head", () => { span(g.title); small.c("inbox-badge").text(String(rows.length)).el.hidden = !rows.length; });
			if (g.key === "landed") div.c("sessions-tabs flex gap-50 wrap", () => TasksPage.WINDOWS.forEach(([k, label]) =>
				TasksPage.chip(label, this.window === k, () => { this.window = k; history.replaceState(null, "", k === "today" ? location.pathname : "?landed=" + k); this.draw(); })));
			if (!rows.length) return small.c("tasks-empty muted", g.empty);
			rows.forEach(r => this.row(g.key, r));
		});
	}

	/** One filter chip; the Inbox (ai/rail/DashChips.js) draws its chips with this too. */
	static chip(label, on, click){ return button.c("sessions-chip" + (on ? " sessions-chip-on" : ""), label).on("click", click); }

	/** The red line of a failed self-check: always this one, so a wrong count is never quiet. */
	static note_bad(text){ return div.c("tasks-note tasks-check-bad", () => span(text)).el.style.color = "#c62828"; }

	/** State's self-check failed (Server/doc/state.md): the two numbers in red, never a quiet wrong count. */
	static bad(c){ TasksPage.note_bad(TasksPage.why(c)); }

	/** The sentence naming every count that differs: landed today, tasks, cards, asks, sessions. */
	static why(c){
		const l = c.landed_today ?? {}, ids = [...(l.only_state ?? []), ...(l.only_walk ?? [])], two = (k, x) => x && x.ok === false ? `${k}: ${x.rows} rows, ${x.sum} in buckets, ${x.ids} found by a text scan` : null;
		const parts = [l.state !== l.walk || ids.length ? `landed today is ${l.state} by the task rules but ${l.walk} by a plain walk${ids.length ? " (" + ids.join(", ") + ")" : ""}` : null,
			c.total !== c.sum ? `${c.total} tasks, ${c.sum} in buckets` : null, two("cards", c.cards), two("asks", c.asks),
			c.sessions?.ok === false ? `sessions: ${c.sessions.in_sessions} tasks in sessions, ${c.sessions.with_session} task rows with a session` : null].filter(Boolean);
		return "Counts disagree: " + (parts.length ? parts.join("; ") : `${c.total} tasks, ${c.sum} in buckets`) + ".";
	}

	row(kind, r){
		const href = r.home === "module" ? r.url : r.id ? this.url + r.id + "/" : null;   // a module task opens its own page
		(href ? a.c("inbox-row tasks-row").href(href) : div.c("inbox-row tasks-row")).append(() => {
			div.c("inbox-row-head flex gap-25", () => {
				if (r.quiet) span.c("tasks-warn").attr("title", `quiet for ${r.quiet_min} min`).text("⚠");
				span.c("inbox-row-title").text(r.title);
				small.c("inbox-row-when muted").text(kind === "landed" ? (this.window === "today" ? "" : r.day + " ") + TasksPage.when(r.landed_at) : kind === "in_flight" ? TasksPage.quiet(r) : "");
			});
			const line = kind === "landed" ? r.line : [r.model, r.cost ? "$" + r.cost.toFixed(2) : null].filter(Boolean).join(" · ");
			if (line) div.c("inbox-row-foot", () => small.c("inbox-row-line muted").text(line));
		});
	}
}

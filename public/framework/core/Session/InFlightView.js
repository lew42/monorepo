// InFlightView.js — draws InFlight.pick for one session, or for several (the AI dashboard); live through SessionTasks (a JSONL tail).
import View, { div, span, a, small, strong } from "../View/View.js";
import SessionTasks from "./SessionTasks.js";
import InFlight from "./InFlight.js";
View.stylesheet(import.meta, "InFlight.css");

export default class InFlightView extends View {
	// { urls: [session.jsonl urls], all: true on the AI dashboard (a session with nothing in flight or waiting is left out) }
	initialize(){
		this.ac("in-flight");
		this.sessions = new Map();
		this.readers = (this.urls ?? [this.url]).filter(Boolean).map(url => new SessionTasks({ url, on_session: s => { this.sessions.set(url, s); this.redraw(); } }).live());
		this.empty_text ??= "Nothing is in flight.";
		this.redraw();
	}

	redraw(){
		clearTimeout(this._t);
		this._t = setTimeout(() => this.empty(() => this.paint()), 100);   // one repaint for a burst of lines
	}

	paint(){
		const picks = [...this.sessions].map(([url, s]) => ({ url, s, ...InFlight.pick(s) }));
		const shown = this.all ? picks.filter(p => p.inflight.length || p.waiting.length) : picks;
		const loading = picks.reduce((n, p) => n + InFlight.loading(p.s), 0);
		if (!picks.length && this.readers.length) return void div.c("if-empty muted", "Reading the session…");   // its file has not arrived yet: not the same as empty
		if (loading && !shown.length) return void div.c("if-empty muted", `Reading ${loading} task${loading > 1 ? "s" : ""}…`);
		if (!shown.length || shown.every(p => !p.inflight.length && !p.waiting.length && !p.next.length)) return void div.c("if-empty", this.empty_text);
		for (const p of shown){
			div.c("if-session", () => {
				if (this.all) a.c("if-session-name", p.s.get_one("title") ?? p.s.id ?? p.url).href(p.url.replace(/session\.jsonl$/, ""));
				if (p.inflight.length) this.section("In flight", () => { p.inflight.forEach(t => this.row(t)); if (p.more) small.c("muted", `+ ${p.more} more running`); });
				if (p.waiting.length) this.section("Waiting on you", () => p.waiting.forEach(w => this.row(w.task, w.what || "needs you", true)));
				if (p.next.length && !this.all) this.section("Next", () => p.next.forEach(t => this.row(t)));
				if (p.done && !this.all) small.c("muted if-done", `${p.done} done`);
			});
		}
	}

	section(title, fill){ div.c("if-section", () => { strong.c("if-h", title); fill(); }); }

	row(t, line, bare){
		const pct = Math.round(t.completion * 100), href = t.get_one("url") ?? t.get_one("path");
		div.c("if-row" + (bare ? " if-bare" : ""), () => {
			(href ? a.c("if-title", t.get_one("title") ?? t.id).href(href) : span.c("if-title", t.get_one("title") ?? t.id));
			if (!bare){
				span.c("if-bar", () => span.c("if-fill").style({ width: pct + "%" })).attr("title", pct + "%");
				small.c("if-pct", pct + "%");
			}
			const now = line ?? InFlight.now_of(t);
			if (now) div.c("if-now muted", now);
		});
	}
}

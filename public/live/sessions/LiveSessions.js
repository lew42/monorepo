import { Page, div, span, a } from "/app.js";
import Live from "../Live.js";
import LiveArchive from "../archive/LiveArchive.js";

/* /live/sessions/: every session of ideas, newest first, and each one's cards in reading order (/live/sessions/<id>/).
 * A session is what was on screen between two clears, computed from the logs (LiveLog.sessions), nothing stored twice. doc/sessions.md */
export default class LiveSessions extends Live {
	// The logs, newest source first. `follow` keeps /live's own log streaming; the archive is a finished file, read once.
	static sources = [
		{ key: "live", log: "../page.jsonl", Card: Live.Card, follow: true },
		{ key: "archive", log: "../archive/page.jsonl", Card: LiveArchive.Card, label: "archive" },
	];

	get empty_text(){ return "No sessions yet."; }

	start(){
		if (this.sources) return;
		const changed = () => this.views.forEach(v => v());
		this.sources = this.constructor.sources.map(s => ({ ...s, stream: new this.constructor.Log({ url: import.meta.resolve(s.log) }) }));
		this.sources.forEach(s => s.follow ? this.follow(s.stream) : s.stream.load().then(changed));
		this.load_days().then(changed);
	}

	// The central store: Servex writes `ai/sessions/YYYY/MM/DD/index.json` for every day, one entry per session (voice and agents alike).
	// Read for today and the days back to `back`; a day with no index is skipped. Loaded once per visit, not streamed (see doc/sessions.md).
	static back = 14;
	async load_days(){
		const p = n => String(n).padStart(2, "0"), dates = [];
		for (let i = 0; i < this.constructor.back; i++){ const d = new Date(Date.now() - i * 864e5); dates.push(`${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`); }
		const days = await Promise.all(dates.map(date => fetch(import.meta.resolve(`/framework/ai/sessions/${date}/index.json`))
			.then(r => r.ok ? r.json() : null).catch(() => null).then(j => (j?.snapshots ?? []).map(s => ({ ...s, day: s.day ?? date })))));
		this.days = days.flat().sort((a, b) => String(b.last_activity ?? b.first_at ?? "").localeCompare(String(a.last_activity ?? a.first_at ?? "")));
		this.days_loaded = true;
	}

	static is_voice(s){ return /voice|session-smart/.test(s.agent ?? "") || s.parent === "voice-app"; }

	// Every session of the central store, grouped under its day, newest first.
	days_list(){
		let day;
		(this.days ?? []).forEach(s => {
			if (s.day !== day) div.c("live-session-day", day = s.day);
			a.c("live-session-row", () => {
				span.c("live-card-title", s.title || s.agent || s.folder);
				span.c("live-session-meta", [this.constructor.when(s.first_at), this.constructor.is_voice(s) ? "voice" : null, s.agent, s.model].filter(Boolean).join(" · "));
			}).href(`/framework/ai/sessions/${s.day}/${s.folder}/`);
		});
	}

	// Every session of every source, newest first. The id is the source plus the line the session began on.
	all(){
		return this.sources.flatMap(s => s.stream.sessions().map(x => ({ ...x, id: `${s.key}-${x.id}`, source: s })));
	}

	static when(ts){
		return ts ? new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "earlier";
	}
	static name(session){ return session.items.find(i => i.title)?.title ?? "Untitled session"; }

	// One session's page: its cards, whole, oldest first, so it reads top to bottom.
	route(id){
		if (id.includes(".")) return;
		const live = this;
		return new Page({ title: id, url: this.url + id + "/", classes: "", content(){ live.mount(div.c("live live-one live-session"), id); } });
	}

	paint(id){
		const all = this.all();
		if (!id){
			if (!all.length && !this.days?.length) return void div.c("live-empty", this.days_loaded ? this.empty_text : "Loading…");
			if (this.days?.length) this.days_list();
			if (all.length){ div.c("live-session-day", "Cleared screens of /live/"); this.list(all); }
			return;
		}
		const one = all.find(s => s.id === id);
		if (!one) return void div.c("live-empty", this.sources.some(s => s.stream.loaded) ? "No such session." : "Loading…");
		div.c("live-session-head", () => {
			a.c("live-back", "← Sessions").href(this.url);
			span.c("live-card-title", this.constructor.name(one));
			span.c("live-session-meta", `${this.constructor.when(one.items[0].ts)} · ${one.items.length} cards${one.source.label ? ` · ${one.source.label}` : ""}`);
		});
		div.c("live-screen live-session-cards", () => one.items.forEach(r => one.source.Card.of({ ...r, id: r.id }, this.url + id + "/").full()));
	}

	list(all){
		all.forEach(s => a.c("live-session-row", () => {
			span.c("live-card-title", this.constructor.name(s));
			span.c("live-session-meta", `${s.current ? "● now · " : ""}${this.constructor.when(s.items[0].ts)} · ${s.items.length} cards${s.source.label ? ` · ${s.source.label}` : ""}`);
			span.c("live-session-peek", s.items.slice(1, 4).map(i => i.title).filter(Boolean).join(" · "));
		}).href(`${this.url}${encodeURIComponent(s.id)}/`));
	}

	render(){
		return this.view ??= div.c("page live", () => this.mount(div.c("live-screen")));
	}
}

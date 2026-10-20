import { Page, div, span, a, p, md } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { View } from "/framework/core/View/View.js";
import LiveToday from "./LiveToday.js";
import LiveTasks from "./LiveTasks.js";
import LiveNow from "./LiveNow.js";

View.stylesheet(import.meta, "Live.css");

/* LIVE — a one-screen presentation: only the voice agent writes here, and only what is being discussed now.
 * Folds the lines the page tools write (page_add, page_set) from page.jsonl; {"content":{"clear":true}} wipes the screen. doc/presentation.md */
class LiveLog extends JSONL {
	static verbs = [...JSONL.verbs, "title", "content"];
	static chrome = new Set(["archive", "sessions", "tasks", "now", "today"]);   // pointer and view cards: on screen, but never part of a session's content
	items = new Map();
	past = [];   // closed sessions: the cards that were on screen before each clear (doc/sessions.md)
	seq = 0;

	// A session is what was on screen between two clears: past ones (oldest first) then the current one, newest first. Computed from the log, never stored.
	shown(){ return [...this.items.values()].filter(i => i.type !== "part-live" && !this.constructor.chrome.has(i.id)); }
	sessions(){
		const now = this.shown(), all = [...this.past, ...(now.length ? [now] : [])];
		return all.map((items, i) => ({ id: `s${items[0].seq}`, items, current: !!now.length && i === all.length - 1 })).reverse();
	}

	// Every line gets its order; a line with no ts is placed at the last ts seen before it.
	apply(entry){ this.seq++; return super.apply(entry); }
	stamp(v, ts){ if (ts) this.last_ts = ts; return { ...v, ts: ts ?? this.last_ts, seq: this.seq, guess: !ts }; }

	title(v){ this.fields = { ...this.fields, title: v }; }
	log(v){ super.log(this.stamp(v, v?.ts)); }
	content(v){
		const { add, remove, clear, by, ts } = v ?? {};
		if (clear){ const done = this.shown(); if (done.length) this.past.push(done); this.items = new Map(); }
		if (add) this.items.set(add.id ?? `i${this.seq}`, this.stamp({ ...add, by, ts }, ts ?? add.ts));
		if (typeof remove === "string") this.items.delete(remove);
	}
	// A line naming a card id edits that card in place; other lines (set, pages, notes) are not ours.
	skip(k, entry){
		const item = this.items.get(k), v = entry?.[k];
		if (item && v && typeof v === "object" && !Array.isArray(v)){
			const { text, title, type, preview, live } = v;
			this.items.set(k, { ...item, ...(live !== undefined && { live }), ...(text !== undefined && { text }), ...(title !== undefined && { title }), ...(type !== undefined && { type }), ...(preview !== undefined && { preview }) });
		}
	}
	reset(){ super.reset(); this.items = new Map(); this.past = []; this.seq = 0; this.last_ts = undefined; return this; }
}

/* The dev socket only opens on localhost (an RCE guard, Socket.js), so a phone on the LAN IP or the
 * tunnel gets no stream. This reads only the NEW bytes of page.jsonl (a Range request), and runs
 * on a timer while the tab is visible, on becoming visible, on focus and when the network returns. */
class Tail {
	offset = 0;
	constructor(log, changed){ this.log = log; this.changed = changed; }

	start(){
		const go = () => document.visibilityState === "visible" && this.poll();
		document.addEventListener("visibilitychange", go);
		["focus", "online", "pageshow"].forEach(e => addEventListener(e, go));
		setInterval(go, 3000);
		return this.poll();
	}

	// A tab left open keeps its old code: reload it once when Live.js changes on the server.
	async fresh(){
		try {
			const r = await fetch(import.meta.url, { method: "HEAD", cache: "no-store" });
			const tag = r.headers.get("etag") ?? r.headers.get("last-modified");
			if (!tag) return;
			if (this.tag && this.tag !== tag) return location.reload();
			this.tag = tag;
		} catch {}
	}

	async poll(){
		if (this.busy) return;
		this.busy = true;
		this.fresh();
		try {
			const res = await fetch(this.log.url, { cache: "no-store", headers: this.offset ? { Range: `bytes=${this.offset}-` } : {} });
			if (res.status === 416 || !res.ok || res.headers.get("content-type")?.includes("html")) return;
			const bytes = new Uint8Array(await res.arrayBuffer());
			if (res.status === 200 && this.offset){ this.log.reset(); this.offset = 0; }   // no Range support: whole file again
			const end = bytes.lastIndexOf(10) + 1;                                          // only whole lines
			if (!end) return;
			this.log.read(this.log.parse(new TextDecoder().decode(bytes.subarray(0, end))));
			this.offset += end;
			this.changed();
		} catch {} finally { this.busy = false; }
	}
}

/* One feed item as a small Page: preview() is the stock preview card (Page.preview -> preview_card), full() the whole content. */
class LiveCard extends Page {
	static back = false;   // true shows a "← Live" link above an opened card (the owner uses the browser back button)
	static live = { today: LiveToday, tasks: LiveTasks, now: LiveNow };   // a card {type:"part-live", live:"<name>"} is drawn by this class, from live data, not from its text

	static of(row, base = "/live/"){
		const url = `${base}${encodeURIComponent(row.id)}/`;   // base: the page that owns the log (/live/ or /live/archive/)
		const card = new this({ id: row.id, title: row.title, label: row.preview ?? row.title ?? row.id, text: row.text, url, path: url });
		if (row.type === "part-live") card.live_name = row.live;
		return card;
	}

	get renderer(){ return this.constructor.live[this.live_name]; }

	preview(nav){
		if (!this.renderer) return this.preview_card(nav);
		if (this.renderer.line) return div.c("page-preview live-live live-line", () => this.renderer.line(div.c("live-live-body")));   // a one-line card: the line is its own title and link
		return div.c("page-preview live-live", () => {
			a.c("live-card-title", this.title).href(this.url).ac("page-preview-link");
			this.renderer.into(div.c("live-live-body"));
		});
	}
	full(){
		return div.c("live-full", () => {
			if (this.constructor.back) a.c("live-back", "← Live").href("/live/");
			if (this.title) span.c("live-card-title", this.title);
			if (this.renderer) return void this.renderer.into(div.c("live-live-body"));
			md(Live.pretty(this.text ?? ""));
		});
	}
}

export default class Live extends Page {
	static Card = LiveCard;
	static Log = LiveLog;
	static Tail = Tail;

	// A json code block that parses is shown indented; any other code wraps (Live.css).
	static pretty(text){
		return text.replace(/```json\n([\s\S]*?)\n```/g, (all, body) => {
			try { return "```json\n" + JSON.stringify(JSON.parse(body), null, 2) + "\n```"; } catch { return all; }
		});
	}

	// Newest first (pull-to-refresh lands on the newest); a card naming `after` sits right under that card.
	rows(){
		const list = [...this.stream.items.values()].map(i => ({ ...i, kind: i.type?.replace("part-", "") ?? "text" })).reverse();
		list.filter(r => r.after).forEach(r => {
			if (!list.some(o => o.id === r.after)) return;
			list.splice(list.indexOf(r), 1);
			list.splice(list.findIndex(o => o.id === r.after) + 1, 0, r);
		});
		return list;
	}

	// The card id in the address: /live/<id>/ (a child page, route() below); the old ?card=<id> is redirected to it.
	get open(){ return this.card_id ?? null; }

	// One card's page at /live/<id>/. The card lives as a line in this page.jsonl; `path` is where it can later own a dir.
	route(id){
		if (id.includes(".")) return;
		const live = this;
		return new Page({ title: id, url: this.url + id + "/", classes: "", content(){ live.mount(div.c("live live-one"), id); } });
	}

	// What an empty feed says; the archive says something else.
	get empty_text(){ return "Nothing on screen. The voice agent shows what you are discussing here."; }

	// The log this page folds; archive/LiveArchive.js points it at its own copy.
	get log_url(){ return import.meta.resolve("./page.jsonl"); }

	// The shared stream, started once; `changed` redraws whatever is mounted.
	start(){
		if (this.stream) return;
		this.stream = new this.constructor.Log({ url: this.log_url });
		this.follow(this.stream);
	}

	// Keep one log current: the socket where it opens (it resubscribes from its offset when it reconnects), else the Tail.
	follow(log){
		const changed = () => this.views.forEach(v => v());
		(Socket.singleton().disabled || location.search.includes("poll"))
			? new this.constructor.Tail(log, changed).start()
			: log.live(changed).then(changed);
	}
	views = new Set();

	// Draw one card (id) or the feed (no id) into a box, and keep it drawn as lines arrive.
	mount(box, id){
		this.start();
		const draw = () => box.empty(() => this.paint(id));
		this.views.add(draw);
		draw();
		return box;
	}

	paint(id){
		const rows = this.rows(), one = id && rows.find(r => r.id === id);
		if (id) return one ? void this.constructor.Card.of(one, this.url).full() : void div.c("live-empty", rows.length ? "No such card." : "Loading…");
		if (!rows.length) return void div.c("live-empty", this.empty_text);
		rows.forEach(r => { const card = this.constructor.Card.of(r, this.url); card.preview(card.nav()); });
	}

	render(){
		return this.view ??= div.c("page live", () => {
			const old = new URLSearchParams(location.search).get("card");
			if (old) history.replaceState({}, "", `${this.url}${encodeURIComponent(old)}/`);   // ?card= -> /live/<id>/, back still works
			this.mount(div.c("live-screen"), old);
		});
	}
}

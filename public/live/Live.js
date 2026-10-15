import { Page, div, span, p, md } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { View } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "Live.css");

/* LIVE — the owner's voice-work feed: a title line, then newest-first entries.
 * Folds the lines the page tools write (page_log, page_add, page_set) from page.jsonl. doc/notes.md */
class LiveLog extends JSONL {
	static verbs = [...JSONL.verbs, "title", "content"];
	items = new Map();
	seq = 0;

	// Every line gets its order; a line with no ts is placed at the last ts seen before it.
	apply(entry){ this.seq++; return super.apply(entry); }
	stamp(v, ts){ if (ts) this.last_ts = ts; return { ...v, ts: ts ?? this.last_ts, seq: this.seq, guess: !ts }; }

	title(v){ this.fields = { ...this.fields, title: v }; }
	log(v){ super.log(this.stamp(v, v?.ts)); }
	content(v){
		const { add, remove, by, ts } = v ?? {};
		if (add) this.items.set(add.id ?? `i${this.seq}`, this.stamp({ ...add, by, ts }, ts ?? add.ts));
		if (typeof remove === "string") this.items.delete(remove);
	}
	skip(){}   // the log carries other lines (set, pages, notes): not ours, no warning
	reset(){ super.reset(); this.items = new Map(); this.seq = 0; this.last_ts = undefined; return this; }
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

	async poll(){
		if (this.busy) return;
		this.busy = true;
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

export default class Live extends Page {
	static Log = LiveLog;
	static Tail = Tail;

	// One list, strictly by time, newest first (line order breaks ties).
	rows(){
		const log = this.stream;
		return [
			...log.logs.map(l => ({ ...l, text: l.text ?? l.msg, kind: "log" })),
			...[...log.items.values()].map(i => ({ ...i, kind: i.type?.replace("part-", "") ?? "text" })),
		].sort((a, b) => (Date.parse(b.ts ?? 0) || 0) - (Date.parse(a.ts ?? 0) || 0) || b.seq - a.seq);
	}

	render(){
		return this.view ??= div.c("page live", () => {
			div.c("live-title", () => { span.c("live-name", "Live"); span.c("live-sub", "voice work, newest first"); });
			this.$feed = div.c("live-feed");
			this.stream ??= new this.constructor.Log({ url: import.meta.resolve("./page.jsonl") });
			const draw = () => this.draw();
			(Socket.singleton().disabled || location.search.includes("poll"))
				? new this.constructor.Tail(this.stream, draw).start()
				: this.stream.live(draw).then(draw);   // the socket resubscribes from its offset when it reconnects
		});
	}

	draw(){
		this.$feed?.empty(() => {
			const rows = this.rows();
			if (!rows.length) return void p("Nothing yet. The voice agent writes here.");
			rows.forEach(r => div.c(`live-row live-${r.kind}`, () => {
				const when = r.ts ? new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
				span.c("live-meta", [when, r.by].filter(Boolean).join(" · "));
				if (r.title) span.c("live-card-title", r.title);
				md(r.text ?? "");
			}));
		});
	}
}

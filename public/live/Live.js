import { Page, div, span, p, md } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";
import { View } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "Live.css");

/* LIVE — a one-screen presentation: only the voice agent writes here, and only what is being discussed now.
 * Folds the lines the page tools write (page_add, page_set) from page.jsonl; {"content":{"clear":true}} wipes the screen. doc/presentation.md */
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
		const { add, remove, clear, by, ts } = v ?? {};
		if (clear) this.items = new Map();
		if (add) this.items.set(add.id ?? `i${this.seq}`, this.stamp({ ...add, by, ts }, ts ?? add.ts));
		if (typeof remove === "string") this.items.delete(remove);
	}
	// A line naming a card id edits that card in place; other lines (set, pages, notes) are not ours.
	skip(k, entry){
		const item = this.items.get(k), v = entry?.[k];
		if (item && v && typeof v === "object" && !Array.isArray(v)){
			const { text, title, type } = v;
			this.items.set(k, { ...item, ...(text !== undefined && { text }), ...(title !== undefined && { title }), ...(type !== undefined && { type }) });
		}
	}
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

export default class Live extends Page {
	static Log = LiveLog;
	static Tail = Tail;

	// A json code block that parses is shown indented; any other code wraps (Live.css).
	static pretty(text){
		return text.replace(/```json\n([\s\S]*?)\n```/g, (all, body) => {
			try { return "```json\n" + JSON.stringify(JSON.parse(body), null, 2) + "\n```"; } catch { return all; }
		});
	}

	// The screen: the cards added since the last clear, in the order they were added.
	rows(){
		return [...this.stream.items.values()].map(i => ({ ...i, kind: i.type?.replace("part-", "") ?? "text" }));
	}

	render(){
		return this.view ??= div.c("page live", () => {
			this.$feed = div.c("live-screen");
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
			if (!rows.length) return void div.c("live-empty", "Nothing on screen. The voice agent shows what you are discussing here.");
			rows.forEach(r => div.c(`live-row live-${r.kind}`, () => {
												if (r.title) span.c("live-card-title", r.title);
				md(this.constructor.pretty(r.text ?? ""));
			}));
		});
	}
}

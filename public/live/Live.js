import { Page, div, span, p, md } from "/app.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import { View } from "/framework/core/View/View.js";

View.stylesheet(import.meta, "Live.css");

/* LIVE — the owner's voice-work feed: a title line, then newest-first entries.
 * Folds the lines the page tools write (page_log, page_add, page_set) from page.jsonl. */
class LiveLog extends JSONL {
	static verbs = [...JSONL.verbs, "title", "content"];
	items = new Map();

	title(v){ this.fields = { ...this.fields, title: v }; }
	content(v){
		const { add, remove, by, ts } = v ?? {};
		if (add) this.items.set(add.id ?? `i${this.items.size}`, { ...add, by, ts });
		if (typeof remove === "string") this.items.delete(remove);
	}
	skip(){}   // the log carries other lines (set, pages, notes): not ours, no warning
	reset(){ super.reset(); this.items = new Map(); return this; }
}

export default class Live extends Page {
	static Log = LiveLog;

	// One list, newest first: every card and every log line.
	rows(){
		const log = this.stream;
		return [
			...log.logs.map(l => ({ text: l.text ?? l.msg, by: l.by, ts: l.ts, kind: "log" })),
			...[...log.items.values()].map(i => ({ ...i, kind: i.type?.replace("part-", "") ?? "text" })),
		].sort((a, b) => Date.parse(b.ts ?? 0) - Date.parse(a.ts ?? 0));
	}

	render(){
		return this.view ??= div.c("page live", () => {
			div.c("live-title", () => { span.c("live-name", "Live"); span.c("live-sub", "voice work, newest first"); });
			this.$feed = div.c("live-feed");
			this.stream ??= new this.constructor.Log({ url: import.meta.resolve("./page.jsonl") });
			this.stream.live(() => this.draw()).then(() => this.draw());
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

import Item from "/framework/core/Item/Item.js";
import Page from "/framework/core/Page/Page.class.js";
import View, { div, h4, span, input } from "/framework/core/View/View.js";

// One delta line, shown short: its number, who made it, when, and the delta itself truncated.
function line_label(n, line){
	const who = line.by ?? "?", ts = line.ts ? new Date(line.ts).toLocaleString() : "";
	const body = JSON.stringify(line);
	return `${n}. ${who}${ts ? " · " + ts : ""} — ${body.length > 90 ? body.slice(0, 87) + "…" : body}`;
}

// A quick, read-only replay of a folder's page.jsonl: given {url} (the folder, e.g. `/live/plan/`), it loads the raw
// lines and lets a slider (1..N) rebuild the object from only the first N of them — every move replays in memory
// (Item.class_for + Class.replay), nothing is ever written back. Below the slider: title, its cards in order, sub-pages.
export default class DeltaHistory extends View {
	render(){
		const { url } = this;
		this.$box = div.c("delta-history-body", () => span.c("muted", "Loading…"));
		this.load(url);
	}

	async load(url){
		const store = new Item.Store({ url: url + "page.jsonl" });
		await store.load();
		const lines = store.entries;
		this.lines = lines;
		this.Class = Item.class_for(lines) !== Item ? Item.class_for(lines) : Page;
		this.$box.empty(() => {
			if (!store.loaded || !lines.length){ span.c("muted", "No page.jsonl lines here."); return; }
			this.n = lines.length;
			this.$slider = input.c("delta-history-slider")
				.attr("type", "range").attr("min", "1").attr("max", String(lines.length)).attr("value", String(lines.length))
				.on("input", () => this.show(+this.$slider.el.value));
			this.$count = span.c("delta-history-count muted");
			this.$list = div.c("delta-history-list");
			this.$summary = div.c("delta-history-summary");
			lines.forEach((line, i) => div.c("delta-history-line muted", line_label(i + 1, line)));
			this.show(lines.length);
		});
	}

	// Replays lines[0..n) through this.Class fresh, in memory, and shows the result.
	show(n){
		this.$count.text(`line ${n} of ${this.n}`);
		const host = this.Class.replay(this.lines.slice(0, n));
		this.$summary.empty(() => {
			h4(String(host.title ?? host.id ?? "(untitled)"));
			const list = host.lists ? host.lists() : {};
			Object.entries(list).forEach(([name, l]) => l.length && span.c("delta-history-stat muted", `${name}: ${l.length}`));
			if (!Object.values(list).some(l => l.length)) span.c("muted", "Nothing listed yet.");
		});
	}
}

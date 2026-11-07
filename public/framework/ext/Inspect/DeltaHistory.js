import Item from "/framework/core/Item/Item.js";
import Page from "/framework/core/Page/Page.class.js";
import View, { div, h4, span, input } from "/framework/core/View/View.js";
import { item_list } from "./ItemInspector.js";

View.stylesheet(import.meta, "Inspect.css");

// One delta line, shown short: its number, who made it, when, and the delta itself truncated.
function line_label(n, line){
	const who = line.by ?? "?", ts = line.ts ? new Date(line.ts).toLocaleString() : "";
	const body = JSON.stringify(line);
	return `${n}. ${who}${ts ? " · " + ts : ""} — ${body.length > 90 ? body.slice(0, 87) + "…" : body}`;
}

// A quick, read-only replay of a folder's page.jsonl: given {url} (the folder, e.g. `/live/plan/`) and an optional
// {Class} (the real class, when the caller already knows it — Settings passes `of.constructor`), it loads the raw
// lines and lets a slider (1..N) rebuild the object from only the first N of them — every move replays in memory
// (Class.replay), nothing is ever written back. Below the slider: title, its cards in order, its sub-pages.
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
		this.Class = this.Class ?? (Item.class_for(lines) !== Item ? Item.class_for(lines) : Page);
		this.$box.empty(() => {
			if (!store.loaded || !lines.length){ span.c("muted", "No page.jsonl lines here."); return; }
			this.n = lines.length;
			this.$slider = input.c("delta-history-slider")
				.attr("type", "range").attr("min", "1").attr("max", String(lines.length)).attr("value", String(lines.length))
				.on("input", () => this.show(+this.$slider.el.value));
			this.$count = span.c("delta-history-count muted");
			this.$summary = div.c("delta-history-summary");
			h4.c("item-inspector-heading", "Lines");
			this.$list = div.c("delta-history-list");
			this.$list.append(() => lines.forEach((line, i) => div.c("delta-history-line muted", line_label(i + 1, line))));
			this.show(lines.length);
		});
	}

	// Replays lines[0..n) through this.Class fresh, in memory, and shows the result: its title, its cards (`content`)
	// in order, and its sub-pages (`pages`) — the same row and list shape as ItemInspector's own Inside section.
	show(n){
		this.$count.text(`line ${n} of ${this.n}`);
		const host = this.Class.replay(this.lines.slice(0, n));
		this.$summary.empty(() => {
			h4.c("item-inspector-heading", String(host.title ?? host.id ?? "(untitled)"));
			const cards = host.content, pages = host.pages;
			if (!cards?.length && !pages?.length){ span.c("muted", "Nothing listed yet."); return; }
			if (cards?.length) item_list("cards", cards, host);
			if (pages?.length) item_list("pages", pages, host);
		});
	}
}

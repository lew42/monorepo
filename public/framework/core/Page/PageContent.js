import List from "../List/List.js";
import View, { div, h4, is } from "../View/View.js";
import PageContentItem from "./PageContentItem.js";
import PageCode from "./PageCode.js";
import PageAddress from "./PageAddress.js";
import PageParagraph from "./PageParagraph.js";

// A page's `content`: one List for the page's life, drawn by its View. doc/content.md
export default class PageContent extends List {

	static is_address = value => is.str(value) && value.startsWith("/");

	// The ways a value reaches content: a function, string or address is the page's one bare item (a new one replaces it);
	// an array or object goes to set(), like a page.jsonl line.
	fill(value){
		const Kind = this.constructor;
		if (value == null || value === this) return this;
		if (value instanceof PageContent) return this.bare(PageCode, { fn: () => value.render() });
		if (value instanceof List){ value.items.forEach(item => this.insert(item)); return this; }
		if (is.fn(value)) return this.bare(PageCode, { fn: value });
		if (is.str(value)) return Kind.is_address(value) ? this.bare(PageAddress, { address: value }) : this.bare(PageParagraph, { text: value });
		if (value.el || is.promise(value) || (typeof Node !== "undefined" && value instanceof Node)) return this.bare(PageCode, { fn: () => value });
		return this.set(value);
	}

	// First in the list, added quietly: a function cannot be written to page.jsonl, so no event.
	bare(Kind, props){
		this.items.filter(item => item instanceof PageContentItem).forEach(item => this.release(item));
		this.insert(new Kind({ id: "content-" + Kind.name.replace("Page", "").toLowerCase(), ...props }), { after: null });
		return this;
	}

	// A page.jsonl page with no code of its own draws its log; real parts replace that default.
	fallback(fn){
		this.bare(PageCode, { fn });
		this.items.at(0).fallback = true;
		return this;
	}

	adopted(item){ if (!item.transient) this.drop_fallback(); }
	drop_fallback(){ this.items.filter(item => item.fallback).forEach(item => this.release(item)); }

	// A set() means the page has parts: it draws the row box even while empty.
	set(delta){
		this.boxed = true;
		this.drop_fallback();
		return super.set(delta);
	}

	get has_parts(){ return this.items.some(item => !item.transient); }

	// Does it draw anything? (A page with no content draws nothing.)
	// The page's own function, string or address, as it was given (a section hands it on).
	get value(){ return this.items.find(item => item.transient)?.value; }

	get drawn(){ return !!this.boxed || this.length > 0; }

	// Only items that can be written down: the bare kinds live in the page's code.
	toJSON(){ return this.items.filter(item => !item.transient); }

	render(){ return new this.constructor.View({ list: this, page: this.owner }).result; }
}

// Bare items (code, address, paragraph) draw straight into the page's box. A list with any real part draws the row box and redraws on events.
PageContent.View = class PageContentView extends PageContentItem.View {
	draw(){
		const { list } = this;
		return this.box || list.has_parts || list.boxed ? this.rows() : this.bare_items();
	}

	bare_items(){
		let result;
		this.list.items.forEach(item => {
			if (result !== undefined) View.captor.append(result);
			result = new item.constructor.View({ item }).result;
		});
		return result;
	}

	// `#id` in the url scrolls to the block with that id (rows carry id=). Rows draw in a later frame, so look then.
	scroll_to_hash(){
		const id = decodeURIComponent(location.hash.slice(1));
		if (!id) return;
		requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
	}

	// ⚠ `item: { items: list }` on the container's Sortable, `item` on each row's. doc/content.md
	rows(){
		const { list, page } = this;
		let $rows;
		const sortable = !!page?.get?.("sortable");

		// A kind with its own `View` draws itself in a bare row; a plain item gets the card chrome.
		const draw_row = item => {
			const Draw = item.constructor.View;
			const $row = div.c("page-content-row" + (Draw ? "" : " card"), () => {
				const ref = item.get("ref");
				const title = item.get("title"), text = item.get("text");
				const draw_body = () => {
					if (title || !text) h4.c("page-content-title", title ?? String(item.id));
					if (text){
						const $text = div.c("page-content-text");
						import("../../ext/markdown/md.js").then(({ default: md }) => $text.append(md(text)));
					}
				};
				if (ref){
					// A ref row is the inline "#Page" chip upgraded to a card. doc/decisions.md
					const $card = div.c("page-content-ref card page-surface-dark");
					import("../../ext/Mention/Mention.js").then(({ ref_entry, build_row }) => {
						const entry = ref_entry(ref) ?? { name: ref, icon: "link", url: ref };
						$card.append(() => { $card.append(build_row(entry.name, entry, "mention")); draw_body(); });
					});
					return;
				}
				if (Draw){
					const made = new Draw({ item });
					return made.result;
				}
				draw_body();
			});
			if (sortable) import("../../ext/Draggable/Sortable.js").then(({ default: Sortable }) => {
				new Sortable({ view: $row, item });
			});
			$row.attr("id", item.id);
			return $row;
		};

		// ⚠ A block body, not `() => list.forEach(draw_row)`: forEach's return value would append "[object Object]".
		const box = div.c("page-content-list flow", () => {
			$rows = div.c("page-content-rows", () => { list.forEach(draw_row); }).ac(sortable && "drag-items sortable");
		});

		if (sortable) import("../../ext/Draggable/Sortable.js").then(({ default: Sortable }) => {
			new Sortable({ view: $rows, handle: false, $items: $rows, item: { items: list, root(){ return this; } } });
		});

		const redraw = () => { $rows.empty(() => { list.forEach(draw_row); }); this.scroll_to_hash(); };
		["add", "remove", "move", "order"].forEach(verb => list.on(verb, redraw));
		this.scroll_to_hash();
		window.addEventListener("hashchange", () => this.scroll_to_hash());

		return box;
	}
};

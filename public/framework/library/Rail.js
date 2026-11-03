import { div, a, h4, span, icon } from "/framework/core/View/View.js";
import { watch } from "/framework/ext/demo/stage.js";

// A column of Item previews. Each card lays the item out at its optimalWidth and scales it with CSS `zoom`
// (card width ÷ optimalWidth, never above 1). Docs: doc/decisions.md §5–6.
export default class LibraryRail {

	static MAX_HEIGHT = 14;   // em; a tall item is cropped, not stretched

	constructor({ library }){ this.library = library; }

	// sections: [{ title, items }]
	draw($box, sections, active){
		$box.empty(() => sections.forEach(({ title, items }) => {
			if (!items.length) return;
			div.c("library-rail-section", () => {
				h4.c("muted library-rail-title", title);
				items.forEach(item => this.card(item, item.path === active?.path));
			});
		}));
	}

	card(item, on, cols = 0){
		const { library } = this;
		const $card = a.c("card library-card", () => {
			div.c("library-thumb", $thumb => {
				const $inner = div.c("library-thumb-inner", () => item.render());
				watch($thumb.el, () => this.fit($thumb.el, $inner, item.optimalWidth));
			});
			div.c("library-card-title", () => {
				if (item.icon) icon(item.icon);
				span(item.title);
			});
		}).href(library.href_for(item.path, "")).attr("title", item.description || item.title);

		if (cols) $card.ac("span-" + cols);
		if (on) $card.ac("on").attr("aria-current", "page");
		$card.on("click", event => {
			if (event.metaKey || event.ctrlKey || event.shiftKey) return;
			event.preventDefault();
			library.go(item.path, "");
		});
		return $card;
	}

	// The wall: every item in one grid; a card spans columns by its optimalWidth (400→1, 1000→2, 1920→3, 3440→4).
	static SPANS = { 400: 1, 1000: 2, 1920: 3, 3440: 4 };

	wall($box, items){
		$box.empty(() => div.c("library-wall", () => items.forEach(item =>
			this.card(item, false, this.constructor.SPANS[item.optimalWidth] ?? 2))));
	}

	fit(thumb, $inner, width){
		if (!thumb.clientWidth) return;
		const factor = Math.min(1, thumb.clientWidth / width);
		$inner.style({ width: width + "px", zoom: factor });
		thumb.style.maxHeight = this.constructor.MAX_HEIGHT + "em";
	}
}

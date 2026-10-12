import { div, h2, p, a, button } from "/framework/core/View/View.js";
import { watch } from "/framework/ext/demo/stage.js";
import PaddingContract from "./PaddingContract.js";

// The centre: the active Item at 100% in a box as wide as the chosen chip; wider than the column, CSS `zoom` fits it.
export default class LibraryStage {

	static WIDTHS = [400, 1000, 1920, 3440];

	constructor({ library, item }){
		Object.assign(this, { library, item });
		this.width = item.optimalWidth;
	}

	draw($box){
		const { item } = this;

		$box.empty(() => {
			div.c("library-stage-head", () => {
				h2(item.title);
				if (item.description) p.c("muted", item.description);
				a.c("page-link", "Open the page →").href(item.href);
			});

			this.$chips = div.c("library-chips", () => this.constructor.WIDTHS.forEach(w =>
				button.c("library-chip", String(w)).on("click", () => this.set(w)).attr("data-width", w)));

			this.$screen = div.c("library-screen", () => {
				this.$render = div.c("library-render", () => item.render());
			});
		});

		this.mark();
		watch(this.$screen.el, () => this.fit());
		requestAnimationFrame(() => this.fit());
		requestAnimationFrame(() => PaddingContract.check(this.$render.el));
	}

	// The padding contract: the box carries the data attribute for what it holds.
	mark(){
		const { item, $render } = this;

		if (item.no_parent_padding) $render.ac("bleed");
		else if (item.needs_parent_padding)
			[...$render.el.children].forEach(el => el.setAttribute("data-needs-parent-padding", item.path));
	}

	set(width){
		this.width = width;
		this.fit();
		requestAnimationFrame(() => PaddingContract.check(this.$render.el));
	}

	fit(){
		const room = this.$screen.el.clientWidth, width = this.width;
		if (!room) return;
		const factor = Math.min(1, room / width);

		this.$render.style({ flex: "0 0 auto", width: width + "px", zoom: factor });
		[...this.$chips.el.children].forEach(el => el.classList.toggle("on", Number(el.dataset.width) === width));
	}
}

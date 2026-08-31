import { Page, div, p, h1, h2, span, a, button, icon } from "/app.js";

/* ONE ARTICLE — a page built from an entry in `issue.json`, nothing hand-written.

   Container: /imagine/'s column row (the columns host is `/imagine/`, however deep
   you are — `column_host()` takes the SHALLOWEST claim). So there is no page grid
   here and `wide` means nothing; `bleed` is the only word that reaches an edge.
   Size: no width word at all — the default track, 16em floor and the 40em measure
   as its ceiling. This is the page that earns it. Own layout: core's
   `.page-column-prose.flow`, with quotes, figures and the next-hop bled to the
   column's own inset. Regions: none, an article is a leaf. Preview: the contents
   entry below — a number, a section, a title, a standfirst.

   The blocks are a tiny vocabulary — `p`, `h`, `quote`, `figure`, `tones` — because
   an article that needs a sixth kind of block is telling you it is a different page. */

export class Article extends Page {

	// ⚠ Defaults go in `initialize()`, never in a class field. A subclass field runs
	//   AFTER `super()` — which is where Page does its `assign()` — so `no = ""` here
	//   would quietly erase the number `contents/page.js` just handed over. (Core's own
	//   `column_floor = 96` is the opposite case: a field on the BASE class runs
	//   before its constructor body, so an argument still wins.)
	initialize(){ this.no ??= ""; }

	// One flex box, not three flow children: the eyebrow, the title and the standfirst
	// are one unit of type and the column's 1.05em rhythm belongs between BLOCKS.
	content(){
		div.c("mag-head", () => {
			div.c("mag-eyebrow", () => {
				span(this.section);
				if (this.place()) span.c("mag-place", this.place());
			});

			h1.c("mag-title", this.title);
			p.c("mag-stand", this.standfirst);
		});

		this.lede();
		this.body.forEach(block => this.block(block));
		this.footer();
	}

	// The seam the data piece fills: whatever belongs between the standfirst and the
	// prose. Empty for an ordinary article, which is why it is a method and not a flag.
	lede(){}

	block(block){
		if (block.h) return h2.c("mag-sub", block.h);
		if (block.quote) return this.quote(block);
		if (block.figure) return this.figure(block);
		if (block.tones) return this.tones(block);

		return p(block.p);
	}

	// ⚠ `bleed` is a DIRECT child of `.page-column-prose` or it does nothing — the
	//   rule spends the column's own `--page-column-pad-x`, and a descendant selector
	//   would have a nested column unpick its parent's inset. Everything built by
	//   `content()` is a direct child, which is the whole reason the blocks are flat.
	quote(block){
		return div.c("mag-quote bleed", () => {
			p.c("mag-quote-text", block.quote);
			if (block.by) div.c("mag-quote-by", block.by);
		});
	}

	// A picture of a row, drawn rather than photographed: one frame per hop, the cells
	// weighted by the shares the article is talking about. No image files, no fetch,
	// and it re-flows with the column instead of pixelating in it.
	figure(block){
		return div.c("mag-figure bleed", () => {
			div.c("mag-frames", () => block.figure.forEach((spec, i) => {
				if (i) icon("chevron_right");

				div.c("mag-frame", () => spec.trim().split(/\s+/)
					.forEach(weight => div.c("mag-cell").style("flex", weight)));
			}));

			p.c("mag-caption", block.caption);
		});
	}

	// The issue's own tone ladder, as three swatches. The classes are the SAME three
	// custom properties the columns wear (mag.css), so the graphic cannot drift from
	// the thing it illustrates.
	tones(block){
		return div.c("mag-tones bleed", () => {
			div.c("mag-tones-row", () => block.tones.forEach((label, i) =>
				div.c("mag-tone mag-tone-" + (i + 1), () => span.c("mag-tone-label", label))));

			p.c("mag-caption", block.caption);
		});
	}

	// THE NEXT HOP. Reading is a line, not a tree: the end of an article offers the
	// next one, never a trip back to the contents. (The contents column is still open
	// beside this one, so it was never more than one click away either.)
	footer(){
		const next = this.next();

		return a.c("mag-next bleed").href(next ? next.url : this.parent.parent.url).append(() => {
			div.c("mag-eyebrow", next ? "Next" : "End of issue");
			div.c("mag-next-title", next ? next.title : "Back to the cover");
			if (next) p.c("mag-next-stand", next.standfirst);
		});
	}

	// My sibling after me. `children` is an insertion-ordered Map, so the running
	// order in `issue.json` IS the reading order and nothing restates it.
	next(){
		const order = [...this.parent.children.values()];
		return order[order.indexOf(this) + 1];
	}

	/* "03 / 06" — where you are in the issue. The contents entry has worn the number
	   since the issue was built; the ARTICLE never did, so a reader who opened one from
	   the row had no idea whether three more were coming or thirty.
	   ⚠ Counted from the same insertion-ordered Map `next()` walks, never from a total in
	     `issue.json` — one more entry there renumbers the whole issue and nothing says
	     six out loud. Asked at render time, which is the first moment `parent` is set. */
	place(){
		const order = [...(this.parent?.children.values() ?? [])];
		return order.includes(this) ? `${this.no} / ${String(order.length).padStart(2, "0")}` : "";
	}

	// A contents entry, not a card — a preview is a picture and this one is set in the
	// magazine's own type. Core's `preview()` seam; `nav` carries the resolved url.
	preview(nav){
		return a.c("page-preview mag-entry").href(nav.url).append(() => {
			div.c("mag-entry-no", this.no);

			div.c("mag-entry-body", () => {
				div.c("mag-eyebrow", this.section);
				div.c("mag-entry-title", this.title);
				p.c("mag-entry-stand", this.standfirst);
			});
		});
	}
}

/* THE DATA PIECE — the same article, with a chart where the lede goes.

   One fetch (`issue.js`, already done), one control, one rendering that redraws from
   it. `watch`/`notify` is the feeds lab's shape: a box captured SYNCHRONOUSLY and
   refilled in a callback, so nothing is built after an await and the filter has no
   per-view code to keep in step. */
Article.Data = class DataArticle extends Article {

	// `viewport: null` is "all of them" — the chip that shows every measurement at once.
	// `large`, because the one page in the issue whose content is not prose is the one
	// that may ask for the room; doc/columns.md's own test for the word.
	initialize(){
		super.initialize();
		this.watchers = [];
		this.viewport ??= 1920;
		this.width ??= "large";
	}

	watch(fn){ this.watchers.push(fn); fn(); }
	notify(){ this.watchers.forEach(fn => fn()); }

	rows(){ return this.data.rows.filter(row => !this.viewport || row.viewport === this.viewport); }

	lede(){
		return div.c("mag-data bleed", () => {
			div.c("mag-data-bar", () => {
				div.c("mag-chips", $chips => this.watch(() => $chips.empty(() => {
					const chip = (label, value) => button.c("mag-chip")
						.ac(this.viewport === value && "mag-chip-on")
						.text(label)
						.on("click", () => { this.viewport = value; this.notify(); });

					chip("All", null);
					this.data.viewports.forEach(width => chip(width + "px", width));
				})));

				span.c("mag-count", $count => this.watch(() => {
					const rows = this.rows();
					$count.text(`${rows.length} of ${this.data.rows.length} · widest ${Math.max(...rows.map(row => row.px))}px`);
				}));
			});

			div.c("mag-bars", $bars => this.watch(() => $bars.empty(() => {
				const rows = this.rows(), max = Math.max(...rows.map(row => row.px));

				rows.forEach(row => {
					span.c("mag-bar-word", () => {
						span(row.word);
						if (!this.viewport) span.c("mag-bar-vp", String(row.viewport));
					});

					div.c("mag-bar-track", () => div.c("mag-bar").style("width", row.px / max * 100 + "%"));
					span.c("mag-bar-px", row.px + this.data.unit);
				});
			})));
		});
	}
};

export default Article;

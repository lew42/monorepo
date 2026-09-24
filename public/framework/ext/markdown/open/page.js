import { Page, md, h2, h3, p, div, iframe, code } from "/app.js";

/* WHERE A MARKDOWN LINK OPENS. A link carries no target: the page that holds it
   decides, through one method, open_link(). Three pages below hold the same three
   links (./alpha.md, ./beta.md, ./gamma.md) and open them three ways. */

const docs = new URL("./", import.meta.url).pathname;
const box = { border: "1px solid var(--line)", borderRadius: "8px", padding: "1em", minHeight: "14em" };

// A small page drawn in a box. It is never routed to, so it says `default` to be seen.
const boxed = (extra = {}) => new Page({ folder: docs, content(){ this.md_files(); }, ...extra });

const navigate = boxed();
const card = boxed({ open_link(link){ return this.swap_link(link); } });

// A 1280 × 800 window onto a real url, drawn at half size, that clicks `doc` once loaded.
// ⚠ The url is set only once the window is ON SCREEN, and never inside another window.
//   A page's ancestors stay in the DOM, hidden, and a hidden iframe still loads — so
//   opening the columns tree below loaded this page's windows, which loaded the
//   columns tree, which loaded… (measured: 160 failed requests from one visit).
function window_on(url, doc){
	return div(() => {
		div(() => {
			iframe().attr("title", url).style({ width: "1280px", maxWidth: "none", height: "800px", border: "0", transform: "scale(0.5)", transformOrigin: "0 0" })
				.on("load", e => e.target.src && click_in(e.target, doc));
		}).style({ width: "640px", height: "400px", overflow: "hidden", border: "1px solid var(--line)", borderRadius: "8px" })
			.append($frame => { if (window.top === window) load_when_seen($frame.el.firstElementChild, url); });
		p.c("muted", url + " — then a click on " + doc + ".md");
	});
}

function load_when_seen(frame, url){
	const seen = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting) return;
		seen.disconnect();
		frame.src = url;
	});
	seen.observe(frame);
}

// Click the doc in the LAST column, the way a reader would, once it has drawn.
function click_in(frame, doc, tries = 30){
	const links = [...frame.contentDocument?.querySelectorAll(`a[href$="${doc}.md"]`) ?? []];
	if (links.length) return links.at(-1).click();
	if (tries) setTimeout(() => click_in(frame, doc, tries - 1), 200);
}

export default new Page({
	meta: import.meta,
	title: "Where a link opens",
	description: "The same markdown link, opened three ways — because the page that holds it decides, not the link.",
	icon: "call_split",
	children: "columns",

	content(){
		md("A link to a `.md` file carries no target. **The page that holds the link decides** where it opens, with one method, `open_link(link)`. Below, three pages hold the same three links. Click **alpha** in each.");

		div(() => {
			div(() => {
				h3("Navigate — the default");
				p.c("muted", "A page that says nothing goes to the doc's own page.");
				navigate.render().ac("default");
			}).style(box);

			div(() => {
				h3("Next column — in a columns tree");
				p.c("muted", "Any page inside columns opens the doc beside itself.");
				md("The two windows below show it live, one column deep and three. Or open [the columns tree](/framework/ext/markdown/open/columns/) and click a doc.");
			}).style(box);

			div(() => {
				h3("Swap in place — a card");
				p.c("muted", "This card draws the doc inside itself, with a Back button.");
				card.render().ac("default");
			}).style(box);
		}).style({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16em, 1fr))", gap: "1em" }).ac("wide");

		code.js(`// the card, whole — the one line that makes it swap in place
new Page({ content(){ this.md_files(); },
	open_link(link){ return this.swap_link(link); } });`);

		h2("One column deep, or three — at 1280");
		p("The same click, in two places in one columns tree. Each window is 1280 wide, shown at half size. Where the doc opens is always the next column after the one you clicked in.");

		div(() => {
			window_on("/framework/ext/markdown/open/columns/", "alpha");
			window_on("/framework/ext/markdown/open/columns/two/three/", "alpha");
		}).style({ display: "flex", flexWrap: "wrap", gap: "1em" }).ac("wide");

		md("How it works, and how a page picks its own rule: [core/Page/doc/open.md](/framework/core/Page/doc/open.md). Next: the [columns tree](/framework/ext/markdown/open/columns/) at full size.");
	},
});

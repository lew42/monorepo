import { Page, md, div, p, a, span, button } from "/app.js";
import { load, wall, body } from "../foreign.js";

/**
 * The four answers, each with the demo that settles it. The written-up version is
 * [core/Page/doc/previews.md](/framework/core/Page/doc/previews/).
 */

// Q1's subject: far from here, and nothing on this page is its parent.
const SUBJECT = "/framework/core/Page/overview/columns/";

// Q4's arrangement: four building-block demos, renamed and re-ordered, at MY urls.
const HERE = "/imagine/gallery/answers/arrange/";
const ARRANGE = {
	"the-leaf":  { title: "1 · The leaf",  path: "/framework/core/Page/overview/prose/" },
	"one-link":  { title: "2 · One link",  path: "/framework/core/Page/overview/list/" },
	"a-wall":    { title: "3 · A wall",    path: "/framework/core/Page/overview/wall/" },
	"the-trail": { title: "4 · The trail", path: "/framework/core/Page/overview/crumbs/" },
};

/* ── Q1 ───────────────────────────────────────────────────────────────────────
   A live count, because the guess is wrong: one import is not one file. */

function meter(){
	const js = () => performance.getEntriesByType("resource").filter(r => r.name.endsWith(".js")).length;
	const css = () => document.querySelectorAll("link[rel=stylesheet]").length;

	const $out = div.c("gal-meter flex v gap").style("--gap", "0.3em");

	button.c("prim", "Import " + SUBJECT).click(function(){
		this.el.disabled = true;                         // ⚠ `this` is the View, not the element
		const was = { js: js(), css: css(), t: performance.now() };

		// ⚠ No DOM after the await — the box above already exists; this only fills it.
		load(SUBJECT)
			.then(page => Promise.resolve(page?.loading).then(() => page))
			.then(page => $out.empty(() => {
				const files = js() - was.js;

				row("JavaScript modules fetched", files);
				row("Stylesheets added to <head>", css() - was.css);
				row("Milliseconds", Math.round(performance.now() - was.t));
				row("Its own url", page.url);
				row("Its parent", page.parent ? page.parent.url : "none — it is an orphan");
				row("Its app", page.app ? "set" : "undefined");
				row("Children resolved", [...page.children.values()].filter(Boolean).length);

				if (!files) p.c("muted", "Zero — a list column already imported it. That is the second-visit price.");
			}));
	});

	function row(label, value){
		div.c("gal-meter-row flex gap split", () => { span.c("muted", label); span(String(value)); });
	}
}

/* ── Q3 ───────────────────────────────────────────────────────────────────────
   Three cards for the same page. Only the `nav` handed to preview() differs. */

function quiet(){
	const $row = div.c("page-previews").style("--column", "14em");
	const $said = p.c("muted", "Nothing clicked yet.");

	// ⚠ `preview_card`, not `preview`, for all three: this page overrides preview() with
	//   a live tree whose only link is invisible, so a label handed to it would not be
	//   readable — and its override chains `.href(nav.url).attr(…)`, where
	//   `View.href(undefined)` falls into its GETTER branch, returns null, and throws.
	load(SUBJECT).then(page => $row.empty(() => {
		const nav = { ...page.nav(), description: page.url };

		// 1 — the default. Goes home, which is the whole problem.
		page.preview_card({ ...nav, label: "Default — goes home" });

		// 2 — re-addressed. Same card, MY url. This is nav for an arrangement.
		page.preview_card({ ...nav, label: "Re-addressed — stays here", url: HERE, description: HERE });

		// 3 — no url at all. preview_link() writes no href, and the Router only claims
		//     `a[href]`, so the anchor is inert and a handler of mine is the only one.
		page.preview_card({ ...nav, label: "No href — my handler", url: undefined, description: "no href" })
			.click(() => $said.text("Clicked. The Router never saw it — the card has no href."));
	}));
}

/* ── The four ─────────────────────────────────────────────────────────────── */

export default new Page({
	meta: import.meta,
	title: "Answers",
	description: "Can you import a page from anywhere and preview it? Four questions, four demos.",
	icon: "help",

	content(){
		md("Four questions about borrowing a page, each with the demo that settles it.");
		md("Written up: [core/Page/doc/previews](/framework/core/Page/doc/previews/).");
	},

	children: {

		"Import": {
			width: "large",
			content(){
				md("### 1 · Yes — and it costs more than one file\n\n`import(\"/path/page.js\")` works from anywhere, and the object it returns is the **same one** the Router uses: the module cache holds one copy. But the constructor calls `load_all_children()`, so importing a page imports its **whole declared subtree**, and every `View.stylesheet()` along the way appends a real `<link>` to `<head>` — permanently, for every page you visit afterwards.\n\nPress it and watch:");
				meter();
				md("What comes back is an **orphan**: it knows its own url (from `import.meta`) but `parent` and `app` are undefined until something adopts it. That is enough for `preview()`, `nav()` and `link()` — and not enough for `activate()`, whose `container()` reads `this.app.$pages` and throws.\n\n⚠ So don't adopt it. `add()` calls `move()`, which **rewrites the page's url and every resolved descendant's**. Measured: `add()`ing `/framework/styles/layouts/mail/` renamed it `/framework/borrowed/`, and its real address stopped working. Borrow the preview, never the page.");
			},
		},

		"Click": {
			width: "large",
			content(){
				md("### 2 · The card goes home, not here\n\n`preview()` builds its link from `nav()`, and `nav()` returns the page's **own** url. Click the card below: the Router walks `/framework/core/Page/overview/columns/`, the gallery rail on the left disappears, and you are in the framework docs.\n\nNothing intervened. The card is an ordinary `<a href>` pointing at the page's real address, and the Router did exactly what the href said.");
				wall([SUBJECT]).style("--column", "16em");
				md("**So a wall of borrowed cards is a directory, not a navigation system.** It shows you what exists elsewhere and sends you there. Keeping a reader inside your arrangement means changing the address the card carries — question 3.");
			},
		},

		"Quiet": {
			width: "large",
			content(){
				md("### 3 · Take the click away by changing one field\n\n`preview(nav)` takes the nav as an **argument** — it does not have to be the page's own. Three cards for the same page; only `nav.url` differs:");
				quiet();
				md("```js\npage.preview({ ...page.nav(), url: \"/my/own/url/\" });        // nav for my arrangement\npage.preview_card({ ...page.nav(), url: undefined });        // an inert picture\n```\n\nWith no url, `preview_link()` writes an `<a>` with **no href**, and `Router.link_clicked()` opens with `closest(\"a[href]\")` — so the Router never claims it, and a `click()` of your own is the only handler. No override, no second card shape, no fight.\n\n⚠ `preview_card()` for that one, not `preview()`. A page may override `preview()` with a live render, and `ext/demo`'s does `.href(nav.url).attr(…)` — `View.href(undefined)` falls into its **getter** branch and returns `null`, so the chain dies with *Cannot read properties of null*. The base card takes a url-less nav; an override may not.");
			},
		},

		"Arrange": {
			width: "large",

			/* ⚠ These names are NOT in a `children:` list. A declared name sits in the map
			   as `null`, and `child()` only offers an UNDECLARED name to `route()` — a
			   declared one falls straight through to a `page.js` fetch that 404s, and the
			   column is dead. A dynamic page draws its own index instead, from the same
			   object route() reads, so the two can never disagree. */
			route(name){
				const entry = ARRANGE[name];
				if (!entry) return;

				return { title: entry.title, width: "large", content(){ return body(entry.path); } };
			},

			content(){
				md("### 4 · Give them urls of your own\n\nFour building-block demos from `/framework/core/Page/overview/` — renamed, re-ordered and living **here**. Open one: the crumb bar says gallery, the rail stays, and the page you are reading was written somewhere else.");

				div.c("gal-index flex v gap", () => Object.entries(ARRANGE).forEach(([name, entry]) => {
					a.c("gal-index-row flex gap split").href(HERE + name + "/").append(() => {
						span.c("page-preview-title", entry.title);
						span.c("muted", entry.path);
					});
				})).style("--gap", "0.3em");

				md("`route(name)` claims the name and returns a page **spec** — a title, and a `content()` that calls the foreign page's own `content()` with the foreign page as `this`, exactly the move `ext/catalog` makes when it turns a page's content into a child.\n\nThe foreign page is **read, never moved**: its url, its parent and its cached `view` are untouched, so `/framework/core/Page/overview/prose/` still works. ⚠ Never `render()` it — that caches `page.view`, and the original would find its own body parented inside yours.\n\nThis is the answer to \"the Router would intervene\": stop borrowing its links and **borrow its body**. The Router serves your url scheme because it is a real one.");
			},
		},
	},
});

import { Page, div, h2, h3, p, a, span, img, figure, figcaption, md } from "/app.js";

/* Container: a column of /imagine/design/'s row (the hub calls columns()). Size:
   `full` — this study is pictures first, and a picture wants the whole row.
   Own layout: sections of h2, each a shot grid. Regions: none, plain content().
   Preview: the default card. */

const here = new URL(".", import.meta.url).pathname;

/* ── the catalogue — one row per mechanism ──────────────────────────────── */
const MECHANISMS = [
	{ tag: "rail-nested", file: "rail-nested-1280.png", where: "/framework/core/Page/",
		def: "`new Sidebar({ pages })` — a brand, a list of links with nested groups, active + in-path marked from the URL, a footer that stays put.",
		used: "11 direct `new Sidebar()` call sites — every top-level section (/, /framework/, /web/, /notes/, each personal sandbox) brings its own." },
	{ tag: "crumbs", file: "crumbs-1280.png", where: "/notes/auth/",
		def: "`this.crumbs()` — the trail to here, one link per page in `chain()`. Never typed, so it cannot disagree with the URL.",
		used: "5 real page.js call sites (the /notes/ tree, ext/Playground) plus every columns host, which redraws one as its own strip on each navigation." },
	{ tag: "tabs", file: "tabs-1280.png", where: "/framework/core/Page/ (OVERVIEW / GENERATOR / OLD / API / DOCS / FILES)",
		def: "`this.tabs(\"a b c\")` — a bar of links, one panel. `.vertical` turns the same mechanism into a rail (the DOCS tab's own \"declaring / labels / css / …\" list is `tabs()` again, not a second component).",
		used: "38 call sites — the framework's own module pages (Overview/Generator/Old/API/Docs/Files) are the biggest single consumer." },
	{ tag: "preview-wall", file: "preview-wall-1280.png", where: "/framework/core/Page/ → DOCS-adjacent card wall",
		def: "`previews()` / `catalog()` / `browse()` — a page's children drawn as cards instead of (or in addition to) rows; `browse()` adds a search box and filter chips over grouped bands.",
		used: "127 `previews()` sites, 24 `catalog()`, 4 `browse()` — by call count this is the site's single most common navigation surface." },
	{ tag: "columns-row", file: "columns-1280.png", where: "/framework/core/Page/overview/columns/finder/",
		def: "`this.columns()` — every descendant page becomes a full-height column opening to the right; a crumb strip above the row is the only way back once a column scrolls off.",
		used: "30 `columns()` hosts (Finder demo, /imagine/ itself, /imagine/gallery/, most of blogx's `parts` shell)." },
	{ tag: "prev-next", file: "prev-next-1280.png", where: "/imagine/blogx/rail/framework/layout-generators/",
		def: "A floor strip of `[label, url]` pairs — `Blog.strip()` for the shell-to-shell footer, `parts_strip()` for PART 1/2/3/4 of one post.",
		used: "blogx only, both of its own strip flavours; no equivalent exists outside the blog demos." },
	{ tag: "toc-rail", file: "toc-1280.png", where: "mockup: /framework/styles/layouts/docs/ (\"ON THIS PAGE\")",
		def: "`toc()` — scans the page's own `h2`/`h3` into a sticky right-hand rail, current section marked as you scroll. No `nav:` to maintain; add a heading and it's in the rail.",
		used: "23 `toc()` call sites in source — **but its CSS explicitly excludes `.standard`, the page's own default shape** (`toc.css:15`), so on every one of those 23 pages the rail never paints. The shot alongside is a hand-built mockup that shows the intended shape; the live component currently ships invisible." },
];

/* ── the phone story — where the 1280 shape and the 390 shape genuinely differ ── */
const PHONE = [
	{ tag: "rail-nested", a: "rail-nested-1280.png", b: "rail-nested-390.png", c: "rail-nested-390-open.png",
		note: "Sidebar → a sticky top bar with a burger. Closed, it's a title and three lines; tap it and the whole tree drops below the bar (still one flat list, no accordion) — this is the documented take-two design (Sidebar/doc/narrow.md)." },
	{ tag: "columns-row", a: "columns-deep-1280.png", b: "columns-deep-390.png",
		note: "A four-deep row (Finder › Guides › Words › Fill) collapses to ONE column at a time under 32em. The crumb strip is the only surviving nav — no columns, no rail, just the trail of links across the top." },
	{ tag: "rail-scroll (blogx only)", a: null, b: "prev-next-390.png",
		note: "blogx's own two-level rail does NOT get a burger — it flattens into a horizontal-scrolling strip of tabs at the very top (\"FRAMEWORK | The layout generator | Column pa…\"), a second, different answer to the same narrow-width problem the site's Sidebar already solved once." },
	{ tag: "toc-rail", a: "toc-1280.png", b: "toc-390.png",
		note: "The right rail is simply dropped — no toggle, no relocation, the sections it indexed are just headings in the flow again." },
	{ tag: "tabs", a: "tabs-1280.png", b: "tabs-390.png",
		note: "The bar doesn't wrap or shrink its labels — it just runs off the right edge (DOCS and FILES are already invisible at 390, no scroll hint). Matches ext/tabs' own doc: “one strip that scrolls, never a wrapping block.”" },
	{ tag: "preview-wall", a: "preview-wall-1280.png", b: "preview-wall-390.png",
		note: "The filter rail (search box + count chips) stacks full-width above the cards instead of beside them, and each band drops to one card per row — the only mechanism here that degrades by simple reflow, no JS state at all." },
];

const shot = (file, alt, w) => a().href("#").attr("tabindex", "-1").append(() =>
	img().attr("src", here + "shots/" + file).attr("alt", alt)
		.style({ width: w || "100%", border: "1px solid var(--line)", borderRadius: "0.3em", display: "block" }));

const row = m => div.c("nav-row").style({ borderBottom: "1px solid var(--line)", paddingBlock: "1.4em" }).append(() => {
	div.c("flex gap wrap").style({ alignItems: "flex-start" }).append(() => {
		div().style({ flex: "1 1 420px", minWidth: "300px" }).append(() => shot(m.file, m.tag));
		div().style({ flex: "1 1 320px", minWidth: "260px" }).append(() => {
			span.c("code", m.tag);
			p.c("muted", m.def).style({ margin: "0.4em 0" });
			p().style({ fontSize: "0.9em" }).append(() => { span.c("muted", "Where: "); span(m.where); });
			p().style({ fontSize: "0.9em" }).append(() => { span.c("muted", "Used: "); span(m.used); });
		});
	});
});

const pair = ph => div.c("nav-phone-row").style({ borderBottom: "1px solid var(--line)", paddingBlock: "1.4em" }).append(() => {
	h3.c("code", ph.tag).style({ marginBlockEnd: "0.5em" });
	div.c("flex gap wrap", () => {
		if (ph.a) figure.c("flex v gap").style({ margin: 0, flex: "2 1 500px" }).append(() => {
			shot(ph.a, ph.tag + " at 1280");
			figcaption.c("muted", "1280");
		});
		figure.c("flex v gap").style({ margin: 0, flex: "1 1 220px", maxWidth: "260px" }).append(() => {
			shot(ph.b, ph.tag + " at 390");
			figcaption.c("muted", "390");
		});
		if (ph.c) figure.c("flex v gap").style({ margin: 0, flex: "1 1 220px", maxWidth: "260px" }).append(() => {
			shot(ph.c, ph.tag + " at 390, opened");
			figcaption.c("muted", "390, opened");
		});
	});
	p.c("muted", ph.note).style({ marginBlockStart: "0.6em" });
});

const TRAILS = [
	{ title: "A blog post, 5 segments deep", clicks: 4,
		path: ["/", "/imagine/", "/imagine/blogx/", "/imagine/blogx/rail/", "/imagine/blogx/rail/framework/layout-generators/"],
		carried: "Nothing site-level. blogx hides the site's sidebar and crumb strip on purpose (\"a blog's own rail IS the navigation\") — the only orientation past the first click is blogx's own two-level rail, which re-marks itself from the URL on every click." },
	{ title: "A doc topic, 6 segments deep", clicks: 4,
		path: ["/", "/framework/core/Page/", "/framework/core/Page/ (Docs tab)", "/framework/core/Page/doc/", "/framework/core/Page/doc/columns/"],
		carried: "Three mechanisms stacked, none of them a breadcrumb: the site Sidebar's in-path mark on \"Page\", the horizontal tab bar's underline on \"Docs\", and the vertical tab list's underline on \"columns\". Landing here cold (a shared link), there is no `.page-crumbs` at all — /notes/ pages get a real breadcrumb, doc pages don't." },
	{ title: "A columns row, 4 columns deep, no reload", clicks: 3,
		path: ["/framework/core/Page/overview/columns/finder/", "…/guides/", "…/guides/words/", "…/guides/words/fill/"],
		carried: "The crumb strip above the row (`Finder › Guides › Words › Fill`) is generated fresh on every click from `chain()`, and it is the ONLY orientation left once the row is narrower than the screen — see the phone story above, where the columns themselves disappear and the crumb strip is what remains." },
];

const trail = t => div.c("nav-trail").style({ borderBottom: "1px solid var(--line)", paddingBlock: "1.2em" }).append(() => {
	h3(t.title + " — " + t.clicks + " clicks").style({ marginBlockEnd: "0.3em" });
	div.c("flex gap wrap v-center").style({ fontSize: "0.85em", marginBlock: "0.5em" }).append(() =>
		t.path.forEach((seg, i) => {
			if (i) span.c("muted", " → ");
			span.c("code", seg);
		}));
	p.c("muted", t.carried);
});

export default new Page({
	meta: import.meta,
	title: "Navigation",
	description: "Every navigation mechanism the site uses, shot at three widths — rails, crumbs, tabs, preview walls, the columns row, prev/next strips — and three click-trails into the four-plus-level deep end.",
	icon: "explore",
	width: "full",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink).
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/columns-1280.png").attr("alt", nav.label));
	},

	content(){
		md("**Nine mechanisms, and previews already do the heaviest lifting.** `previews()`/`catalog()`/`browse()` outnumber every other call site combined (127 + 24 + 4) — cards, not rows, are the site's default answer to *what do I click next*. The rest cover what cards can't: a persistent map (`rail-nested`), *where am I* (`crumbs`), a small closed set (`tabs`), a browsing session with real back-state (`columns-row`), and read-in-order content (`prev-next`).");

		h2("The catalogue");
		p.c("muted", "One 1280 shot, the tag, and where it's used. Counts are call sites in `public/`, not visual instances.");
		MECHANISMS.forEach(row);

		h2("The phone story");
		p.c("muted", "Four mechanisms change shape at 390 in four different ways — one of them (toc) just disappears, and two of the survivors (rail-nested vs. blogx's own rail) solved the same problem differently without knowing about each other.");
		PHONE.forEach(pair);

		h2("Three deep-path walks");
		p.c("muted", "Headless, from a cold `/`, counting only real clicks (no typed URLs, no back button).");
		TRAILS.forEach(trail);

		h2("What's missing");
		md("No **sticky top bar** exists anywhere as its own mechanism — the closest thing is the Sidebar's narrow-mode top bar, which is a rail wearing a different shape, not a scroll-position affordance. There is no **sticky-on-scroll header** for a long prose page.");
		md("Multi-level nesting tops out at what the rail and the columns row already carry: the rail's groups are one level deep (a heading, then flat links — no group ever contains a sub-group), and the columns row has no depth ceiling of its own, but under 32em width it can show only **one** column, so anything past two ancestors is already off-screen and the crumb strip is doing all the work alone.");
		md("Two real gaps: **toc() silently no-ops on the page shape 23 of its own call sites actually use** (.standard, the default — see the catalogue row above), so the sticky “on this page” rail the framework already built is currently invisible in production, not merely rare. And **the site's own top-level .nav** (Home/Framework/Web/Alex/Arya/Castin/Edric/Michael, built once in app.js) **is hidden on every real destination** — every top-level page declares classes: \"hides-nav\" and brings its own Sidebar instead — so that nav bar has no page left that shows it; /imagine/ itself is reachable from the homepage by exactly one markdown link at the very bottom of the page, not from any rail.");
		md("If one thing here gets cut first: **the two narrow-width answers to the same problem.** Sidebar's hamburger and blogx's horizontal-scroll strip both exist to solve “a nested rail is too tall for a phone,” and a visitor who has learned one has to re-learn the other.");
	},
});

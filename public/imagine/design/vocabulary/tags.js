// The vocabulary — one flat list of {tag, axis, def} plus one array of tagged sites.
// Tags are lifted VERBATIM from tonight's other studies wherever they fit (see each
// def's "from" note) rather than invented twice. New tags exist only to describe a
// shape neither study needed for THIS site but a foreign one will have.
//
// `carries: true` marks the multi-level-navigation subset — the tags whose whole job
// is holding a trail more than one level deep (a nested rail, a derived crumb, a
// columns row, a menu that opens a sub-menu). Everything else in the navigation axis
// is flat: one bar, one panel, one strip.

export const axes = [
	// ── navigation: how you move, and what remembers where you are ──────────
	{ tag: "rail-nested", axis: "navigation", carries: true,
		def: "A sidebar of links with nested groups; active + in-path marked from the URL. (navigation-study)" },
	{ tag: "crumbs", axis: "navigation", carries: true,
		def: "A trail of links to here, one per ancestor page — derived from the URL, never typed. (navigation-study)" },
	{ tag: "tabs", axis: "navigation",
		def: "A bar of links with one open panel; the vertical variant is the same mechanism as a rail. (navigation-study)" },
	{ tag: "preview-wall", axis: "navigation",
		def: "Children drawn as cards instead of rows — the site's single most common answer to \"what's next\". (navigation-study)" },
	{ tag: "prev-next", axis: "navigation",
		def: "A floor strip of prev/next links for content meant to be read in a fixed order. (navigation-study)" },
	{ tag: "toc-rail", axis: "navigation",
		def: "A sticky right-hand rail built from the page's own headings. (navigation-study)" },
	{ tag: "rail-scroll", axis: "navigation", carries: true,
		def: "A nested rail that answers narrow width by scrolling sideways instead of collapsing behind a toggle. (navigation-study, blogx)" },
	{ tag: "top-nav", axis: "navigation",
		def: "One horizontal bar of top-level links, page width, no nesting." },
	{ tag: "hamburger", axis: "navigation", carries: true,
		def: "A nested menu collapsed behind a toggle icon below some width." },
	{ tag: "mega-menu", axis: "navigation", carries: true,
		def: "A top-nav item that opens a wide panel of grouped links on hover or click." },
	{ tag: "footer-nav", axis: "navigation",
		def: "A block of links repeated in the page footer, usually a flat sitemap." },

	// ── shell: the page's own region layout ──────────────────────────────
	{ tag: "rail-and-content", axis: "shell",
		def: "A fixed sidebar beside one scrolling content column — the near-universal shell. (layout-study)" },
	{ tag: "docs-three-region", axis: "shell",
		def: "Rail and content plus a third region, a per-page table of contents pinned right. (layout-study)" },
	{ tag: "columns-row", axis: "shell", carries: true,
		def: "Full-height panes opening rightward, Finder-style; each column scrolls itself and carries its own depth. (layout-study / navigation-study)" },
	{ tag: "holy-grail", axis: "shell",
		def: "Header, footer, and three columns (nav / content / aside) in one fixed frame." },
	{ tag: "single-column", axis: "shell",
		def: "One column, page width capped, no sidebar at all." },
	{ tag: "split-view", axis: "shell",
		def: "Two panes side by side, a list and a detail, both visible at once." },
	{ tag: "solo-bespoke", axis: "shell",
		def: "No shared shell — the page builds its own frame from scratch. (layout-study)" },

	// ── scroll: what the page does as you move down it ───────────────────
	{ tag: "infinite-scroll", axis: "scroll",
		def: "New content loads automatically near the bottom — no pager, no end." },
	{ tag: "horizontal-scroll", axis: "scroll",
		def: "Content overflows sideways on purpose — a strip you scroll across, not down." },
	{ tag: "sticky-header", axis: "scroll",
		def: "The top bar stays pinned while the page scrolls beneath it." },

	// ── content-kind: what the section IS, not how it's built ────────────
	{ tag: "landing", axis: "content-kind",
		def: "A site's own front door — cards or links out to its sections, little content of its own." },
	{ tag: "blog", axis: "content-kind",
		def: "Dated posts, read in sequence, usually with prev/next." },
	{ tag: "docs", axis: "content-kind",
		def: "Reference material organized by topic, not by date." },
	{ tag: "dashboard", axis: "content-kind",
		def: "A live status board — cards or rows of current state, not narrative." },
	{ tag: "gallery", axis: "content-kind",
		def: "A browsable wall of items borrowed from elsewhere, previewed as cards." },
	{ tag: "notes", axis: "content-kind",
		def: "Short, loosely related write-ups — not a sequence, not reference." },
	{ tag: "personal", axis: "content-kind",
		def: "A named individual's own sandbox — style and structure are theirs to set." },
	{ tag: "resume", axis: "content-kind",
		def: "A single-purpose page making the case for one person, not a section of many." },
];

// The corpus — OUR OWN realms, tagged as if each were a foreign site found on the web.
// Every honest look was quick (grep + a page.js read, not a full audit); `notes` says
// what was actually checked.
//
// TO ADD AN EXTERNAL SITE (from the owner's PC, once egress is open): append one object
// here — { site, url, tags: [...], notes } — using tags already defined in `axes` above.
// Add a new tag to `axes` first if none fits; don't invent one inline.
export const sites = [
	{ site: "lew42 (home)", url: "/",
		tags: ["rail-and-content", "rail-nested", "hamburger", "landing"],
		notes: "Brings its own Sidebar built from the same {title,url,desc} list as the hero cards — one data source, two renderings." },
	{ site: "Blog", url: "/blog/",
		tags: ["rail-nested", "hamburger", "crumbs", "toc-rail", "prev-next", "docs-three-region", "blog"],
		notes: "Found: the blog. Each post is rail + prose + toc — the site's one real three-region shell, given to every post for free by Post.js." },
	{ site: "Framework", url: "/framework/",
		tags: ["rail-and-content", "rail-nested", "hamburger", "tabs", "docs"],
		notes: "Found: the docs. Module pages use OVERVIEW/GENERATOR/API/DOCS tabs; no breadcrumb (navigation-study: doc pages carry no .page-crumbs, unlike /notes/)." },
	{ site: "AI board", url: "/framework/ai/",
		tags: ["rail-and-content", "preview-wall", "dashboard"],
		notes: "A dashboard: catalog()'s previews() override draws every day as a card, every task inside it as a row." },
	{ site: "Imagine", url: "/imagine/",
		tags: ["columns-row", "crumbs", "gallery"],
		notes: "The columns world — multi-level via columns(), not a rail; a crumb strip above the row is the only trail once a column scrolls off (navigation-study)." },
	{ site: "Notes", url: "/notes/",
		tags: ["top-nav", "single-column", "preview-wall", "crumbs", "notes"],
		notes: "No Sidebar, no hides-nav — one of the few real destinations where the site's own top .nav actually shows (navigation-study flagged this as rare)." },
	{ site: "Michael (sandbox)", url: "/michael/",
		tags: ["rail-and-content", "rail-nested", "hamburger", "personal"],
		notes: "Textbook rail-and-content; layout-study measured its width_used dropping 79%→33% from 1280 to 3440 (prose ceiling, nothing added beside it)." },
	{ site: "Alex (sandbox)", url: "/alex/",
		tags: ["solo-bespoke", "top-nav", "personal"],
		notes: "Pre-Page: a bare function importing its own nav.js, not new Page({...}) — bespoke in the literal sense, not just visually." },
	{ site: "Résumé", url: "/resume/",
		tags: ["solo-bespoke", "single-column", "resume"],
		notes: "Its own render(), no shared shell (layout-study); a 3D parallax scroll runs underneath the single column." },
];

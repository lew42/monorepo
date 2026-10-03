/**
 * refs — the `#` namespace: name → { url, icon }. `#Page` becomes a small icon
 * item linking to `url`, with `icon` (a Material Symbols name, the same ones
 * `ui.item` takes) beside the word.
 *
 * A plain object, imported like any other module — no fetch, so a mention can
 * render the instant the text does, and the browser's own module cache is the
 * only cache this needs. Mention.js does the lookup case-insensitively, so
 * `#page` and `#PAGE` both find `Page` below.
 *
 * WHERE THESE CAME FROM (2026-09-30): the core seven classes
 * (`/framework/core/`), Servex, and nineteen `ext/` modules, each pointing at
 * its own real page — chosen so every url on this list answers 200 today.
 * Four more were added for the owner's own first-targets list: `CLAUDE.md`,
 * `skills`, `MCP`, `dev-server` — see doc/syntax.md for exactly which page
 * each of those landed on and why (none of them has a page of its own).
 *
 * HOW TO GROW THIS LIST: add a `Name: { url, icon }` line. Check the url
 * loads (a missing page still answers 200 on the dev server, so a broken
 * link won't show itself — open it and look). Pick `icon` from Material
 * Symbols, ideally the same one that page already uses for itself (its
 * `page.js`'s own `icon:` field) so the mention matches the page it points
 * to. doc/syntax.md has the note on deriving this list from the site
 * instead of hand-writing it.
 */
export default {

	// THE ROOT ITSELF — added 2026-10-03 so a literal "/framework/" in text (owner, bug
	// report: "a path must link to its own page") resolves HERE, never to one of the
	// `path: false` stand-ins below that happen to borrow this same url.
	Framework: { url: "/framework/", icon: "widgets" },

	// The core seven — one class, one real element (or, for Router/Item/List,
	// one real idea) — public/framework/core/page.js's own `children:`.
	Page:    { url: "/framework/core/Page/", icon: "description", class_card: true },
	View:    { url: "/framework/core/View/", icon: "image", class_card: true },
	Router:  { url: "/framework/core/Router/", icon: "alt_route", class_card: true },
	App:     { url: "/framework/core/App/", icon: "widgets", class_card: true },
	Sidebar: { url: "/framework/core/Sidebar/", icon: "view_sidebar", class_card: true },
	Item:    { url: "/framework/core/Item/", icon: "data_object", class_card: true },
	List:    { url: "/framework/core/List/", icon: "reorder", class_card: true },

	// The agent system.
	Servex: { url: "/framework/servex/", icon: "hub" },

	// ext/ — nineteen addons a reader runs into often enough to deserve a
	// one-word mention. `Task` points at AITask, the module that renders one.
	Task:       { url: "/framework/ext/AITask/", icon: "smart_toy", class_card: true },
	Chat:       { url: "/framework/ext/Chat/", icon: "chat" },
	Panel:      { url: "/framework/ext/Panel/", icon: "dashboard_customize", class_card: true },
	Doc:        { url: "/framework/ext/Doc/", icon: "menu_book", class_card: true },
	JSONL:      { url: "/framework/ext/JSONL/", icon: "table_rows", class_card: true },
	Markdown:   { url: "/framework/ext/markdown/", icon: "article" },
	Tabs:       { url: "/framework/ext/tabs/", icon: "tab", class_card: true },
	Files:      { url: "/framework/ext/files/", icon: "folder_open" },
	Collab:     { url: "/framework/ext/Collab/", icon: "forum", class_card: true },
	Research:   { url: "/framework/ext/Research/", icon: "biotech" },
	DesignTool: { url: "/framework/ext/DesignTool/", icon: "straighten" },
	Draggable:  { url: "/framework/ext/Draggable/", icon: "drag_indicator", class_card: true },
	Saver:      { url: "/framework/ext/Saver/", icon: "save", class_card: true },
	Editor:     { url: "/framework/ext/editor/", icon: "design_services", class_card: true },
	Timeline:   { url: "/framework/ext/Timeline/", icon: "view_timeline", class_card: true },
	Drawer:     { url: "/framework/ext/drawer/", icon: "view_sidebar" },
	Highlight:  { url: "/framework/ext/highlight/", icon: "code" },
	Layout:     { url: "/framework/ext/layout/", icon: "tune" },
	Session:    { url: "/framework/ext/Session/", icon: "record_voice_over" },

	// The owner's own first-targets list (2026-09-30) that isn't a module page. `path: false`
	// — each BORROWS another page's url just to have somewhere to click (this comment, above),
	// so typing that url as a literal PATH must still reach the real page it is (bug, 2026-10-03:
	// the owner typed "/framework/" and got a "CLAUDE.md" icon link instead of the Framework
	// page itself) — `by_path()` (Mention.js) skips any entry marked `path: false`.
	"CLAUDE.md": { url: "/framework/",                                icon: "policy", path: false },
	skills:      { url: "/framework/servex/",                         icon: "extension", path: false },
	MCP:         { url: "/framework/servex/",                         icon: "cable", path: false },
	"dev-server": { url: "/framework/servex/fs/?file=Server",         icon: "terminal", path: false },
	// Roles as THINGS to read about (the owner's #-list names them); `@` is the agent itself.
	mastermind:        { url: "/framework/servex/md/doc/roles/", icon: "psychology" },
	"fast-assistant":  { url: "/framework/servex/md/doc/roles/", icon: "bolt" },
	"smart-assistant": { url: "/framework/servex/md/doc/roles/", icon: "support_agent" },
};

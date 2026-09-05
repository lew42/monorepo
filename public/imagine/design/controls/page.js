import { Page, div, h2, h3, span, a, img, figure, figcaption, p, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;
const shot = file => here + "shots/" + file;

/* ── The control wall ────────────────────────────────────────────────────
   One card per control kind ACTUALLY instantiated somewhere — grepped, not
   guessed. `n` is file-count of real importers outside the module's own dir. */
const WALL = [
	{ name: "Buttons & links-as-buttons", n: "305 sampled", files: "27 CSS signatures, ~9 families",
		shots: ["style-demo-btn.png", "style-sidebar-link.png"],
		examples: [["/web/nav/tabs/", "demo-btn (CTA)"], ["/framework/", "sidebar-link"]],
		note: "No single '.btn' owns the site. A theme button rule, a 'demo-btn' family and a dozen bespoke link classes coexist — see the verdict below." },
	{ name: "Dropdown (menu)", n: 4, files: "files import it",
		shots: ["dropdown-default.png", "dropdown-open.png"],
		examples: [["/framework/ext/Dropdown/", "the module's own demo"], ["/framework/ext/Panel/", "the properties rail's picker"]],
		note: "A popover in the top layer, never clipped. Narrow but real use — wired only into Panel/Playground toolbars, nowhere on a content page." },
	{ name: "Panel (workspace surface)", n: 33, files: "files import it",
		shots: ["panel-default.png"],
		examples: [["/framework/ext/Panel/", "the module's own demo"], ["/framework/dev/DevBar/", "the dev rail's own panels"]],
		note: "Chrome for arranging — the workspace + toolbar + always-open properties rail on the right." },
	{ name: "Drawer (right rail)", n: 12, files: "files import it — one of them is app.js itself",
		shots: ["drawer-open.png", "drawer-resized.png"],
		examples: [["/framework/ext/drawer/", "the module's own demo"], ["/framework/ext/Panel/", "shows a selection's words"]],
		note: "One rail, any number of callers. Its inline edge is `ext/grip` — dragged live here, 304px → 380px, 1:1 with the pointer." },
	{ name: "Tabs", n: 23, files: "files import it — patched onto every Page by app.js",
		shots: ["tabs-default.png", "tabs-active.png"],
		examples: [["/framework/ext/tabs/", "the module's own demo"], ["/framework/ext/Dropdown/", "OVERVIEW / DOCS / FILES"]],
		note: "The most widely reused control on the site — `this.tabs()` is one line on any Page." },
	{ name: "Mode toggle (light/dark/auto)", n: "site-wide", files: "one button, every page's sidebar footer",
		shots: ["mode-before.png", "mode-after.png"],
		examples: [["/", "home"], ["/blog/", "blog"]],
		note: "One control, one place — the closest thing on the site to a perfectly consistent widget." },
	{ name: "Editor / inputs (Ask, block editor)", n: "18 + 7", files: "editor + Ask importers",
		shots: ["editor-default.png"],
		examples: [["/framework/ext/editor/", "the drag-and-drop block builder"], ["Ctrl+\\", "the dev rail's Ask input (localhost only)"]],
		note: "The editor's palette/tree/properties triad is its own three-panel vocabulary, not shared with Panel's." },
	{ name: "Files & toc (tree navigation)", n: "11 + 10", files: "files + toc importers",
		shots: ["files-default.png"],
		examples: [["/framework/ext/files/", "a real fetched file tree"], ["/framework/start/", "the start page's own tree"]],
		note: "Selection is a highlighted row (orange outline), never a redraw — the one tree pattern that survived being copied twice." },
	{ name: "Icons", n: "pervasive", files: "icon() on nearly every control above",
		shots: ["panel-default.png"],
		examples: [["/framework/ext/Panel/", "toolbar glyphs"], ["/", "sidebar glyphs"]],
		note: "One ligature font (Material Icons, not Symbols — a Symbols-only name silently renders as its literal word). One glyph system, used consistently." },
];

const card = c => figure.c("flex v gap ctl-card").style({
	margin: 0, padding: "0.8em", border: "1px solid var(--line)", borderRadius: "0.4em", background: "var(--surface)",
}).append(() => {
	div.c("flex gap wrap").append(() => c.shots.forEach(f =>
		img().attr("src", shot(f)).attr("alt", c.name).style({ maxHeight: "160px", border: "1px solid var(--line)", borderRadius: "0.3em" }))
	);
	figcaption(() => {
		span.c("ctl-name", c.name).style({ fontWeight: "700", display: "block" });
		span.c("muted", `used in ${c.n} ${c.files}`).style({ display: "block", fontSize: "0.85em" });
		div.c("flex gap wrap").style({ fontSize: "0.85em", margin: "0.2em 0" }).append(() =>
			c.examples.forEach(([url, label], i) => {
				if (i) span.c("muted", " · ");
				a(label).href(url.startsWith("/") ? url : "#");
			})
		);
		p.c("muted", c.note).style({ fontSize: "0.85em", margin: "0.3em 0 0" });
	});
});

/* ── The consistency verdict ─────────────────────────────────────────────
   Small crops, same scale, so the eye does the clustering. */
const BUTTON_STYLES = [
	{ file: "style-sidebar-link.png", label: "sidebar-link — no frame, no bg" },
	{ file: "style-demo-btn.png", label: "demo-btn — bordered, uppercase, bold" },
	{ file: "style-blog-chip.png", label: "blog-chip — pill, 999px radius" },
	{ file: "style-mode-btn.png", label: "mode-btn — bordered square, icon-only" },
];

const swatch = s => figure.c("flex v gap").style({ margin: 0, gap: "0.3em" }).append(() => {
	img().attr("src", shot(s.file)).attr("alt", s.label).style({ border: "1px solid var(--line)", borderRadius: "0.3em", background: "var(--surface)" });
	figcaption.c("muted", s.label).style({ fontSize: "0.8em" });
});

/* ── Keyboard spot-check ──────────────────────────────────────────────── */
const KEYBOARD = [
	["Dropdown trigger", "PASS", "Tab reaches it (visible outline), Escape closes the popover"],
	["Drawer close ✕", "PASS", "Tab focuses it, Enter fires close() — the rail's `.on` class clears"],
	["Mode toggle", "PASS", "click AND Enter both flip the color-scheme (auto → light → dark)"],
	["Tabs (a focused .tab)", "PARTIAL", "Enter DOES activate it — but outline:none, so it works with no visible focus ring"],
	["Panel toolbar button", "FAIL", "a real button element, tabIndex 0 — but hover-revealed and hidden by default, so Tab can never reach it"],
];

export default new Page({
	meta: import.meta,
	title: "Controls",
	description: "Every interactive control pattern the site actually uses — buttons, menus, panels, tabs, grips — shot in its states, and judged: one button, or five accidental ones?",
	icon: "toggle_on",
	width: "full",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink).
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/drawer-open.png").attr("alt", nav.label));
	},

	content(){
		md("**Source first, then the camera.** `framework/ext/` is the real control library — ten interactive modules, all genuinely imported somewhere outside their own directory (grepped, not assumed). `framework/ui/` is a *different* tier: twenty markup-you-copy templates, and nine of them — dialog, tooltip, accordion, card, toolbar, progress, field, kbd, stats — have never been copied into a real page. That's shelf-ware by design (the readme says so), not a bug, but it means the design system is wider than the site's actual footprint.");

		h2("The control wall");
		p.c("muted", "One card per control kind in real use — default + one driven state, where it's used, and two live links.");
		div.c("bleed", () => div.c("grid auto gap", () => WALL.forEach(card)).style("--column", "22em"));

		h2("The consistency verdict");
		md("**305 clickable elements**, sampled across 14 pages at 1280px, clustered by (padding, radius, background, border, font-size, weight, transform): **27 distinct CSS signatures**. Most collapse into the same family across states (a `.tab` sampled active/inactive/hover four ways is one family, not four) — the honest count is **about 9 real button families**, with no single one dominant. Four of them, same scale:");
		div.c("bleed", () => div.c("flex gap wrap", () => BUTTON_STYLES.forEach(swatch)));
		md("**Panels and menus fare differently — for the opposite reason.** A passive crawl found only 21 panel-shaped elements (3 clusters), because dropdowns, drawers and menus render at zero size until opened. Driving them open (above) shows real agreement: Dropdown's list, Panel's rail and the drawer all share the same look — a light surface, a thin border, no shadow. Where panels disagree is not visual, it's structural: Panel's workspace, the block editor's workspace and the file tree's two-panel layout are three different multi-pane vocabularies for what is conceptually the same job.");

		h2("Keyboard + focus, 5 controls");
		md(KEYBOARD.map(([c, r, note]) => `- **${c}** — ${r === "PASS" ? "✅" : r === "FAIL" ? "❌" : "⚠️"} ${r} — ${note}`).join("\n"));

		h2("Three moves toward one control set");
		md("**1. Name the one button.** `demo-btn` and the theme's bare `button, .btn` rule are two lineages solving the same problem — pick one, and give every bordered/uppercase CTA on the site that class, not a per-page reinvention. **2. Give the hover-only controls a keyboard path.** Panel's toolbar (`tune`, `zoom_in`, the drag handle) is real markup with `tabIndex 0` that Tab can never reach because it's hidden until hover — either show it on `:focus-within` too, or accept it's mouse-only and say so. **3. Converge the three multi-pane vocabularies.** Panel's workspace, the editor's workspace and `files()`'s tree+source layout each reinvented a palette/tree/canvas arrangement independently; one shared `ux/` shell (as Tree already graduated) would mean a reader learns the pattern once.");

		md.details(import.meta, "readme.md", "Readme");
	},
});

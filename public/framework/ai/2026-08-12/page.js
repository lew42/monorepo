import { Page, md, h2, ui } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-12",
	description: "One axis for everything; then four parallel workers: width presets, the Layout tab, app patterns, and ui/ unified.",
	icon: "flag",
	children: "stage layouts apps unify",

	content(){

		md("**The axis verdict — blessed by Mike.** A page was running two compositions at once: title and prose on a centred measure, walls and exhibits packed left off the `wide` / `bleed` tracks. Two axes on one page reads broken at every scale, and it recurses — a `demo.app` repeats the fight inside a box already off the outer axis.");

		md(`## Left-anchor everything — one axis

- The opt-in \`.page.standard.left\` variant **became** \`.page.standard\`. Fixed
  gutter (\`clamp(2em, 4%, 5em)\`), \`main\` and \`wide\` starting on one grid line,
  every leftover pixel spent on the right.
- \`.page\` lost \`margin-inline: auto\`, so a \`pad\` / \`full\` page or a page in a
  tab panel joins the same axis instead of finding its own centre.
- \`.bleed\` still spans the page, but a **framed** exhibit pays the gutter back
  like the wall does — \`.demo-stage.bleed\` and \`.layout.bleed\`, each rule in the
  ext that owns the class. Unframed colour bands stay edge to edge; a catalog is
  a region, not an exhibit, and is left alone.
- Record, with the diagnosis and the one counter-argument worth reopening it
  with: [Page — doc/layout.md](/framework/core/Page/).`);

		md("**The size system + exhibit unification proposal was drafted and shelved** — one vocabulary for how big a thing renders (card, thumb, stage, exhibit) is worth having, but not on the same day the axis moved under it.");

		md("**A classdoc's header is a well.** The class name and the tab strip now share one row in a full-bleed band a shade darker than the page — title at the gutter, strip bottom-aligned on the band's edge, and the selected tab filled with the app's own ground (`--tab-fill`, new in `ext/tabs`, `transparent` by default) so tab and content read as one lighter surface cut into it. `.block` tabs took the scale's `h4`. Title and content land on `--gutter-x` — the axis, held.");

		md("**`mini_app()` is now `demo.app()`** — `import { demo } from \"/app.js\"`, then `demo.app(tree, { nav: true })`. `ext/demo/mini-app.{js,css}` became `app.{js,css}`, `MiniApp` became `DemoApp`, and the `.mini-app*` classes became `.demo-app*`. The box was never *mini*; it is the demo tier's app, and it now says so.");

		md("**Every detail page on the site is `demo.exhibit()` now** — `styles/sections` and `styles/layouts` were the last two hand-rolls and both converted by deleting, not adding: `layouts/Layout.js` and `recipe.js` dissolved into `detail.js`, and `sections/parts.js` is gone entirely, its `section()`/`eyebrow()`/`cta()` written out in the fifteen bands whose source is now the lesson. [demo §16](/framework/ext/demo/), [sections §11](/framework/styles/sections/), [layouts](/framework/styles/layouts/).");

		h2("Session two — the layout expedition");

		md("Four Opus workers, launched in parallel at **15:41**, orchestrated from one Fable session. Each got its brief at `<dir>/requirements.md` and owes back an interactive executive summary at `<dir>/page.js` — the links below land on those summaries as they arrive.");

		ui.timeline(
			["15:41 → 16:06", "stage — landed", "Width presets (390 · mobile, 810 · tablet, 1440 · desktop, 3440 · mega) merged into the stage's one zoom control — the render lays out at the picked width and zooms to fit its room, capped at 1:1, so mega is visible on a laptop. Dragging the handle releases the preset. Two-up drag rAF-coalesced and change-gated: 200 pointermoves cost 781ms before, under 2ms after, measured. Verified in Chrome at four widths, zero console errors. Opus, 25 min."],
			["15:41 → 16:11", "layouts — landed", "A Layout tab on the Page class page for the cost of ONE WORD — classdoc already tabs declared children. Ten page layouts (document, landing, docs, split, dashboard, gallery, shell, feed, mail, chat), every one the same fictional site from web.js, every card a 390 phone beside a 3440 monitor, every detail page the two-up with parts chips in the right drawer — header, rail, footer are checkboxes, not sibling variants. Zero new CSS. Verified at 390/900/1600/3440, light and dark. Opus, 30 min."],
			["15:41 → 16:20", "apps — landed", "Four application patterns as live demo pages: a Figma-like editor (pages + layers rail, canvas, a REAL properties panel built from ext/Layout's own controls), a Blender-like recursive pane system with per-pane type menus and a cut/close variant, Miller columns on a real Page tree — columns are catalog() applied at every level — and rail vs wall vs columns compared on one switchable tree. ~15 lines of CSS total. Strongest promotion case: columns into the Page overview's Arrangements run. Opus, 39 min."],
			["15:41 → 16:24", "unify — landed", "Nineteen of nineteen ui/ pages took the exhibit — the last un-unified section is gone, and 29 variant child pages arrived with it. demo.exhibit() is one full-bleed band now (render beside definition, wrapping under 36em so a phone gets every pixel), and any page with children grows a Variants section — sub-demos, simple → complex, one card system. Plus a found bug: every exhibit caption was an unpadded tinted strip. 446-route crawl clean. Opus, 43 min."],
		);

		md("- [stage](/framework/ai/2026-08-12/stage/) — `ext/demo` presets + performance\n- [layouts](/framework/ai/2026-08-12/layouts/) — the Layout tab and the page-layout library\n- [apps](/framework/ai/2026-08-12/apps/) — Figma-like, Blender-like, columns, rail vs detail\n- [unify](/framework/ai/2026-08-12/unify/) — one preview/detail system everywhere, sub-demos");

		md("**Round two — Mike's review, same workers resumed with their context intact.**");

		ui.timeline(
			["16:47 → 17:07", "stage, round two", "The strip is the stage's own now: [ devices centered | 🔍 zoom ⤢ ] — a segmented width toggle, the zoom select top right with a scrubbing magnifier (drag to zoom, ×2 per 240px), one fullscreen. All four chrome shapes got it by DELETING their own controls. Zoom rides on top of a width; press-again releases; a container query collapses the strip on narrow stages."],
			["16:47 → 17:06", "layouts, round two", "Auto-height two-up — the 440px strip is gone, panes floor to the tallest page and footers still pin. The rail's funky chicken measured (three visual states, ~300ms apart) and killed: aspect-ratio panes, hidden until first fit. Rail widened to 26em by a one-line token on the index page; twin panes split by device proportion so both land full height, nothing cropped. Orchestrator capped the two-up at 1:1 to match the presets' verdict."],
		);
	},
});

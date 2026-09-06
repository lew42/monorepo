import { Page, View, md } from "/app.js";

// One sheet for the whole realm, loaded here so every note in it is styled — the
// same shape as /imagine/design/page.js loading design.css for its children.
View.stylesheet(import.meta, "notes.css");

/* Layout (the `layout` skill's five): a plain page grid in the app's main region —
   /notes/ is a ROOT realm, not the /imagine/ columns host. One line of prose, then
   one wall: `previews()` is already `bleed`, and each card sizes itself. The
   photographed notes lead because their cards are pictures — show, don't tell — and
   the three written notes follow as icon cards. No group headings: a wall of sixteen
   cards where thirteen carry a photograph separates itself.

   Order is the notebook's own — the sequence the pages were photographed in — because
   several of them are two halves of one argument and read best in order. */
export default new Page({
	meta: import.meta,
	title: "Notes",
	description: "Short working notes for the team, and the notebook pages behind them.",
	children: "scale-1920-to-3413 visual-context drop-target-ux anchor-point-optional "
		+ "record-long-cut-to-60s shotgun-or-lav meeting-notes-are-ip one-video-everywhere "
		+ "sign-up-flow topic-dbs-and-claims what-is-openmike right-people-not-many "
		+ "strengths-and-weaknesses layouts-need-fit switch-or-transition notebook-cooked "
		+ "each-meme-is-a-community levels-and-points personal-specs basketball-tower "
		+ "edge-selection parallel-generation doodles "
		+ "ai-research-list-ui-ux split-responsive-viewer simplify-my-website "
		+ "laws-rules-suggestions short-minded analyze-spacing-as-percent column-vs-swap "
		+ "the-editor edit-mode-toolbar my-docs-are-bad page-active-display "
		+ "tabs-and-lazy-pages we-think load-but-dont-render nested-rendering "
		+ "readme-one-to-n "
		+ "walk-down-or-jump-to-topic starter-repo-vs-scaffolding an-element-browser "
		+ "mobile-tabs-are-tricky tabs-vs-breadcrumbs oop-course-equals-freedom "
		+ "page-previews-and-columns jsdelivr-or-your-own-cdn a-localhost-cdn "
		+ "too-many-patterns-to-exemplify build-now-architect-later forgot-to-branch "
		+ "links-that-dont-break straight-talk perfectly-simple-syntax page-is-not-prose "
		+ "tests-on-pages does-save-hold-up page-nav-from-sub standardized-web-services "
		+ "web-of-lies realtime-web-design property-screens multi-column-contents "
		+ "just-a-note drop-then-rerender type-slash-for-the-menu right-click-hug-fill "
		+ "git-branch-names auth team-note",
	// ⚠ Add a slug here ONLY once its `page.js` exists: a declared child without one 404s
	// twice on EVERY page in the realm (the wall still renders — a null child falls back
	// to the default card — so nothing looks wrong). Measured 2026-09-06 with `doodles`.

	content(){
		md("Anything that isn't documentation but everyone needs to know once — plus the "
			+ "owner's photographed notebook pages. Each one is transcribed, linked to "
			+ "whatever it turned into on this site, and built where it described "
			+ "something buildable.");
		this.previews();
	}
});

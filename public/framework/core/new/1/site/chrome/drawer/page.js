import { Page, div, p, span, label, input, style } from "/app.js";
import { code, section } from "../../ui.js";
import { ChromeShell, sample, nav, prev_next, widths, code as src, demo } from "../chrome.js";

/* One string, used twice: applied with style() and printed with code.css(). A
 * CSS pattern shown as a hand-typed quote is the one kind of example that can
 * silently stop being true, and this is the page where the CSS IS the pattern. */
const drawer_css = `
@layer base, theme, site, util;

@layer site {

	.chrome-drawer-row { position: relative; display: flex; flex: 1 1 auto; min-height: 0; }
	.chrome-drawer { flex: 0 0 10rem; overflow-y: auto; }
	.chrome-drawer-main { flex: 1 1 auto; min-width: 0; display: flex; }

	/* the toggle: focusable, never visible, and the only state this pattern has */
	.chrome-drawer-toggle { position: absolute; width: 1px; height: 1px; opacity: 0; }

	.chrome-drawer-bar { display: none; align-items: center; gap: .5rem;
	                     padding: .35rem .6rem; border-bottom: 1px solid #e2e4e8; }
	.chrome-burger { cursor: pointer; padding: .1rem .45rem; border-radius: .3rem; user-select: none; }
	.chrome-burger:hover { background: #eceef2; }
	.chrome-drawer-toggle:focus-visible ~ .chrome-drawer-bar .chrome-burger { outline: 2px solid #0a58ca; }

	.chrome-scrim { display: none; position: absolute; inset: 0; z-index: 15; background: rgba(0,0,0,.28); }

	/* @container, not @media: this box is not the window, and a demo that
	   queried the window would be lying about which width made it change. One
	   word swaps it back for real chrome. */
	@container (max-width: 34em) {

		.chrome-drawer-bar { display: flex; }

		.chrome-drawer {
			position: absolute; inset: 0 auto 0 0; width: 11rem; z-index: 20;
			transform: translateX(-100%); transition: transform .2s ease;
			box-shadow: 2px 0 12px rgba(0,0,0,.25);
		}

		/* the whole of "is it open" — one checkbox, read from the shell */
		.chrome-shell:has(.chrome-drawer-toggle:checked) .chrome-drawer { transform: none; }
		.chrome-shell:has(.chrome-drawer-toggle:checked) .chrome-scrim { display: block; }
	}

	@media (prefers-reduced-motion: reduce) { .chrome-drawer { transition: none; } }
}`;

style(drawer_css);

// An id is a GLOBAL name and a <label for> is the only way to reach a checkbox
// that isn't its ancestor. One counter, because two drawers on one page would
// otherwise share a toggle — which is the honest cost of the CSS-only version.
let drawers = 0;

export default new Page({
	meta: import.meta,
	title: "Drawer",
	classes: "chrome",

	content(){
		this.shell();

		p("Drag the width down to 500px. Below `34em` the sidebar leaves the flow, the burger appears, and the scrim closes it — no JavaScript in any of that.").ac("note");

		section("The CSS, entire");

		src.css(drawer_css);

		p("Printed from the same string that `style()` applied at the top of this file, so the page cannot show a rule it is not running.").ac("note");

		section("The one line CSS can't write");

		code(`
navigated(shell){ shell.el.querySelector(".chrome-drawer-toggle").checked = false; }`);

		p("A drawer that stays open after you pick something is a drawer you have to close twice. CSS has no selector for `a navigation happened` — and this is the third pattern in this section to want the same hook (crumbs and prev/next are the others). See the report.").ac("note");

		section("Ladder");

		code(`
1  nothing        a 10rem sidebar at 500px is 40% of the window     no
2  a utility      display:none below a breakpoint                   loses the nav
3  :target        href="#nav" opens it                              a fake history entry
4  checkbox + :has  open, close, scrim, focusable, zero JS          an ID, globally
5  JS state       open, close, AND close on navigate                one line, on top of 4`);

		p("Stop at 4 and add the one line. Rungs 1–3 are cheaper and each loses something a reader needs; rung 5 alone would hand the whole open/close to JavaScript to buy the one thing CSS cannot see.").ac("note");

		section("Covered, not removed");

		code(`
.page.full.active-page { position: fixed; inset: 0; z-index: 10; }`, "styles.css — readme Open #3");

		p("A `full` page paints over the chrome. The links underneath are still in the DOM, still tabbable, and still read aloud — so a keyboard lands in a nav nobody can see. `inert` on the chrome is the fix, it is the site's job, and it is measured on `/chrome/focus/`.").ac("note");

		prev_next(this);
	},

	/* A shell wearing the whole pattern: toggle, bar, drawer, scrim, and pages
	 * inside the row the chrome built. */
	shell(){
		const id = "chrome-drawer-toggle-" + (++drawers);

		const $stage = div.c("chrome-stage", () => demo(() => {
			new ChromeShell({
				root: sample(),
				start: "/guide/",

				chrome(shell){
					input().attr("type", "checkbox").attr("id", id).ac("chrome-drawer-toggle");

					div.c("chrome-drawer-bar", () => {
						label.c("chrome-burger", "☰").attr("for", id);
						span.c("chrome-topbar-title", "Docs");
					});

					div.c("chrome-drawer-row", () => {
						nav(shell.root, shell.root).ac("chrome-drawer");
						label.c("chrome-scrim").attr("for", id);
						shell.$region = div.c("chrome-drawer-main");
					});
				},

				// the only JS in the pattern: CSS cannot see a navigation
				navigated(shell){ shell.el.querySelector(".chrome-drawer-toggle").checked = false; },
			});
		}));

		widths($stage, "1400px 900px 500px auto");

		return $stage;
	},
});

import { Page, div, p, span, a, h3, button } from "/app.js";
import { code, section } from "../../ui.js";
import { ChromeShell, sample, nav, prev_next, demo } from "../chrome.js";

/* The eighth pattern, which nobody asked for.
 *
 * Every other pattern in this section answers "where am I". This one answers
 * "where is the keyboard", and it is chrome's job for exactly the reason the
 * others are: it is the only thing on screen that survives the navigation. */
export default new Page({
	meta: import.meta,
	title: "Focus & inert",
	classes: "chrome",

	content(){
		this.handoff();

		p("Click a link in the shell and watch the focus readout. The Router changes the document and does not move the keyboard — so focus stays on the link you clicked, in chrome, while the page underneath becomes something else entirely. A screen reader is told nothing at all.").ac("note");

		section("Three lines of chrome");

		code(`
navigated(shell){
    shell.$title.attr("tabindex", "-1").el.focus();   // put the keyboard in the new page
    shell.$live.text(shell.page.title);               // and say its name out loud
}`);

		p("`tabindex=\"-1\"` makes a heading focusable by script but not by Tab, so the tab order is unchanged. The live region is an `aria-live=\"polite\"` div that is otherwise empty — writing to it is the entire announcement. Neither belongs to a page: a page cannot move focus to itself before it exists.").ac("note");

		section("The skip link");

		this.skip();

		p("Press Tab from the top of a document with a 20-link sidebar and you press it 20 more times to reach the words. A skip link is the first tabbable thing in the chrome, invisible until it has focus. It is three lines and it is the highest-value chrome on this page.").ac("note");

		section("Covered, not removed");

		code(`
.page.full.active-page { position: fixed; inset: 0; z-index: 10; background: #fff; }`, "styles.css — readme Open #3");

		this.inert();

		p("`display: none` would have removed the chrome from the tab order for free. Covering keeps it there — every link underneath is still reachable, still announced, and now invisible. `inert` on the chrome is the fix, it is one property, and the readme is right that it belongs to the site: the framework never knew the page was `full`.").ac("note");

		code(`
// site/app.js — a full page is the site's own class, so this is the site's own line
navigated(page){ this.$sidebar.el.inert = page.classes?.includes("full") ?? false; }`);

		section("Why this is chrome and not a page");

		code(`
a page   is built once and hidden by a class — it cannot know it became visible
chrome   is built once and NEVER hidden     — it is the only thing still running`);

		p("Focus management, announcements and `inert` all have to happen at the moment the leaf changes, to something that outlives both leaves. That is the definition of chrome, and it is the fourth pattern here to want the same one-line hook.").ac("note");

		prev_next(this);
	},

	// focus and an announcement, moved by the chrome on every navigation
	handoff(){
		return demo(() => {
			new ChromeShell({
				root: sample(),

				chrome(shell){
					nav(shell.root, shell.root).ac("across");

					shell.$live = div.c("chrome-stamp").attr("aria-live", "polite");
					shell.$focus = div.c("chrome-stamp");
				},

				navigated(shell){
					const $title = shell.$pages.el.querySelector(".chrome-shell-title");

					$title.setAttribute("tabindex", "-1");

					// not on the first — arriving somewhere is not navigating to it,
					// and stealing focus on load is its own bug
					if (shell.navigations > 1) $title.focus();

					shell.$live.text(`announced: ${shell.page.title}`);
					shell.$focus.text(`document.activeElement: ${document.activeElement.className || document.activeElement.tagName}`);
				},
			});
		}, "The heading takes focus and the live region says its name — both written by the chrome, on the one event that knows a navigation finished.");
	},

	// the first tabbable thing, invisible until it isn't
	skip(){
		let $target;

		div.c("chrome-box", () => {
			div.c("chrome-shell-pages", () => {
				a.c("chrome-skip", "Skip to content").href("#chrome-skip-target");
				span.c("note", " ← there is a link here. Click, then press Tab.");
			});

			// tabindex spans, not anchors: these exist only to be tabbed past, and
			// a real href here would collect `.active` from the marking pass
			div.c("chrome-nav", () => ["One", "Two", "Three"].forEach(t =>
				span.c("chrome-nav-link", "a nav link — " + t).attr("tabindex", "0")));

			$target = div.c("chrome-shell-pages", () => h3("Content starts here"));
		});

		$target.attr("id", "chrome-skip-target").attr("tabindex", "-1");

		return $target;
	},

	/* inert, measured. The probe calls .focus() on a link under the cover and
	 * reports what the document actually did — an inert subtree refuses. */
	inert(){
		let $chrome, $report;

		div.c("chrome-shell", () => {
			$chrome = div.c("chrome-nav", () => ["Home", "Guide", "API"].forEach(t =>
				span.c("chrome-nav-link", t).attr("tabindex", "0")));

			div.c("chrome-shell-pages", () => div.c("chrome-shell-title", "the page"));
			div.c("chrome-cover", () => div.c("chrome-shell-title", "a full page, covering the chrome"));
		});

		$report = div.c("chrome-stamp", "not probed yet");

		return div.c("chrome-widths", () => {
			button.c("chrome-btn", "probe: focus a covered link").click(() => {
				const link = $chrome.el.querySelector(".chrome-nav-link");

				link.focus();
				$report.text(document.activeElement === link
					? "reachable — the keyboard is in chrome nobody can see"
					: "refused — inert kept the keyboard out");
			});

			button.c("chrome-btn", "toggle inert on the chrome").click(function(){
				$chrome.el.inert = !$chrome.el.inert;
				this.tc("on");
				$report.text(`chrome.inert = ${$chrome.el.inert}`);
			});
		});
	},
});

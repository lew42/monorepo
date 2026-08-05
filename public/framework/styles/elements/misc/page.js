import { Page, md, demo, div, p, span, a, button, br, details, summary, section, article, aside, header, footer, main, nav, icon, toc } from "/app.js";

/* No stylesheet — see base/page.js. */

export default new Page({
	meta: import.meta,
	title: "Misc",
	description: "Disclosure, focus rings, the ligature trap, and the long list of elements with no rule at all.",
	content(){

		toc();

		demo(() => {
			details(() => {
				summary("A disclosure");
				p("Its body, which the browser hides until you click.");
			});
		}, "`summary { cursor: pointer }` — one declaration, and the comment beside it in `framework.css` calls it what it is: **a real UA gap.** A control that doesn't say it's clickable is a bug in the browser, not a look, so fixing it is the base theme's business. The marker triangle, the animation and the open/closed states are all still the browser's.");

		md("`details` is in markdown's `block_tags`, so `.md()` inside one parses **full** markdown rather than inline — which is how `md.details(import.meta, \"readme.md\")` puts a whole design record behind one click at the bottom of a page. The `md-details` / `md-details-body` classes on it belong to [`ext/markdown`](/framework/ext/markdown/), not here.");

		md("## Focus rings");

		demo(() => {
			div.c("flex gap wrap v-center", () => {
				button("tab to me");
				a("or to me").href("/framework/styles/elements/misc/");
				div.c("pad").style({ outlineStyle: "auto", outlineColor: "var(--prim)", outlineOffset: "3px" })
					.text("the same ring, forced on");
			});
		}, "`:focus-visible { outline-color: var(--prim); outline-offset: 3px; outline-width: 2px }`. **`:focus-visible` and not `:focus`** — a mouse click on a button shouldn't draw a ring, a Tab key should, and the browser already knows the difference.");

		md("Two things in that rule are worth writing down, because the file itself has a puzzled comment about them.\n\n**`outline-width: 2px` has no effect, and that's not a bug in the browser.** No `outline-style` is set, so the UA's own focus style — `outline-style: auto` — is what's drawing, and `auto` means \"the platform ring\": it ignores `outline-width` by design and honours only colour and offset.\n\n**And that's why `outline: 2px solid var(--prim)` is commented out above it.** The shorthand replaces `auto` with `solid`, and a `solid` outline does *not* follow the element's `border-radius` — it draws a rectangle around a rounded button. Losing `outline-width` is the price of keeping rounded rings, which is the right trade and now has a reason attached to it.");

		md("## The ligature trap");

		demo(() => {
			div.c("flex gap v-center", () => {
				icon("check_circle");
				icon("not_a_real_icon");
			});
		}, "The second one is the failure mode: Material Icons is a **ligature font**, so an unrecognised name renders as the literal text you typed. A typo shows you the typo instead of a blank box — and it's also what you see for one frame if the font hasn't loaded, which is why `App` waits on `app.font(\"Material Icons\")` before first paint. Sizing and the reset are on [Media](/framework/styles/elements/media/).");

		md("## br");

		demo(() => {
			p("One line,", br(), "then another — inside one paragraph.");
		}, "No rule, no reset. Worth listing only to say the obvious out loud: a `br` is a line break *inside* a run of text, not a spacer. Space between blocks is the `--flow` rhythm in `Page.css`, and space in a row is `gap`.");

		md("## Elements with no rule at all");

		demo(() => {
			section.c("pad").style({ background: "var(--wash)" }).append(() => {
				header(() => { div.c("h4", "header"); });
				article(() => { p("article"); });
				aside(() => { p("aside"); });
				footer(() => { div.c("h4", "footer"); });
			});
		}, "`section`, `article`, `aside`, `header`, `footer`, `main` and `nav` render as plain blocks — every box you can see here is `pad` and an inline background. **They are landmarks, not layout.** Using one changes what a screen reader announces and nothing else, which is exactly right: the framework can't know how far apart your sections sit.");

		md("The complete list of elements with a `View` factory and **no rule anywhere in `framework.css`**:\n\n`a` · `abbr` · `article` · `aside` · `audio` · `b` · `br` · `cite` · `data` · `del` · `dfn` · `em` · `figcaption` · `figure` · `footer` · `header` · `i` · `iframe` · `ins` · `kbd` · `label` · `li` · `main` · `mark` · `meter` · `nav` · `option` · `progress` · `q` · `s` · `samp` · `section` · `small` · `span` · `strong` · `sub` · `sup` · `time` · `u`\n\nThirty-nine of about seventy. That ratio is the deliberate part — `framework.css` is meant to contain nothing you'd ever want to override, and the cheapest way to hold that line is to style very little.");

		md("## The document itself");

		md("| rule | why |\n| --- | --- |\n| `*, *::before, *::after { box-sizing: border-box }` | padding stops making things wider than you asked for |\n| `html { height: 100% }` | anchors the definite height chain `html → body → .app → .pages` |\n| `html { scrollbar-color: rgba(0,0,0,0.2) transparent }` | a quiet scrollbar — a look with no token behind it, and on the eviction list |\n| `body { margin: 0 }` | the 8px nobody has ever wanted |\n| `body { line-height: 1.5 }` | readable copy, and it inherits everywhere |\n| `body { -webkit-font-smoothing: antialiased }` | a one-line Safari nicety |\n| `body { height: 100% }` | `min-height` here was the bug: a percentage height resolves against the parent's *height*, and `min-height` doesn't give one |\n| `body { overflow-wrap: break-word }` | one long token can't blow out the layout |\n| `.app { height: 100%; display: flex; flex-direction: column }` | the shell — `App.render()` emits it, so its stacking is the framework's business |");

		md("`.app` and `.pages` are the only two component classes in `framework.css`, and both are there because `App` emits them and neither is a look. Everything else about arrangement is a class a page opts into — see [Page](/framework/core/Page/).");

		md("## A trap worth repeating");

		demo(() => {
			p("`p()` handles backticks — and **that's all it handles**.");
			span("A span does not: `nothing happens here`.");
		}, "`p()` runs `backtick_append`, which turns `` `x` `` into a `<code>` element and leaves everything else as literal text. So **bold, italics, links and tables silently render as the characters you typed** — `**that's all it handles**` above is the proof, and the asterisks are right there on the page. Prose with any formatting in it wants `md(\"…\")`.");

		md("That's the element reference. Back to [Styles](/framework/styles/) for the strategy — the ladder, the layer order, and the escalation ratchet that all of this exists to keep you off.");
	}
});

import { Page, md, demo, div, p, span, a, h1, h2, h3, h4, h5, h6,
	strong, b, em, i, small, mark, del, ins, s, u, sub, sup,
	abbr, cite, dfn, q, time, data, blockquote, hr, toc } from "/app.js";

/* No stylesheet — see base/page.js. */

export default new Page({
	meta: import.meta,
	title: "Text",
	description: "Six type levels, and the twenty inline elements the framework deliberately leaves alone.",
	content(){

		toc();

		demo(() => {
			h1("Page Title");
			h2("Section Title");
			h3("Sub-section Title");
			h4("Annotation Heading");
			p("Body copy, with `code` in it.");
		}, "The whole vocabulary. From `framework.css`: `h1` 1.9em/900 with `-0.015em` tracking, `h2` 1.4em/700, `h3` 1em/700, `h4` 0.8em/700 uppercase with `0.05em` tracking. **Size, weight and tracking only** — margins are rhythm and belong to whatever arranges the content.");

		md("What you just saw is bigger than those numbers, and that's the point: this site wears `theme-lew42`, which re-declares the same four selectors at 3em / 2.25em / 1.5em / 0.875em and wins by loading later at equal specificity. Not a typo — the override model working. The table of both is in [theme](/framework/styles/theme/).");

		demo(() => {
			p.c("h2", "A paragraph borrowing h2");
			div.c("h4", "A div borrowing h4");
			span.c("code", "a span borrowing code");
		}, "`.h1`–`.h4` and `.code` are declared alongside their tags, so anything can take a level without lying about the outline. **Never invent a font-size in a component — pick a level.**");

		demo(() => {
			h5("h5");
			h6("h6");
			p("Body copy, for scale.");
		}, "`h5, h6 { font-size: 1em; font-weight: 700 }` — identical to `h3`, because the UA shrinks them *below* body size and that is never what you want. They are also the two levels with **no matching class**: the scale is four deep, and these exist only so a deep outline stays legal HTML.");

		md("Body copy itself is `body { font-size: clamp(1rem, 0.68rem + 0.36vw, 1.25rem); font-family: var(--font); color: var(--ink) }` with `line-height: 1.5` from the reset — 16px through a 1440px viewport, reaching 20px around 2560. `rem + vw` rather than plain `vw`, so a reader's own font-size setting still counts.");

		md("## Emphasis");

		demo(() => {
			p("This is ", strong("strong"), " and ", em("em"), " — ", b("b"), " and ", i("i"), " render identically and differ only in meaning.");
			p(mark("mark"), " highlights, ", del("del"), " and ", ins("ins"), " track an edit, ", s("s"), " is no longer accurate, ", u("u"), " is a non-textual annotation, ", small("small"), " is fine print, and water is H", sub("2"), "O at 10", sup("3"), " kPa.");
		}, "**`framework.css` styles none of these.** Every look here is the browser's, and there is nothing to override — which is exactly why they're worth listing. If you want `mark` in the accent colour, that's a theme rule on a generic element, and a theme is allowed to do that.");

		md("## Semantics with no look");

		demo(() => {
			p(abbr("CSS").attr("title", "Cascading Style Sheets"), " expands on hover, ",
				cite("Every Layout"), " names a work, ",
				dfn("a dfn"), " marks a defining instance, ",
				q("a q"), " gets the browser's own quotation marks, ",
				time("2026-08-05").attr("datetime", "2026-08-05"), " is machine-readable, and ",
				data("42").attr("value", "42"), " carries a value.");
		}, "Six more the framework never names. `q` inserts real quotes through `::before`/`::after`; `time` and `data` render as plain text and exist entirely for their attribute. Reach for them for meaning, and expect no styling.");

		md("## Links");

		demo(() => {
			p("A bare ", a("link").href("/framework/"), " takes the browser's blue underline — `framework.css` has no `a` rule at all.");
			div.c("flex gap wrap", () => {
				a.c("page-link", "page-link").href("/framework/");
				a.c("nav-link", "nav-link").href("/framework/");
				a.c("tab", "tab").href("/framework/");
			});
		}, "The base theme's only opinion about links is `a * { cursor: pointer }` — a child of a link doesn't inherit the hand. What a link *looks* like comes from a class its component emits: `.page-link` and `.tab` (`Page.css`), `.nav-link` (`/styles.css`), `.sidebar-link` (`Sidebar.css`). `Router.mark_links()` adds `.active` and `.in-path` after every render, so **no view compares `window.location` itself** — that's why the three above are lit up.");

		md("## Blocks");

		demo(() => {
			blockquote(() => {
				p("A rule down the left edge, and the text in `--subtle`.");
				p("A second paragraph, spaced by the flow — a `blockquote` is a flow container too.");
			});
		}, "`blockquote { margin-left: 0; padding-left: 1em; border-left: 3px solid var(--subtle); color: var(--subtle) }`. It lives in `framework.css` and not in `md.css`, and that move is the rule in miniature: a blockquote is generic HTML, so the ext that happened to render one first owning it gave the site **two** blockquote designs — one for markdown, one for a hand-written `blockquote()`.");

		demo(() => {
			p("Above.");
			hr();
			p("Below.");
		}, "`hr { border: none; border-top: 1px solid var(--line) }` — one hairline in the theme's own line colour, and **no margin**. The `--flow` rules in `Page.css` space it like any other block, so an `hr` inside a tighter container stays tight instead of carrying a fixed gap around with it.");

		md("`p` and `h1`–`h6` each repeat `overflow-wrap: break-word` from `body`, so one long token can't blow out a column — the headings need their own rule because the value doesn't inherit through an element that sets it itself. Demoed side by side in [base](/framework/styles/base/).");

		md("Next: [Lists](/framework/styles/elements/lists/) — `ul`, `ol`, nesting, and the one list the reset misses.");
	}
});

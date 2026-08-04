import { Page, md, demo, div, p, span, code, pre, blockquote, table, thead, tbody, tr, th, td, input, select, option, textarea, button, details, summary } from "/app.js";
import guide from "./guide/page.js";
import lew42 from "./lew42/page.js";

/* No stylesheet of its own — see base/page.js. */

const swatch = (name, fg) =>
	div.c("pad flex-1").style({ background: `var(${name})`, color: fg || "#fff", minWidth: "7em" })
		.append(() => span.c("code", name));

export default new Page({
	meta: import.meta,
	title: "theme",
	description: "The base theme — tokens plus the default look. The layer a theme replaces.",
	children: [guide, lew42],
	content(){

		md("```css\n@layer theme { … }\n```\n\n**This layer is a theme** — the one you get when you load no other. That framing matters: it means using no theme is a finished-looking, supported outcome, and a theme is something you *add*, never something you must have.\n\nIt also means the override model is boring, which is the goal:");

		md("```css\nframework.css    h2 { font-size: 1.4em }    /* loads first */\nyour-theme.css   h2 { font-size: 2em }      /* loads later, wins */\n```\n\nEqual specificity, later declaration takes it. Which is why every selector here is **flat** — one element, no descendant combinators. A `.page > h2` in the base would out-rank a theme's `h2` no matter when the theme loaded.");

		md("## Tokens");

		demo(() => {
			div.c("flex gap wrap", () => {
				swatch("--prim");
				swatch("--bg");
				swatch("--surface", "var(--ink)");
				swatch("--wash", "var(--ink)");
			});
		}, "The vocabulary a theme retunes. Every one of these replaces a value that was hardcoded somewhere — usually in several places at once. **That's the bar for adding another:** a token names a decision that already exists, it doesn't invent one.");

		md("| token | is | names the hardcode |\n| --- | --- | --- |\n| `--prim` | the one accent color | — |\n| `--bg` | dark surface (the sidebar's) | — |\n| `--subtle` | de-emphasized text | — |\n| `--ink` | body text | the UA's black |\n| `--surface` | content background | `#fff`, in four files |\n| `--line` | borders and rules | `rgba(0,0,0,0.1–0.2)`, ~8 places |\n| `--wash` | code / `th` / hover fill | `rgba(0,0,0,0.04–0.1)` |\n| `--radius` | corner radius | `0.5em`, twice |\n| `--code-bg` `--code-ink` | the code box — falls back to `--wash` / inherit | — |\n| `--column` | flex/grid wrap width | — |\n| `--sidebar` | any sidebar's width | — |\n| `--font` | body typeface | `system-ui, …` |\n| `--mono` | code typeface | `Consolas, …`, twice |\n\nTokens live on `:root` and **cascade** — a theme overrides them on `.app` or `body.theme-x`, never back at `:root`. That single rule is what lets two variants of a page sit side by side.\n\n**Third column is the work, not a claim it's finished.** `framework.css`'s own rules read these tokens; several *components* still hardcode `#fff` and `rgba(0,0,0,…)`. Until those are rewired, dark mode is defined but not honest — which is why `:root` pins `color-scheme: light`. It's the top item in the design record.");

		md("## The type scale");

		demo(() => {
			div.c("h1", "Page Title");
			div.c("h2", "Section Title");
			div.c("h3", "Sub-section Title");
			div.c("h4", "Annotation Heading");
			p("Body copy, with ", code("code"), " in it.");
		}, "Six levels, and the only question is ever *which one*. Each is a class as well as a tag, so anything can borrow a level without lying about the outline: `p.c(\"h2\", …)` reads as a section title and is still a paragraph.");

		md("| level | is | size / weight |\n| --- | --- | --- |\n| `h1` `.h1` | page title | 1.9em / 900 |\n| `h2` `.h2` | section title | 1.4em / 700 |\n| `h3` `.h3` | sub-section | 1em / 700 |\n| `h4` `.h4` | annotation | 0.8em / 700, uppercase |\n| — | body | `clamp(16px, 2vw, 20px)` |\n| `code` `.code` | code, names, values | `var(--mono)` |\n\n`h5`/`h6` exist and match `h3` — the UA shrinks them below body size, which is never what you want.\n\n**Margins are not in the scale.** Size, weight and tracking are what a level *is*; margin is rhythm, and rhythm belongs to whatever arranges the content. That split is why the scale can apply everywhere without wrecking a demo box.");

		md("## Code");

		demo(() => {
			p("Inline ", code("code"), " sits in a sentence.");
			pre("a block sits on its own");
		}, "`pre` is a **block** and `code` is **inline**, so they get different padding — 0.75em/1em against 0.15em/0.4em. One shared value fit neither, which is how `md.css`, `demo.css` and `highlight.css` each ended up overriding it independently. `pre > code` resets to zero, since the block is already a padded box.");

		md("The box reads two **component tokens** — `var(--code-bg, var(--wash))` and `var(--code-ink, inherit)` — so dark code blocks are two values, not three selectors:\n\n```css\n.app { --code-bg: #1f1d26; --code-ink: #e6e4ef; }\n```\n\nThat's what `/styles.css` does, and it reaches inline code, block code, markdown fences and demo code areas at once. The token exists because the selector fight happened first: a bare `code { background }` lost the block case to `pre > code` and stranded `color: white` on a light box. **The framework was missing a token — that's the fix, not a stronger selector downstream.**");

		md("## Elements the browser styles badly");

		demo(() => {
			blockquote("A quote, with a rule down its left edge.");
			table(() => {
				thead(() => tr(() => { th("token"); th("is"); }));
				tbody(() => {
					tr(() => { td("--prim"); td("the accent"); });
					tr(() => { td("--line"); td("borders"); });
				});
			});
			details(() => { summary("A disclosure"); p("Its body."); });
		}, "`blockquote`, `table`/`th`/`td`, and `summary { cursor: pointer }` — a real UA gap. All generic HTML, so they belong to whoever styles HTML. They used to live in `md.css`, which gave the site two blockquote designs: one for markdown, one for a hand-written `blockquote()`.");

		md("## Controls");

		demo(() => {
			div.c("flex gap v-center wrap", () => {
				button.c("prim", "prim");
				button.c("bg", "bg");
				button("plain");
			});
			div.c("flex gap wrap", () => {
				input().attr("placeholder", "input");
				select(() => { option("select"); option("another"); });
			});
			textarea("textarea");
		}, "Padding, a `--subtle` border, and a pointer cursor. `.bg` and `.prim` are opt-in color variants — and `.btn` gets everything `button` does, so a link can be a button.");

		md("`select` is the one heavyweight in the layer: `appearance: none` plus an inline SVG arrow, because the native control can't be styled consistently. It's on the eviction list in the design record — the least defensible rule in the file, and the hardest to remove.");

		md("## The rest");

		md("| rule | why |\n| --- | --- |\n| `:focus-visible` | accent-colored ring, offset 3px — keyboard users only |\n| `html { height: 100% }` | anchors the full-bleed height chain layouts need |\n| `html { scrollbar-color }` | a quiet scrollbar; pure look, on the eviction list |\n| `body { font-size: clamp(16px, 2vw, 20px) }` | the whole document scales with the viewport, in one place |\n| `body { accent-color }` | themes checkboxes and radios for free |\n| `.app { height: 100% }` | continues the height chain |\n| `hr { margin: 3em 0 }` | a section break should feel like one |\n| `a * { cursor: pointer }` | children of a link don't inherit the hand |\n| `fieldset > p:first-of-type` | kills the leading gap inside a fieldset |");

		md("## Next");

		md("Read [Writing a theme](/framework/styles/theme/guide/) for how to replace all of this — two sample themes, both modes, and why a theme should almost never contain a selector.");

		this.previews();
	}
});

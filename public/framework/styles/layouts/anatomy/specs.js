import { div, h3, p } from "/app.js";

/* Seven "generic layouts" from the Figma frame Frame 12 (node 181:1457) — Burger, 3x
 * Burgers, Burger with Columns, Burger with Columns with Burger, Columns, Columns with
 * Burger, 3x Columns. The owner: "the parent container should not be mocked up, each
 * of the children should" — so the wrapper frame is not built, and these seven are.
 *
 * Every one of them turns out to be one of exactly TWO primitives, nested:
 *
 *   burger(...)   a stack of full-width bands — `flex v`, no gap. It is the skeleton
 *                 every page.js in this catalog already opens with.
 *   columns(...)  a fluid row — `flex auto`, the centre wearing `--grow: 2` (shipped
 *                 2026-08-18) so it is twice its neighbours' width and still fluid.
 *
 * A Burger's OWN bands never need the wrapper function when they sit at the top of a
 * `page full fill flex v` — that root already IS a Burger. `burger(...)` is called by
 * name only where it is genuinely nested one level deeper (inside a Columns row).
 *
 * ⚠ Two spacing values in the file, both below: `--gap: 0.4em` (label to line, in
 *   `band()`) and `--column: 12em` (the wrap threshold, in `columns()`). `--pad` is
 *   never touched — every box is a plain `.pad` at its 1em default. No `gap` on either
 *   primitive's own row/stack — the Figma's cards touch, and tone does the separating.
 */

const screen = { background: "var(--surface)" };
const scrolls = { minHeight: "0", overflowY: "auto" };

/* One band — every cell on every one of the seven shapes below is this. `tone` is
 * "wash", "tint", or bare: three greys, now that `.tint` (2026-08-18) makes the third
 * one a class instead of a token with no rule.
 */
const band = (label, line, tone = "") =>
	div.c("pad flex v gap " + tone, () => {
		if (label) h3(label);
		if (line) p.c("muted measure start", line);
	}).style("--gap", "0.4em");

/* Primitive 1 — BURGER. `flex v`, nothing else: bands stack, full width, no gap. */
const burger = (...bands) => div.c("flex v", () => bands.forEach(fn => fn()));

/* Primitive 2 — COLUMNS. `flex auto` wraps at `--column`; the centre's `--grow: 2`
 * makes it a fluid track twice its neighbours — no inline `flex`, no query. Older
 * pages here (shell, sidebar) predate `--grow` and reach for a fixed `basis` rail
 * plus an inline `flex: 1 1 26em` for the same 1:2:1 idea. `center()` gets `--grow`
 * applied HERE, once, so a caller never sets it twice.
 */
const columns = (left, center, right) =>
	div.c("flex auto", () => { left(); center().style("--grow", "2"); right(); })
		.style("--column", "12em");

export const specs = [

	{
		name: "burger", title: "Burger",
		description: "Header, a band of text, footer — flex v and nothing else.",
		note: "**`flex v` is the whole shape**, and you have already seen it: every page.js "
			+ "in this catalog opens `div.c(\"page full fill flex v\", …)` — a Burger IS that "
			+ "skeleton, undressed, which is why there is no separate `burger()` call below. "
			+ "[Document](/framework/styles/layouts/document/) is this exact stack with real "
			+ "content in the middle band.",
		layout(){
			return div.c("page full fill flex v", () => {
				band("Header", "One band, `pad flex v`.", "wash");
				band("", "The middle band holds the reading — no label, just a line.");
				band("Footer", "The closing band, same word.", "wash");
			}).style(screen);
		},
	},

	{
		name: "burgers-3x", title: "3× Burgers",
		description: "Three Burgers, side by side, sharing a row's height.",
		note: "**Three PEERS, not a weighted row** — `flex three` (three, then straight to "
			+ "one), because the Figma's three burgers are equal, not the `--grow` Columns "
			+ "primitive below. Each column is a Burger with `all-1` added so its three cells "
			+ "share the column's height — the exact shape "
			+ "[Wire → Three Full Columns](/framework/styles/layouts/wire/columns/) already "
			+ "builds and measures at four widths.",
		layout(){
			const stack = (a, b, c) => div.c("flex v all-1", () => {
				band(a[0], a[1], "wash"); band(b[0], b[1]); band(c[0], c[1], "wash");
			});
			return div.c("page full fill flex three", () => {
				stack(["Header", "First of three."], ["", "The body cell."], ["Footer", "Closes the stack."]);
				stack(["Header", "Second."], ["", "Same shape."], ["Footer", "Same word."]);
				stack(["Header", "Third."], ["", "`all-1` shares the height."], ["Footer", "Below `--column`, one across."]);
			}).style({ "--column": "16em", ...screen, ...scrolls });
		},
	},

	{
		name: "burger-columns", title: "Burger with Columns",
		description: "A Burger whose middle band is a Columns row — nesting, not a new string.",
		note: "**The middle band of a Burger can be anything, including a Columns row.** "
			+ "Same two class strings as above, one inside the other. This shape already "
			+ "exists whole: [App shell](/framework/styles/layouts/shell/)'s header + "
			+ "(rail, content, aside) + footer is this exact nest, with real navigation in "
			+ "the rails instead of placeholder bands.",
		layout(){
			return div.c("page full fill flex v", () => {
				band("Header", "The outer Burger's first band.", "wash");
				columns(
					() => band("Left", "Default `--grow: 1`.", "tint"),
					() => band("Columns", "The centre wears `--grow: 2` — twice Left and Right."),
					() => band("Right", "Same default as Left.", "tint"),
				).ac("flex-1").style(scrolls);
				band("Footer", "The outer Burger's last band.", "wash");
			}).style(screen);
		},
	},

	{
		name: "burger-columns-burger", title: "Burger with Columns with Burger",
		description: "Three deep — a Burger, whose Columns row's centre is itself a Burger.",
		note: "**Nesting has no floor.** Swap the Columns row's centre band for a "
			+ "`burger(...)` of three cells and the composition is three levels deep, still "
			+ "zero new CSS — `columns()` still applies the centre's `--grow: 2` itself, "
			+ "whatever the centre turns out to be. This is "
			+ "[App shell](/framework/styles/layouts/shell/)'s content region filled with a "
			+ "stacked layout instead of prose — the same slot "
			+ "[Document](/framework/styles/layouts/document/) fills with a `measure flow` "
			+ "column.",
		layout(){
			return div.c("page full fill flex v", () => {
				band("Header", "The outermost band.", "wash");
				columns(
					() => band("Left", "Still `--grow: 1`.", "tint"),
					() => burger(
						() => band("Above", "A Burger's own header band.", "wash"),
						() => band("", "Its middle band."),
						() => band("Below", "Its footer band.", "wash"),
					),
					() => band("Right", "Still `--grow: 1`.", "tint"),
				).ac("flex-1").style(scrolls);
				band("Footer", "The outermost band's mirror.", "wash");
			}).style(screen);
		},
	},

	{
		name: "columns", title: "Columns",
		description: "The row alone — flex auto, --grow: 2 on the centre.",
		note: "**`flex auto` plus one token is the whole row.** `.flex.auto > *` is "
			+ "`flex: var(--grow, 1) 1 var(--column)`, so the centre's `--grow: 2` makes it "
			+ "a fluid track twice its neighbours — no inline `flex`, no query. "
			+ "`--column: 12em` is the wrap threshold: three across, one column under it. "
			+ "Compare [App shell](/framework/styles/layouts/shell/)'s row, which predates "
			+ "`--grow` and reaches for a fixed `basis` rail plus an inline "
			+ "`flex: 1 1 24em` for the same idea.",
		layout(){
			return div.c("page full fill flex v", () => {
				columns(
					() => band("Left", "`--grow` defaults to 1.", "tint"),
					() => band("Columns", "The centre, twice as wide and still fluid."),
					() => band("Right", "Same default as Left.", "tint"),
				).ac("flex-1").style(scrolls);
			}).style(screen);
		},
	},

	{
		name: "columns-burger", title: "Columns with Burger",
		description: "The row alone, centre swapped for a Burger — the row doesn't care what's inside its track.",
		note: "**A `--grow` track can hold anything**, including another primitive. Left "
			+ "and Right stay plain bands; the centre is `burger(...)`, and `columns()` "
			+ "hands it the same `--grow: 2` it would hand a plain band — so it is the wide "
			+ "track AND a stack of three cells sharing its height, at once.",
		layout(){
			return div.c("page full fill flex v", () => {
				columns(
					() => band("Left", "A plain band, full height.", "tint"),
					() => burger(
						() => band("Header", "The centre's own header band.", "wash"),
						() => band("", "The centre's own middle band."),
						() => band("Footer", "The centre's own footer band.", "wash"),
					),
					() => band("Right", "A plain band, full height.", "tint"),
				).ac("flex-1").style(scrolls);
			}).style(screen);
		},
	},

	{
		name: "columns-3x", title: "3× Columns",
		description: "Three Columns rows, stacked — the same nesting, minus the header and footer.",
		note: "**`flex v` of three `columns(...)` rows.** Same two primitives as every "
			+ "shape on this page; here Burger's header and footer bands are simply "
			+ "absent, so what is left is three plain Columns rows, one above the next — "
			+ "each one `flex-1` so the three share the page's height evenly.",
		layout(){
			return div.c("page full fill flex v", () => {
				columns(
					() => band("Left", "Row one.", "tint"),
					() => band("Columns", "Every row reads the same `--column`."),
					() => band("Right", "Row one.", "tint"),
				).ac("flex-1").style(scrolls);
				columns(
					() => band("Left", "Row two.", "tint"),
					() => band("Columns", "No row is special-cased."),
					() => band("Right", "Row two.", "tint"),
				).ac("flex-1").style(scrolls);
				columns(
					() => band("Left", "Row three.", "tint"),
					() => band("Columns", "Three rows, one class string."),
					() => band("Right", "Row three.", "tint"),
				).ac("flex-1").style(scrolls);
			}).style(screen);
		},
	},

];

export default specs;

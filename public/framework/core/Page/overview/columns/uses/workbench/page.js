import { Page, div, md } from "/app.js";

/* Container: the app's page region — a columns host stretches to fill it. Size: a
   14em index and then one, two, three content columns; the board claims `full`.
   Own layout: core's row. The board's own layout is `grid auto` on a `--column` of
   22em, bled to the column's edges — a `full` page is handed the screen, not a
   layout. Regions: one per column, core's. Preview: the default card.

   NOTHING NEW. Four `width:` words and a chain of children is the whole file — this
   exemplar is here to answer the open question in doc/columns.md with numbers:
   where does the space at 3440 actually go. */

// A cell of the board. `pad` and `tint` are framework words; the wall needs no sheet.
const finding = (id, where, note) => div.c("pad tint", () => md("**" + id + "** · `" + where + "`\n\n" + note));

export default new Page({
	meta: import.meta,
	title: "Workbench",
	description: "The 3440 exemplar — two, three and four columns of real content side by side, and one that claims the screen.",
	icon: "dashboard",

	width: "small",

	initialize(){ this.columns(); },

	content(){ md("A code review, open. Walk right; each step is one more column."); },

	children: {
		Spec: {
			icon: "article",
			content(){
				md("**RFC 12 — retry policy**\n\nA request that fails with a 5xx is retried up to three times with full jitter: `sleep = random(0, min(cap, base * 2 ** attempt))`. A 4xx is never retried. A retry carries the original idempotency key.");
				md("**Two columns.** The 14em index plus this one. At 1280 that is 224 + 640px of a 1051px row — the gutter is real, and it is the right answer for one document.");
				md("Open **Diff** for three.");
			},

			children: {
				Diff: {
					icon: "compare_arrows",
					content(){
						md("```js\n-  const wait = base * 2 ** attempt;\n+  const cap  = 20_000;\n+  const wait = Math.random() * Math.min(cap, base * 2 ** attempt);\n   await sleep(wait);\n```");
						md("**Three columns**, and this is the width the arrangement was designed for: spec, change, and the file you are reading them against, all at a readable measure.");
						md("Open **Notes** for four.");
					},

					children: {
						Notes: {
							icon: "rate_review",
							width: "large",
							content(){
								md("**Review**\n\n1. `cap` belongs in config, not the module — every caller wants a different ceiling.\n2. Full jitter is right; equal jitter would keep the herd.\n3. No test covers `attempt = 0`, where `2 ** 0` makes the window `base` and the jitter can return 0.\n4. The idempotency key is threaded, but nothing asserts it survives the retry.");

								md("**Four columns** — and this one is `width: \"large\"` (28–64em) rather than the default 40em cap. That is the answer to dead space at 3440: **a wider word, not a wider column.** A default column stretched to 1000px is not more useful, it is less readable.");

								md("At 1280 the four columns want more than the row has, so the row scrolls sideways and the newest column scrolls itself in. That is the arrangement working, not failing — and under 32em of row it pages one column at a time instead.");
							},
						},
					},
				},
			},
		},

		Board: {
			icon: "view_module",
			width: "full",
			content(){
				// ⚠ `measure start` on the PROSE, not on the page: a `full` column has no
				// cap at all, so at 3440 this paragraph would be one 3166px line. `start`
				// because every shape on this site shares one left edge.
				div.c("measure start flow", () => md("**What fullscreen means here.** `full` hands this page the whole host and stands the columns down; it does not lay anything out. A page that claims the screen **owes the screen a layout** — and owes its own prose a measure. The wall below is `grid auto` on a 22em `--column`: 3 cells wide at 1280, 8 at 3440."));

				div.c("bleed grid auto gap", () => {
					finding("F-1", "retry.js:14", "cap hard-coded at 20s; move to config.");
					finding("F-2", "retry.js:14", "full jitter — correct, keep.");
					finding("F-3", "retry.test.js", "no case for attempt = 0.");
					finding("F-4", "client.js:88", "idempotency key threaded but unasserted.");
					finding("F-5", "retry.js:31", "5xx only — 429 falls through unretried.");
					finding("F-6", "docs/retry.md", "still documents the old backoff.");
					finding("F-7", "client.js:12", "AbortSignal not forwarded to the retry.");
					finding("F-8", "retry.js:44", "logs at info on every attempt; noisy.");
				}).style("--column", "22em");

				div.c("measure start flow", () => md("**Verdict on the mix:** width words alone. No override, no stylesheet, no new word — the whole file is `columns()`, four `width:` values and a `--column` token on a wall. The dead space at 3440 is answered by a wider *word*, not a wider column."));
			},
		},
	},
});

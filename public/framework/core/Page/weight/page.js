import { Page, md, h2, div, a, span, icon } from "/app.js";
import { weight as page_weight } from "./weight.js";

/* Weight — the owner's own words, 2026-09-29 (4:45 PM): "let's create a weight system for
   pages... normally... a weight of one... increase that if it becomes heavier... The weight
   could be computed dynamically from the number of references... whenever you reference a
   page, you add a log item to that page that says referenced by... each page knows where
   it's being referenced from... totaled up... a first rough dynamic... we might want to
   manually adjust weights... add 10 to important things... 20 or 50 for ultra important."

   Continued, 4:55 PM — four USES of the same number, all demonstrated below, in the order the
   owner said them: (1) a page's main navigation only lists weight >= 1 — below 1 is still
   reachable, just not first; (2) a flex-wrap row of quick-link pills, heaviest first; (3) past
   weight 10 an item is visibly bigger, not just numerically first; (4) how to SHOW the weight
   isn't decided, so both a visual scale (A) and the plain number (B) are built, side by side.

   1 CONTAINER  standard column — a design + demo page, not a full-width app.
   2 SIZE       standard width — the widest thing here is a wrap of small cards.
   3 OWN LAYOUT the formula in one line, then the four demos in the order above, each with
                its own one-line heading (topic + gist, most important first).
   4 REGIONS    none.
   5 PREVIEW    core's default card off `description` below. */

// The 8 real core/Page sub-pages this demo sorts. `jsonl/` belongs on this wall too — it's
// the other live example the brief named — but that folder is fenced to another minion while
// this task runs, so it stays out rather than risk a collision (doc/design.md).
const PAGES = [
	{ name: "Layout", meaning: "the layout system", icon: "dashboard", href: "/framework/core/Page/layout/" },
	{ name: "Navigation", meaning: "persistent vs switching", icon: "route", href: "/framework/core/Page/navigation/" },
	{ name: "Generator", meaning: "builds a page tree from a spec string", icon: "auto_awesome", href: "/framework/core/Page/generator/" },
	{ name: "Make", meaning: "five ways to make a page", icon: "add_box", href: "/framework/core/Page/make/" },
	{ name: "AI", meaning: "the page-based AI system", icon: "smart_toy", href: "/framework/core/Page/ai/" },
	{ name: "Dynamic", meaning: "a url with no page.js", icon: "dynamic_feed", href: "/framework/core/Page/dynamic/" },
	{ name: "Overview", meaning: "the wall of building blocks", icon: "grid_view", href: "/framework/core/Page/overview/" },
	{ name: "Old", meaning: "the first Page docs, kept as reference", icon: "history", href: "/framework/core/Page/old/" },
];

const caption = w => `weight ${w.weight} · referenced by ${w.refs.length}${w.manual ? ` · ${w.manual > 0 ? "+" : ""}${w.manual} manual` : ""}`;

// ── 1. Main navigation — the tier sizing (w1/w2/w3, ux/Content/structure) plus one more,
//      BIGGER still, past weight 10 ("an item is upgraded" — the owner's own words).
function nav_card(p, w){
	const big = w.weight > 10;
	const tier = Math.max(1, Math.min(3, w.weight));

	const card = a.c(`ux-content-icard w${tier}`).href(p.href).append(() => {
		icon(p.icon).style(big ? { fontSize: "3.2rem" } : {});
		span(p.name).style(big ? { fontSize: "1.3em", fontWeight: "700" } : {});
		span.c("muted", caption(w)).style({ fontSize: "0.75em", fontWeight: "normal" });
	});

	// Past weight 10 the card is not just first, it's bigger — real padding grows the box
	// IN FLOW, so its neighbours still get room (a `transform: scale()` paints outside the
	// box without telling the grid, which overlapped the next card — tried it, reverted).
	return big ? card.style({ padding: "1.6em 1.4em" }) : card;
}

// ── 2. Quick links — smaller, denser: reuses `.ui-pill`'s own chip shape (ux/Tags), styled
//      only, no Tags instance (these pills are links, nothing removes them).
function pill(p, w){
	return a.c("ui-pill h4 flex v-center gap").href(p.href).style({ textDecoration: "none" }).append(() => {
		icon(p.icon).style({ fontSize: "1.1em" });
		span(p.name);
		span.c("muted", String(w.weight));
	});
}

// ── 4. A vs B — the SAME row, shown two ways. A: a bar that scales with weight, the exact
//      number only on hover. B: the plain number, always visible.
function row_a(p, w){
	const bar_w = Math.min(w.weight, 12) * 8;
	return div.c("flex v-center gap-35").append(() => {
		span(p.name).style({ minWidth: "6em" });
		span().style({ width: `${bar_w}px`, height: "8px", background: "var(--ink)", opacity: 0.6, borderRadius: "4px" })
			.attr("title", `weight ${w.weight}`);
	});
}

function row_b(p, w){
	return div.c("flex v-center gap-35").append(() => {
		span(p.name).style({ minWidth: "6em" });
		span.c("muted", String(w.weight)).style({ fontWeight: "700" });
	});
}

export default new Page({
	meta: import.meta,
	title: "Weight",
	description: "Each page's weight: 1 by default, raised by the pages that reference it, plus a manual adjustment. Heaviest sorts first.",
	icon: "scale",

	content(){
		md("**Weight is one number per page, 1 by default.** A real page that links to it adds 1 for every distinct page that does; a manual bump — the owner's words: +10 for something important, +20 or +50 for ultra-important, and a negative number to diminish it — adds on top of that. `weight = 1 + references + manual`. Full formula and why: [`doc/design.md`](/framework/core/Page/weight/doc/design.md); what already existed before this task: [`doc/prior.md`](/framework/core/Page/weight/doc/prior.md).");

		md("Every card below reads REAL data: eight real `core/Page` sub-pages, real `referenced_by` lines seeded by the writer from real links (the readme's own sub-systems list, plus `layout → navigation` and `overview → generator` — both real links inside those pages' own readmes), and two real manual bumps (`layout` +10, `old` −2) — not fabricated numbers.");

		div.c("card ux-content-section flow", $box => {
			Promise.all(PAGES.map(p => page_weight(p.href).then(w => ({ p, w })))).then(rows => {
				rows.sort((a, b) => b.w.weight - a.w.weight);
				const main = rows.filter(r => r.w.weight >= 1);
				const parked = rows.filter(r => r.w.weight < 1);

				$box.append(() => {
					h2("1. Main navigation — weight ≥ 1 is listed; below 1 is still reachable, just not here");
					div.c("ux-content-icards", () => main.forEach(({ p, w }) => nav_card(p, w)));

					if (parked.length){
						md("**Below weight 1, so left off the list above but not gone:** " +
							parked.map(({ p, w }) => `[${p.name}](${p.href}) (weight ${w.weight})`).join(", ") + ".");
					}

					h2("2. Quick links — a flex-wrap row of pills, the core things, heaviest first");
					div.c("flex wrap gap-35", () => main.forEach(({ p, w }) => pill(p, w)));

					h2("3. Past weight 10, an item is upgraded — bigger, not just first");
					md(main[0]
						? `**${main[0].p.name}** is weight **${main[0].w.weight}** — over 10, so it renders bigger above, not only sorted first. It's manually marked important because the owner's own \`navigation/readme.md\` already says to "start every layout here": the most-pointed-to starting page of the eight.`
						: "");

					h2("4. Showing the weight — A or B? Not decided; both are built");
					md("**A** is quiet: a bar whose length scales with weight, the exact number only on hover. **B** is loud: the plain number, always visible. Same eight rows, same numbers — pick whichever reads better.");

					div.c("wide flex gap", () => {
						div.c("card pad flow", () => { md("**A — visual scale, hover for the number**"); main.forEach(({ p, w }) => row_a(p, w)); }).style("--grow", "1");
						div.c("card pad flow", () => { md("**B — the plain number**"); main.forEach(({ p, w }) => row_b(p, w)); }).style("--grow", "1");
					});
				});
			});
		});

		h2("Run it yourself");
		md("`node Server/page-refs.mjs <from-url> <to-url>` appends one `referenced_by` line to the target's own `page.jsonl` — running it twice for the same pair adds one line, not two. `node Server/page-refs.mjs <to-url> --weight <N>` sets the manual number the same way. `weight(page_url)` (`weight.js`) reads it all back as `{ weight, refs, manual }`. Not built: wiring this into `Page`'s own real navigation menu — a core change that needs the owner's own yes first (`doc/design.md`).");
	},
});

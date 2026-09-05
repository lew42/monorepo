import { Page, md, h2, p, figure, figcaption, img, a } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* Container: a plain column of /imagine/'s row, same as every `design` sibling (padding,
   layout, ...). Size: `full` — a study is a report, and previous studies all took the
   whole column rather than the 40em default. Own layout: `md()` prose, one `.flow`
   sitting inside `page-column-prose`; two tables; three crop figures. Regions: none.
   Preview: the default card via the parent's `previews()`. */

const NO_REASON = [
	{ url: "/imagine/platform/", a: "27.1px", b: "10.8px", shot: "platform.jpg",
		note: "paragraph → “Behind the scenes” section (27.1px, the site's own --flow) then that section → the previews wall (10.8px, the column's --flow) — same rhythm token, two different values 1,335px apart on one page." },
	{ url: "/imagine/blogx/", a: "10.8px", b: "27.1px", shot: "blogx.jpg",
		note: "intro paragraph → previews wall is 10.8px; the very next transition, wall → “What the eight are for”, is 27.1px. The wall sits closer to what's above it than what's below." },
	{ url: "/imagine/stream/", a: "10.8px", b: "27.1px", shot: "stream.jpg",
		note: "same shape as blogx: intro → wall reads 10.8px, wall → “The two files” reads 27.1px, on one screen." },
];

const CRAMPED = [
	["/imagine/cms/", "9.45px", "9.7px", "1.03×"],
	["/imagine/paging/", "9.5px", "11.3px", "1.19×"],
	["/imagine/review/", "6.8px", "8.1px", "1.19×"],
	["/imagine/stream/", "27.1px", "32.4px", "1.20×"],
	["/imagine/design/, /imagine/gallery/, /imagine/vary/, /imagine/screens/, /imagine/feeds/, /imagine/blogx/, /imagine/decks/", "8.1px", "9.7px", "1.20×"],
	["/imagine/team/", "7.5px", "9px", "1.20×"],
	["/imagine/shells/, /imagine/generated/", "9.45px", "11.35px", "1.20×"],
	["/imagine/layouts/, /imagine/codrops/, /imagine/scenes/, /imagine/youtube/, /imagine/design/padding/ (control)", "10.8px", "13px", "1.20×"],
	["/imagine/research/", "4.7px", "5.7px", "1.21×"],
	["/imagine/game/", "4.15px", "5.4px", "1.30×"],
	["/imagine/platform/", "19px", "32.4px", "1.71× (best)"],
];

const shot = s => figure.c("flex v gap").style({ margin: 0, gap: "0.4em" }).append(() => {
	a().href(s.url).append(() => img().attr("src", here + "shots/" + s.shot).attr("alt", s.url)
		.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" }));
	figcaption(() => {
		a(s.url).href(s.url);
		md(` — **${s.a} vs ${s.b}**, a ${(Math.max(parseFloat(s.a), parseFloat(s.b)) / Math.min(parseFloat(s.a), parseFloat(s.b))).toFixed(2)}× jump between two adjacent gaps. ${s.note}`);
	}).style({ fontSize: "0.85em" });
});

export default new Page({
	meta: import.meta,
	children: "ceilings",
	title: "Spacing",
	description: "Every /imagine/ realm's vertical spacing, measured box by box at 1280 and 3440 — the neighbour-ratio pairs with no legitimate reason, the cramped ranking, and one proposal that fixes all three.",
	icon: "height",
	width: "full",

	content(){
		md("**What was measured:** every `/imagine/` realm's landing page, plus `/imagine/design/padding/` as a control — 1,166 visible boxes at 1,280px and 1,166 at 3,440px, each one's own padding, margin, container gap, inherited `--flow`, and the *real* rendered distance to its previous and next sibling ([raw tables + method](" + "/framework/ai/2026-09-05/spacing-study/" + ")). **The one rule the numbers suggest:** `.page-previews` (the wall `previews()` draws, used by 13 of these 22 realms) carries its own flat `--gap: 0.8em` instead of the site's `--flow`/`--gap-default` clamp — that single token is behind both defects below.");

		h2("The neighbour ratio");
		p.c("muted", "For every run of siblings, the ratio between one gap and the next gap right beside it (the larger over the smaller) — 504 such comparisons. Half read exactly 1× (perfectly even rhythm); 90% stay under 2.26×. 21 pairs cross 2.5×: 18 have a legitimate reason (a heading, a card/section boundary, a collapsible `<details>`, a game-board grid laid out to the pixel, or a grid row-wrap where the “next sibling” in DOM order is really the next ROW, not a real vertical neighbour — that last one is a measurement trap this crawl found and corrected, not a design defect: /imagine/review/'s uniform 6.8px column gaps first read as an 8.2× spike before the fix). **3 have no reason at all** — every one of them the same defect.");

		h2("The 3 “no reason” pairs");
		p.c("muted", "Fewer than twenty exist. All three are one bug wearing three pages: a paragraph's own rhythm (`--flow: 2em` — 27.1px in this column's 13.5px type) is 2.5× bigger than the previews wall sitting right beside it (`--gap: 0.8em` — 10.8px), because the wall doesn't carry the `.flow` class the column scoped `--flow` down to (0.8em) — confirmed by reading `getComputedStyle` on both boxes live, not inferred from the CSS.");
		NO_REASON.forEach(shot);

		h2("The cramped test");
		p.c("muted", "Median distance between siblings at 1280 vs 3440, and the ratio — ranked worst first. The viewport itself grows 2.69× (1280 → 3440); every realm's spacing grows only 1.0–1.7×, and thirteen of them cluster at *exactly* the same 1.20× because they share the one flat token above. Nothing shrinks, so nothing is “cramped” by the strict zero-growth definition — but growing 20% while the screen grows 169% is the cramped feeling the owner named, site-wide, not in outliers. `/imagine/mag/` has no siblings to compare (one full-bleed composition) and isn't ranked. Stub realms mid-build tonight (`layouts`, `codrops`) are included with a small sample and read close to the pack.");
		md("| realm(s) | median @ 1280 | median @ 3440 | growth |\n|---|---|---|---|\n" +
			CRAMPED.map(([u, m1, m2, g]) => `| ${u} | ${m1} | ${m2} | ${g} |`).join("\n")).ac("wide");

		h2("The proposal");
		p.c("muted", "One token change, counted by what it fixes:");
		md("| proposal | pairs fixed (of 3) | also |\n|---|---|---|\n" +
			"| **Give `.page-previews` the site's `--flow`/`--gap-default` clamp instead of its own flat `--gap: 0.8em`** (`core/Page/Page.css`) | 3 of 3 | touches all 45 gap-comparisons this crawl found beside a previews wall — most are already masked by a nearby heading, but carry the same two numbers; likely lifts the 13-realm 1.20× cluster in the cramped table too, since it's the same token |\n" +
			"| Narrower: just give `.page-previews` a `margin-block-start/end: var(--flow)` where it sits inside `.flow`/`.md` | 3 of 3 | smaller blast radius — doesn't touch the wall's own internal card gap, only its entrance/exit |\n" +
			"| Widen the neighbour-ratio tolerance instead of fixing the token | 0 of 3 | rejected — hides a real, named, single-cause defect |").ac("wide");
		md("Fix nothing here — both real proposals are one CSS rule in a core file the realms don't own; that's the next minion's edit, from this list.");
	},
});

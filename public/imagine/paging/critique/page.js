import { div, h2, h3, p, a, img, figure, figcaption, span, md } from "/app.js";
import { Paging } from "../paging.js";

const here = new URL(".", import.meta.url).pathname;
const shots = here + "shots/";

/* Container: a column in /imagine/'s row (`/imagine/paging/critique/`), wired into the
   `paging` hub's `children:` by the mastermind — not this task, which fences write to its
   own dir only. Size: `full`, because nineteen ranked cards plus a findings screen is a wall,
   not prose. Own layout: a markdown numbers table (method: measure before judging), then one
   ranked stack of image+verdict rows, then a findings screen. Regions: three. Preview: default.

   Every number below is `ext/DesignTool`'s `analyze()`/`rate()`, read from `.page.active-page`
   for depth/score/scroll (its own box is 0×0 under a columns row — `display: contents` — but
   depth and rate() read RELATIVE geometry and don't need it) and from `.app` for width-used/
   dead-region, which are VIEWPORT questions no single column's own box can answer. Shots are
   3440×1440 headless, quality 60 (platform re-shot at 35 to clear 200KB). No realm was edited. */

const REALMS = [
	{ rank: 1, slug: "research", title: "Research", url: "/imagine/research/",
		m: "41% wide · 1856px dead · depth 9 · scroll 14517/1392",
		weak: "368 entries render as one 41%-wide scrolling column that runs 14,517px deep — 10.4 screens — while 59% of a 3440 monitor sits empty the entire time.",
		alt: "Tile wall for the four topic cards, then let the synthesis read claim `wide` — width should scale with content instead of content scaling into scroll.",
		surface: "tint", score: 73 },
	{ rank: 2, slug: "generated", title: "Generated", url: "/imagine/generated/",
		m: "29% wide · 2180px dead · depth 6 · scroll 1392/1392",
		weak: "One \"Seed 7\" card floats alone in a 40em rail with 2180px of blank paper beside it — the emptiest screen in the whole set.",
		alt: "Tile wall at `wide`: each generated tree becomes a real card in a grid that fills in as seeds arrive, instead of a list waiting for company.",
		surface: "card", score: 76 },
	{ rank: 3, slug: "cms", title: "CMS", url: "/imagine/cms/",
		m: "31% wide · 2180px dead · depth 6 · scroll 1392/1392",
		weak: "Five feature cards and three paragraphs score 99 on taste — the highest in the set — yet still only fill 31% of 3440. Polish and viewport use are different axes.",
		alt: "Tile wall, `wide` column: five cards read as one row at 3440 instead of a cramped 2-up huddle.",
		surface: "tint", score: 99 },
	{ rank: 4, slug: "design", title: "Design", url: "/imagine/design/",
		m: "31% wide · 2180px dead · depth 4 · scroll 1392/1392",
		weak: "The site's own layout-study program renders its 12-item index as a bare vocabulary list in a 40em lane — the same dead 69% as every narrow sibling.",
		alt: "Tile wall — three subdirectories down (padding/, layout/) it already builds this pattern; just not at its own front door.",
		surface: "tint", score: 65 },
	{ rank: 5, slug: "feeds", title: "Feeds", url: "/imagine/feeds/",
		m: "31% wide · 2180px dead · depth 6 · scroll 1392/1392",
		weak: "A 3-card preview row sits directly above an identical 3-item text list — the same three links twice, both stuck in the same 31%.",
		alt: "Drop the duplicate list; let the card row claim `wide` and become the whole index.",
		surface: "card", score: 62 },
	{ rank: 6, slug: "gallery", title: "Gallery", url: "/imagine/gallery/",
		m: "31% wide · 2180px dead · depth 4 · scroll 1392/1392",
		weak: "Three one-line children (Lists, Answers, Cards) sit in a plain list; 2180px of canvas does nothing beside them.",
		alt: "Tile wall — the imported previews these children already draw are built for a grid, not a list.",
		surface: "plain", score: 79 },
	{ rank: 7, slug: "vary", title: "Vary", url: "/imagine/vary/",
		m: "31% wide · 2180px dead · depth 6 · scroll 1392/1392",
		weak: "Four lab cards stack in one narrow column when 3440 has room for all four in a single row.",
		alt: "Tile wall, `wide`.",
		surface: "tint", score: 61 },
	{ rank: 8, slug: "paging", title: "Paging", url: "/imagine/paging/",
		m: "29% wide · 1856px dead · depth 4 · scroll 1392/1392",
		weak: "Still a placeholder — \"Being built\", one link, 71% unused. The numbers describe a stub, not a verdict on the landed design.",
		alt: "Once `paging-core` lands: the vertically-centred `center` column system this program is building, not the generic small+large default every other realm falls back to.",
		surface: "dark", score: null, note: "stub — owned by paging-core, revisit after it lands" },
	{ rank: 9, slug: "mag", title: "Magazine", url: "/imagine/mag/",
		m: "47% wide · 986px dead · depth 4 · scroll 1392/1392",
		weak: "A magazine hero floats dead-centre with symmetric blank margins on both sides — the only realm whose dead space comes from centring, not from a narrow rail.",
		alt: "Docs three-region once articles exist, or pair Solo with a `bleed` background wash so the frame reads full even while the text stays narrow.",
		surface: "dark", score: null, note: "mostly a picture — taste has little to read" },
	{ rank: 10, slug: "screens", title: "Screens", url: "/imagine/screens/",
		m: "40% wide · 1856px dead · depth 6 · scroll 1392/1392",
		weak: "The page about screen-switching ratios renders its own eight mechanism cards at 40% width — the demo doesn't practice what it explains.",
		alt: "Tile wall, `wide`.",
		surface: "card", score: 88 },
	{ rank: 11, slug: "blogx", title: "Blogx", url: "/imagine/blogx/",
		m: "39% wide · 1856px dead · depth 6 · scroll 1392/1392",
		weak: "Eight shell cards sit in a tight 4×2 grid inside a 40em lane — 1856px dead beside a page whose own verdict says \"a wide screen gets more columns, never a wider one,\" a rule its own index doesn't follow.",
		alt: "Tile wall at `wide`: one row of eight instead of two of four.",
		surface: "card", score: 89 },
	{ rank: 12, slug: "decks", title: "Decks", url: "/imagine/decks/",
		m: "41% wide · 1856px dead · depth 7 · scroll 2105/1392",
		weak: "Ten ratio-lab cards stack in a narrow column, and the intro prose alone overflows about 713px past the fold.",
		alt: "Tile wall, `wide`, plus an `expand` disclosure on the long intro instead of a flat scroll.",
		surface: "tint", score: 77 },
	{ rank: 13, slug: "shells", title: "Shells", url: "/imagine/shells/",
		m: "41% wide · 1856px dead · depth 6 · scroll 1392/1392",
		weak: "Ten shell cards, grouped under four headings, are all crammed into one 40em list — the grouping wants a real grid, not indentation.",
		alt: "Tile wall per group, `wide`.",
		surface: "card", score: 73 },
	{ rank: 14, slug: "stream", title: "Stream", url: "/imagine/stream/",
		m: "41% wide · 1856px dead · depth 6 · scroll 1819/1392",
		weak: "A live two-window demo plus a code sample sit in a 41%-wide lane that then overflows about 427px past the fold.",
		alt: "`wide` column; move the wire.json / wire.jsonl sample into an `expand` disclosure.",
		surface: "dark", score: 91 },
	{ rank: 15, slug: "team", title: "Team", url: "/imagine/team/",
		m: "52% wide · 1424px dead · depth 11 · scroll 1392/1392",
		weak: "A real kanban board — 12 tasks, 4 lanes — still leaves 1424px dead at 3440 because the board's own `--column` floor is only 9em.",
		alt: "Raise the board's column floor, or `launch` a person's own board as a third column instead of swapping it into the second.",
		surface: "plain", score: 82 },
	{ rank: 16, slug: "game", title: "Game", url: "/imagine/game/",
		m: "52% wide · 1424px dead · depth 8 · scroll 1392/1392",
		weak: "A journal narrative with real state (found / carrying / rooms) sits in one 52%-wide column with 1424px of nothing beside it.",
		alt: "`launch` a persistent inventory or map as a third column instead of leaving the space idle.",
		surface: "prim", score: 83 },
	{ rank: 17, slug: "youtube", title: "YouTube", url: "/imagine/youtube/",
		m: "62% wide · 1028px dead · depth 11 · scroll 1392/1392",
		weak: "Video plus a genuinely dense control panel already use two real columns, but 1028px still sits blank on the far right at 3440.",
		alt: "Add a third `wide` column — a transcript, or the marks timeline the page already builds.",
		surface: "dark", score: 82 },
	{ rank: 18, slug: "platform", title: "Platform", url: "/imagine/platform/",
		m: "70% wide · 704px dead · depth 10 · scroll 2015/1392",
		weak: "The best two-column pairing in the set — 91% used at 1280 — still drops to 70% at 3440: 704px unclaimed beside the densest prose here.",
		alt: "Docs three-region — pin the table of contents these long verdict pages already imply as a real third column.",
		surface: "plain", score: 90 },
	{ rank: 19, slug: "scenes", title: "Scenes", url: "/imagine/scenes/",
		m: "100% wide · 1px dead · depth 5 · scroll 1392/1392",
		weak: "None found — a full-bleed 3D stage claims 100% of the row at every width measured. The pattern the other eighteen should copy.",
		alt: "Keep — this already is the Tile/Stage `full` exemplar.",
		surface: "plain (unchanged)", score: 82 },
];

// Numbers-first table, built straight from the ranked data (no second hand-typed copy).
const numbers = () => {
	const rows = REALMS.map(r => {
		const [w3440, dead, depth] = r.m.split(" · ");
		return `| ${r.rank} | [${r.title}](${r.url}) | ${w3440} | ${dead} | ${depth} | ${r.score ?? "—"} |`;
	}).join("\n");
	md(`| # | realm | width used @3440 | dead region @3440 | nesting | score |\n|---|---|---|---|---|---|\n${rows}`).ac("wide");
};

const card = r => div.c("flex gap").style({ alignItems: "flex-start", padding: "1em 0", borderBottom: "1px solid var(--line)" }).append(() => {
	figure(() => {
		img().attr("src", shots + r.slug + ".jpg").attr("alt", r.title + " at 3440")
			.style({ width: "100%", height: "auto", display: "block", border: "1px solid var(--line)", borderRadius: "0.3em" });
		figcaption(() => { span.c("muted", r.m); }).style({ fontSize: "0.8em", marginTop: "0.3em" });
	}).style({ margin: 0, flex: "0 0 24em", minWidth: "16em" });
	div.c("flex v gap").style({ flex: "1 1 24em", gap: "0.4em" }).append(() => {
		h3(() => { span(`${r.rank}. `); a(r.title).attr("href", r.url); span.c("muted", r.score != null ? `  ·  score ${r.score}` : "  ·  score —"); });
		if (r.note) p(() => span.c("muted", r.note)).style({ fontStyle: "italic" });
		p(() => { span.c("muted", "Weak: "); span(r.weak); });
		p(() => { span.c("muted", "Alternate layout: "); span(r.alt); });
		p(() => { span.c("muted", "Alternate surface: "); span(r.surface); });
	});
});

export default new Paging({
	meta: import.meta,
	title: "Critique",
	description: "Every /imagine/ realm, shot at 1280 and 3440 and ranked worst-first — column ratio, alignment and nesting against the viewport.",
	icon: "rate_review",

	content(){
		md("**Every realm in /imagine/ was screenshotted cold, measured, and ranked worst-first — this page is that reading.** Nothing was edited to produce it: it says where each realm wastes the screen, where it is cramped, and what an alternate layout or palette would do.").ac("paging-lede");

		md(`**Nineteen realms, shot cold at 1280 and 3440, ranked worst-first.** The owner's ask: alternate layouts, alternate color schemes, different ratios of columns and alignment relative to the viewport, and how nesting interacts with all of it. No realm here was edited — this is a reading, not a fix.

Method: private server, headless Playwright, \`ext/DesignTool\`'s \`analyze()\`/\`rate()\` for depth and taste, plus one added measure — the widest contiguous horizontal gap in what's actually painted, read from \`.app\` because "how much of the screen is used" is a viewport question no single column can answer for itself. Numbers before judgement:`);

		numbers();

		h2("Ranked worst → best");
		div(() => REALMS.forEach(card));

		h2("Three ways ratio × alignment × nesting × surface interact");
		md(`1. **Ratio collapses with the viewport instead of scaling with it.** The small-rail-plus-one-column formula holds 89–92% width-used at 1280 across most realms, and falls to 29–31% at 3440 — the SAME layout, unchanged, just handed more room it never claims. [Design](/imagine/design/) goes 58%→31%; [CMS](/imagine/cms/) goes 57%→31%. Nobody's content got narrower; the row just stopped growing with the screen.

2. **Nesting depth doesn't rescue width — the width WORD on the leaf column does.** [YouTube](/imagine/youtube/) nests 11 levels deep and still only claims 62% (1028px dead) because every column in the chain is \`small\`/\`default\`. [Scenes](/imagine/scenes/) nests only 5 levels and claims 100% (1px dead) because its one stage takes \`full\`. Depth is not the variable that predicts waste; the size word chosen at the leaf is.

3. **Dead space has a shape, and the shape — not just the pixel count — decides the fix.** A left-anchored rail+column leaves ONE contiguous block on the right: [CMS](/imagine/cms/) at 2180px, all of it past the content's right edge, fixed by a \`wide\` third region. A centred/solo surface leaves TWO symmetric margins instead: [Magazine](/imagine/mag/) at 986px, split evenly left and right of a floating hero, fixed by widening the measure or bleeding the background — never by adding a column, because there's no edge for one to sit against. Same order of magnitude, opposite geometry, opposite remedy.`);
	},
});

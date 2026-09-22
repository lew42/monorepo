import { Page, div, h2, h3, p, a, img, figure, figcaption, span, md } from "/app.js";

const shots = "/framework/ai/2026-09-04/imagine-review/shots/";
const task = r => "/framework/ai/2026-09-04/imagine-" + r + "/";

/* Container: a column in /imagine/'s columns row. Size: `fill` — eighteen picture cards are a
   wall, not prose, and the rail keeps its floor (doc/columns.md: fill is full that lets its
   neighbours stay). ⚠ 2026-09-05: this page stopped being a leaf — `rethink` opens beside it —
   so two `fill` siblings now share the row. They split it evenly (both are `flex: 1 1 100%`),
   which measures fine at 3440; the starving case the layout skill warns about is `fill` beside
   a NARROWER word, not beside another `fill`. `full` was rejected:
   /imagine/gallery/ tried it on 2026-09-04 and reverted, it collapses the hub rail.
   Own layout: three plain sentences, a numbers line, one stack of image+verdict rows, then a
   five-item screen. Regions: three. Preview: the default card.

   ⚠ Every sentence in REALMS is its reviewer's own words, harvested verbatim from that agent's
   final report. Do not "improve" them — the whole point is what a stranger actually said. */

const REALMS = [
	{ slug: "platform", title: "Platform", cold: "unclear", fixed: 4, proposed: 2,
		stranger: "A wall of prose plus a bulleted list of nine research topics with entry counts, a timestamped run log, and AI-agent spend numbers — it reads like an internal status report for someone else's project, not something I can use or understand as a \"platform\".",
		meant: "Topics as worlds — the research, decisions and prototypes behind a community platform built on this framework, with one real working demo among the reference material.",
		did: "Added a plain opening sentence saying this is a design lab, not a live product, and a \"Start here\" pointer to the one real interactive demo. Relabelled the project-status block so it reads as behind-the-scenes. Defined \"DO\" (Durable Object) where it first appears." },

	{ slug: "research", title: "Research", cold: "unclear", fixed: 6, proposed: 1,
		stranger: "A hub about ancient-technology mysteries and UFO claims, sorted into four topics with a confidence rating — but it never stopped scrolling, turning into a ten-screen wall of raw claim cards below the topic row.",
		meant: "Four topics in ancient technology, dug in parallel and streamed live, every claim tagged by how sure anyone actually is.",
		did: "Put the raw claim stream behind a closed disclosure: the page now renders 877px deep instead of 14,413px at 3440, a 94% cut. Added a sentence telling you to pick a topic card, or open the drawer for the raw claims. Fixed four dead cross-links." },

	{ slug: "generated", title: "Generated", cold: "unclear", fixed: 2, proposed: 0,
		stranger: "A settings-ish page with a dense jargon paragraph and one small \"Seed 7\" card floating alone in mostly empty space — it looks like an empty or broken admin screen, and it is not clear what a \"seed\" is or what to do with it.",
		meant: "Page trees exported from the page generator, landed as real editable page.js files — export a tree there, name it, and it appears here as a directory you then edit.",
		did: "Said in plain words why only one card is here right now — it is not broken, nothing else has been exported yet. Said one level down that \"Journal\" and \"Backlog\" are the generator's placeholder names, not real content." },

	{ slug: "design", title: "Design", cold: "unclear", fixed: 2, proposed: 1,
		stranger: "A list of eleven single words — Journey, Padding, Scale, Layout, Navigation, Color, Type, Controls, Vocabulary, System, Themes — with no indication of what any of them show or why I would click one.",
		meant: "A design-study program: a program visited every page on the site overnight and saved a screenshot of each, and every page here studies that same picture library to answer one design question.",
		did: "Rewrote the opening sentence in plain words and turned the bare word list into a wall of cards. A dead columns() call had been pinning it to the narrow default column; removing it took width used at 3440 from 31% to 97%. Wrote the realm's first readme." },

	{ slug: "gallery", title: "Gallery", cold: "unclear", fixed: 3, proposed: 1,
		stranger: "A short bare list of three links — Lists, Answers, Cards — whose opening line talks about a \"foreign page\" being \"imported by path, never adopted\", which means nothing on first read, and most of the canvas is empty grey.",
		meant: "Browsable lists of all the things the framework can be made of, every card a page borrowed from somewhere else.",
		did: "Wrote a plain takeaway sentence that defines \"foreign page\" the first time it appears, and replaced the three-line list with a labelled card wall. Swapped a hard-coded 1.5em gap for the site's spacing clamp." },

	{ slug: "screens", title: "Screens", cold: "unclear", fixed: 3, proposed: 0,
		stranger: "A jargon paragraph about a \"columns host\", a \"width word\" and a \"crumb strip\" sits above eight tiny thumbnail cards whose captions repeat the same undefined words, so a stranger cannot tell what clicking one does or why it matters.",
		meant: "Eight small experiments in what a click does to the rest of the screen — it either replaces what you were looking at, or joins it and splits the space evenly.",
		did: "Rewrote the page's and the readme's opening paragraphs to lead with one plain sentence and moved the framework vocabulary behind the readme link. Replaced \"hop\" with \"click\", and \"a basis pair is the ratio, exactly\" with the actual numbers, 61.8/38.2." },

	{ slug: "scenes", title: "Scenes", cold: "unclear", fixed: 7, proposed: 1,
		stranger: "A 3D lobby with five pedestals, each holding a small spinning object and a hint to click whatever lights up — it reads as a menu of five sections, but the paragraph above it (slot, active chain, composition, grains of swap) is jargon that never says what any of the five things actually is.",
		meant: "A 3D showroom where clicking an object is real navigation, and each of the five doors swaps a different-sized piece of the same shared scene — a whole world, one object, one region, one light, or all four at once.",
		did: "Replaced the jargon paragraph with a plain takeaway sentence. That paragraph is composed onto every child page in the realm, so one rewrite fixed all six at once. Reworded each door to lead with the plain instruction, and moved a link off a dead end." },

	{ slug: "shells", title: "Shells", cold: "unclear", fixed: 2, proposed: 0,
		stranger: "It reads as a components catalog — ten cards grouped under headers like \"Outer chrome\" and \"Inner chrome\" listing rail, bar and footer layouts — but without knowing what \"chrome\" means I cannot tell why these matter or which to click.",
		meant: "A lab of ten complete app-shell layouts, so you can click through and compare how a page's persistent surrounding UI can be arranged — six of them wrapping the same document, so only the frame changes.",
		did: "Defined \"chrome\" in plain words the first time it appears, in both the page and the readme, and added an explicit \"click a card\" instruction. Fixed a duplicate heading in the readme that was breaking its anchor links." },

	{ slug: "decks", title: "Decks", cold: "unclear", fixed: 3, proposed: 1,
		stranger: "A gallery of ten small ratio diagrams — Half, Golden, Aside, Triptych, Poster, Four, Persistent, Swap, The pitch — captioned in vocabulary that assumes you already know what a \"screen region\" or a \"slide cut\" is.",
		meant: "Nine presentational layouts for cutting a screen into regions, showing which kind of content survives which region shape.",
		did: "Put one plain sentence in front of the vocabulary rather than deleting it. Widened the wall from large to fill: dead space at 3440 went from 1,856px to roughly 15% of the row. Gave the doc files real urls, closing five dead links." },

	{ slug: "team", title: "Team", cold: "unclear", fixed: 5, proposed: 2,
		stranger: "A drag-and-drop task board for a fictional six-person team with twelve tasks in four lanes — but nothing on screen says who these people are or why I would be looking at this.",
		meant: "The page's own description said it demonstrates the framework's column architecture — \"four columns, one ref, no imports between them\" — a sentence for someone studying the framework, not a page for a visitor to use.",
		did: "Added the missing takeaway sentence and rewrote the description in plain terms. Widened the board from large to fill, closing the 1,424px of dead space at 3440. Labelled the bare counters, and fixed a real bug: the LANDED button was silently clipped to LAND at 1280." },

	{ slug: "mag", title: "Magazine", cold: "unclear", fixed: 3, proposed: 1,
		stranger: "A poster-style cover for a small magazine called The Column, issue 01, with a headline, a short teaser line, and a button that says \"Open the issue\".",
		meant: "A small magazine made entirely out of the column-layout system's own vocabulary — a demo you read and use like a real magazine, rather than a page of documentation you inspect.",
		did: "Rewrote the cover's teaser line from insider poetry into a plain sentence that names what the magazine is actually about. Raised the cover's background wash slightly so the wide-screen margins read as toned paper instead of blank white." },

	{ slug: "vary", title: "Vary", cold: "unclear", fixed: 2, proposed: 0,
		stranger: "Four cards labelled Scroll, Tone, Place, Colstyles under a sentence that says \"Three labs\" — the count contradicts what is on screen, so the first reaction is confusion about a missing card rather than grasping the point.",
		meant: "Four small labs, each a tree of column-page variations under one question, browsed live as real linkable pages rather than config options, each ending in a one-line verdict.",
		did: "Corrected \"Three\" to \"Four\" in both the sentence and the description — a fourth lab had been added to the children list and the copy was never updated. Widened the column so all four cards sit in one row at 3440 instead of stacking 2x2." },

	{ slug: "feeds", title: "Feeds", cold: "unclear", fixed: 1, proposed: 1,
		stranger: "Three cards labelled Video, Data and Live, each with a truncated description, sitting directly above the exact same three names repeated as a plain link list — I cannot tell why both exist or which to click.",
		meant: "Three small labs, each a different shape of content the repo does not author itself — a YouTube embed you have to ask for, one dataset drawn three ways, and a live public weather API.",
		did: "One line. The page already drew its children as cards, and core was repeating them as a plain rail underneath because the page never said index: true. Adding it removed the duplicate, and a wider column put the three cards in one row." },

	{ slug: "game", title: "Game", cold: "clear", fixed: 2, proposed: 1,
		stranger: "A fantasy exploration game where you click links to walk between named realms and rooms, picking up a lamp, key, lens and sigil to unlock further rooms and eventually open a locked gate.",
		meant: "A game whose only mechanic is navigation — a realm is a page, a room is a page, an exit is a link to a sibling. Nine rooms, four things, one chain, one trade, one way out.",
		did: "The genre was legible but the page explained its mechanic before ever saying it was a game, so a plain sentence went in first. Also fixed a real bug: three realm links and the exit all displayed the keyboard shortcut \"1\", so pressing 1 only ever reached the first one." },

	{ slug: "youtube", title: "YouTube", cold: "clear", fixed: 2, proposed: 1,
		stranger: "A page called YouTube with an embedded talk and a dense settings panel, plus a sidebar list of five one-word things — Course, Yield, Split, Chat, Marks — whose names do not say what they do until you click them.",
		meant: "Six labs proving the YouTube player API: a control panel exposing every method as a control, a course whose chapters are real pages the playhead can open, three more ways a shared timeline can drive real UI, and the stopwatch used to write the others' cue tables.",
		did: "The words were honest and the page was broken. The panel's whole printed keyboard legend — Space, arrows, J/L, M, 0-9 — did nothing at all on a cold load, and its polling timer leaked forever after you left, because a column marked default never receives activate(). Wired both up, and gave the docs real urls." },

	{ slug: "cms", title: "CMS", cold: "clear", fixed: 3, proposed: 1,
		stranger: "A demo of a homemade content-editing system for this website — a markdown file you can open, edit in a form, and save — walked through in five short guides.",
		meant: "A CMS out of two seams that already existed: a markdown file is a page, and the dev socket writes files.",
		did: "The landing page was already clear; it broke one click deeper. Three links inside its own readmes ended in a file extension, which the router never intercepts, so clicking one dumped you on raw unstyled text with no way back. Two now route properly, one was delinked." },

	{ slug: "stream", title: "Stream", cold: "clear", fixed: 3, proposed: 0,
		stranger: "This page proves that editing something in one browser tab makes another tab update instantly with no reload, backed by a quoted 9ms measurement.",
		meant: "A page's state is just an append-only log the dev server already watches — one window appends a change, every other window's subscription replays it and redraws, with no reload and no navigation.",
		did: "The takeaway already matched, and the claim is real: two live browser windows were driven at once, and typing in one updated the other in 3ms with no interaction. Removed a duplicate link rail, gave the docs real urls, and folded the long code sample into a disclosure." },

	{ slug: "blogx", title: "Blogx", cold: "clear", fixed: 2, proposed: 0,
		stranger: "A page comparing eight different ways to lay out the same fake blog — magazine front, dashboard, deck, columns, two rail styles, two multi-part treatments — with a stated rule that no reading column ever exceeds 42em.",
		meant: "Eight blog shells rendering the same eight posts, so the only variable on screen is the layout, judged at 3440 first and ranked in the readme.",
		did: "The sentence was already right; the page broke its own rule. It states that a wide screen gets more columns and never a wider one, then rendered its own eight cards as a 4x2 grid in a narrow lane. Now one row of eight: 1,856px of dead space down to about 50. Four dead doc links fixed." },
];

/* `--muted` is a PERCENTAGE, not a colour — framework.css feeds it to color-mix inside the
   `.muted` class — so a faded badge asks for the CLASS and never for `var(--muted)`. */
const badge = (text, loud) => {
	const el = loud ? span(text) : span.c("muted", text);
	return el.style({
		fontSize: "0.75em", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase",
		padding: "0.15em 0.55em", borderRadius: "0.25em", whiteSpace: "nowrap",
		border: "1px solid var(--line)",
		background: loud ? "var(--tint)" : "transparent",
	});
};

/* One card per realm, and the WALL is a grid — not one full-width row each. A row would run its
   sentences to 2,900px at 3440, which is the exact defect this page reports about other realms
   (pattern 3: a wide screen gets more columns, never a wider one). A 24em grid track keeps every
   line inside the measure at any width and still claims the whole row. */
const card = (r, i) => div.c("flex v gap").style({ gap: "0.5em", alignItems: "stretch" }).append(() => {
	h3(() => {
		span.c("muted", `${i + 1}. `);
		a(r.title).attr("href", "/imagine/" + r.slug + "/");
	}).style({ margin: 0 });

	div.c("flex gap").style({ alignItems: "center", flexWrap: "wrap", gap: "0.4em" }).append(() => {
		badge(r.cold === "unclear" ? "was unclear" : "was clear", r.cold === "unclear");
		span.c("muted", "→");
		badge("now clear", false);
	});

	figure(() => {
		img().attr("src", shots + r.slug + ".jpg").attr("alt", r.title + " at 1280, after the fixes")
			.style({ width: "100%", height: "auto", display: "block", border: "1px solid var(--line)", borderRadius: "0.3em" });
		figcaption(() => { span.c("muted", `as it stands now, at 1280 · ${r.fixed} fixed · ${r.proposed} proposed`); })
			.style({ fontSize: "0.8em", marginTop: "0.35em" });
	}).style({ margin: 0 });

	p(() => { span.c("muted", "A stranger said: "); span(r.stranger); });
	p(() => { span.c("muted", "The page meant: "); span(r.meant); });
	p(() => { span.c("muted", "What was fixed: "); span(r.did); });
	p(() => {
		a("the reviewer's full log").attr("href", task(r.slug));
	}).style({ fontSize: "0.9em" });
});

const wall = () => div(() => REALMS.forEach(card)).style({
	display: "grid",
	gridTemplateColumns: "repeat(auto-fill, minmax(24em, 1fr))",
	gap: "var(--gap-default, 1.5em) var(--gap-default, 1.5em)",
	alignItems: "start",
	marginTop: "1em",
});

export default new Page({
	meta: import.meta,
	title: "Review",
	description: "Eighteen realms opened cold by eighteen reviewers: what a stranger thought each page was for, what it meant to be, and the 55 things that got fixed.",
	icon: "fact_check",
	width: "fill",

	/* Nothing crawls: this line is the only reason /imagine/review/rethink/ exists.
	   It is the SECOND pass — the same eighteen realms, asked a harder question. */
	children: ["rethink"],

	content(){
		md(`**Every page under /imagine/ was opened cold by someone who had never seen it, and asked one question: can you say what this is for in ten seconds?** Eighteen reviewers each took one realm, screenshotted it, clicked the first thing a reader would click, wrote down what a stranger would say the page was for, and compared that to what the page's own code and readme said it was for. Where those two sentences disagreed, that was the finding — and the reviewer fixed it on the spot rather than filing it.

**Thirteen of the eighteen failed that test. All eighteen pass now.** 55 things were fixed, and 14 more were written up as proposals because the fix belonged in shared framework code rather than in one realm.

**How to read the cards below.** They run worst-first, ordered by how far apart those two sentences were when the page was opened cold. The picture on each card is the page **as it stands now, after the fixes** — the "a stranger said" line describes what was there before.`);

		h2("Eighteen realms, worst first");
		wall();

		h2("What kept going wrong");

		md(`Five failures came up again and again. None of them is a bug in the usual sense — every one of these pages worked. They were unclear, which is a different and more expensive kind of broken.

**1. The first sentence was written in the author's own vocabulary.** Eleven of the eighteen opened with a word that only the person who built the page knew, so the reader met jargon before they met the point. [Shells](/imagine/shells/) built its whole index on the word "chrome" and never defined it, so its two group headings read as noise instead of as the distinction the page was teaching. [Scenes](/imagine/scenes/) opened with "slot, active chain, composition, grains of swap" — and because that one paragraph is composed onto every child page in the realm, the best-laid-out page on the entire site was failing the ten-second test in six places at once. The fix is never to delete the vocabulary. It is to put one plain sentence in front of it.

**2. The page described how it was built instead of what you can do with it.** [Platform](/imagine/platform/) led with an AI agent's own project-status report — tokens spent, minions dispatched, timestamped run logs — which is the artifact of the process that made the page, not a description of the page. [Team](/imagine/team/) is a working drag-and-drop task board, and its own description sold it as "four columns, one ref, no imports between them": a sentence written for someone studying the framework, standing where the sentence for a visitor should have been.

**3. The front door broke the rule the realm itself teaches.** [Design](/imagine/design/) is the site's own layout-study program, and it rendered its index as a bare list of eleven words using 31% of a wide screen — while its own studies say a wall of cards is the answer and a wider column never is. [Blogx](/imagine/blogx/) states outright that a wide screen gets more columns and never a wider one, then laid its own eight cards out as a 4x2 grid crammed into a narrow lane. In both cases the page was right and its own chrome was wrong.

**4. A link that quietly left the app.** An inline link to a \`doc/something.md\` file ends in a file extension, and the router does not intercept those — so the click did a full page load onto raw, unstyled markdown with no header, no styling and no way back. Six realms had these. [Scenes](/imagine/scenes/) found the first one on its own "how this works" link, the single link a confused reader is most likely to try. [CMS](/imagine/cms/) is the sharpest case: its landing page was already clear, and it broke one click deeper, inside its own readme. Five realms shipped the same small fix today, which is itself the argument for making it once in the framework instead.

**5. What core does for a page is decided by one word the page forgets to say.** [Feeds](/imagine/feeds/) showed the same three links twice — a row of cards with an identical plain list under it — because a page that draws its own card wall still gets core's automatic link rail unless it declares \`index: true\`. [Stream](/imagine/stream/) had exactly the same defect, from the same omission. The sharpest version is [YouTube](/imagine/youtube/), where a printed keyboard legend — Space, arrows, J/L, M, 0-9 — did nothing whatsoever on a cold load, and left a polling timer running forever after you navigated away, because a column marked \`default\` never receives \`activate()\`. No amount of rereading the copy would have caught that one. Only driving the page did.`);

		md(`**Where the rest went.** The 14 proposals are in the reviewers' logs, each with the diff it would apply — the largest are a route for \`doc/*.md\` files so links stop leaving the app, an \`activate()\` lifecycle for default columns, and a card description that stops truncating to one line. They were written up rather than applied because they change \`core/\` or \`ext/\`, which is shared by every page on the site.

The measurements each reviewer worked from are the [layout critique](/imagine/paging/critique/), taken before any of this. The full run — every screenshot, every caveat, every rejected fix — is at [the day's log](/framework/ai/2026-09-04/), and [how this page itself was built](/imagine/review/readme/) is beside it.`);
	},
});

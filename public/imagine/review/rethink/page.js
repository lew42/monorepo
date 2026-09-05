import { Page, View, div, h2, h3, p, a, img, figure, figcaption, span, md } from "/app.js";

View.stylesheet(import.meta, "rethink.css");

const shots = r => "/framework/ai/2026-09-05/ux-" + r + "/shots/";
const log = r => "/framework/ai/2026-09-05/ux-" + r + "/";

/* ── THE SECOND PASS ────────────────────────────────────────────────────────────
   Yesterday eighteen strangers opened these eighteen realms cold and asked one
   question: can you say what this page is for in ten seconds? That page is
   [/imagine/review/](/imagine/review/). Tonight eighteen reviewers went back with a
   harder question — is this the best SHAPE this page could have? — and each one was
   required to actually BUILD an alternative layout, measure it, and keep it or put
   it back with the numbers that decided it.

   ⚠ Every sentence in REALMS is its reviewer's own words, harvested verbatim from
   that agent's final report. Do not "improve" them. The whole value of this page is
   that eighteen independent agents, who never spoke to each other, agreed.

   THE PAGE APPLIES ITS OWN FINDING TO ITSELF, AND THE ANSWER WAS NO. The rule these
   eighteen produced is "reach for the owner's 3-column card when the centre column is
   ALIVE". This page's centre would be two static screenshots, so it does not — see the
   comment on `card()` for the measurement that settled it. The cards are still ordered
   the way the owner asked multiples of a card to be ordered, "related, so as you scroll
   from one to the next you could see the relation": seven keeps, then the eleven that
   did not, and the reason flips with them. */

const KEPT = "kept", BACK = "reverted", NONE = "declined";

const REALMS = [

	// ════ THE SEVEN THAT KEPT WHAT THEY BUILT ═════════════════════════════════

	{ slug: "team", title: "Team", verdict: KEPT,
		tried: "The owner's 3-column card: controls and intro left, the live drag-and-drop board centre, every counter as a readout right.",
		why: "Two measured wins for near-zero cost. The four lanes went from about 640px each at 3440 — mostly whitespace around two-word task titles — to 410–460px, a real kanban card width. And the board's live counters left a muted monospace footnote most readers never scrolled to, for a bordered readouts card.",
		what: "A drag-and-drop kanban board for a six-person fictional team — twelve tasks across four lanes — laid out as controls and intro on the left, the live board centre, and every readout on the right.",
		use: "Drag a task card to another lane to move it, or click a person on the far rail to see just their work.",
		goal: "Leave knowing the board's real state — who owns what, how loaded each lane is — and that dragging is exactly how you'd rearrange it, with no reading required first.",
		hard: "1/5 — the intro sentence and the three-region shape do all the explaining now.",
		better: "The green \"Saved\" mark could say what changed, not just that something did.",
		numbers: "Lanes 640px → 410–460px at 3440. The column's own content height 515px → 489px. Width used and dead space unchanged: the board was already full-width, so this change is about how that width is used, not how much is claimed.",
		visual: "The page's live counters — points per lane, people picked, tasks moved, redraws, ref hops — went from a single muted line under the fold to a bordered Readouts card with one row per number.",
		persists: "Which lane each task is in, plus row density and sort. Proved end to end, not by reading the import: a real drag turns the mark green instantly with no reload, and two presses on Reset clears the key and puts the task back.",
		counts: "4 fixed · 0 proposed" },

	{ slug: "youtube", title: "YouTube", verdict: KEPT,
		tried: "The 3-column card on the control panel: every control left, the video centre, every readout right.",
		why: "This was the strongest candidate on the site, because the centre column was already a live thing with real numbers beside it. Splitting one 34em control stack into two shorter side columns roughly halved the tallest column with no loss of function. One real mistake, caught by measuring rather than assuming: the first version used an unconditional CSS `order`, which looked right at 3440 and made 1280 worse — the video got pushed below three control groups on a cold landing.",
		what: "A page that lets you actually drive the YouTube player API — a live control panel with controls on one side, the video in the middle, and every readout on the other — plus five more labs proving what a shared, polled timeline can drive.",
		use: "Press play on the video in the middle, then drive it with the buttons on the left or the keyboard; click a card below to open one of the other five labs, each showing a real picture of what it looks like.",
		goal: "Leave understanding, by playing with it, everything the API exposes and how a page reacts to time passing in a video that has no time event.",
		hard: "2/5 — the panel now reads left to right as drive it / watch it / read it, and the five labs show what they do instead of just naming themselves.",
		better: "Wire the cue table in as a live companion column beside the panel by default, so the page also shows where its own cue tables come from without a click.",
		numbers: "The panel column's own scrollHeight 1110px → 859px at 3440, which fits its 852px box with no internal scroll left; 1199px → 988px at 1280.",
		visual: "The five one-word lab names — Course, Yield, Split, Chat, Marks — became real screenshots of each lab's own distinguishing UI instead of a generic icon and a repeated description.",
		counts: "3 fixed · 0 proposed — including a genuine crash: a method named `card()` shadowed core's `nav().card` field and threw the instant the page got a real preview." },

	{ slug: "research", title: "Research", verdict: KEPT,
		tried: "The owner's 3-column card: the topic name and tally left, the topic's own newest theory live in the centre, credence readouts right.",
		why: "The numbers argued for reverting — the page got three times taller and no wider. The five sentences overruled them. Before, \"how do I use it\" had no honest answer beyond click-and-hope; after, the front answers its own stated question once per topic with zero clicks, and every added pixel is a real sourced claim rather than a raw entry count.",
		what: "A live research hub on ancient-technology mysteries — four topics dug in parallel, each card now leading with one real, credence-tagged claim instead of just a count.",
		use: "Read a topic card's own theory right on the front, click its name to go deeper, or open Latest further down for the raw cross-topic stream.",
		goal: "Leave knowing at least one real, sourced claim per topic and how sure anyone is about it — not just how many claims exist.",
		hard: "2/5 — the depth crisis from yesterday is still fixed, and the one remaining friction is that the highlighted theory is always the newest, not necessarily the most interesting one.",
		better: "Rank the highlighted theory by how contested it is rather than defaulting to newest.",
		numbers: "Page height 877px → 2,855px at 3440 — three times taller, and kept anyway. Width used and dead space unchanged at 46.0% and 1,856px, which is the columns row, not this page.",
		visual: "Each topic card's centre column now shows the topic's actual newest theory — title, credence badge, full reasoning, and a source link — where a bare entry count and a coloured bar used to be.",
		counts: "2 fixed · 1 proposed — and one real bug found by driving it: a \"+N more theories\" disclosure dumped all 22 remaining theories inline, growing the card 5,412px in one click. It is a plain link now." },

	{ slug: "game", title: "Game", verdict: KEPT,
		tried: "The owner's 3-column card on the arrival screen: intro and the way in left, the run's live chain and scene as a boxed stage centre, per-realm progress as meters right.",
		why: "A menu-of-children page usually loses with this shape — five reviewers reverted it tonight for exactly that reason — but this landing page already had a live HUD and real per-realm numbers, not just links. Built for real: the column's content height dropped 10% at 1280 and 11% at 3440, and three fill bars beat three paragraphs duplicating what the rail already said.",
		what: "A small fantasy exploration game where every room is a real page, every exit is a link to a sibling room, and a rail beside it keeps a live HUD, a map and a save-file mark.",
		use: "Click \"Walk in — the Iron Gate\" in the left column of the arrival card, then click an exit link to move from room to room.",
		goal: "Collect the lamp, key and sigil — trading the lamp away for a lens partway through — and reach the Gate to close the run, which remembers two different, honestly-earned endings.",
		hard: "2/5 — the opening line states the mechanic and the goal in one sentence, and the right-hand column turns \"how far into each realm\" into three fill bars instead of three sentences duplicated from the rail.",
		better: "Mirroring the rail's own nine-cell map at a larger size in the centre column would let a stranger see the shape of the whole world before their first click.",
		numbers: "The column's own content height 850px → 758px at 3440, 724px → 649px at 1280. Width used and dead space held exactly steady, because a column's width word caps it regardless of what is drawn inside.",
		visual: "Three realm summaries stopped being prose duplicating the rail and became stat cards — a name, a fraction, a fill-bar meter, and a small glyph for the realm's ambiance.",
		persists: "Six arrays kept on purpose under one key, so the mark is green, not amber. A 23-step driven run proved it: walking two rooms and taking the lamp turned the mark on; two presses on Reset cleared storage and restored the exact starting state in place, with no reload.",
		counts: "2 fixed · 0 proposed" },

	{ slug: "stream", title: "Stream", verdict: KEPT,
		tried: "The owner's 3-column card, verbatim: a title and intro left, the claim itself live in the centre, the readouts right.",
		why: "The page's whole content is a claim — that editing in one tab updates another instantly — and a claim about two live windows is nearly impossible to believe from a paragraph. The centre is now two independently-subscribed instances, two real sockets on the same file, so typing in the left window is visible in the right one before any second tab is opened. The card cost about 450px; folding two supplementary mechanism sections into a disclosure paid it back and left the page 2% shorter than it started.",
		what: "A page with a live card showing two independent, separately-connected windows editing the same file side by side.",
		use: "Type in the left window of the card at the top of the page; the right window updates on its own, with a live latency number beside it.",
		goal: "Leave having watched the claim happen on the page you landed on, not just read it, and know where three fuller demos are if you want to try it in a real second tab.",
		hard: "2/5 — obvious that typing on the left changes the right, because it is shown rather than described; the one thing that still needs the caption is that these are two SEPARATE listeners, which is the whole point.",
		better: "A one-click \"pop out window B\" button opening a literal second browser tab would remove the last shred of doubt that this is two sockets and not script-mirroring.",
		numbers: "The column's own scrollHeight 1,651px → 1,620px at 3440 and 1,358px → 1,326px at 1280 — a page that got shorter while gaining a live demo.",
		visual: "The landing page's own claim went from a paragraph and a quoted \"9 ms\" to a card you can type into and watch update.",
		persists: "Not through the audited mechanism. It does keep state, but through the shared server-side files that ARE the demo, and the page already carries its own visible way back.",
		counts: "3 fixed · 1 proposed — and the claim was re-proved for real, in two fully separate browser contexts: 2ms and 3ms, both under the 9ms the page quotes." },

	{ slug: "scenes", title: "Scenes", verdict: KEPT,
		tried: "The 3-column card, which is also the approved docs three-region shape: intro and door switch in a rail, the 3D stage centre, the current door's own note as a readout right — firing only past 100em, so 1280 is untouched.",
		why: "Page height at 3440 dropped 13% with nothing removed, and the current door's own explanation is now visible beside the canvas at every depth instead of below a 600–900px canvas. That caption sitting off the first screen was the realm's real defect, and three levels deep it made the page look broken.",
		what: "A 3D showroom — a lit room with five pedestals, each one a door into a different small world.",
		use: "Click an object in the room, or a name in the list beside it, to step inside that world and look around.",
		goal: "Leave understanding the one mechanism behind all five doors — each swaps a different-sized piece of one shared room — and having actually walked into a few of them.",
		hard: "2/5 — round one already replaced the jargon; what was left was mechanical, not conceptual.",
		better: "Give the four remaining doors the same ultrawide-aspect fix the foyer and the crossroads got, so every one uses the width it is given.",
		numbers: "Page height 987.6px → 856.8px at 3440, 13% shorter. Width used reads 100% before and after and is not an informative number for this page, which opts out of the columns cap — the reviewer said so rather than hiding it.",
		visual: "A bug no DOM measurement could ever see: past a certain aspect ratio the 3D camera's field of view kept widening with screen width alone, so the five doors shrank toward the centre of an ultrawide canvas. They used about a third of the frame; now they use 63%.",
		counts: "4 fixed · 1 proposed" },

	{ slug: "generated", title: "Generated", verdict: KEPT,
		tried: "The owner's 3-column card — what it is left, its shape centre, its numbers right — replacing a flat card wall holding one small card in a mostly empty box.",
		why: "Kept on the five-sentence read, not on the numbers, and the reviewer said so plainly: the measurements did not move, because the old wall's grid container already spanned the column whether or not anything filled it. The new card genuinely fills that same box with real information, and it is built off the live page tree, so a second export draws its own shape with no new code.",
		what: "A page that shows every exported page-generator tree as a full card — right now, one, called Seed 7.",
		use: "Read the left column of the Seed 7 card, then click \"Open Seed 7\" to walk into the real files, or click the generator link in the dashed slot below to make a second one.",
		goal: "Leave knowing exactly what Seed 7 is — two branches, 14 pages, exported 2026-08-31 — that nothing else has been exported yet, and precisely how to change that.",
		hard: "2/5 — one real card that fully explains itself plus a clearly labelled empty slot reads as a small, working, unfinished page rather than a broken one.",
		better: "When a second seed exists, add one line comparing the two cards, so scrolling from one to the next shows the relation rather than two similar boxes.",
		numbers: "Width used, dead space and page height all unchanged — and the report says why, at length, instead of claiming a win it did not measure.",
		visual: "The seed's own tree structure, previously buried in a source-code comment no reader would ever see, is now two labelled chips drawn live off the page's actual children.",
		counts: "2 fixed · 0 proposed" },

	// ════ THE ELEVEN THAT PUT IT BACK ═════════════════════════════════════════

	{ slug: "design", title: "Design", verdict: BACK,
		tried: "The owner's 3-column card as the whole front door: title and intro left, a real screenshot centre, the study's one-line finding right.",
		why: "It measured five to six times the page height of the tile wall — 4,324px at 1280 and 5,280px at 3440 against 860px and 852px — for identical width and identical invariants. For a page whose entire job is showing a stranger twelve choices at a glance, a five-screen scroll is a real cost the tile wall does not pay. The first build actually measured 19,657px, from a real bug: one flex track had a floor but no ceiling, so a screenshot scaled past its own resolution.",
		what: "A wall of 12 study cards, 10 of them now showing a real screenshot from that study instead of a generic icon.",
		use: "Click any card — the picture and the title are the whole pitch now, with no description text competing against it.",
		goal: "Pick one of 12 design questions and open it; the picture itself now hints which study is which before you read a word.",
		hard: "1/5 — a picture of the actual thing reads faster than an icon plus a caption ever could.",
		better: "The two text-only cards could get a small generated glyph of their own data, closing the gap between all twelve.",
		numbers: "The alternative: 852px → 5,280px at 3440. What was kept instead: 852px → 734px, and 860px → 786px at 1280 — the page got SHORTER, because the framework drops a card's two-line description once it has a thumbnail.",
		visual: "Ten cards that showed a generic icon and two lines of caption now show the actual screenshot the study is about — a padding ladder, a dark theme, a resize handle, a magazine headline.",
		counts: "5 fixed · 0 proposed" },

	{ slug: "shells", title: "Shells", verdict: BACK,
		tried: "The 3-column card: title and intro left, the shell's own still centre, its finding right, one row per shell.",
		why: "Width used and dead space came out identical, because the column's width word caps both regardless of what is drawn inside it — but page height went 998px → 3,568px at 1280 and 1,289px → 4,038px at 3440, roughly three and a half times taller for ten rows. And the right-hand readout column only repeated words already visible in the still.",
		what: "A lab of ten complete app-shell layouts, and every card is now a real screenshot of that shell's own chrome instead of an icon.",
		use: "Click a card — its own picture already shows you the shape — to open that shell full-screen, then press [ ] h f to hide and show a rail or bar.",
		goal: "Recognise, from the pictures alone, which chrome arrangement fits a given app, and see that one grid produces all ten shapes.",
		hard: "2/5 — the ten shapes are now visually distinct at a glance; a first-time visitor still needs one line to learn what \"chrome\" means.",
		better: "A short hover-scrub of the keyboard rail-toggle on one card would show the hide/show behaviour without a click.",
		numbers: "The alternative: 1,289px → 4,038px at 3440. What was kept: 1,289px → 1,989px, the honest cost of ten real stills.",
		visual: "The ten cards changed from a generic icon to a real screenshot of that exact shell, so a reader can tell left-rail from canvas-centre from nested-columns before clicking any of them.",
		counts: "4 fixed · 0 proposed — including a doc page that 404'd outright, and four readme links that left the app for raw markdown." },

	{ slug: "decks", title: "Decks", verdict: BACK,
		tried: "The owner's 3-column card, one row per cut: title and intro left, a real slide still centre, the measured widths right.",
		why: "Page height rose 33% at 1280 and 50% at 3440 for identical width used, and rows of differing natural height visibly overlapped each other at 3440 even after fixing an image-height bug that first blew 3440 up to 12,537px. No compensating gain on a menu of nine choices, so it went back — diff-checked byte for byte against a pre-edit copy.",
		what: "A gallery of nine real screenshots of presentational layouts, each one a different way to cut a screen into regions.",
		use: "Click any card to open that cut full-screen, then press the right or left arrow key to step to the next one without going back to the gallery.",
		goal: "Leave knowing which of five content kinds — statement, stage, wall, notes, list — belongs in which shaped region.",
		hard: "2/5 — the card now shows the real slide with its own ratio label baked into the picture.",
		better: "A \"try both\" toggle on the Persistent and Swap cards, so that specific comparison is felt in one click instead of two page visits.",
		numbers: "Width used 98.6% → 79.6% — and the drop is the fix, not a loss. An under-filled auto-fill grid was reaching out to 3,390px behind a group holding one card; each group is now capped to its own card count, so up to 2,667px of dead space — 78% of a 3440 screen — went to zero.",
		visual: "Every card's picture stopped being a colour-toned rectangle standing in for a ratio and became a real screenshot of the actual slide, ratio label and all.",
		counts: "3 fixed · 1 proposed — make core's grouped card wall render one grid per group, so every other grouped wall on the site gets that 2,667px fix for free." },

	{ slug: "screens", title: "Screens", verdict: BACK,
		tried: "The owner's 3-column card, rebuilt as one full-width row per demo.",
		why: "It roughly doubled the column's own content height — 695px → 1,439px at 1280, 856px → 1,747px at 3440 — while width used and dead space stayed identical. The pattern's own strength did not apply either: every demo here is one inert diagram and every readout is one sentence. Doubling the scroll for zero layout gain fails the test, so the useful half was kept and shrunk to fit the existing wall.",
		what: "A landing page of eight demo cards, each a tiny diagram of one way a click can reshape the screen, now labelled with the actual number it measured.",
		use: "Click any of the eight cards — each opens a real page and shows the effect happening.",
		goal: "Leave knowing the two-word vocabulary — replace versus join — and which of the eight patterns fits a problem you actually have.",
		hard: "2/5 — the diagrams are self-explanatory once you have clicked one, and the new number line answers \"does this actually hold up?\" without a click.",
		better: "A hover state that animates the hop a card represents, in place, would remove the last reason to click through blind.",
		numbers: "The alternative: 856px → 1,747px at 3440. What was kept: 856px → 979px, one added line of real information per card.",
		visual: "Each card gained a fourth line — the concrete number that demo actually measured — pulled out from behind the readme link and onto the card itself.",
		counts: "3 fixed · 0 proposed" },

	{ slug: "vary", title: "Vary", verdict: BACK,
		tried: "An index of indexes — showing all fifteen real variation pages grouped under four headings, instead of drilling through four abstract names.",
		why: "It cut one click, but grew the column's own height 61% at 3440 and 29% at 1280 without fixing the actual defect: icon-only cards, now four times as many. The 3-column card was not rebuilt, because five reviewers had already disproved it for a wall of children, and the reviewer said so in one line instead of spending the budget re-proving it.",
		what: "Four small labs, each a real tree of column-page variations under one question — the scrollbar situation, background hierarchy, child placement, and four complete column looks.",
		use: "Click a lab card — now a real screenshot of what that lab actually looks like — to open it as a new column, then click through its own real variation pages.",
		goal: "Leave knowing which concrete choice is right for a real page, proven by a real working example rather than a description of one.",
		hard: "2/5 — the four cards now read as actual interface stills; still a 2 because the name \"Colstyles\" gives no hint it means colour-and-width combinations until you open it.",
		better: "Add a one-word hint under Colstyles' title (\"4 looks × 2 widths\") so the permutation is visible before the click, not only after it.",
		numbers: "The alternative: 852px → 1,373px at 3440, so the page no longer fit one screen where it used to. What was kept: 852px → 852px, because the framework needs no extra room once an icon and a description become a thumbnail.",
		visual: "The four lab cards now show a real screenshot of what clicking each one reveals, on a page whose entire subject is visual comparison and which was showing none of it.",
		counts: "2 fixed · 0 proposed — including the colour-by-layout permutation the owner asked for tonight, which existed here in name only and is now real: four looks crossed against two real column widths." },

	{ slug: "mag", title: "Magazine", verdict: BACK,
		tried: "A paging-vocabulary surface change: dropping the cover's bespoke recede so a click into the issue was governed by core's plain default takeover instead of custom CSS.",
		why: "Measured, not assumed. At 1280 the un-shrinking cover forced the row to auto-scroll 421px to reveal the contents column, decapitating the masthead mid-word — the T and the Co sliced clean off at the viewport edge. At 3440 the same scroll ate 504px of the poster's own inset. The bespoke recede turned out to be a necessary override, confirmed by breaking the page without it.",
		what: "A poster cover for a small magazine called The Column, Issue 01, that now also shows the six real pieces waiting inside it.",
		use: "Click \"Open the issue\" to launch the contents beside it, then open any piece — or read its title in the new list on the cover before you commit to clicking at all.",
		goal: "Trust that six worthwhile, real pieces are actually inside, then get into the contents and start reading.",
		hard: "1/5 — one huge headline, one line of copy, one button; the new list of titles is something you read, not something you have to operate.",
		better: "Let each coverline jump straight to its own article, so a returning reader can skip the contents column entirely.",
		numbers: "The cover is full-width, not a capped column, so it never had the site-wide dead-space problem. The added coverlines introduce no scrollbar from 1280×720 through 3440×1440, measured directly.",
		visual: "The cover's silence about what is inside it became a real, visible list: the issue's six actual article titles, numbered in the accent colour the contents page already uses.",
		persists: "Which articles you have read. Proved live: two articles moved the count from 0 of 6 to 2 of 6, the green mark appeared, both survived a hard reload, and Reset cleared them.",
		counts: "3 fixed · 0 proposed — including /imagine/mag/doc/ 404ing outright, because \"doc\" was never named in the cover's children." },

	{ slug: "platform", title: "Platform", verdict: BACK,
		tried: "The approved tile wall — the nine research-verdict entries as a card grid instead of a bullet list.",
		why: "A Miller-columns pane does not widen with the browser, so nine cards fit two per row at 1280 and four at 3440. The card grid measured taller than the plain list at every width — 20% at 1280, 9% at 3440 — while width used and dead space never moved either way. The list stayed, with the counts bolded so they still read as numbers.",
		what: "A design-lab hub for a hypothetical community platform, showing the real pages first and the research paper trail behind them second.",
		use: "Read two short sentences, then click straight into whichever real page interests you, from a wall of cards that now appears immediately instead of after two screens of prose.",
		goal: "Leave at the one working demo, or with the research and decisions behind it.",
		hard: "2/5 — the real pages are visible within about 450 pixels of scrolling and no page is named twice; the research log further down is still dense, but it now reads as backing material.",
		better: "Give the one truly interactive card a still of its own, so it stands out from the seven reference cards.",
		numbers: "The alternative: 2,389px → 2,601px at 3440 and 2,254px → 2,714px at 1280, taller at every width. What was kept moved the wall up rather than reshaping it.",
		visual: "The real page wall moved from the very bottom of the page to right after the opening two sentences, so what used to be a wall of text is something you can see and click within one screen.",
		persists: "Not on the landing page. Two demos one level down keep a run, and both show the amber mark and a Reset.",
		counts: "5 fixed · 0 proposed — six duplicate text links removed, where the same page was named three times on one screen." },

	{ slug: "gallery", title: "Gallery", verdict: BACK,
		tried: "A paging-vocabulary surface swap — the framework's own tabs as a vertical rail over the three sections, in place of the tile wall.",
		why: "No width or height gain at either size, and a real visual regression: tabs mount each child through its own full render, which draws that child's column chrome — so picking a tab nested a second title bar inside the first, floating at roughly 460px inside a 1,152px column. The tile wall, which this realm's own catalogue names as the textbook case for this shape, stayed.",
		what: "A directory of three ways to browse the things the framework can be made of, and now each of the three is shown by a real picture of what it contains.",
		use: "Click a card — Lists' own card wall, the live import-cost readout, or the card-restyle comparison — and it opens as a new column to the right.",
		goal: "Find a specific page, layout or demo by walking the taxonomy, or see what borrowing a page costs and what it looks like before you commit to opening it.",
		hard: "1/5 — the three cards now show their own content, so a stranger can tell Lists from Answers from Cards before reading a word.",
		better: "Carry the same treatment a layer deeper, to each of the 42 individual pages inside the six lists — which needs a pre-rendered sprite sheet, not a live import.",
		numbers: "Unchanged either way — 33.5% width used, the same column height. The real change here is density, not extent.",
		visual: "The three top-level cards and Lists' own six-card index all traded an icon and a caption for a real picture of what is actually inside.",
		counts: "2 fixed · 0 proposed — including Lists' own index, which had no card wall at all and fell through to the framework's bare default link rail." },

	{ slug: "feeds", title: "Feeds", verdict: BACK,
		tried: "A paging-vocabulary surface change: expand — an accordion growing in place — instead of the tile wall's launch into a new column.",
		why: "Built for real and measured. Collapsed, it hid all three of the new stills behind a bare icon-and-title row; opened, one child alone stood 480px tall against 407px for all three shown together. It also breaks the paging vocabulary's own documented rule for when NOT to use expand — wrong when the thing you opened has children of its own, because an expanded panel has no url — which is true of all three children here.",
		what: "Three small labs of content this repo does not author — a YouTube embed, one dataset drawn three ways, a live weather API — each now shown by a real photo of itself.",
		use: "Click any of the three real-looking cards; on Video, click the play button to swap the poster for the real embed.",
		goal: "Leave knowing three concrete ways to embed a video safely, render one dataset three ways from one filter, and poll a public API without ever going blank.",
		hard: "1/5 — each card now shows the actual thing at a glance, not a category label.",
		better: "The data wall's own cards, one level in, are still text-only; a few named building photos there would read even faster.",
		numbers: "340.8px → 406.9px on the column's own body — the honest cost of three 16:10 thumbnails replacing two lines of text.",
		visual: "Each of the three cards traded a generic glyph for a real screenshot of the thing itself: Steve Jobs mid-talk at the podium, the real twenty-building card wall, the real five-city weather board with real temperatures.",
		counts: "1 fixed · 0 proposed" },

	{ slug: "cms", title: "CMS", verdict: BACK,
		tried: "Merging the landing page's two columns — the card wall, and the guide column beside it — into one.",
		why: "At 3440 the merge gave back the exact 1,856px dead band the two-column split exists to fill (width used fell from 70.1% to 46.0%) and made the column 26% taller, because the guide prose stacked under the wall instead of running beside it. At 1280 the two were within 11px of each other. The earlier fix earns its keep at wide viewports, confirmed with real numbers instead of taken on faith.",
		what: "A demo content-editing system — open a markdown file in a form, edit it, save, and the file on disk changes.",
		use: "Click one of five cards, now real screenshots of the five pages; Edit's thumb, a split source and preview pane, makes it obvious which one writes.",
		goal: "Leave believing no backend was needed — a markdown file plus the dev socket already is a CMS.",
		hard: "1/5 — every card now shows what it actually looks like, so the five choices read as five different things at a glance.",
		better: "A sixth still, of the CMS's own landing page, for a reader arriving from outside.",
		numbers: "The alternative: width used 70.1% → 46.0% and the column 794px → 1,002px. What was kept cost 25px of height for five real thumbnails.",
		visual: "The five landing cards went from generic icons — and one bare title with no icon at all — to real screenshots of the five actual pages.",
		persists: "An in-progress draft. Its bespoke draft note and one-click Discard were replaced by the site's shared mark and its two-press Reset, wired to the page's own discard so it still restores in place with no reload.",
		counts: "2 fixed · 1 proposed — including the promise-cycle crash a cold deep url has been throwing, fixed by copying the four-line guard that already exists elsewhere." },

	{ slug: "blogx", title: "Blogx", verdict: NONE,
		tried: "Nothing — and this one is deliberate. The reviewer declined to rebuild a shape five colleagues had already disproved for a wall of same-shaped children, cited them in one line, and spent the whole build on the stills instead.",
		why: "This is the discipline the night was supposed to produce, and it belongs on the page as much as any keep: the eighteenth reviewer read the first seventeen and did not spend 60,000 tokens re-proving a known result. What it built instead — a real still on each of eight cards — cost 8% of height at 3440 and made the page's whole point legible without eight clicks.",
		what: "A lab that renders the same eight fake blog posts through eight complete, real blog-front layouts, so the only variable on screen is the layout itself.",
		use: "Click a card on the landing wall — each one is now a real screenshot of that shell — then click a post or the floor strip along the bottom to compare shells.",
		goal: "Leave knowing which of the eight shapes to actually build a real blog on, with the numbers to back the choice.",
		hard: "2/5 — the eight cards now show what they claim before you click; the only thing left to learn is the ranked reasoning in the readme.",
		better: "Formalise the click from the wall into a shell as the paging vocabulary's own takeover word, instead of the custom escape it uses today.",
		numbers: "774px → 838px at 3440, 736px → 833px at 1280 — an honest 8–13% of height bought with eight real screenshots. Width used stays 100%: this realm already fixed its own dead space before tonight.",
		visual: "Eight identical-looking icon-and-caption cards became eight real screenshots — a hero-and-wall magazine front, a shut-rail title deck, a nested Finder-style archive and a four-column side-by-side reader are visibly different things now.",
		counts: "1 fixed · 1 proposed" },
];

/* `--muted` is a PERCENTAGE, not a colour — framework.css feeds it to color-mix inside
   the `.muted` class — so a faded badge asks for the CLASS and never for `var(--muted)`. */
const badge = (text, loud) => span.c("rethink-badge").ac(loud && "on").ac(!loud && "muted").append(() => span(text));

/* ⚠ The picture is ~680px wide here and the page it shows is 1280px, so it reads as a
     SHAPE, not as text. The whole shot is therefore a link to its own full-size jpg — a
     file extension, which the router deliberately does not intercept, so it opens in a
     new tab instead of dumping the reader out of the app. */
const shot = (r, when, label) => figure.c("rethink-shot", () => {
	a.c("rethink-shot-link", () => {
		img().attr("src", shots(r.slug) + when + "-1280.jpg").attr("loading", "lazy")
			.attr("alt", r.title + " at 1280, " + label);
	}).attr("href", shots(r.slug) + when + "-1280.jpg").attr("target", "_blank").attr("rel", "noopener");
	figcaption(() => span.c("muted", label + " — click for full size"));
});

const readout = (label, words) => div.c("rethink-readout", () => {
	span.c("rethink-label", label);
	span(words);
});

/* ONE CARD PER REALM: a title strip, the two pictures across the full width, then the
   words in three columns beneath them.

   ⚠ WHY THIS IS NOT THE OWNER'S 3-COLUMN CARD, on the page that reports it winning.
     The rule this page found is "use that shape when the centre column is ALIVE". This
     card's centre would be two static screenshots, so the rule says no — and the numbers
     agreed when it was tried: this column is 1,504px wide at 3440 (it shares the row with
     /imagine/review/), so three tracks left the pictures 370px each, a third of the size
     they are here. Full-width pictures, then three columns of text, keeps every line
     inside the measure AND keeps the shots at ~680px. Measured 2026-09-05.

   ⚠ The container query lives on the WRAPPER (`.rethink-cards`), never on `.rethink-card`
     itself — a container query can never restyle its own container, and it fails SILENTLY.
     Two reviewers hit exactly this trap tonight, on team/ and game/, and each lost a build
     cycle to it. See rethink.css. */
const card = r => div.c("rethink-card").append(() => {

	div.c("rethink-head", () => {
		h3(() => a(r.title).attr("href", "/imagine/" + r.slug + "/")).style({ margin: 0 });
		if (r.verdict === KEPT) badge("kept the new layout", true);
		else if (r.verdict === BACK) badge("built it, put it back", false);
		else badge("declined, with a reason", false);
		span.c("rethink-links", () => {
			a("the reviewer's log").attr("href", log(r.slug));
			span.c("muted", " · ");
			a("open the realm").attr("href", "/imagine/" + r.slug + "/");
		});
	});

	div.c("rethink-shots", () => { shot(r, "before", "before"); shot(r, "after", "after"); });

	div.c("rethink-col", () => {
		readout("Tried", r.tried);
		readout("Why", r.why);
	});

	div.c("rethink-col", () => {
		readout("What it is", r.what);
		readout("How you use it", r.use);
		readout("Its goal", r.goal);
		readout("How hard", r.hard);
		readout("Better still", r.better);
	});

	div.c("rethink-col", () => {
		readout("Numbers", r.numbers);
		readout("More visual", r.visual);
		// Thirteen of the eighteen realms remember nothing, and "Remembers: nothing" on
		// thirteen cards is noise. The row appears only where there is something to say.
		if (r.persists) readout("Remembers", r.persists);
		readout("Count", r.counts);
	});
});

const wall = list => div.c("rethink-cards", () => list.forEach(card));

export default new Page({
	meta: import.meta,
	title: "Rethink",
	description: "Eighteen realms reviewed a second time — each one built a real alternative layout, measured it, and kept it or put it back.",
	icon: "swap_horiz",
	width: "fill",

	content(){
		md(`**Yesterday every page under /imagine/ was opened cold and asked one question: can you say what this is for in ten seconds? [That pass](/imagine/review/) fixed 55 things and all eighteen realms passed. Tonight eighteen reviewers went back with a harder question — is this the best SHAPE this page could have? — and none of them was allowed to just think about it.** Each one had to actually build an alternative layout on its realm's landing page, shoot it before and after at 1280 and 3440, measure the width used, the dead space, the page's own height and the three layout invariants, then read its five plain sentences again — and keep the new layout only if it won on both the numbers and the sentences.

**Seven kept what they built. Ten built it, measured it, and put it back. One read the first seventeen results and declined to re-prove a known answer.** Every one of the seven keeps is the same shape: the owner's three-column card, a title and controls on the left, the thing itself in the centre, readouts on the right. Every one of the ten reverts is the same page: a landing page that is a menu of children, where that shape multiplied the height by anything from 1.5× to 5× and never bought a single pixel of width.

**How to read the cards below.** Each card carries the before and after screenshots at 1280 side by side — click either one for full size — and under them, in three columns: the alternative that was tried and why it was kept or put back, the five sentences as the reviewer wrote them **after** the change, and the numbers that decided it. The seven keeps come first, then the eleven that did not, and the reason flips with them.

**This page is not itself built as a three-column card, and that is deliberate.** The rule below says to reach for that shape when the centre column is *alive*; two static screenshots are not, and when it was tried here the numbers said the same thing — this column shares its row with [yesterday's review](/imagine/review/), so it is 1,504px wide at 3440, and three tracks left the pictures 370px each instead of 680px. A page that reports a rule and then breaks it is the exact defect [yesterday's pass](/imagine/review/) found on three realms.`);

		h2("Seven kept the layout they built");
		md("All seven are the three-column card, and all seven landing pages have the same thing in common: **the centre column is alive.** A drag-and-drop board, a video player, a 3D stage, two live sockets, a game's own run. There are readouts worth putting beside those, and they were not already visible in the middle.");
		wall(REALMS.filter(r => r.verdict === KEPT));

		h2("Ten put it back, and one declined to try");
		md("Every one of the ten reverts failed the same way — **the height went up and the width never moved** — and the reason is structural: under the columns host a column's width comes from its width word, so nothing you draw inside it can claim a pixel more. The eleventh, [Blogx](/imagine/blogx/), read the other ten results and refused to spend its budget re-proving them, which is the right answer and belongs here beside them. What survived on almost every one of these pages was the smaller change: a real screenshot in place of an icon.");
		wall(REALMS.filter(r => r.verdict !== KEPT));

		h2("What made pages better");

		md(`Five things came up over and over, across eighteen agents who never spoke to each other.

**1. The three-column card wins exactly where the centre column is alive — and nowhere else.** Seven realms built it and kept it; ten built it and reverted it; the split between them is completely clean. [YouTube](/imagine/youtube/) is the clearest keep: one 34em control stack became controls on one side and readouts on the other, and the tallest column fell from 1,110px to 859px, which finally let the panel fit its own box without an internal scrollbar. [Team](/imagine/team/) is the second: its four kanban lanes had stretched to about 640px each at 3440, which is mostly whitespace around two-word task titles, and the card's centre track brought them back to a real 410–460px while the live counters moved out of a footnote nobody scrolled to. The rule the night produced is one sentence long: **put a thing in the middle that is doing something, or do not use this shape.**

**2. A real still beats an icon, and it usually costs nothing.** Nine realms replaced a card's icon with a screenshot of the actual thing, and it was the single most repeated improvement of the night. [Design](/imagine/design/) is the surprising one — the page got *shorter*, 852px to 734px at 3440, because the framework drops a card's two-line description as soon as it has a thumbnail, so the picture arrives free. [Blogx](/imagine/blogx/) is the purest: eight blog shells whose entire subject is what a layout looks like, presented as eight identical icon-and-caption rows, so a stranger could not tell a magazine front from a rail-driven archive without opening all eight. It cost 8% of height and removed eight clicks.

**3. Height was the whole price, and width never moved — because the number everyone reaches for is measuring the wrong thing.** On twelve of the eighteen realms, "width used at 3440" and "dead space at 3440" read *identically* before and after, because both are properties of the columns row, not of the page inside it. [Shells](/imagine/shells/) tripled and a half its height (1,289px to 4,038px) with those two numbers frozen; [Design](/imagine/design/) multiplied its own by six with the same two frozen. The measurement that actually decided every single verdict was the column's own content height, read together with the five plain sentences. [Generated](/imagine/generated/) is the honest version of this: it kept its new layout while reporting that none of its numbers moved, and said exactly why rather than claiming a win it had not measured.

**4. A click that moves a lot is a click the reader has to re-read.** This is the owner's own note tonight, and two realms proved it by breaking themselves. [Magazine](/imagine/mag/) dropped its bespoke cover recede for core's plain takeover, and at 1280 the row auto-scrolled 421px to reveal the contents — slicing the masthead mid-word, with the T and the Co cut off at the viewport edge. [Feeds](/imagine/feeds/) tried an accordion in place of opening a column, and found it violated the paging vocabulary's own rule: an expanded panel has no url, so it is wrong the moment the thing you opened has children of its own. Both went back. The bounded, predictable move won both times.

**5. Driving the page found what reading it could not.** Five realms turned up bugs that no amount of rereading would have caught, because they only exist while something is happening. [Scenes](/imagine/scenes/) had a 3D camera whose field of view widened with screen width alone, so the five doors shrank into the middle third of an ultrawide canvas — invisible to every DOM measurement ever taken of that page, and now fixed from 33% of the frame to 63%. [YouTube](/imagine/youtube/) had a method named \`card()\` quietly shadowing core's own \`nav().card\` field, which threw the instant the page was given a real preview. [Decks](/imagine/decks/) had up to 2,667px of dead space — 78% of a 3440 screen — hiding behind an under-filled grid; [Research](/imagine/research/) had a disclosure that grew a card 5,412px in one click; [Magazine](/imagine/mag/) had a whole doc directory 404ing because one word was missing from a children list.`);

		h2("What this leaves");
		md(`The seven-for-seven and zero-for-ten split is strong enough to be a rule, and it is written into [the layout system](/imagine/layouts/) as one: reach for the three-column card when the centre is alive, reach for the [approved tile wall](/imagine/design/layout/approved/) when the page is a menu. The five proposals the reviewers could not apply themselves are in their logs, each with its diff — the largest is making core's grouped card wall render one grid per group, which would hand every grouped wall on the site the 2,667px fix Decks made locally.

Every reviewer's full log, with the measurements, the reverted code and the caveats, is under [the day's tasks](/framework/ai/2026-09-05/), and the run that dispatched them is [ux-rethink](/framework/ai/2026-09-05/ux-rethink/). [Yesterday's cold read](/imagine/review/) is the pass this one builds on, and [how this page was built](/imagine/review/rethink/readme/) — including why it does not use the shape it recommends — is beside it.`);
	},
});

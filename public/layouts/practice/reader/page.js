import { Page, div, a, span, p, h2, h3, article, aside, md } from "/app.js";
import Practice from "../Practice.js";
import Layout, { load, find } from "../../Layout.js";
import toc from "../../../framework/ext/toc/toc.js";
import { mount } from "/framework/ext/Ask/chat.js";

/* ── /layouts/practice/reader/ — a rail, an article, a margin ─────────────────
   LAYOUT, the five questions.

   1. CONTAINER. A page in `app.$pages` under `/layouts/`, so the page grid. The
      whole layout claims `wide`, because three columns of content can never live
      in `main`.
   2. SIZE. 329 · 1178 · 1751 · 3260. Three regions above 80rem, two above 48rem,
      one below — and the ARTICLE never grows past `--measure` at any of them.
   3. OWN LAYOUT. One grid: a `15rem` rail, an article between 30rem and the
      measure, and a margin clamped between 17rem and 38rem. Every track floored
      AND capped, and the two bounds do different jobs: the article's floor stops
      the margin squeezing it, the margin's ceiling keeps its stacked blocks about
      as tall as the article beside them. Above the point where all three tracks
      fit, the grid CENTRES rather than stretching — see the note below.
   4. REGIONS. Three, plus the fold.
   5. PREVIEW. The 1920 shot on `/layouts/practice/`.

   THE PROBLEM THIS ANSWERS. An article has a measure — about 40em, past which a
   line is tiring to read — so a 3440 screen hands a reading page 2,500px it is
   not allowed to spend on the text. The lazy answer is to leave it grey. This
   one spends it on three things a reader of THIS article actually wants beside
   them: where they are (a table of contents that stays put), what the words are
   describing (two real wire drawings), and the traps (three real notes).

   THE LAYOUT IT IS AN INSTANCE OF: `3-holy-grail`.
   THE APPROVED SHAPE: 2 (Docs three-region).

   ⚠ The table of contents is `ext/toc` — the site's own component, which ids the
     headings, builds the list and marks the one you are reading against `.pages`
     (the real scroller). Reusing it costs one CSS line, because `.toc` is
     `display: none` until a rule turns it on; writing a second one would have
     cost a scroll spy.                                                          */

export default new Page({
	meta: import.meta,
	title: "Reader",
	icon: "menu_book",
	description: "An article at the measure with a rail beside it — and on a wide screen the leftover spent on contents, figures and notes instead of left grey.",

	content(){
		const entry = Practice.find("Reader");
		mount({ app: this.app, url: this.url });

		div.c("std-practice std-practice-reader wide", () => {
			div.c("std-practice-rd-grid", () => {

				Practice.rail("Layouts");

				article.c("std-practice-article", () => {
					Practice.head(entry);
					body();
				});

				/* FOUR BLOCKS, and four is the count on purpose: the margin lays
				   them out 1, 2 or 4 across, and 4 divides all three. */
				aside.c("std-practice-margin", () => {
					div.c("std-practice-toc", () => { toc(); });
					figures();
					notes();
					wayout();
				});

				/* A ROW OF THE GRID, so the fold stands on the same axis as the
				   article it explains — and centres with it on a wide screen. */
				Practice.fold(entry, ANSWERS, POLISH);
			});
		});
	},
});

/* ── THE ARTICLE ── the layout standard's own story, in its own words. Every
   sentence here is this site's: `/layouts/readme.md` and
   `/layouts/doc/naming.md`. A layout filled with invented prose cannot be judged
   — the paragraph lengths, the heading count and the link density are all part
   of what makes a reading layout work or not. */
function body(){
	md("Every way a web page can divide its room, named and drawn. This is the reference the rest of this site points at when it wants to say what a layout *is*.");

	h2("An id is `N-name`");
	md("**The number is how many columns the layout has on the widest screen it is meant for.** Count the columns you see side by side on a desktop, not on your phone. If the count is not fixed at all — the layout names a column *width* and lets the room decide — the number is the letter `n`.");
	md("**The name says how the room is divided.** `sidebar` means one narrow column supports one wide one. `equal` means every column gets the same share. `wall` means the count follows the room. The name never mentions CSS.");

	h2("An id names the division of the room");
	md("That is the whole idea, so it is worth saying the other way round too: **a flex row and a grid that produce the same picture are the same layout.** If you screenshotted both and could not tell them apart, they have one id between them, and the difference — flex or grid — is a [tag](/layouts/tag/2-column-flex/).");
	md("Paint is a tag (`cards`, a background and padding on each column). Proportion is a tag (`golden`, 61.8 / 38.2). Technique is a tag. Which side the sidebar sits on is a tag. Whether there is a gap is a tag.");
	md("This is why there is no id called `3-cards`, even though that is a phrase people say. Cards is paint. A three-column row of cards is [`3-equal`](/layouts/3-equal/) wearing the [`cards`](/layouts/tag/cards/) tag — and because it is a tag, that one page shows you *every* layout that can be painted as cards. **A word that describes many layouts is worth more than a word that describes one.**");

	h2("Are two layouts the same one?");
	md("Ask these three, in order. Stop at the first *no*.");
	md("1. **Do they have the same number of columns at their widest?** Different numbers, different ids.\n2. **Is the room divided the same way?** Equal shares, or a narrow column beside a wide one, or one column per fitted width — this is the question the name answers.\n3. **Would a screenshot of both, with the content removed, look the same?** If yes, they are one layout and the difference you were thinking of is a tag.");
	md("The one exception is behaviour a screenshot cannot show — whether a column scrolls on its own, whether a header sticks. Those are tags too, because they do not change how the room is divided.");

	h2("Adding a layout");
	md("Everything under [`/layouts/`](/layouts/) is drawn from one file, `layouts.json`. There is no page to write. Check it is not already there, name it in one word that survives being explained to somebody who has never built a web page, and add one object to the file. [The rules in full](/layouts/doc/naming/).");

	h2("What 47 real sites do");
	md("The corpus next door photographed 47 real sites and tagged each one with the id it uses. [`1-bands`](/layouts/1-bands/) is the second commonest whole-page layout — and the only arrangement other than a plain flow that a phone leaves alone: 8 of those 11 sites are still bands at 400px. [`n-wall`](/layouts/n-wall/) is never a page at all; it is what you put inside one. [The count, live](/websites/patterns/).");
}

/* ── THE MARGIN ── what the leftover on a wide screen is spent on. Not
   decoration: a reader of this article wants the picture beside the words, and
   the traps beside the rule that has them. THE MARGIN TAKES THE WHOLE LEFTOVER
   (`minmax(17rem, 1fr)`) and lays these four blocks out 1, 2 or 4 across, so
   there is no grey column anywhere on this page at any width — which is the
   difference between a third region that earns its room and one that is just
   where the room ran out.
   ⚠ `toc-skip` on every block but the table of contents itself. `ext/toc` scans
     every `h2`/`h3` inside the page, so without it the margin's own headings
     would appear in the article's contents as though they were its sections. */
function figures(){
	div.c("std-practice-margin-block toc-skip", () => {
		h3.c("std-practice-margin-label", "Four of the twelve");
		p.c("std-practice-margin-say", "The drawings are real flex and real grid at a real viewport width, shrunk to fit — so what you see is what the CSS does. The last one is this page's own layout.");

		div.c("std-practice-figs", $figs => {
			load().then(data => {
				$figs.append(() => {
					["2-sidebar", "n-wall", "1-bands", "3-holy-grail"].forEach(id => {
						const found = find(data, id);
						if (found) Layout.thumb(found);
					});
				});
			});
		});
	});
}

function notes(){
	div.c("std-practice-margin-block toc-skip", () => {
		h3.c("std-practice-margin-label", "Watch out");
		NOTES.forEach(([title, text]) => {
			div.c("std-practice-note-box", () => {
				span.c("std-practice-note-title", title);
				p.c("std-practice-note-body", text);
			});
		});
	});
}

function wayout(){
	div.c("std-practice-margin-block toc-skip", () => {
		h3.c("std-practice-margin-label", "Where next");
		p.c("std-practice-margin-say", "This article is the short version. The encyclopedia draws every layout at three widths and says what each becomes on a phone.");
		a.c("std-practice-margin-go").href("/layouts/").append(() => { span("All twelve, drawn"); });
		a.c("std-practice-margin-go").href("/layouts/doc/naming/").append(() => { span("The rules in full"); });
		a.c("std-practice-margin-go").href("/websites/patterns/").append(() => { span("What 47 real sites do"); });
	});
}

/* Real notes, from `/layouts/readme.md`'s own "Watch out" list. */
const NOTES = [
	["Never type a count into a sentence", "The pages count the entries live. Three typed “five layouts” went wrong the day `4-equal` was deleted."],
	["None of these names is a CSS class", "On purpose — a name is a name for a picture, and a picture has a dozen builds."],
	["A wire cannot draw motion", "Nor a hidden column, nor an overlap — and it should not try. The honest shape to draw instead is in `doc/wire.md`."],
	["A drawing's height ceiling is a fold budget", "In `vh`, never a constant. As a flat `22rem` the three-widths row used half of a 3440 screen."],
	["The drawing pins `font-size: 16px`", "The site's body size is a viewport clamp, so without the pin a `16em` rail would measure 288px inside a drawing labelled 1920."],
];

const ANSWERS = [
	["Layout", "One grid on the `wide` track: a 15rem rail, the article at `--measure`, and a margin clamped between 17rem and 38rem. Below 80rem the margin folds under the article and keeps the rail; below 48rem everything stacks and the rail becomes a strip. On a screen wider than the three tracks need, the grid centres instead of stretching — 792px of margin on each side at 3440, which a reader reads as a page margin. The alternative was measured and was worse: spending that room on a four-column margin left 905px and 1,483px of dead ground inside it."],
	["Navigation", "Two navigations that never compete. The rail is the SITE — same eight links, same place, at every width. The table of contents is the ARTICLE, it sticks as you scroll, and it marks the section you are reading. Neither moves when you use the other."],
	["Structure", "Page → one grid → three regions: the rail, the article, the margin. The margin holds three things in one column — contents, figures, notes — rather than three regions of its own."],
	["Visual hierarchy", "The article is loudest: full-size type on the page's own floor, at the measure, with the biggest heading on the page at its top. The margin is deliberately quieter — 0.9em, `--subtle` labels — because a note that shouts beside a paragraph wins an argument it should have lost."],
	["Iceberg UX", "The contents list is the whole article in eight words; a figure is a layout in one picture; a note is a trap in one line. Each of them opens to the real thing, and the reasoning for the page itself is in this fold."],
	["Color", "One ground. The article, the rail and the margin all sit on `--surface` — there is no second background anywhere on this page, which is why there is no padding on the rail or the margin either. The only paint is the current contents link, `--prim-ink` with a `--prim` edge, and the figure frames' `--line` hairline. The measured ratios are in this task's log."],
	["Focus", "The article's title. It is the biggest type on the page, it sits at the top of the widest column, and nothing beside it is louder."],
	["Interaction", "Read, and click a contents link to jump. The contents marks itself as you scroll. The figures and the notes are links out. Nothing here opens, closes or rearranges — a reading page that rearranges is a reading page you have to re-scan."],
	["Purpose and outcome", "A reader leaves knowing what a layout id is and how to tell two layouts apart — and having seen a wide screen's leftover spent on something rather than left grey."],
];

const POLISH = "Eight checks at four widths said 8 of 8 — and a critic then swept every 80px from 400 to 3440 and measured six widths in full, including the two a four-width sweep skips. What it found and what was done is in [the critic's log](/framework/ai/2026-09-17/practice-critic/).";

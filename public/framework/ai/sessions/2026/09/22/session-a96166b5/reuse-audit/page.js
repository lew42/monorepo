import { Page, p, b, md, div, a } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid, prose width.
   2 SIZE       prose at --measure; the two tables get `.wide` to use the gutter.
   3 OWN LAYOUT one screen: the answer in a sentence, three numbers, then the two
                places the duplication actually is. Everything else is a click down
                into the task log, which holds all 112 module paragraphs.
   4 REGIONS    none.  5 PREVIEW default card. */

export default new Page({
	meta: import.meta,
	title: "Rewritten, or reused?",
	description: "Fourteen minions read 108 modules. The features you named are already merged onto one implementation each. The real duplication is 739 dead files and one card shape written 27 times.",
	icon: "content_copy",

	content(){

		p(b("You asked this before — on 18 September, as the overlap study."), " Since then four of its five merges have landed, so this pass started where that one stopped and went wider: an inventory of all 822 modules on the site, then fourteen Sonnet minions reading the 108 that could plausibly hold a feature. The short answer is better than you expected. ", b("The things you named by name — drag and drop, resize handles — have already been consolidated,"), " and the readmes say which day each merge landed. The duplication that is left is in two places, and neither of them is a component.");

		div.c("surface pad flex v gap-25", () => {
			p.c("h4", "the three numbers");
			md("- **14,354 lines, in 739 files, are dead.** Twenty-six pages under `/imagine/` were moved elsewhere. Their `page.js` became a nine-line *This page moved* stub — and every other file behind that stub was left in place, byte for byte identical to the copy at the destination.\n- **27 places write their own card shape.** A CSS rule that sets its own background *and* its own padding *and* its own border, when `surface pad flex v gap` on a plain div already gives you exactly that with no rules at all.\n- **11 lines came out today.** One duplicate met the bar for reducing without asking you. Everything bigger is below, as a proposal.");
		});

		md("## 1 — The graveyard behind the moved pages\n\nThis is the biggest single thing on the site and it is not really a *reuse* problem — it is a move that finished halfway. `imagine/blogx/Blog.js` and `layouts/labs/blogx/Blog.js` are both 335 lines and the same bytes. So are the two `deck.js` files, the two `sections.js`, the two `Shell.js`, and the two `spacing/audit/data.js`. None of it is reachable: a stub declares no children, and nothing on this site crawls the filesystem. Every destination was checked and is complete — its own readme, its own `doc/`, its own sub-pages, and named in its parent's `children:`.").ac("wide");

		md("| Moved from | Moved to | Files left behind | Lines |\n|---|---|---|---|\n| `imagine/design/` *(and its 17 sub-studies)* | `framework/styles/system/studies/` | 630 | 4,502 |\n| `imagine/blogx/` | `/layouts/labs/blogx/` | 22 | 1,852 |\n| `imagine/layouts/` | `/layouts/` | 10 | 1,676 |\n| `imagine/decks/` | `/layouts/labs/decks/` | 25 | 1,554 |\n| `imagine/sections/` | `/layouts/labs/sections/` | 7 | 1,377 |\n| `imagine/shells/` | `/layouts/labs/shells/` | 25 | 1,189 |\n| `imagine/screens/` | `/layouts/labs/screens/` | 12 | 1,129 |\n| `imagine/mag/` | `/layouts/labs/mag/` | 8 | 1,075 |\n| | | **739** | **14,354** |").ac("wide");

		p(b("This one is yours to call, and it is the only thing on this page that is."), " Deleting 739 files is major surgery by the letter of ", b("CLAUDE.md"), " even though every one of them is tracked in git and nothing imports any of them. Say the word and it is one command; the nine-line stubs stay exactly where they are, so every old link keeps working.");

		md("## 2 — The card, written 27 times\n\nYou suspected this one and you were right. The framework already has two answers: four utility words on a div (`surface pad flex v gap`), and `preview_card()` in `core/Page`, which is the site's one real card component with 144 call sites. Beside those, 27 CSS rules across 22 files mint the shape again from scratch — 11 of them under `/imagine/`, 5 under `/layouts/`. The JS side is the same story: `ext/DesignTool` has **three** separate four-line `cards()` helpers, in `library/patterns.js`, `library/bad/traps.js` and `tests/cases.js`; `websites/Site.js` has its own `static card()` while `/layouts/browse/` one directory over correctly reuses core's `preview()`; and four `/imagine/` pages each hand-built the same three-column card with no shared component between them.\n\nThis is a proposal, not a fix. Most of the 27 have a stated reason in their own file, and a sweep across 22 files at once is exactly the kind of change that needs your eye on it.").ac("wide");

		md("## What was already fixed, and when\n\nWorth reading, because it is the direct answer to your question:\n\n- **Resize handles** — `ext/grip` is the one implementation. `core/Sidebar`, `layouts/shell/Shell.js`, `ext/drawer` and `dev/DevBar` all import it. The September study called `Shell.grab()` a byte-for-byte rewrite of `Sidebar.grab()`; a minion re-read both files today and each is now five lines handing callbacks to the shared gesture.\n- **Drag and drop** — `ext/Draggable`/`Sortable` is the one implementation. `ext/Panel`'s panel drag and `ux/Tree`'s row drag both *extend* it. Make's own drag model was lifted **into** `ux/Tree` on 17 September so the site would have one.\n- **Saving** — `core/Page.Store` is the one guarded `localStorage` wrapper; `ext/Saver`'s `LocalStorageSaver` now delegates to it rather than repeating the try/catch.\n- **Trees** — `ux/Tree` won, and its own compare page documents the three implementations that lost.").ac("wide");

		md("## The one thing reduced today\n\n`core/Section/Section.js` exported a `fits()` whose own comment admitted it was `core/Layout/rules.js`'s first rule with the reporting taken off, left behind because `core/Layout` was outside that task's write fence. One caller, one directory apart. `core/Layout/rules.js` now owns the single answer and its own width rule calls it, so the two can no longer disagree; Section imports it; eleven lines gone. Proven behind the reload hold, both pages loaded clean on a private port before it was released.").ac("wide");

		div.c("flex wrap gap", () => {
			a("the Section page, after").href("/framework/ai/2026-09-22/reuse-audit/shots/fits-section.png");
			a("the Layout page, after").href("/framework/ai/2026-09-22/reuse-audit/shots/fits-layout.png");
		});

		md("## Left deliberately alone\n\nSo you do not mistake these for oversights — each is a real duplicate with a real reason:\n\n- **Three ways to open a list near a trigger.** `ux/Menu` (a native `<details>`), `ext/Dropdown` (native `[popover]`, shows a current value) and `ux/Popover`'s `menu()` (arrow-key nav). Different cases; none of the three readmes names the other two, which is the only thing actually wrong here.\n- **Four append-log persistence contracts** — `imagine/importance`, `imagine/stream`, `imagine/cms/json` and `paging/make`. All four build on `ext/JSONL`'s transport and share no class; three of the four readmes say they know about each other.\n- **`mulberry32`, the five-line random-number function, copied into four files.** Every copy is commented and deliberate: sharing it would cross a tree boundary the framework does not want crossed.").ac("wide");

		md("## Documentation\n\nSixteen modules had no readme and now have one — most of `framework/ui/` (`alert`, `avatar`, `badge`, `crumbs`, `decision`, `dialog`, `kbd`, `menu`, `table`, `tooltip`, `words`, `accordion`), plus `DesignTool/library`, `DesignTool/tests`, `imagine/team` and `imagine/platform/workflows`. **Not one existing readme was found stale** — every readme on the site still matches its code.").ac("wide");

		md("*All 112 module paragraphs — what each module is, which features it implements itself, and the `file:line` of each — are in this task's own log, on the tab beside this one. The counts here are measured, not remembered: the inventory walker and the card census are re-runnable scripts, and every line count is `wc -l` on the file named.*").ac("muted");
	},
});

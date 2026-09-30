---
name: page
description: Invoke before making or reshaping ANY page, card or view the owner will look at — the whole job top-down: what kind of page, where it lives, how it's reached, its layout, its content and the order of that content. Umbrella over `new-page` (the mechanics), `layout` (sizing), `css` (styling) and `content` (words). Load it yourself instead of handing a page to a specialist agent: you keep the context.
---

# Page: from the top down

**Never destroy a viable version (the owner, 2026-09-29).** Before you restructure markup or CSS that works, keep v1 reachable: make the template a class, and make the new version a variant that extends it, so the owner can click back to v1. A rewrite that leaves nothing to compare against is a loss, even when v2 is better.

The owner, 2026-09-25: "creating content, creating pages, creating layouts: it's all the same
thing." Visual hierarchy is the thing that matters most: clean, simple, the right content in the
right order. Answer these in order, one line each, before you build.

1. **What is it, and who is it for?** One sentence. That sentence becomes the page's title or
   first line. If you can't write it, don't build yet.
2. **Where does it live, and how is it reached?** Its parent, its URL (route everything), its
   place in the navigation, and the mechanics — all in the `new-page` skill. **A child starts
   from its parent:** read what `create_page` hands back (its layout, visual hierarchy) first.
3. **Its properties:** title, icon, one-line description. The description is what its preview
   shows elsewhere, so make it self-evident.
4. **Layout: for the page and for every region or box on it, answer three questions, one line each.**
   *How wide is it?* Check 1280 and 3440; it should fill 3440 too (several columns, or navigation
   beside a centred main one).
   *Does it need padding?* A region gets `.pad`, a framed box (background, border or rounded
   corners) gets `.card`, and a deliberate no is marked `.bleed`. Padding is opted into where it
   is needed, never set as a default that other boxes must undo.
   *How does it meet its neighbours?* Look at the ground and border on each side; text needs room
   from every one of them, including a neighbour's edge.
   Then open the `layout` skill for the details. The trap: "full bleed" is for a strip or a band's
   paint; the content inside a bled container still gets `.pad`. The padding check runs by itself
   on landing; run it by hand with `node Server/padding-check.mjs <path> --base http://monorepo.localhost`
   (Git Bash needs `MSYS_NO_PATHCONV=1`).
5a. **The first thing on a page: what it is made of, its core concepts as linked icon tiles** (`ux/Content/Concepts`; one child page each: name, slug, icon).
5. **Content, in priority order, top to bottom.** What does the reader need first? Usually: what
   it is → its current state → what needs doing → what was done → detail. What's still open
   usually matters more than what's finished, so it goes first.
6. **Each piece in its best form** (the `content` skill): a number or a small data grid beats a
   sentence ("Delivered 8 · To do 5" reads at a glance); a list gets a filter (open / done) rather
   than two lists; a section gets a title that makes the whole section clear; a structure is
   shown, not described.

## Structured content: judgement, with examples (the owner, 2026-09-28)

Whenever content is made, a page is made for it; the page is the wrapper around what it renders.
The only test: **what is the best way to present THIS information?** None of what follows is
law: no fixed number of items, no fixed depth. Drawn live at
[/framework/ux/Content/structure/](/framework/ux/Content/structure/).

- **Hierarchy comes mostly from typography:** H1, then H2, then H3; section titles that say what
  each section is; about as many sections as the thing really has. Getting that right is an art,
  and it is not the first job of a documentation run.
- **The default move is a list of icon-item links, or a few small sections of familiar, concrete
  concepts.** For example, "Servex" over three icon cards (Servers, Agents, Cards) says more at a
  glance than a paragraph about them.
- **Background or not is each block's first choice.** A background brings padding, and none
  brings none. Options the reader picks between often read well on a background; a plain list of
  related links usually needs none. Don't box everything.
- **An outline often beats paragraphs.** Text that goes "first… then… also…" usually wants to be
  a nested list.
- **Weight, when one thing matters more.** A bigger icon card for the idea the eye should land
  on first, sorted to the top. Real system: [core/Page/weight](/framework/core/Page/weight/).
- **An icon isn't required.** It adds visual weight — reach for one when the concept needs to
  be spotted at a glance; a plain named topic link is enough for a quieter one.

| For example, you have… | Often reads best as |
|---|---|
| One big idea, a place to go | a large **icon card** |
| A few related things | a **section**: a title over icon cards |
| A few destinations to label | a **section** with a **background** |
| Things inside things | an **outline** |

Page weight, and a page with no wrapper of its own (`display: contents`), are proposals:
[doc/weight.md](/framework/ux/Content/structure/doc/weight.md).

## Cards: which one, when (cards-and-logs, 2026-09-30)

- A card is a mini page: `.card` (framework.css); the rules live at [/framework/core/Page/card/](/framework/core/Page/card/).
- Grounds: default (surface), `.card-gray` (wash), `.card-dark`, `.card-prim` (the strong hue). A plain card nested in a plain card switches to gray on its own.
- Nesting: at most 3 boxes. From level 4 down, use a heading with its content at the same indentation, never a 4th border ([nesting](/framework/core/Page/card/nesting/)).
- Headers: none · a heading · icon + title · a header bar with a ··· menu (`.card-head`, `.card-menu-btn`) · a clickable whole card (an `a.card`) · expandable (`details.card`).
- A list of clickable cards is a list of routed pages. Each card's data is one line in the nearest page.jsonl, with a virtual URL through the parent's route(); a folder is made only when a card grows ([mini pages](/framework/core/Page/card/mini-pages/)).
- A log is nested cards: `Logger.attach(obj)` gives it `this.log()`, and LogView renders the result ([log](/framework/core/Page/card/log/)).

## A page has an inbox, for coordination only (page-inbox, 2026-09-30)

A page's inbox is for necessary coordination, never chat. `drop(path, text)` sends a note to the mastermind coordinating that module (whoever holds `claim_topic` on its path), or else leaves it in the page's AI tab until someone clears it. Notes are appended lines in the page's own `page.jsonl` (the owner: "append to that module's page.jsonl and it just goes into its inbox"), so a card, whose log is page.jsonl, has one too. Name systems by reference (`#Page`) once ext/Mention lands.

## Two tests for every element

Run them on every item, label and button before you land:

- **Self-evident:** would the owner know what it is and what it does without reading more? "When
  I respond on that page" as a task title fails; "Live card: replying hid the usage bars" passes.
- **Necessary:** does it earn its space here? If not, move it (a toolbar, one click down) or
  remove it. A 50px button alone on a 2000px row is wasted space; a line that repeats what the
  grid beside it already shows ("8 of 13 done") goes.

Then look at the whole page at 1920 and 3440, reached the way the owner reaches it, and ask the
two questions again.

## Which kind of page is this?

Pick a type from [`/framework/ai/audits/paging/types.json`](/framework/ai/audits/paging/), most-used first (`uses`). Each type is a template: its `template` field names the Page words that build it, so no page-specific CSS. If none fits, propose a new type. Every page made with a type bumps its `uses` by one (`bump(id)` in `types.js`: read the file, uses + 1, write), so the common types rise to the top.

Creating a new page needs:
1. A line in the parent's `children:` (no line, no page).
2. Its url, routed: every view a click reaches has one.
3. A layout word from the table above, not a new one.
4. Content in order: what it is, then state, then what to do, then detail.
5. A `doc/` or `readme.md`. Per-page saved column widths are NOT built yet: see /framework/ai/audits/paging/.

## Content kinds (reach for a module before writing markup)

First ask: what content, and how much? A little or a lot; images, video, navigation, sub-pages. Then pick:

| need | use | path |
|---|---|---|
| prose, tables | `md` / `md.file` | ext/markdown |
| live thing + its code | `demo()` | ext/demo |
| a folder, with source on click | `files` | ext/files |
| a question / a decision / a quote / a cost | Question, Decision, Quotation, Spend | ux/Content (catalog: 75 kinds) |
| numbers, rows | `ui.table`, ui/stats | ui/ |
| sibling views, jump links | `tabs`, `toc` | ext/tabs, ext/toc |
| nested items | Tree | ux/Tree |
| one list, open/done | Filter | ux/Filter |
| a streaming log | JSONL | ext/JSONL |
| dated events | ui/timeline | ui/timeline |
| folded detail | ui/accordion (Disclosure is not built yet) | ui/accordion |

**A page for every template and every variant, down to a button or one CSS class.** Each type is a Page and each variant a child Page (`ai/audits/paging/types/`, built from a `types.json` node by one factory), so each has its own URL, comments and soon its own agent.

No flow-chart module exists yet. Full audit: /framework/ai/audits/paging/ (Round 2).

Review questions for this system: [questions.md](questions.md) (the review skill asks them).

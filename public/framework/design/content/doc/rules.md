# Content: the full rules

Moved from `.claude/skills/content/SKILL.md`, whole, plus the "Structured content" and "Cards" sections from `.claude/skills/page/SKILL.md` (every piece of content is a page, so these belong here). The short version is on [the readme](/framework/design/content/).

## Seen first, read second

The owner, 2026-09-25: "I don't want to read things. I want to see the thing I was asking about.
Some words are okay: a title that makes it evident, a caption. When I see a three-page response,
it makes me want to throw up."

**A title is 5–8 words and starts with the familiar concept** (the owner, 2026-09-30): "Page: the card system", "Dictation: clean mode", never a sentence. The reader recognises the concept first, then the specific thing.

## Let the layout say it

The reader should understand the structure from where things sit: hierarchy, proximity,
grouping. Sentences explaining the structure come second, if at all.

Not this (words describing a folder, then a separate table):

> A card is a folder: `public/framework/ai/…/my-card/`. Inside the folder: page.jsonl is the log…

This (the path above its contents, so it is obvious what is inside what):

```
public/framework/ai/2026/09/25/my-card/
├── page.jsonl   the card: one line per event
└── about.md     its text
```

The same goes everywhere:

- **Files** → a tree, or the `ext/files` widget (click a file to see its code).
- **An object** → its live instance or hierarchy, not a paragraph about it.
- **A task** → its checklist, done ticked and next unticked.
- **A layout** → a screenshot.
- **A code or data shape** → a short code block with one-line labels beside it.
- **The first thing on a page: what it is made of, its core concepts as linked icon tiles** (the `Concepts` module in `ux/Content`; each concept is a child page with a name, slug and icon).

## Words, when they earn it

- A title that says exactly what the thing is.
- A caption of one line under a picture.
- The one sentence that the picture can't say.
- Name each concept once, the same way every time, and link it.

## Connect the dots

Clarity comes from familiar structure (the owner, 2026-09-29). When a text mentions a concept that
has its own page (a class, a method, a named system), link it there, so simple statements connect
familiar concepts rather than re-explaining them. Link where the link helps the reader, not every
mention.

- **Every section is a heading, one gist line, then its items in their best form** (the owner, 2026-09-29/30): cards with a gist line each for parts, a flow for steps in order, a chip / row / panel for an object. Builders: `ux/Content/structure` (`section()`, `outline()`; `cards()` and `flow()` coming from ai/overview.js).
- **Use references heavily** (ext/Mention, 2026-09-30): `#Page` for a page or concept, `@agent` for a person or agent, `/framework/core/Page` for a path; each renders as an icon link.
- **Name a familiar system by its reference** (ext/Mention, 2026-09-30): write `#Page` (or `#[Page layout]` for a name with a space, `#Servex/lifecycle` for a child page), not "the page system". `@` is for people and agents. It renders as an icon link; add a missing name to `ext/Mention/maps/refs.js`.
- **Document where the code lives.** A method is explained on its class's page; a Servex system on
  the Servex page. Other pages state the fact in one line and link.
- **The tip of the iceberg comes first.** The most important thing leads, and very often that's the
  list of subtopics: what is this made of, as linked items. Detail sits one click down.

## The length check

Before sending, ask: could the owner get this in ten seconds? If not, cut it until they can, and
move the rest one click down (a linked doc or a folded section). A reply to the owner is one screen
at most, and usually a few lines.

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
[/framework/ux/Content/structure/doc/weight.md](/framework/ux/Content/structure/doc/weight.md).

## Cards: which one, when (cards-and-logs, 2026-09-30)

- A card is a mini page: `.card` (framework.css); the rules live at [/framework/core/Page/card/](/framework/core/Page/card/).
- Grounds: default (surface), `.card-gray` (wash), `.card-dark`, `.card-prim` (the strong hue). A plain card nested in a plain card switches to gray on its own.
- Nesting: at most 3 boxes. From level 4 down, use a heading with its content at the same indentation, never a 4th border ([nesting](/framework/core/Page/card/nesting/)).
- Headers: none · a heading · icon + title · a header bar with a ··· menu (`.card-head`, `.card-menu-btn`) · a clickable whole card (an `a.card`) · expandable (`details.card`).
- A list of clickable cards is a list of routed pages. Each card's data is one line in the nearest page.jsonl, with a virtual URL through the parent's route(); a folder is made only when a card grows ([mini pages](/framework/core/Page/card/mini-pages/)).
- A log is nested cards: `Logger.attach(obj)` gives it `this.log()`, and LogView renders the result ([log](/framework/core/Page/card/log/)).

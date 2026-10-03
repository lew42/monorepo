# Content — the iceberg: level of detail, what is foundational, importance and prioritization

Content is what a page says, and in what order. The rule underneath all of it: **show it, then tell it** — a picture, a live widget or a structure the reader can see beats a paragraph describing it.

## Use

- **Show it before you tell it.** Files → a tree. An object → its live instance. A task → its checklist. A layout → a screenshot.
- **The tip of the iceberg comes first** — usually the list of what a thing is made of, as linked items (concept tiles). Detail sits one click down, never deleted.
- **A title is 5–8 words, starting with the familiar concept** — "Page: the card system", never a sentence.
- **The length check:** could the reader get the point in ten seconds? If not, cut and move the rest one click down.
- **Helpful headings, everywhere, chat replies included** (the owner, 2026-10-02): every topic gets a heading that names it, as a statement or a question, so the reader is primed before the detail and can refer back to it. Deeper content goes in bullets under the heading, each starting with a **bold title**, then a sentence or two. A sub-item's heading carries its parent's name when the sub-name alone wouldn't stand ("Panel 2: the toolbar", not "Toolbar"). Keep it minimal and highly structured: at most 3 main headings, 1–5 items under each, and an overview stays at the level of the important things (the owner, 2026-10-02).
- **Quote the question, head with the answer** (the owner, 2026-10-02): when answering a question, quote it small (a block quote, `ux/Content/Quotation` on pages), then make the heading the answer itself, so the reader reads the conclusion, not their own question again.
- **Put what the owner says where they'll see it later** (the owner, 2026-10-02): before recording anything, ask what it's for and where it has the best chance of guiding the work next time. Weight decides the form: an important idea becomes its own sub-page (or a post) under the page it belongs to; an anecdote becomes a comment on that page, still visible, lighter. Name it so it can't be misread.
- **Show the data's real structure** (the owner, 2026-10-02): a page about a system shows the data that best represents it (its objects as previews, its records as a data grid, its files as a tree) so the reader sees how it's stored, not a description of it.
- **Three preview levels for anything with a class:** inline (an icon and the name), card (icon, title, a ⋯ menu of quick actions, mostly one big link, with a corner arrow on touch screens), and detail (its own routed page, or a side peek in the drawer).
- **A class looks like a class** (the owner, 2026-10-02): a card or an inline reference for a page that documents a CLASS uses the dark class look (`.class-card`, being built at /framework/). Content pages stay light.
- **Connect the dots:** every mention of a concept with its own page links to it; name a system by its reference (`#Page`, `@agent`, `/path`) rather than describing it in prose.

**How to structure a piece of content**, once you know what it is:

| You have… | Often reads best as |
|---|---|
| One big idea, a place to go | a large icon card |
| A few related things | a section: a title over icon cards |
| A few destinations to label | a section with a background |
| Things inside things | an outline |

**Cards** are mini pages (`.card`): a list of clickable cards is a list of routed pages, each one line in a `page.jsonl`. Full rules: [doc/rules.md](./doc/rules.md).

## Watch out

- A response that takes more than ten seconds to get is too long — cut it, don't shorten each sentence.
- Nesting cards more than 3 deep: switch to a heading with content at the same indentation instead of a 4th border.
- A background brings padding; don't box a plain list of related links that needs none.

## More

- [doc/rules.md](./doc/rules.md) — the full rules, verbatim from the old `content` and `page` skills (Structured content, Cards).
- [questions.md](./questions.md) — review questions for this system.
- [/framework/ux/Content/](/framework/ux/Content/) — the modules themselves: Concepts, Question, Decision, Quotation, Spend, structure().

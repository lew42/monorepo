# Design — everything that goes into making anything new: layout, color, navigation, content and UI

Design is what decides how a page, a card or a view looks and behaves, before any code is written. It is a browsable system, the same way [core](/framework/core/), [ext](/framework/ext/) and [ui](/framework/ui/) are: one readme per topic, live examples, detail one click down. A person and an agent read the same pages.

## Index

- [layout](./layout/) — space: sizing, wrapping, spacing, flow, the approved layouts, 400 to 3440
- [color](./color/) — colour and contrast: tokens, ratios, light and dark
- [navigation](./navigation/) — the path: how links look, persistent or switching, transitions
- [content](./content/) — the iceberg: level of detail, what is foundational, importance
- [ui](./ui/) — buttons, toolbars, dropdowns, icons: states and targets
- [doc/job.md](./doc/job.md) — the full order of the job, the two tests, and the content-kinds table (docs only)

## Use

Answer these, in order, before the first line of markup. Each links to the child page that covers it in full.

1. **What is it, and who is it for?** One sentence — it becomes the title or first line.
2. **Where does it live, and how is it reached?** Its parent, its URL (route everything), its place in the nav — the mechanics are the [new-page skill](/framework/ai/skills/new-page/); the path and the links themselves are [navigation](./navigation/).
3. **How big is it, and how does it use the space?** [layout](./layout/).
4. **What does it say, and in what order?** [content](./content/).
5. **What does the reader press, and how does it feel?** [ui](./ui/), for the controls; [color](./color/) for what carries them.

Run the same order for every region or box on the page, not only the page itself.

**The two tests for every element**, before you land it:
- **Self-evident** — would the reader know what it is and does without reading more?
- **Necessary** — does it earn its space here, or does it belong one click down, or nowhere?

**Content kinds** — before writing markup, reach for a module:

| need | use |
|---|---|
| prose, tables | `md` / `md.file` |
| a live thing and its code | `demo()` |
| a folder, with source on click | `files` (ext/files) |
| a question, a decision, a quote, a cost | Question, Decision, Quotation, Spend (ux/Content) |
| numbers, rows | `ui.table`, ui/stats |
| sibling views, jump links | `tabs`, `toc` |
| nested items | Tree (ux/Tree) |
| one list, open/done | Filter (ux/Filter) |
| this page's own concepts | Concepts (ux/Content) |

Full version, with the "which kind of page" table and why each rule exists: [doc/job.md](./doc/job.md).

This page links to, and never repeats, [/framework/styles/](/framework/styles/) (the CSS vocabulary itself) and [/framework/ui/](/framework/ui/) (the component gallery).

## Watch out

- A page's inbox — the note a reader or another agent leaves on it — is a Servex fact, not a design one: [/framework/ai/inboxes/](/framework/ai/inboxes/).
- Cards, and how content is structured into tiles, sections or outlines, live on [content](./content/), because every piece of content is a page.
- "It's all UI" (the owner): these five pages are one thing seen five ways. A finding about a toolbar changes [ui](./ui/) only; a finding about a rail changes [navigation](./navigation/) only.

## More

- [/framework/styles/](/framework/styles/) — the CSS strategy: four layers, the vocabulary these pages point at.
- [/framework/ui/](/framework/ui/) — the component gallery: buttons, toolbars, dropdowns as built things.
- [doc/job.md](./doc/job.md) — the full order of the job, the two tests, the "which kind of page" table.
- `.claude/skills/page/` — the thin skill that points here.

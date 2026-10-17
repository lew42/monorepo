# Check 2 asks against the repo: design

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/37-design/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `design`, folder `public/framework/design` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/design/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/design/readme.md`)

# Design — everything that goes into making anything new: layout, color, navigation, content and UI

**What goes here:** what a page, card or view should look like and why. **Next door:** the classes and tokens that do it → the [Style library](/framework/styles/); how to write the CSS → [Code: CSS](/framework/code/css/).

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
2. **Where does it live, and how is it reached?** Its parent, its URL (route everything), its place in the nav — the mechanics are the new-page skill (`.claude/skills/new-page/SKILL.md`); the path and the links themselves are [navigation](./navigation/).
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


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/37-design/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 2 asks

1. `27257c9039` (3 days old): Document generic design guidance such as fluid vs fixed width, whitespace, alignment and contrast in the framework design system.
2. `1c72f44b5a` (3 days old): Do not turn these suggestions into rigid laws that cause breakage.

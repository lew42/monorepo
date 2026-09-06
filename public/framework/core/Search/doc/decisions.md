# Decisions — what graduated from the prototype, and the calls made instead

[`ext/Omnibox`](/framework/ext/Omnibox/) was a prototype built on 2026-09-04 to find the best
interaction model. This is what came across on 2026-09-06, what did not, and why.

## The box sits at the bottom, and remembers if you move it

The owner's call: *"a bottom center Omnibox feels good — it's like the terminal or chat feel."*
So the closed state is a slim pill at the bottom-centre of the window and the open state grows
**upward** out of it. One DOM order (field, chips, results) reads correctly from both ends of
the screen, because `.omnibox.bottom` sets `flex-direction: column-reverse` and the top
placement does not — one line, not two layouts.

**The placement is the one thing persisted**, in `localStorage` under `lew42:omnibox`, through
`Page.Store` rather than a second storage helper. It is an app preference, not demo state: a
reader who moves the box to the top means it, and a refresh that put it back at the bottom
would be the box forgetting. (Demos, by the site's rule, never persist. This is not a demo.)

## The prototype was always-visible; this one is always-visible too

The prototype's strongest argument survives whole: a modal-only box that Ctrl+K conjures from
nothing **hides its own existence**, and a reader who never learns the shortcut never learns the
feature is there. So the field is on screen, closed, on every page — the shortcuts are an
accelerator for a control that already worked by clicking into it.

What changed is the cost. A full field parked in the shell spends real space on every page; a
32-pixel pill spends almost none, and opening it is one click or one keystroke.

## The corpus is the Router's walk, not a filesystem index

The prototype indexed `/directory.json` and titled each row by capitalising its directory name.
That is fast and it is a guess: `/imagine/vary/colstyles/` titled itself *Colstyles*, and no row
had a description at all.

This one uses the listing only as **the list of urls to try**, and then loads each one with
`Page.load()` — the Router's own call. Every row is a real `Page` with the title, description
and icon the page wrote about itself, and a row cannot promise a url the Router then fails to
open. It costs ~540 dynamic imports, about a second, once per tab, on the first search — never
on a page load. [`corpus.md`](./corpus.md) has the numbers and the two kinds of page it misses.

## Ranking: title tiers, then a description tier

The prototype's tiers were exact → prefix → word-start → substring on the title, inside two
buckets (the current topic's subtree first, then everywhere else). The tiers are kept and a
**description** tier added under them, because "titles first, then descriptions" is what
autocomplete means when a title is three words long and a description is a sentence.

**The local/global buckets are dropped.** The box is app-level now — it belongs to the window,
not to the page under it — so there is no page context to prefer. The filter chips do that job
where it is visible and reversible, instead of a ranking rule the reader cannot see.

## Dropped: Tab-completion, Space-for-command-mode, the borrowed preview

- **Tab** completed the top match. Dropped: Tab has to reach the filter chips and the *show
  more* button, and stealing the one key that moves focus is not worth a shortcut for something
  ArrowDown already does.
- **Space** on an empty box switched to a command mode of three hardcoded links. Dropped whole:
  three links were never a palette, the trigger collided with any query meant to start with a
  space, and a mode nobody can see is not a feature. A real command palette is a different
  question, asked later.
- **The highlighted row's borrowed `preview()`** — one dynamic import per settled highlight,
  to draw the page's own card. Dropped because the results are a **wall** now: forty cards, each
  showing itself, so no single row needs to be special. The wall is what the owner asked for
  ("multiple columns that properly fill 3440") and it makes the preview redundant rather than
  cut.

## The wall is auto-FILL, and that is not the `.grid.auto` utility

`.grid.auto` is `auto-fit`, which collapses empty tracks — three matches would become three
enormous cards. The wall declares `repeat(auto-fill, minmax(min(var(--column), 100%), 1fr))`
itself, with `--column: 17em`: **one** column at 400, **four** at 1280, **seven** at 3440.
framework.css special-cases a wall of `.page-preview` for exactly this reason; a `@layer util`
utility cannot be overridden from a module's `@layer theme`, so the tracks are declared rather
than borrowed.

## Forty cards, then a button

Never the whole corpus. Forty is a wall you can scan at 1280 and about a screen and a half at
3440; past that a *Show 40 more* button says how many are still to come. A new query or a chip
resets the budget, because it is a different wall.

## What is deliberately not here

**No search inside a page's prose** — titles and descriptions only. **No users, no history, no
chat.** **No url state**: the box does not put its query in the address bar, because nobody
links a colleague to a half-typed search — the same call `core/new/1/site/patterns/api/` argued
for its own filters.

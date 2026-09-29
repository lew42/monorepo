# Inventory minion — common brief

Load the `minion` skill first. Then read this page, then [`../requirements.md`](../requirements.md)
for the owner's words. Your prompt names your **area** and your **rows file**.

## Your job, in one sentence

List every thing that has been built in your area, say what each is for, whether its readme is
current, what it duplicates, what it should be using but isn't, and whether it is alive.

## What a "thing" is

One row per **module or page subtree that serves one purpose** — not one row per file, not one
row per leaf demo page. A module dir with its own `.js` class is a thing. A realm's sub-section
of pages (e.g. `imagine/paging/templates/`) is a thing. A folder of twenty demo pages that all
show one idea is ONE thing. Aim for **10 to 40 rows** for your area; a big area may need more.

Find them with `find <area> -name page.js`, `find <area> -name readme.md`, and by reading each
parent `page.js`'s `children:` (nothing crawls — a page exists only if its parent names it; a
directory no parent names is **orphaned**, say so).

## The row

Write a JSON array to your rows file with the **Write tool** (never a heredoc). One object per thing:

```json
{
  "area": "imagine/paging",
  "thing": "Paging templates",
  "path": "public/imagine/paging/templates/",
  "purpose": "One plain sentence a new coder understands.",
  "readme": "current | stale | missing | not-needed",
  "readme_why": "Only if stale: the file it names that is gone, or the shape it describes that changed.",
  "status": "live | demo | lab | dead | moved-stub | orphaned",
  "duplicates": ["public/layouts/labs/... - how it overlaps, in a few words"],
  "should_use": ["framework/ext/grip - it hand-rolls a resize rail at Foo.js:120"],
  "evidence": "file:line for the strongest claim in this row",
  "lines": 0
}
```

- **status**: `live` = a real feature other pages use or the owner uses daily. `demo` = a page
  that shows a framework feature. `lab` = an experiment / exploration. `dead` = nothing links to or
  imports it. `moved-stub` = a `page.js` that only redirects/points elsewhere (a nine-line "moved"
  stub) — note whether the old files behind it are still there. `orphaned` = has a page.js but no
  parent's `children:` names it.
- **readme**: `current` means every file it names exists and it describes the code as it is now,
  and a new reader could follow it. Check at least the files it names. Demo folders with no shared
  code may be `not-needed`.
- **duplicates**: the most valuable column. Name the other path, anywhere on the site, that does
  the same job. Use the cross-reference sources below, and `grep -rl` for the class or CSS names.
- **should_use**: a framework module (`core/`, `ext/`, `ux/`, `ui/`, `styles/`) that exists for
  exactly what this thing hand-rolls. Give the `file:line` where it hand-rolls it.
- **lines**: `wc -l` total of the thing's own `.js` + `.css` files (rough is fine).

## Cross-reference sources (read these before you start)

1. `C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/f4b31cc0-f241-4102-8fbd-82a8de06c829/scratchpad/reuse-rows.txt`
   — 112 module paragraphs from the 22 Sept reuse audit. Each says what a framework module is and
   which features it implements itself. **Reuse them** — if your module is in there, start from
   its paragraph and only check what changed.
2. `public/framework/readme.md` and the readmes of `core/ ext/ ui/ ux/ styles/` — the list of what
   the framework offers.
3. The card catalog of 75 card kinds (not merged yet, read it from the worktree):
   `C:/Code/lew42/worktrees/page-cards/public/framework/ux/Content/catalog/catalog.json`.

## Rules

- **Read-only on the repo.** Do not edit, fix, move or rewrite anything — not even a stale
  readme. Nothing is moved in this task; the owner sees the plan first. The ONLY file you write
  is your rows file in the scratchpad.
- Do not start servers, do not open browsers. Reading files is enough.
- Stay in your area for rows; look anywhere for duplicates.
- Every claim you are unsure of says so in the row ("probably", "not checked").
- When done, your last message is two lines: how many rows, and the one biggest duplicate you found.

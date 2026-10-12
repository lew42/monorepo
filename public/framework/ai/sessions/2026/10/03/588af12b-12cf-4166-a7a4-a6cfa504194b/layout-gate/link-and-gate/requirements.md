# Links look right everywhere; the merge gate catches broken layout

## The owner's words (verbatim, dictated 2026-10-03)
> There's a little link "$1,128 of AI work · 49 tasks" … it's blue. I'm not sure why we have blue links. Our default link styles need to apply everywhere; right now they might be scoped to the page class, so a random link somewhere should still use the proper styles.
> It sat above the AI title (an h1, `.doc-title`, the page with the top tabs) which is meant to be flush with the top of the page. There is zero padding from that dollar sign to the edge of its container. It creates a massive void and pushes the entire page down. Whatever UI check we're doing, measuring the layout or looking at images to make sure text isn't against the border, didn't catch it. We need a system in place to fix these problems.

Already done (commit `db0e77af`, don't redo): the AI cost line itself moved to the page end,
padded, hidden on Doc/app pages. Your job is the two SYSTEM fixes so the next version of this
bug gets caught automatically, plus the link-colour bug itself.

## Work in this worktree
`C:\Code\lew42\worktrees\layout-gate` (branch `worktree/layout-gate`, dev server at
`http://layout-gate.localhost/` / `http://localhost:62784/`). Commit there; don't touch the main
repo. **Load the `minion` skill first.**

## 1. Global link style (`public/framework/framework.css`)

Read the comment block right above line 1159 (`/* ── a link in prose ── */`) first — it explains
why the current rule is scoped to `:where(p, li, td, th, dd, blockquote, .md) a` instead of a bare
`a`. That reasoning is still correct for avoiding a flat `a { font-weight: 600 }`, but the owner's
bug is a link that sits in NONE of those containers (a plain `div`/`span` wrapper), so it gets no
style at all and falls back to the browser default (blue, underlined).

Fix: change the three selectors (the base rule, `:visited`, `:hover`) from
`:where(p, li, td, th, dd, blockquote, .md) a` to plain `:where(a)`. `:where()` always contributes
zero specificity, so `:where(a)` and `:where(p, ... ) a` already have the exact same specificity
(0,0,1) — this is not a specificity change, it's a SCOPE change: every anchor gets this default
now, not just ones inside those seven containers. Any component that wants its own link look
(the sidebar, a tab, a crumb, a card) already uses a real class selector (e.g. `.sidebar-rail a`),
which is (0,1,1) and still wins over `:where(a)`'s (0,0,1) — so nothing elsewhere should change.
Update the comment above the rule: it currently argues for scoping to prose; replace that
reasoning with why `:where(a)` alone is safe (the point above).

**Prove no regression:** load `/framework/`, `/framework/ai/`, and one more page with a sidebar or
tabs, at 400 and 1920, with `node Server/layout-check.mjs <urls> --widths 400,1920 --out
<this task dir>/shots/`. Confirm nav/sidebar/tab links still look like nav (no stray underline on
them) and a plain inline link elsewhere now shows the house style, not browser blue. Note what you
saw in `task.jsonl`, with the shot paths.

## 2. A layout-edge check in `Server/smoke.mjs`

Coordinate: `@task-mastermind-console-clean` is also editing this file today. `git pull` (or check
`git log -1 Server/smoke.mjs` on `michael/dev`) right before you start, and write your addition as
**one new, separately-named function**, called once per loaded page, not interleaved with the
existing console-noise gate code (around line 40-70) or the per-page checks (around line 190-225).

Add a function, e.g. `layout_edge_problems(page)`, that runs inside the browser (via
`page.evaluate`) against `.page.active-page` (same scoping `links_on` already uses — see line 142
— so you don't pick up the sidebar, crumbs or dev bar repeated on every page) and returns a list of
plain-English problems, each with a CSS selector (or short description) and the pixel distance.
Two checks, in one function:

- **Text touching its box.** For every visible text node inside `.page.active-page` (skip
  empty/whitespace-only nodes, and skip anything inside `.sidebar-rail, .page-crumbs, .dev-bar` —
  same exclusions `links_on` uses), get its rendered rect (a DOM `Range` around the text node,
  `getBoundingClientRect()`). Walk up to the NEAREST ancestor element that has a non-zero padding,
  a visible border, or a non-transparent background (`getComputedStyle`) — that ancestor's
  **content box** (its border-box rect minus its own border and padding) is the "safe area" the
  text should sit inside. If the text's rect comes within 2px of any edge of that safe area, it's
  a finding: `{selector, side: "top"|"right"|"bottom"|"left", distance}`. (A padded ancestor with
  the text flush against its padding IS fine — padding already keeps 2px+ away; the bug is text
  against an edge with no padding at all between them, which is what the dollar-sign bug was.)
- **Something above the title.** Find the page's own `h1` with class `.page-title` or
  `.doc-title` inside `.page.active-page` (there may be none — skip the check if so). Its top edge
  (`getBoundingClientRect().top`) is the floor. Any OTHER visible element inside
  `.page.active-page` (excluding `.sidebar-rail, .page-crumbs, .dev-bar`, and excluding the title's
  own ancestors) whose rect's bottom is above that floor (i.e. painted higher on the page) is a
  finding: `{selector, text: <short text content>}`.

Wire it into the existing per-page loop (around line 190-207, right after `await
page.waitForTimeout(1500);`), same style as the existing `loadError` check a few lines below it:
push each finding into `errors` as a plain string, e.g.
`` `layout: text touching its box — ".ai-cost-line" 0px from top` `` or
`` `layout: element above the title — ".ai-cost-line" ("$1,128 of AI work · 49 tasks")` ``. These
should fail the smoke run exactly like a console error does (they already will, since they land in
`errors` → `uniq` → `bad`).

**Prove it catches the real bug — on a throwaway commit in this worktree, never landed:**
temporarily move the AI cost line's render back above `.doc-title` on `/framework/ai/` (revert
just that one placement, in this worktree only), run `node Server/smoke.mjs <this worktree path>
/framework/ai/`, confirm it now FAILS with your new finding naming the cost line's selector and a
~0px distance, then `git checkout` that file to undo the temporary revert before you commit
anything real. Paste the failing output into `task.jsonl` as your proof; don't commit the reverted
state.

## 3. One line in `Server/doc/review.md`

Near wherever it talks about what `smoke.mjs` checks (or add a short new line under "The merge
gate" / wherever fits best — your judgement), add ONE line naming the two new checks: text
touching its box, and something painted above the title. Point at `smoke.mjs`'s own comment header
for the detail, same pattern the file already uses elsewhere (comment-in-code is the detail, the
doc is the pointer).

## Land
Commit in this worktree. Write `task.jsonl` as you go (`.claude/hooks/append.mjs`), this dir is
your task (`public/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/link-and-gate/`), parent task
`public/framework/ai/2026-10-03/layout-gate`. When done, tell your parent
(`task-mastermind-layout-gate`) you're ready for merge — don't run `merge.mjs` yourself, the
mastermind runs it (shared files, needs to watch for console-clean's concurrent edit).

Budget: $6 of the task's $8. Model: Sonnet, no sub-minions — this is one person's job.

# /framework/ai/: become a System too

Load the `minion` skill first, then `code` and `page`.

**Work only in the worktree:** `C:\Code\lew42\worktrees\ui-system` (branch
`worktree/ui-system`). Server: http://ui-system.localhost/. Never edit the main tree,
except your own log under
`public/framework/ai/2026-09-30/ui-system/system/ai-convert/` in the MAIN tree
(`C:\Code\lew42\monorepo`). **This is the riskiest file in the whole task — go slowly,
screenshot before AND after, and don't guess: read the real code before changing it.**

## Background

`core/System/System.js` (committed, `4adf0a6d` on this branch) is a class four other
pages (`design/page.js`, `code/page.js`, `ui/page.js`, `ux/page.js`) already use. The
owner's own words: "the framework AI page should probably be a system" — it's the last
of the five. **Read `System.js` in full first** — every method named below is defined
there, with a doc comment.

`public/framework/ai/page.js` and `public/framework/ai/overview.js` are the two files.
Read BOTH, start to finish, before touching either — `overview.js`'s `TABS`,
`SYSTEM_PARTS` and `tab_page()` are what `page.js` currently builds its own hand-rolled
tab strip from, and you are replacing that hand-rolling with `System`, not rewriting
the content.

## The one change, precisely

Today, `ai/page.js`'s `content()` (the `!v1()` branch) builds two tabs by hand:
`TABS = ["inbox", "system"]`. **Only "inbox" is becoming a derived System tab — "system"
stays exactly as it is, as a normal declared child**, because `System`'s own Overview
tab (tiles + intro + readme) doesn't fit what "system" shows (every AI sub-doc) — so you
turn the Overview OFF with `omit: "overview"` and keep "system" as a plain child, same
as today.

1. **`ai/page.js`: `new System({...})` instead of `new Page({...})`.** Import `System`
   from `/app.js` instead of (or alongside) `Page` — check `/app.js` already exports it
   (it does, `core/System/System.js`'s commit added the line).

2. **Add `omit: "overview"`** to the config — System's Overview tab (concept tiles +
   readme) doesn't apply here; "system" (below) is what plays that role, same as today.

3. **Give the instance its own `inbox_content()`**, copying the CURRENT body of
   `pages.inbox.content()` in `overview.js` word for word (the one that says "Your
   inbox: what needs you..." and links AI 2, the log, and the old board) — a method
   you pass in the `new System({...})` config shadows `System.prototype.inbox_content`
   for this one page only (house pattern: an assigned member shadows the prototype's,
   per-instance). This keeps the Inbox tab's WORDS unchanged; only its chrome (the tab
   strip, the url) now comes from `System`.

4. **In `content()`'s `!v1()` branch:** stop adding `"inbox"` as a child (System now
   builds that tab itself, via `inbox_section()` — don't fight it) — only add `"system"`:
   ```js
   if (!this.children.has("system")) this.add("system", tab_page(this, "system"));
   this.loading ??= Promise.resolve();
   const $tabs = this.tabs(this.bar().join(" ")).ac("wide");
   ```
   `this.bar()` (System's own method) already orders `["inbox", "system"]` once
   `overview` is omitted — don't hand-build the list; if it comes out wrong, that's a
   real finding, log it, don't just force the old array back in.

5. **`route(name)`:** today's `if (TABS.includes(name)) return tab_page(this, name);`
   handled BOTH "inbox" and "system" by url. "inbox" is now built automatically (it's
   in `this.children` once `System`'s own `inbox_section()` runs, so ordinary child
   routing finds it — don't add a special case for it). Keep the line for "system"
   only: `if (name === "system") return tab_page(this, "system");` (only needed if
   `this.children` doesn't already have it by the time `route()` is asked — check by
   testing the url cold, not by guessing).
   Leave every other line in `route()` exactly alone — the legacy `"overview"` redirect,
   `SYSTEM_PARTS`, dates, `log`, `effort`, `now`, concepts. None of those change.

6. **`TABS`/`SYSTEM_PARTS` in `overview.js`:** `SYSTEM_PARTS` is untouched. `TABS` is
   used elsewhere too (check `grep -rn "TABS" public/framework/ai/` in the worktree,
   both this file and any importer) — if nothing else reads it, you can leave the
   constant as documentation or trim it to `["system"]`; your call, but say which you
   picked and why in your log.

## What must still work, unchanged — check each one, don't assume

- `/framework/ai/` cold load (not `?v1`) shows the **same Inbox content it shows today**
  — screenshot before, make the change, screenshot after, diff them yourself.
- `/framework/ai/inbox/` still resolves (now via `System`'s own derived tab instead of
  `tab_page`) and shows the same content.
- `/framework/ai/system/` still resolves, unchanged content.
- `/framework/ai/overview/` (legacy redirect) still resolves to the system tab.
- `/framework/ai/skills/`, `/framework/ai/claude-md/`, `/framework/ai/objects/`,
  `/framework/ai/authoring/` — all still resolve (`SYSTEM_PARTS`, untouched).
- `/framework/ai/?v1` still shows the old board, unchanged.
- `/framework/ai/2026-09-30/design-code/` (a task page) and
  `/framework/ai/2026-09-30/ui-system/system/` (THIS task) still resolve with zero
  console errors — these go through the date/task routing in `route()`, which you did
  not touch, but prove it anyway since the root class changed.
- The tab strip itself: two tabs, "Inbox" and "System", in that order, at all four
  widths — no wrapping, no missing label.

## Prove it

Before your edit, shoot the current page:
`node Server/layout-check.mjs http://ui-system.localhost/framework/ai/
http://ui-system.localhost/framework/ai/system/ --widths 400,1200,1920,3440 --bands
--out public/framework/ai/2026-09-30/ui-system/system/ai-convert/shots/before` (from
the MAIN tree; `MSYS_NO_PATHCONV=1` prefix in Git Bash).

After, the same command into `.../shots/after`, plus every url in the checklist above
(zero console errors — check with a headless probe or Servex's `check_page`, never
`mcp__playwright__*` and never the owner's live tabs). Compare before/after
screenshots yourself, band by band.

## If something doesn't fit

This is explicitly the risky one — if `System`'s `bar()`/`omit`/`inbox_content` seam
doesn't produce the right strip or order, that's a finding about `System.js`, not
license to hand-roll the old tab strip again. Write a `need` line in your log with the
specific mismatch, do the closest correct thing you can inside `ai/page.js` alone
(you may override `bar()` for this one instance too, the same shadow-the-prototype
pattern, as a last resort), and say so plainly in your `done` message. Don't silently
revert to `Page`.

## Commit

Exact paths: `ai/page.js` (and `ai/overview.js` only if you trimmed `TABS` there).
One commit. Message: "ai: becomes a System — Inbox and System tabs, via core/System".
Don't merge. Tell your parent (`task-mastermind-system-class`) when committed: hash,
before/after shot paths, the checklist above ticked or not, anything left open with
the reason.

# imagine-tidy — requirements (verbatim)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more — this task DELETES more than it adds. 2. Clarity is the one exception. 3. Prioritize. Final report <=12 lines. CLAUDE.md rules; read it. HARD RULES: never kill/restart the :80 dev server (private PORT=8094 node server.js if down); never drive owner tabs; never stash; never commit; don't touch ext/Playground, dev/DevBar, ext/grip. Probe screenshots to the session scratchpad (tidy-*), keepers to your task dir.

TASK — adopt today's core word where it's owed, delete dead workarounds, final sweep.

First: run new-task (slug imagine-tidy, group pages). Run the code skill. Context: core landed index: true today (a column whose content already draws a previews wall skips core's row list — see core/Page/doc/columns.md), and render_column() now reads classes + hands app down.

1. Adopt index: true: public/imagine/vary/page.js and the gallery index pages under public/imagine/gallery/ that draw a previews wall (check which double-list today — screenshot first, adopt only where rows actually duplicate cards); public/imagine/screens/screens.css has a CSS row-suppression rule (~line 163, per its builder) — if index: true on the screens index (public/imagine/screens/page.js) makes it redundant, adopt the word and delete the rule.
2. Delete dead workarounds in uses/split (named by the column-polish agent 2026-08-27, still standing): core/Page/overview/columns/uses/split/page.js — its browse panel can be a plain pages region now; core/Page/overview/columns/uses/uses.css — the .page-uses-stage > .page flex rule can retire. VERIFY the split page before and after each deletion (screenshot pair; both panels render, console interaction works) — if a deletion breaks it, put it back and log why instead.
3. Final sweep: crawl every page under /imagine/** (all labs — expect ~90 urls; enumerate from the page trees, not the filesystem) at 1920 headless: console errors, HTTP 404s, .md-error's. Report the counts (urls crawled / clean / dirty, and each dirty one on its own line). This is the program's verification number.

FENCE — public/imagine/vary/page.js, public/imagine/gallery/** (index adoption only), public/imagine/screens/page.js + screens.css (index adoption only), core/Page/overview/columns/uses/split/page.js, core/Page/overview/columns/uses/uses.css. Nothing else; no new pages.

VERIFY: before/after screenshot pairs for every adoption and deletion; zero regressions (cards still render, no double lists, split still works); the sweep numbers. Keepers + links in your task dir. Report: adoptions (N), deletions (N), the sweep numbers, anything put back.

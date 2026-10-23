verdict: fix
1. [fix] The Test page does not load: both shots show "Page Load Error — 404 — nothing matches "/framework/core/Test/"" (requirement 2, "results in a JSONL the site can show"; page 1). Cause: `core/page.js` declares `children: "View Page Router App Sidebar Shell Search Layout Section Item List Property Task"` (line 9), and `Test` is not in that list. This is true in the worktree too, so the page will still 404 after the merge. The fix is to add `Test` to that line.
2. [fix] The new rule in `code/dos-and-donts/readme.md` was pasted into the middle of another bullet. It now sits between "Every process you start is hidden — … PowerShell uses" and its continuation, "`Start-Process -WindowStyle Hidden`…". Both bullets read wrong (diff.patch, first hunk). Move the new line below the end of the "hidden" bullet (requirement 3, "the `code` rules"; words).
3. [note] The first full run in results.jsonl shows 16 of 101 lines failing (15 test files fail). Most fail with ERR_MODULE_NOT_FOUND for `@anthropic-ai/claude-agent-sdk`, which is missing in the worktree. The readme says this, but once results.jsonl is merged, the page will show these worktree-only failures as real ones. Re-run in the main tree after the merge.
4. [note] `TestRunner.run()` removes a file from `running` only after it returns. If `one()` hits the `error` path, the file is still removed, so this is fine. But `watch()` calls `run()` without `await` or `catch`, so an exception thrown there would be an unhandled rejection (TestRunner.mjs, `fire`).
5. [note] The plan says "for now the one command" for run on change. Nothing hosts `--watch` yet; the readme marks this ⬜ (requirement 2, "run on change for core/Item and core/Task": partly met).

Widths given: 400 and 1920 (shots/monorepo-localhost-framework-core-Test/).

## Requirements
- 1 "A short design (class sketch, file naming, who runs what on which change, where results live and show)" — yes — tasks/test-system/plan.md covers all four, each with the alternative that lost
- 2a "the helper + runner" — yes — Test.js (ok/eq/throws/done) and TestRunner.mjs (find/run/covers/watch)
- 2b "existing node tests discoverable and runnable in one command" — yes — results.jsonl holds 100 manual-run lines from one `TestRunner.mjs` call
- 2c "run on change for core/Item and core/Task" — partly — `--watch` works (results.jsonl's last line, trigger "change:public/framework/core/Test/Test.js"), but nothing runs it automatically yet; readme marks it ⬜
- 2d "results in a JSONL the site can show" — no — results.jsonl exists, but the page 404s at both widths (finding 1)
- 2e "a test for today's item-tool bug (a verb on a child by id must change its state)" — yes — core/Task/child-verb.test.mjs passes, and it caught a real Task.get bug, now fixed
- 3 "the module readme (conclusions only), a line in framework/readme.md and the code rules" — partly — the readme and the framework/readme.md line are right; the code-rules line breaks a bullet (finding 2)
- owner "Two kinds by file name" — yes — `X.test.mjs` is node, `X.test.js` is held for browser tests, and the plan says why the owner's old names lost
- owner "what earns a test" rule — yes — in the readme and plan.md

## Page structure
- page 1 (the title says what it is) — no — shots/…/1920.png top band: the title is "Page Load Error", not "Test"
- remaining page questions — n/a — the page did not render

## Navigation
- page 13 (identify) — none visible; only the error page and the site drawer rail render
- n/a

## Layout
- n/a — no page content rendered (layout.json `layout: custom`, 2 bands, both from the error)

## Sizing
- n/a — `empty` 0.856 at 400 and 0.891 at 1920, all of it from the error page

## Wrapping
- n/a for the page under review — layout.json `wraps` lists only the error h1 at 400 ("Page Load Error", 2 lines) and drawer buttons

## Spacing and padding
- n/a — not measurable until the page loads

## Colour and contrast
- n/a — the page uses only stock elements (p, pre, span); none rendered

## Flow
- n/a — the page did not render. From the code: the summary line comes first, then failures first (`TestResults.sorted`), and an empty state names the one command. That is the right order.

## Words
- content (plain, full sentences) — yes — readme sections Use / Watch out / More are scannable; each bullet is one clear sentence
- content (no broken text) — no — the dos-and-donts bullet is split (finding 2)
- content (first line says what it is) — yes — readme H1 "Test — node tests that run when the code they cover changes, with results you can open"
- page description — yes — "Is it passing? The latest run of every node test, failures first."

# Fresh-eyes review: the layout explorer

Load the `minion` skill first. You have never seen this page. Read nothing about how it was built.

**The page:** `http://localhost:61596/layouts/explorer/` (a worktree's own server). Drive it headless with Playwright from the scratchpad (`windowsHide: true` on anything you spawn), never the owner's browser.

**What the owner asked for** (his words): `public/framework/ai/2026/09/29/layout-explorer-3-columns-and-a-study-of/owner-words.md`, the first half. Read that and nothing else before you look.

## The test

1. At 1920×1080: can you get from the top page to "Two columns", then to one variant of it, and back, in 10 seconds of clicks? Time it as a person would: count the clicks and say whether each target was visible without scrolling.
2. Back and reload: after each click, press back, then reload. Do you land where you were?
3. At 1920 and 3440, from the screenshot alone: what is this page, what are the three columns, and what does clicking a card do? If you can't tell from the picture, that's a finding.
4. At 400: does it still work?
5. Pick three items you did not visit yet and open them. Any blank preview, blank centre, console error or failed request is a finding.

## Report

Write `review.md` in `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\layout-explorer\`: one line per test (pass / fail, and the proof: a screenshot file name saved beside it, as `review-*.png`). Then at most five findings, ranked, each with the fix you'd make in one sentence. Write nothing else, and edit no code. Keep it under 20 minutes.

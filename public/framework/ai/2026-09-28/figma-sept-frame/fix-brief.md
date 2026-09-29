# Fix brief: review findings on the Figma Sept 2026 cards

The owner, verbatim (2026-09-28): "try to create a new task that's you know converting this uh, this frame that I'm linking to here in Figma convert that frame into a card basically uh, well so put each there's a bunch of sections in there put each of those sections into a card so that you know when the task is done I can see this UI in the card"

Load the `minion` skill, then `code`, `css`, `new-css-class`. Task dir (read-only for you, except the one log line at the end): `C:/Code/lew42/monorepo/public/framework/ai/2026-09-28/figma-sept-frame/` — read `requirements.md`, `minions.md` and `review.md` there. Do NOT write into the worktree's copy of the task dir.

Worktree: `C:/Code/lew42/worktrees/qf-2` (branch `worktree/qf-2`). The seven cards' views are all under `public/framework/ai/2026/09/28/figma-sept-2026/` (each folder: view.js/.css, card 7 also details.*, ai.*, figma.js). They already match their Figma pictures — do not change how any card LOOKS.

## Deliverables
1. **Scope every rule (review finding 1, the real bug).** Every class a card defines carries that card's own prefix: `figma-typo-`, `figma-lists-`, `figma-form-`, `figma-price-`, `figma-dash-`, `figma-ctrl-`, and for card 7 `figma-tasks-`, `figma-details-`, `figma-ai-`. No bare shared names (`.figma-panel`, `.figma-scale`, `.figma-chip`, `.figma-compare`, `.figma-badge` …) may remain. Check with a grep that no class selector is defined in two different cards' css files.
2. **One shared "scale, don't reflow" piece (finding 8).** A new css-only component `public/framework/ui/scale/` : `scale.js` (a `css()` block like `ui/avatar/avatar.js`, in `@layer theme`) defining `.ui-scale` (container-type: inline-size) and `.ui-scale > .ui-scale-body` (font-size: clamp(var(--scale-min, 7px), calc(100cqi / var(--scale-width, 53.5)), var(--scale-max, 16px)) — `--scale-width` is the design width in 16px ems, 856px → 53.5). Plus `readme.md` (index shape: what · use · watch out) and a `page.js` showing one scaled box at two widths. Add `scale` to `ui/page.js` children and the ui readme index, and `import "./scale/scale.js";` to `ui/ui.js`. Cards 4, 5, 6, 7 import `/framework/ui/scale/scale.js` and use it instead of their own copies. Run the `new-page` skill for the page.
3. **One shared compare helper for this group.** `public/framework/ai/2026/09/28/figma-sept-2026/compare.js`: `export function compare(url, alt)` draws the small "Figma" label and the image below a view. Every card's view uses it (card 7's figma.js may just call it).
4. Findings 5, 6, 7: pricing's "chosen" line goes under the clicked plan inside the scaled body; ai.js `pick()` must mark the button reliably (capture the returned View and `.ac()` it); fix the stale lists comment.
5. Finding 2: where a ui/ component renders the same as the Figma (ui/badge for the count badges, ui/tags or ui/progress), use its classes in card 6; where it can't match, leave the hand-built one and write one line why in `C:/Code/lew42/monorepo/public/framework/ai/2026-09-28/figma-sept-frame/ui-reuse.md`.

## Prove it
- For each card: `node C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/ccb16882-756f-466c-b042-6303f11a6fde/scratchpad/figma-probe.mjs http://monorepo.localhost/framework/ai2/2026/09/28/figma-sept-2026/<card>/ <your-scratch>/<card>.png ".page-log"` — zero console errors, looks as before. ⚠ The probe only routes the card folders from the worktree; `ui/scale/` is new and not on the live site yet, so ALSO load `http://127.0.0.1:60969/framework/ui/scale/` (the worktree server) with zero errors, and for the probe add a second route for `/framework/ui/scale/` in a COPY of the probe script in your own scratch dir.
- Then the collision test (finding 4): load the group card `http://monorepo.localhost/framework/ai2/2026/09/28/figma-sept-2026/` and open each sub-card in turn in the same page (click the rows), shooting each — styles must not change as more cards' stylesheets load.
- Every spawned process `windowsHide: true`, Playwright `headless: true`.
- Commit in the worktree, `git add` only the files you changed (never `-A`; never the page.jsonl files, never `ai/2026-09-28/`), message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not merge.
- Then append answers to the task log with `node C:/Code/lew42/monorepo/.claude/hooks/append.mjs C:/Code/lew42/monorepo/public/framework/ai/2026-09-28/figma-sept-frame/task.jsonl <lines.json>`: one `{"review":{"answer":{"n":N,"reply":"fixed"}}}` line per finding 1–8 (or `"declined: <why>"`; finding 3 is the mastermind's — reply "mastermind: verified at landing").

## Report (final message, short)
Commit id · the grep result for finding 1 · shot paths · anything that still differs.

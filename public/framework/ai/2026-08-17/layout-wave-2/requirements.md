# layout-wave-2 — fix what the tool found after wave 1, then measure again

Laws: less is more · clarity · prioritize. **Deliverable: the broken clusters from [`../vision-after/proposal.md`](../vision-after/proposal.md) fixed at the cause, one line each where possible, and a re-shoot proving it. Final message ≤ 25 lines.**

The tool's verdict on wave 1: broken 34 → 29; 21 gone, 13 still, 16 new (3 regressions). Mike: *"Do not monkey patch"* · *"a finding across many independent pages usually means the RULE is wrong."*

## Do (numbers are vision-after's next-wave items)

- **#2** `core/Page/Page.css:155-167` — scope the `@container page (width<38em)` strip to rails of cards (`.rail:has(> .page-preview)`); a rail of controls stacks. Prove on `/framework/ui/` @390: five filters visible again.
- **#3** `framework.css` — raise `--subtle` one step (the most-repeated finding, 6/6 pages, both runs). One token; say the old and new value and the contrast ratio on white before/after (compute it, don't eyeball).
- **#4** `ext/tabs/tabs.css:27-31` — replace `scrollbar-width: thin` (not a fix; measured) with a fade (`mask-image`) that says "more"; keep scroll. Prove on `/framework/ext/DesignTool/` @900: no sliced glyph at the edge.
- **#6 (CSS half)** `Page.css:338` `span 2` and `:345-347`'s undo — delete. Log the three components whose preview draws a void (Panel, Accordion, Breadcrumbs) as an authoring line for a later Sonnet — do not write previews.
- **#7** `public/styles.css:89` `.page.topic { --measure: none }` → `40em` under the same accept item as the measure token; delete the three inline `max-width: 52em` in `public/framework/page.js:57,78,86`; give the clock band an `h2`; `styles.css:69` `.code-block { padding: 2em }` void → the token the rest of the site uses. Add these to the accept screen (`layout-primitives/changes.js`) as new rows with their one-line reverts; **do not delete the shell aliases** — that waits for Mike.
- **Then re-shoot** the four pages nobody else is editing right now — `/framework/`, `/framework/ext/DesignTool/`, `/framework/ui/`, `/web/` (the guide tier; `/framework/web/` was a 404 in the corpus) — × 390/1280/3440, Sonnet, page-level (`node public/framework/ext/DesignTool/vision/run.mjs … --regions none --prompt critique-full-v1 --model sonnet --out public/framework/ai/2026-08-17/layout-wave-2`, ~$0.90, `--dry` first). Broken count on those four pages: vision-after had `/framework/` 5, DesignTool 3, `/ui/` 5 (and `/framework/web/` 5 as a 404); report the new numbers per page and which of your fixes the prose confirms. Skip the two `/framework/ai/` pages — `day-page-ux` is editing them.

## Rules

- Files: `core/Page/Page.css`, `public/framework/framework.css` (the one token only), `ext/tabs/tabs.css`, `public/styles.css`, `public/framework/page.js`, `ai/2026-08-17/layout-primitives/changes.js` (+ its page if a row needs it), this dir. **Not** `ext/AITask/**`, not `ext/DesignTool/**` except running `run.mjs`.
- `css` skill before CSS; `documentation` if `styles/doc/layout-system.md` changes; `finish-task`. Log in `task.jsonl` here (bash `printf`; timestamps from `date -Iseconds`); bump step. Every append reloads Mike's tab — batch.

# layout-primitives — build the five words, migrate the three templates, show Mike before/after

Laws: less is more · clarity · prioritize. **Deliverable: the site at 900/1440/3440 visibly better on the three template pages and their ~120 derivations, with a one-screen before/after page Mike can accept or reject. Final message ≤ 30 lines.**

Spec: [`../layout-system/proposal.md`](../layout-system/proposal.md) (Opus, measured) — the five primitives, the deletions, the migration order, the three failure modes. Mike: *"We need a SIMPLE PAGE LAYOUT SYSTEM. Where we can have our previews, and sometimes go full screen"* · *"Do not monkey patch … more CSS, more complex cascade, complex selectors — these are all smells"* · *"You find me improvements, I rubberstamp them"* · *"Separate 'clearly broken' from 'might be better'."*

## Build, in this order

1. **The five primitives** — `.page` (one shell, three tracks, `wide` takes the leftover), `.rail` (container-sized; below threshold a disclosure, never a scroll band), `.wall`, `.stage` (aspect, not height), `.solo` (a route). Every rule in its layer; in the file where the shell already lives (`core/Page/Page.css`) or `styles/`. `--measure: 40em` as the token (one line to revert — say so in the after page). Old shell words (`standard full fill topic doc-page doc-section layout-full dt-page`) keep working as **one-line aliases** during preview; list them under "deleted on accept". Failure mode 1 is the trap: every parent of a `.rail` declares `container-type`; prove each query fires (log the widths where the disclosure kicks in).
2. **Migrate the three templates**: (a) `/framework/ai/2026-08-17/report/` (`report/page.js`, `report.css`) — `.page` + `.rail` + `.solo`; (b) `ext/Doc/Doc.css` — `.page` alone (42 pages follow); (c) `ext/catalog/browse()` — `.rail` + `.wall` + `.stage` (`/ui/`, `/styles/layouts/`, `/ai/` follow). Plus the one-line `ext/tabs/tabs.css` overflow fix (clipped strip @900 = clearly broken). ⚠ `ext/AITask/ai.css:188-241` (the rail) is being edited by another agent right now — **do not touch `ext/AITask/**` until the mastermind messages you that `ai-board-fix` has landed**; do (b) and (c) first, (a) last.
3. **Before / After** — same 8 pages, same three widths, headless: `after-900.png`, `after-1440.png`, `after-3440.png` contact sheets here (before = the `layout-system/contact-*.png` you already made). Then `page.js` in this dir (`new AITask({ meta, extra(){…} })` or a plain page — whichever the `ext/AITask` readme blesses): one screen, per change: **before | after** thumbs · one line what changed · the CSS diff (collapsed) · what gets deleted on accept · **class: broken | maybe**. If `ext/DesignTool/audit/twin.js`'s accept RPC can append `{"verdict": {"change": id, "accept": bool, "at"}}` to `verdicts.jsonl` here in ≤ 20 lines, add Accept/Reject buttons; else leave the buttons for a later task and say so.
4. **Two numbers that must agree, before/after**: chars-per-line on a doc page at 1440 and 3440; the count of width `@media` queries and `:has()` rules site-wide (must go down or you added a branch — explain each one that stays). Plus the stylesheet/rule census.
5. **Docs**: `styles/doc/layout-system.md` (the five words, ≤ 40 lines, verbatim CSS) and one pointer line in `styles/readme.md` and in `.claude/skills/layout/SKILL.md` (a link, not a rule). `documentation` skill; `finish-task` to land — the `outcome` opens with the after contact sheet.

## Rules

- Files: `core/Page/Page.css`, `styles/**`, `ext/Doc/Doc.css`, `ext/catalog/**`, `ext/tabs/tabs.css`, `ai/2026-08-17/report/{page.js,report.css}`, this dir, the two pointer lines above; `ext/AITask/ai.css` only after the go message. **Not** `framework.css`, not `ext/DesignTool/**` (two agents there), not other `ext/AITask/**` files, not other days' task dirs.
- Skills: `css` before CSS (read framework.css's vocabulary; a new class name → `new-css-class`), `layout`, `documentation`, `finish-task`. Log milestones in `task.jsonl` here (bash `printf`, never Out-File); bump `step`. Every append reloads Mike's tab — batch.
- Stop and write it up instead of forcing it if a template needs a sixth word (failure mode 3) — that is a finding, not a defeat.

## accept screen

Landed by `ai/2026-08-17/accept-buttons/`: Accept/Reject on every card, writing `verdicts.jsonl` here over the dev socket (`twin.js`'s write-whole-file pattern); the header count and each card's tag read it back on load.

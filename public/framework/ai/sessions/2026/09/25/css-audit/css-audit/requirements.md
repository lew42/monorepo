# css-audit — shrink the site's CSS by reusing what exists

## The owner's words (condensed but faithful)

"We shouldn't need to define a new thing if our system works properly; it should reuse an existing layout class. A massive audit without proper direction doesn't do anything: the AI looks at everything, makes up a bunch of stuff. What we need is to stop making new CSS. ai2.css has at least 600 lines, which is crazy. Minimize CSS drastically and reuse classes. We don't want to recreate Tailwind. We want sensible defaults. `.pad` should mean exactly `padding: var(--pad)`. Page-specific selectors that customize existing layouts are sometimes fine. Where something isn't built yet, generalize it (a progress bar, a dictate widget). Lean into a very simple token system. Lean into containers: each resizable column is a container, so default padding uses container query units and everything scales as you resize. I want a file-system explorer: a tree of every directory on the left, twirl down; clicking a directory shows how much CSS is inside and the audit's proposal for that module."

## Deliverables

1. **CSS explorer page** (`./` this dir): tree of public/ dirs with rolled-up CSS line counts; click a dir → its CSS size + verdicts + proposal. Data = JSON files in `data/`.
2. **Token proposal shown, not described**: 2–3 `--pad` curves using container units side by side on real pages (AI 2, a doc page, /framework/) at 1280, 1920, 3440. framework.css is NOT changed.
3. **Ranked reduction plan**, biggest savings first, each with risk. Then ONE pilot (ai2.css cut down) only after task-mastermind-layout-check lands.

Budget ~$15. Nothing else merges. Fence: this dir only (plus the pilot, later).

## Audit rubric (every module minion)

Per rule cluster exactly one verdict: DUPLICATE (name existing class/token, file:line), GENERALIZE (name the component, where it lives), KEEP (page-specific, one reason), DELETE (unused, grep proof). Line count each. Schema: `data/schema.md`.

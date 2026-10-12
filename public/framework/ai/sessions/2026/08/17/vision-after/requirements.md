# vision-after — re-shoot the pilot pages after the layout wave; what vanished, what remains, what next

Laws: less is more · clarity · prioritize. **Deliverable: the vision tool proving (or refuting) the layout wave, and a ranked next-fix list clustered by cause. `proposal.md` ≤ 70 lines; final message ≤ 30 lines.**

Context: the pilot (`../vision-pilot/`, 76 rows, Sonnet `critique-full-v1`) shot 6 pages × 390/1280/3440 **before** `layout-primitives` (five words, 40em measure, Doc/catalog/report migrated) and `ai-board-fix` (task page rebuilt, rail hidden when routed) landed. Mike: *"listen to the analysis … recommend UI/UX/design fixes of all kinds. Separate 'clearly broken' from 'might be better'"* · *"A finding across many independent pages usually means the RULE is wrong"* · *"Do not monkey patch."*

## Do

1. **Re-shoot, page level only** (regions cost the same and add nothing here): `node public/framework/ext/DesignTool/vision/run.mjs --pages <the pilot's 6 urls> --widths 390,1280,3440 --regions none --prompt critique-full-v1 --model sonnet --out public/framework/ai/2026-08-17/vision-after` (check the flag for "no regions" in the readme; `--max-regions 0` if that is the spelling). ~18 asks ≈ $1.30; log `--dry` first. Verify no agent is editing (`git status --short | wc -l` twice a minute apart, equal).
2. **Diff, before → after**, per page × width, from the two `vision.jsonl`s' page-level rows: findings gone · still there (same `what`, judged by you, not string equality) · new. Two numbers that must agree: broken-count before/after summed over the 18 pairs, and the same from a per-page table.
3. **Cluster what remains + what is new by cause** — read the CSS only for the top clusters (`core/Page/Page.css`, `styles/`, `ext/catalog/`, `ext/AITask/ai.css`, `public/styles.css`) and name file:line. One finding on many pages = one rule. Class each cluster **broken** (fix, log the diff) or **maybe** (needs Before/After — Mike rubber-stamps).
4. **Rank the next wave** (≤ 8 items): cause → fix (one line, the CSS sketch) → pages it heals → class → cost S/M/L. Say what to **delete**. Flag anything that would need a sixth layout word (that is a stop, not a fix).
5. Also read `../vision-prompts/note.md` if it exists — if a prompt found things this one missed, say so in one line.

## Rules

- Files: this dir (`vision.jsonl`, `shots/`, `prompts.json` written by the runner; `proposal.md`, `task.jsonl`). Read-only elsewhere — **fix nothing**; the proposal is the deliverable.
- Log in `task.jsonl` here (bash `printf`, never Out-File; timestamps from `date -Iseconds`); bump step; land per `finish-task` with the browse URL `/framework/ext/DesignTool/vision/?run=/framework/ai/2026-08-17/vision-after/` in `links`.

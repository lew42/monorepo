# Brief: web `Ground` schemes and a phone sheet for `.fig-select` (2026-10-12, night)

Read `ext/Figma/readme.md`, `doc/token-sync.md`, `doc/controls.md`, `doc/layouts.md`, and [componentize.md](componentize.md).

1. **Ground schemes**: Figma's `Ground` component has Dark / Near-black / Light / Gray. The web has `.fig-white/.fig-gray/.fig-dark`-style scheme classes in `FigmaTokens.mjs`; add `.fig-near-black` (dark + 50% black, light ink, accent unchanged) the same way, generated, opt-in. Show it on the demo page beside the others, with the contrast note from `DS · 1.2 Dark grounds` (muted fails on plain dark; near-black passes).
2. **Phone sheet**: under a phone width, an open `.fig-select` panel shows as a bottom sheet (Figma `DS · 2.6` variant C). Prefer adding a sheet mode to the existing `ux/Popover` or the `FigSelect` class only if Popover can't take it cleanly — say which and why; nothing outside `.fig-*` changes appearance.

Worktree (`node Server/worktree-up.mjs fig-ground`), commit each step, check at 400/1200/1920/3440, `node Server/review.mjs <task dir> <worktree>` and answer findings in task.jsonl via `.claude/hooks/append.mjs`, then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree> /framework/ext/Figma/tokens/`. Update the docs. Report `kit/web-ground.md`, committed by path.

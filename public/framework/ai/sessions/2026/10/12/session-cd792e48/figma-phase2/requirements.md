# Figma phase 2: site into Figma, and the Figma-to-framework mapping (task mastermind brief)

Phase 1 landed (read `public/framework/ext/Figma/readme.md`, its `doc/observations.md` and `ai/sessions/2026/10/10/session-62419663/figma-system/STATE.md` and `owner-notes-1.md`): the tracked-file browser exists and Sept-2026 Page 7's nine Palette sections were rebuilt as framework pages by Haiku minions. The layout-check on the Figma pages reported problems (empty space at 2560/3440, narrow_share 1 at 3440, padding at 400): fix those first.

## Do
1. **Fix the layout-check findings** on `/framework/ext/Figma/` and `/framework/ext/Figma/palette/` at 400/1200/1920/3440.
2. **Prove `generate_figma_design` on one framework page**: capture a page from a local dev server (a worktree dev server or `monorepo.localhost`) into the scratch Figma file `T5PuB8EhKhfyh0xtpIT1L0` using headless Playwright at 400, 1200 and 1920 wide; read the result back (`get_metadata`, a screenshot) and record fidelity, the effect of viewport, and whether auto layout survives. Verdict in `ext/Figma/doc/`.
3. **The mapping table** (`ext/Figma/doc/figma-to-framework.md`): which Figma properties (auto-layout direction, sizing FIXED/HUG/FILL, gap, padding, constraints, alignment, component variants, fills with opacity/blend) imply which framework layout words and tokens (`styles/layouts`, columns, drawers, `--` tokens), where the signal runs out (partial auto layout), and the default choice when it does. Derive it from the Palette pages already built (what each Figma node became) and from the real framework docs, not from memory.
4. **Convert one more design** from a file the owner has linked (July-2026 `0rZv3Z6Hnqkxa2UQJ5xOOG` is already used in `styles/layouts`; use a different top-level page of Sept-2026 such as Page 8 `119:15240` or Page 6 `69:4759`) with the Sonnet-writes-spec / Haiku-builds-page pattern, recording hits and misses.
5. Keep `ext/Figma` readme (index under ~100 lines) and `doc/observations.md` current; everything linked from the site.

## Fences
Figma writes only to the scratch file; never modify Sept-2026 or July-2026. Worktree, smoke-test then commit each step, review the diff, merge. Sonnet 5.5; Haiku minions under 60k tokens; `node Server/usage-now.mjs` before spawns; no OpenRouter. One-sentence chat replies; `STATE.md` here; land with `finish-task`.

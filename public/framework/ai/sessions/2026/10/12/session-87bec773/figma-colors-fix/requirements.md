# Figma pages: the colour scheme got clobbered (fix brief, urgent)

**Owner (2026-10-12, on the phone):** the Figma pages' colour scheme is "clobbered entirely". Text that says it is prime isn't prime. If the design says prime, use the prime token; don't map it to something else.

**Suspects (style-system commits on `michael/dev`):**
- `4c74b6ae8`: `--prim → --prime` and **`--bg → --dark` by script**. Renaming a background token to "dark" can repaint any page that used `--bg` as a light surface.
- `ffbe497f4`: prime buttons take dark ink.
- `9c4c0320b`, `b4514ecd0`, `b94ce87c4`: Figma pages folded onto tokens.

Task notes: [style-system](../../../../../2026-10-12/style-system/) (or its moved path under `ai/sessions/`).

## Done when (tick each with proof)
- [ ] **Reproduce at 400 and 1200** on current `michael/dev`: screenshots of every [Figma](/framework/ext/Figma/) subpage. Keep them in this task dir.
- [ ] **Ground truth from Figma:** pull the matching frames through the Figma MCP (`get_screenshot`, `get_metadata`; read-only: never modify the Sept-2026 or July-2026 files) and from git (check out the page before `4c74b6ae8`, shoot it). Compare per page: what changed, and why.
- [ ] **Fix the cause, not each symptom:**
  - anything labelled prime uses `--prime`;
  - restore any token whose meaning the rename changed (keep aliases so nothing else breaks);
  - check other pages that used `--bg` the same way, by a script grep plus shots.
- [ ] **After shots** at 400/1200/1920/3440, side by side with the Figma frames, in one `compare.md` with images.
- [ ] `hold.mjs` around live CSS; smoke clean; commit each step; merge. Tell @mastermind-layout-catalog and @mastermind-ui-library what changed.

Sonnet 5.5. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`.

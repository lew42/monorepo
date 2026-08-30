# game-round-2 — the ask, verbatim

Round 2 of the game at `/imagine/game/`: **make the loop complete.**

Read the game as built: `public/imagine/game/**` (3 realms / 9 rooms, lamp -> cistern -> key ->
vault chain, `store(page)` persistence keyed by url, exits as sibling links — its builder's
report is in `ai/2026-08-29/imagine-root/task.jsonl`) and `/imagine/store.js`. Run `code`,
`layout`, `css` skills; `documentation` + `finish-task`.

## What round 2 adds (the navigation stays the game — extend, don't rebuild)

1. **A win state.** The vault currently opens and nothing concludes. Give the run an ending —
   opening the vault reveals the prize and a finale room/state (a real page, cold-loadable) that
   acknowledges the completed chain, shows the run's numbers (rooms walked, items carried — the
   store knows), and offers "start over" (clears the store keys for the game only).
2. **One more real mechanic**, your pick, built on refs/store (e.g. a character who wants an item
   — trade; a room that changes after an event; a locked shortcut that opens permanently). It
   must be VISIBLE in the nav (a rail row that changes state) — that's the thesis.
3. **A map.** A small always-available overview (a column or in-rail mini-map) showing
   realms/rooms visited vs not — drawn from the store, previews-as-nav to jump to any VISITED
   room (unvisited stay unlinked silhouettes).
4. Polish the arrival: the Field notes column should read as a game's opening, display-type
   title, one accent — the screens lab's composition bar applies.

Persistence discipline: everything keyed by page url via `store(page)`; a reload mid-run restores
exactly; "start over" is the only eraser.

## Fence

`public/imagine/game/**` and `public/imagine/store.js` ONLY if a game need reveals a real gap in
it (log the reason; keep it storage, no reactivity — its readme states that verdict).

## Traps

Every CSS rule in a layer; one backtick inside ``css(`…`)`` kills every page; no DOM after
`await`; theme tokens only; scrollbars are a decision; headless Playwright global at
`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.

Never kill/restart the :80 dev server; never drive owner tabs; never stash; never commit; don't
touch `ext/Playground`, `dev/DevBar`, `ext/grip`.

## Verify (headless)

- A full run start -> vault -> finale, screenshot each beat.
- The numbers on the finale match the store (report both).
- Start-over resets (store before/after).
- The map shows visited-only links (count vs store count — two numbers that agree).
- Reload mid-run restores.
- Zero console errors at 400 / 1920 / 3440.
- Keepers + `links`.

Report: the mechanic chosen + why, the finale numbers, the map counts, cuts.

# scenes-observatory — the ask, verbatim

TASK — one new artistic world for the 3D pager at `/imagine/scenes/`, pushing the 2D×3D marriage further.

First: run `new-task` (slug `scenes-observatory`, group `pages`). Read the module as it stands after TWO passes: `public/imagine/scenes/**` (Scene.js/Stage/Light machinery, slot model — the chain composes, deeper wins; sprite labels; `sign()` — a door is drawn by the world behind it; doc/{slots,grains,atmosphere,decisions}.md). The slot model and perf discipline (one renderer, rAF pause, full dispose incl. Light.dispose) are LAW — extend, never rework. Run `code` skill; `new-page`; `documentation` + `finish-task`.

WHAT YOU BUILD — a fourth door in the foyer: **the Observatory** (or a theme you argue better in one log line): a world designed as a piece, not a demo:
1. **The place**: a dome or open night — a star field (points geometry, cheap), one instrument or telescope form, a horizon. Light/dark aware: light mode = pale dawn sky observatory, dark = deep night (the theme signature check pattern exists).
2. **Its children are views**: 3-4 sub pages, each a "sighting" — the telescope aims (camera swap grain), a constellation highlights (region swap), a plate appears (object swap) — the pager's grains used as one instrument.
3. **2D×3D deepened**: each sighting pairs the 3D view with a 2D caption card (theme typography, a small canvas-drawn diagram or chart of the sighting — the 2D chrome and 3D canvas composing one reading experience; the mag's tone rungs may apply between caption and canvas).
4. **The foyer door** (`sign()`): drawn by the Observatory's own idea — a small star cluster or ringed form in its palette.
Keep budget: ≤ +12 draw calls, dispose round-trip proven like the atmosphere pass did (numbers before/after N swaps).

FENCE — `public/imagine/scenes/**` only (the foyer page.js gains one child declaration + your `form`/door hook following how worlds/plinth/quarters are wired — read first).

VERIFY headless (the GL flags): the door appears in the foyer and navigates; each sighting cold-loads to the exact state (parity check); labels legible light + dark; dispose round-trip numbers; rAF stops on leave; zero console errors; 400/1920/3440 shots + light/dark at 1920. Keepers + `links`. Report: the world in 5 words, each sighting's grain, the round-trip numbers, cuts.

## Fences

- Files: `public/imagine/scenes/**` only (plus this task dir). The foyer `page.js` gains one child + one import.
- Never touch: ext/Playground, dev/DevBar, ext/grip, /fly/, /resume/.
- Never kill or restart the :80 dev server (a private one on 8095 if it is down); never drive the owner's tabs; never stash; never commit.
- Scratch (probe scripts, throwaway shots) -> session scratchpad, named `obs-*` / `world-*`.

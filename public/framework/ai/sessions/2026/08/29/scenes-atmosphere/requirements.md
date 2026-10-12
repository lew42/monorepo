# scenes-atmosphere — the ask, verbatim

TASK — atmosphere pass on `/imagine/scenes/` (built earlier today; its builder landed — the dir is yours now).

First: run `new-task` (slug `scenes-atmosphere`, group `pages`). Read the module as built: `public/imagine/scenes/**` (Scene.js/Stage machinery, page.js foyer, worlds/plinth/quarters, readme + doc/) and its task log `ai/2026-08-29/scenes-3d/task.jsonl` (the slot model: each page owns a slot, the chain composes; keep it EXACTLY — this pass is visual, not structural). The mastermind reviewed `ai/2026-08-29/scenes-3d/click-0-hub.png`: mechanically great, visually reserved — gray + one accent, flat light, unlabeled portals, portals don't hint at their worlds. Run `code`, `css` skills; `documentation` + `finish-task`.

THE PASS (owner's standing ask: "create artistic, thematic scenes. experiment with combining standard 2d styling (bg colors, text/buttons for navigation, 2d images) with 3D textures, objects, or entire scenes"):
1. **In-scene labels**: each portal carries its name IN the scene (a canvas-texture sprite or an HTML label anchored by projecting the 3D position — your call; must follow the theme's font/colors and stay legible in light + dark).
2. **Portals preview their worlds**: the worlds portal should carry Dawn/Dusk/Deep's actual palettes (three facets, a spinning tri-color form — something honest to what's behind it); plinth and quarters likewise hint at their grain.
3. **Light + atmosphere**: give the foyer and each world a deliberate mood — directional light with soft shadow or rim, fog tuned per world, a subtle gradient sky (still theme-anchored: light mode airy, dark mode deep). Few elements, strong mood.
4. **One 2D x 3D marriage experiment**: a new small child (e.g. `gallery/` room) where 2D images (use existing repo images or generated canvas textures — no external fetches) hang as textured planes in a 3D room, each a link (the 3D pager as an art gallery — click a painting, it fills the view, url per painting).
Perf discipline stays: one renderer, rAF paused on deactivate, dispose on drop; shadow maps only if they stay cheap (one light).

FENCE — `public/imagine/scenes/**` only.

VERIFY headless (the GL flags above): before/after shots of the foyer + each world at 1920 light AND dark; the labels legible in both (crop shots); the gallery room navigable (click painting -> url -> filled view -> back); cold-load parity still exact (the module's own proof); rAF still stops on leave; zero console errors. Keepers in your task dir + `links`. Report: what each scene's mood is in 5 words, the label technique chosen + why, the gallery mechanic, perf status, cuts.

## Fences

- Files: `public/imagine/scenes/**` only. Nothing else in the repo is mine.
- Never touch: ext/Playground, dev/DevBar, ext/grip, /fly/, /resume/.
- Never kill or restart the :80 dev server; never drive the owner's tabs; never stash; never commit.
- Scratch (probe scripts, throwaway shots) -> session scratchpad, named `scenes2-*`.

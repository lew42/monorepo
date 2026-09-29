# Minion brief: draw one Figma section as live UI on its card

The owner, verbatim (2026-09-28): "try to create a new task that's you know converting this uh, this frame that I'm linking to here in Figma convert that frame into a card basically uh, well so put each there's a bunch of sections in there put each of those sections into a card so that you know when the task is done I can see this UI in the card"

Load the `minion` skill first, then `code`, `css` and `layout`. The whole task: [requirements.md](requirements.md). Your own sections are named in your spawn prompt.

## What you have
- `sections/<n>-<slug>.png` — your section as Figma draws it (1x, 856 wide). This is the acceptance picture.
- `metadata.xml` — every layer of the frame: id, type, text, x, y, w, h. Find your section's `<frame name="…">` and read its children: that is the exact content and geometry.
- `variables.json` — the Figma tokens. Map them onto the site's own (`framework.css`): accent `#72c4ff` → the site's accent/`prim`; darken `#0000001a` → `--darken-1/2`; lighten → `--lighten-*`; pads/gap → the site's `--gap`/pad words. Use the site's own font (don't load Montserrat). The Figma is 856 wide; match its layout and proportions, not its pixels.
- Need a node's exact CSS (colours, radii)? Stop and tell your parent the node id; do not guess wildly. Otherwise read colours off the png.

## Where you write (your fence)
Worktree: `C:/Code/lew42/worktrees/qf-2` (branch `worktree/qf-2`, server `http://127.0.0.1:60969/`). Every minion shares it; write only your own files.
- Your card folder(s): `public/framework/ai/2026/09/28/figma-sept-2026/<card>/` — write `view.js` (plus `view.css` if you need it, loaded with `View.stylesheet(import.meta, "view.css")`) and copy your section png there as `figma.png`.
- ⚠ `page.jsonl` in that folder is a PREVIEW COPY: you may append `{"place":"view.js"}` to it to see your view, but never `git add` it (the real card lives in the main tree; Servex writes it). Commit only `view.js`, `view.css`, `figma.png` — `git add <those paths>`, never `git add -A`.
- A reusable new piece goes in a NEW dir under `public/framework/ui/` or `ux/` named for it (not the card folder), and you say so in your report. Do not edit existing ui/ux/core/styles files or any `page.js`/`readme.md` outside your folders; if one needs a change, tell your parent instead.

## The view
- `view.js` default-exports a View subclass with `render()` — the card constructs it as `new Default({ page, ...data })` (see `core/Page/Log.js` `draw_placed`). Build it from the site's components first: `ui/controls` (buttons, fields, tabs), `ui/badge`, `ui/tags`, `ui/progress`, `ui/stats`, `ui/avatar`, `ui/card`, `ui/field`, `ui/timeline`, `ux/*`, and framework.css words (`flex`, `gap`, `pad`, `darken-1`…). Minimal new CSS; every rule inside `@layer site { … }`; class names prefixed `figma-` (run the `new-css-class` skill once).
- Draw the whole section, every element in the png, with the real text from metadata.xml. Controls that look interactive should work locally (a toggle toggles, a tab switches) — but nothing persists and nothing writes.
- Under the live UI: a small "Figma" label and `figma.png` (resolved against `import.meta.url`, max-width 100%), so the owner compares the two on the card.
- Traps: no DOM after an `await`; one backtick inside a `css(\`…\`)` string kills the page; resolve URLs against `import.meta`.

## Prove it
- Preview: `http://127.0.0.1:60969/framework/ai/2026/09/28/figma-sept-2026/<card>/`. Zero console errors.
- Shoot it headless with Playwright at 1920 wide (`headless: true`; every spawned process `windowsHide: true` — no windows may appear), scripts in your scratchpad named after your card. Put the card shot beside the Figma png and compare.
- Commit in the worktree (`git add` your files only; message ends with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`). Do not merge.

## Report (your final message, short)
Card url · files committed · shot path · per section: what matches, what does not (a list) · any new ui/ux piece.

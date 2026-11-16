# Figma exploration batch: shared brief (all four Explore pages)

Owner request (relayed by voice-app, 2026-11-16). Each minion builds ONE exploration page in **Lew42 v2**, file key `ADpu9u2V0BlEZfR3rrMfER` (https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER). Load the `minion` skill first, then `figma:figma-use` and `figma:figma-generate-design` (pass `figma-use,figma-generate-design` in `skillNames` on every mutating `use_figma`). Call `create_session` for the file once, reuse its sessionId.

## Core rule: Index first, reuse, no new masters (the owner, 2026-11-16)

- **Read the `Index` page first** (currently still `Page 1` until it is built). It lists every master component in the file, one instance of each with its name, home page and one-line purpose, and nothing else. It is the one source for what exists.
- **Reuse what is there.** Do not make a component that duplicates an existing one (v2's `Scale` page already has a `Button`, a `Card` and a `Card · with media`). Use an instance, or a variant of the existing one.
- **A new master component needs the owner's OK first**, and you add it to `Index` in the same step. Without an OK, build with plain frames or instances of existing masters.
- **Name component sets like a JS class, dot-nested, ending in " Set"** (`Icon.Item Set`, `Layout.Columns.Two Set`). Core elements (`Button`, `Image`) live on the `Elements` page, icons on `Icons`.
- **v2 must not depend on another file:** never instance a component from Big Sloppy or any library; no remote main components.
- **Scale modes are named resolution first** (`360 XS`, `400 Mobile`, `600 SM`, `1000 Default`, `1600 LG`, `2600 XL`, `3440 Mega`); look them up by name, label with `<resolution> <name>`. A `width` variable (Scale) holds each mode's resolution: bind a frame's width to it.
- **Don't touch a page the owner is editing** (the brief names them).
- **Masters stay loose on the root canvas of their page**, never inside a frame (see `doc/design-system-notes.md`).

## Hard rules

1. **Your own new page**, named exactly as your task says (`Explore – <topic>`, with the en dash). Create it with `figma.createPage()`. Work only on that page. Page context resets every `use_figma` call: `await figma.setCurrentPageAsync(page)` once per call.
2. **Do NOT edit any variable, collection or existing page** (existing pages: `Page 1` 0:1 and `Scale` 5:5). No new variables or tokens at all (if you need a number that isn't a token, hardcode it and say so). No new styles.
3. **Bind to v2's existing variables.** They are local to the file: `await figma.variables.getLocalVariablesAsync()` and `getLocalVariableCollectionsAsync()`.
   - `Lew42 v2 · Scale` (FLOAT; modes Default, Mobile, Mega, SM, LG, XS, XL; page widths XS 360, Mobile 400, SM 600, Default 1000, LG 1600, XL 2600, Mega 3440): `pad-x`, `pad-y`, `gap`, `radius`, `squeeze`, `section-pad-x`, `section-pad-y`, `button-pad-x`, `button-pad-y`, `text-gap`, `card-min`.
   - `Lew42 v2 · Colors` (single mode): prime, light, dark, error, ok, warn, ink.
   - `Lew42 v2 · Scheme` (COLOR; modes White, Light gray, Prime, Dark): `text`, `muted`, `surface`, `accent`, `on-accent`.
   - Bind padding/gap/radius with `node.setBoundVariable('paddingLeft', v)` etc., fills with `figma.variables.setBoundVariableForPaint`. Set a mode on a region with `frame.setExplicitVariableModeForCollection(collection, modeId)`. Mode rules: nearest explicit mode wins; set modes on regions (root frame, a column), not on layers inside a component; Scale goes on the region and should match its width; Scheme goes on the thing that should look different. See `public/framework/ext/Figma/doc/modes.md` and `readme.md` (component strategy) for the house rules.
4. **Text needs a loaded font** (`Inter` Regular/Bold are fine; verify style names with `listAvailableFontsAsync`). Text layers use real sizes (H1 48, H2 36, H3 24, H4 14/16, body 16). Wrapping text: `resize()` to a fixed width then `textAutoResize = 'HEIGHT'`.
5. **Auto layout everywhere** (`figma.createAutoLayout`); append to the parent BEFORE setting `layoutSizing*`. Position top-level frames away from (0,0) and don't overlap them; give each frame a text label above it (name of the layout, mode set).
6. **Components:** build real components / component sets with variants where the task says so. Name sets in the class form above (`Class.Part Set`). Keep masters on the same page, left of the demos (x ≤ −(widest master + 160)), per the readme.
7. **Screenshots are rationed** (about 10 per minute and 200 per day for the whole account, shared with every agent). Take one `get_screenshot` per finished section, at most ~8 for the page, never in a loop. Look at each shot and fix what is wrong.
8. **No destructive ops.** Never delete or modify anything outside your page. No `git push`. Don't touch other agents' pages.
9. **Short and long text test:** after building anything with text, test it with a short and a long (wrapping) string before you call it done.
10. Return every created node id from each `use_figma`; keep a list. The final report states the page id and a clickable link `https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER?node-id=<id with : replaced by ->`.

## Reporting

Log one line in your task (`log`) at each milestone. Final message to `mastermind-figma` (one screen): page link, what was built, what the owner should look at first, what you couldn't do and why, estimated cost. Never wait on anyone; decide, and note the alternative.

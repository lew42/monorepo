# Minion: the baseline, read-only (step 0 of the plan)

Load the `minion` and `ui-test` skills. Read [../plan.md](../plan.md) first; it says why.

**Read-only.** Change no file under `public/framework/` except this dir. Work against the main site, http://monorepo.localhost/, never the owner's open tabs. Use headless Playwright with `windowsHide: true` and the fake-media flags (`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`). Name your scripts `baseline-*.mjs` and keep them in your session scratchpad, not the repo; stop anything you start. The dev server doesn't carry Playwright: import it from wherever `Server/layout-check.mjs` does.

## Deliverables
1. **Which path answers on a card.** Open `/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/` at 1920 with the desktop drawer on its AI tab. Type one line (`baseline test, please ignore`) and send it. Record:
   - the network request it makes (URL + body keys);
   - which JS function sent it (file:line);
   - which agent's reply appears, and its `from` name (hover title).
   Wait up to 60s for the reply. Do the same in the ✦ sheet at 400 on the same card page.
2. **The "before" shots.** Save each surface at 400 AND 1920 into `shots/`:
   - `rail` (the ✦ sheet open on /framework/);
   - `drawer` (the desktop ☰ drawer, AI tab, on /framework/);
   - `card` (the card page above, with its sidebar or drawer open);
   - `devbar` (the dev bar's chat mode; find how it opens in `public/framework/dev/DevBar/`).
   Where a surface doesn't exist at a width, say so. Don't fake it.
3. **The font on each surface.** Record the computed `font-family` of the chat's text box and of one bubble, and of `body` and `.app` (or whatever element sets the site font). Name the element that sets Montserrat, and say where each chat surface is mounted relative to it (its parent chain up to `body`).
4. **The regression checklist, as it stands today,** on each surface: choice buttons on a reply, the resume line, the page inbox line, reactions, box/mic/Send on one row, the mic released on close, the drawer's other tabs.

Write `baseline.md` here: one table (surface × check → yes / no / n/a, with a shot link), then the three findings from 1 and 3, in plain sentences. At most one screen.

Budget: about $2. End with 3 lines: which agent answered on the card, where the font is lost, and the shot count.

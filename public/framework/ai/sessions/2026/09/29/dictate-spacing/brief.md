# Dictate page spacing: find the CSS values to change

READ-ONLY. Don't edit any CSS; propose only. Budget: stay small.

Look at the screenshot `mobile-400.png` in this folder (the Dictate page at 400 px wide), and `desktop-1920.png`. Live page: http://monorepo.localhost/framework/ux/Dictate/ (you can load it headless at 400 px with Playwright at file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs, launched with `{ channel: "chromium" }`, and read computed styles).

The owner: "the spacing is absolutely terrible. There's way too much space in the wrong places." Their view: any card, whatever its width, should just get the default `--pad` token, which clamps itself. They suspect `--pad` uses a PERCENTAGE (framework.css ~line 259: `calc(clamp(1em, 2.6% - 1.1em, 4em) * var(--size))`), which resolves against the PARENT's width rather than the card's own, so it misfires with more columns. They're considering a container-query pad.

Answer:
1. **The layout as it stands:** list every big gap and the ELEMENT and CSS rule causing it, e.g. the empty band under the tabs, the stray "Folder" label, the side padding at 400 px, the tabs cut off at "PLAYGROUN…". Give the selector, the file, the property, and its computed value at 400 px.
2. **The exact changes:** for each one, selector → property → from → to, and why. Smallest change first.
3. **The pad token:** does a percentage pad really resolve against the parent? Can a container-query unit (cqi) on an element resolve against ITSELF? (Answer precisely, per the CSS spec.) What's the smallest correct design for "a card's padding follows the card's own width"?

Write your answer to `answer-<your model>.md` in this folder (e.g. `answer-haiku.md`): a table, then 5 lines. Also record the tokens or cost you used, if you can see it.


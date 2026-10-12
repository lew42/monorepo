# paging-scroll — `/imagine/paging/` must scroll when the hub is showing its own home (Sonnet, group `paging`)

Three laws: less is more (ASAP); clear beats brief; prioritize. Length budget: one CSS rule with its comment, two pictures, five report lines.

⚠ **NO INTERNET.** The only server is `http://localhost:8123`. Never kill or restart any server; never drive the owner's tabs.

Read first: `../mastermind-playwright/minion-rules.md`. Skills: `new-task` (this dir, group `paging`), `code`, `css` (read `framework.css` and the layer rule before you write), `documentation`, `finish-task`.

## The bug, reported by the owner at 09:45

`/imagine/paging/` does not scroll. The cause, confirmed by reading: `public/styles.css:297–298` (the site theme, `@layer site`) says *only the region showing the leaf scrolls* —

```css
.pages:not(:has(> .page.active-page)):not(:has(> .default)),
.pages:has(> .page.topic.active-page) { overflow-y: hidden; }
```

— and the paging hub's middle, `div.c("pages paging-app-centre", …)` at `public/imagine/paging/paging.js:231`, holds `.paging-home` (`paging.js:232`), which is neither a `.page` nor `.default`. So when the hub is at home — the one moment that region IS the leaf — the site rule hides its overflow. `paging.css:507` already answers the same question by hand for visibility (`.paging-app-centre:has(> .page:is(.active-page, .active-ancestor)) > .paging-home { display: none; }`).

**Do not** give `.paging-home` the `default` class: core's `.default` contract (`core/Page/Page.css:85–100`) would set `display: block`, a `--measure` cap and a `3em` inset on it, which fights the home's own layout. **Do not** edit `styles.css` — the site rule is right for every other region.

## Do

1. Reproduce: headless at 1920×1080 and 400×844, `http://localhost:8123/imagine/paging/`; print `getComputedStyle(document.querySelector(".paging-app-centre")).overflowY` and whether `scrollHeight > clientHeight`; try `el.scrollTop = 400` and print `scrollTop` after. Screenshot → `before-1920.jpg`, `before-400.jpg` in this dir.
2. Fix, one rule in `public/imagine/paging/paging.css` inside its `@layer site` block (line ~424), next to the `.paging-app-centre` rules at ~501–507: when the middle has no child page on screen, restore core's own `.pages` value (`overflow-y: scroll`, `core/Page/Page.css:61`) — the selector must out-rank the site rule's (0,4,0) without depending on load order, e.g. `.pages.paging-app-centre:not(:has(> .page.active-page)):not(:has(> .page.active-ancestor))`. Comment it in the file's voice: the site rule's test, answered for this region, whose "default" is `.paging-home` and not a `.page`.
3. Prove: the same probe → `after-1920.jpg`, `after-400.jpg` (`scrollTop` moves, the home scrolls); then a child page, `http://localhost:8123/imagine/paging/navigation/` (or any child the rail links), still scrolls and its home is hidden — one line each in your log with the numbers. Zero console errors.
4. `public/imagine/paging/readme.md` Watch out: one line naming the trap (a `.pages` whose default content is not a `.page` is hidden by the site's leaf rule), linking `paging.css`.

## Fences and budget

Write ONLY `public/imagine/paging/paging.css`, one line in `public/imagine/paging/readme.md`, this dir, scratch named `paging-scroll-*`. Budget ~60k tokens. Report in ≤ 5 plain lines: the rule, before/after `scrollTop` at both widths, the child page check.

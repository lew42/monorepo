# playwright-demos — ten small runnable demos of what Playwright does, each with its picture (Sonnet, group `playwright`)

Three laws: less is more (ASAP); clear beats brief, by far — every script reads like a lesson a new coder follows line by line; prioritize. Length budget: each script ≤ 45 lines including comments; `readme.md` one line per demo plus its picture; your report ten plain lines.

Read first: `../mastermind-playwright/minion-rules.md` (the import, the rules for external sites, the jpeg rule); `.claude/skills/ui-test/drive.mjs` (a working driver against this site — copy its habits, not its code). Skills: `new-task` (this dir, group `playwright`), `finish-task`. No `page.js` tonight — the blog post that shows these is written by an Opus in the next wave; you build the exhibits.

## The demos — `public/blog/ai/playwright/demo/<nn>-<name>.mjs`, run from the repo root, each writing its picture(s) beside it as `<nn>-<name>[-<what>].jpg` (jpeg, quality 70)

1. `01-screenshot-widths` — this site's home (`http://localhost:8123/`) at 400×844, 1280×800, 1920×1080, 3440×1440: four pictures. The lesson: a viewport is a pretend window.
2. `02-element-and-long` — one element's screenshot (`locator.screenshot`) and a 1280×4000 "long" shot of a long page. The lesson: you can shoot a part, and a page taller than any screen.
3. `03-click-and-type` — drive a real interaction on this site (open the search or a drawer, type into it) with a shot before and after. The lesson: Playwright clicks and types like a person; it waits for things to appear by itself.
4. `04-emulate-phone` — `pw.devices["iPhone 13"]`, touch, `colorScheme: "dark"`, `reducedMotion: "reduce"`: two pictures (phone light, phone dark). The lesson: a phone is a set of settings.
5. `05-read-the-page` — extract the headings, the links, the landmarks and each landmark's computed `display` / `grid-template-columns` / `flex-direction`; then the CSSOM trap (cross-origin `cssRules` throws) and the fix (capture CSS from responses) on `https://developer.mozilla.org/`. Print a compact JSON. The lesson: a page is data you can read, and the CSS is on the wire.
6. `06-network` — `page.route` to block images and fonts, log every request's type and size, mock one JSON response; one picture with images blocked. The lesson: you sit between the page and the internet.
7. `07-pdf` — `page.pdf()` of a page of this site: the pdf's size and page count printed (keep the pdf in the scratchpad, not the repo). The lesson: a browser is also a printer.
8. `08-trace-and-video` — `context.tracing.start()` … `stop({ path })` and `recordVideo`, both into the scratchpad; print the sizes and the command that opens the trace (`npx playwright show-trace <file>`). The lesson: every run can be replayed.
9. `09-aria-snapshot` — `page.locator("body").ariaSnapshot()` of a page of this site printed beside its screenshot. The lesson: this text tree is what an AI agent reads instead of pixels — it is how `@playwright/mcp` works.
10. `10-external-site` — `https://example.com/` and `https://developer.mozilla.org/` at 400 and 1920, plus the two headers that say whether a site allows itself in an iframe (`x-frame-options`, CSP `frame-ancestors`). The lesson: the whole web is reachable, and some of it says "don't embed me".

Each script: a one-paragraph comment at the top that says the lesson in plain sentences, then the code, each step commented in one line. Run every script; every picture is looked at with the Read tool before you call it done; a demo whose picture shows nothing useful is fixed, not shipped.

## Deliverables

- The ten scripts and their pictures in `public/blog/ai/playwright/demo/`.
- `public/blog/ai/playwright/demo/readme.md` — one screen: one line per demo (the lesson, the command, the picture inline as a markdown image).
- A `log` line per demo in your `task.jsonl` with its run time and picture sizes; the total bytes committed (keep it under 3 MB — shrink quality or crop before you exceed it).

## Fences and budget

Write ONLY `public/blog/ai/playwright/demo/**` and this dir; scratch in the scratchpad named `playwright-demos-*`. Never touch `public/blog/posts.js`, `meta.mjs`, or create a `page.js`. `:8123` serves this site; no server of your own. Budget ~200k tokens. Report in ≤ 10 plain lines: the ten lessons in one line each, total bytes, anything that did not work headless and what you did instead.

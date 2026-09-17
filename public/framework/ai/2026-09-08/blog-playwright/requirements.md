# blog-playwright — the post: what Playwright is, what Claude Code does with it, shown (Opus, group `playwright`)

Three laws: less is more (ASAP); clear beats brief, by far — explain it like I'm five, a new coder is the reader; prioritize. Length budget: a 6–8 minute read; the first screen is one picture and the one takeaway in two plain sentences; every section leads with its exhibit, then at most a short paragraph.

Read first: `../mastermind-playwright/minion-rules.md`; `../mastermind-playwright/requirements.md` §"The ask" (the owner: "research what playwright is commonly used for, and how it might be useful. create demos of how it works, documenting with screenshots. what kinds of things can claude code + playwright do? how do people utilize this for automation? research, write a blog post."); `public/blog/readme.md` (the four steps to add a post, the exhibit figure, the traps — every one of them bit someone); one existing post's files for the shape (`public/blog/ai/`). Skills: `new-task` (this dir, group `playwright`), `finish-task`.

## Your material — all of it already exists; you write the story that joins it

- The research: `public/imagine/research/playwright/summary.md` (one screen, the five uses, the three ways Claude drives it, the three limits, each with a url) and `log.jsonl` (32 graded entries; cite by url, and keep a `contested` claim contested — the reader must be able to tell a fact from a vendor's number).
- The demos: `public/blog/ai/playwright/demo/readme.md` — ten scripts, sixteen pictures, one lesson each. They are your exhibits: `<figure class="blog-exhibit">` with the picture and a link to the script; never paste a whole script into the prose (a link and, at most, the three lines that carry the lesson).
- Tonight's own use of it: `/websites/` (sixty sites found, screenshots at four widths, the DOM and CSS scanned — `public/framework/ai/2026-09-08/site-scout/candidates.md` has the numbers: 60 found, 51 load headless, 25 allow iframes, 9 sit behind bot walls) and `/layouts/` (the encyclopedia those screenshots are tagged against). Both are being built beside you; link them by url and say in one sentence what each is. If `public/websites/readme.md` exists when you write, read it and get the sentence right.
- This repo's older uses: the `ui-test` skill (`.claude/skills/ui-test/SKILL.md`) and the vision runner (`public/framework/ext/DesignTool/vision/readme.md`).

## The post — `/blog/ai/playwright/`

Sections, each an exhibit first: (1) the takeaway — a browser you can drive from a script, and what that lets a person or an AI do; (2) what people use it for (testing, scraping, screenshots, PDFs, monitoring, automation in CI) with the demos as proof; (3) the three ways Claude Code drives a browser — the accessibility snapshot (`09-aria-snapshot`, the `@playwright/mcp` way), pixels (computer use), and scripts it writes itself (this repo's tools); (4) what it did tonight — the sixty sites, the four widths, the bot walls; (5) the honest limits — bot detection, the law (hiQ), cross-origin CSS, headless quirks (the font loader bug found tonight: blocking fonts whited out this whole site — `public/framework/ai/2026-09-08/playwright-demos/task.jsonl` has the finding; a fix is in flight as `font-fallback`). Say what each thing IS before what it does. A part that needs its blockquote explained has failed; delete the blockquote.

## Deliverables

- `public/blog/posts.js` — one entry in section `ai` (`name: "playwright"`, `title`, `date: "2026-09-08"`, `description`, `image` = the best demo picture at 1.91:1 or set `card_image`; `alt` one line).
- `public/blog/ai/playwright/page.js` (the two-line `Post`), `post.md` (or `parts:`), the exhibits referencing pictures in `demo/` by relative url.
- `node public/blog/meta.mjs --write` run once at the end; the generated `index.html`, `feed.xml`, `sitemap.xml`, `words.js` are yours to commit-ready (never hand-edit them).
- Two honest sentences in `public/imagine/research/page.js`: line 173's description ("Four topics in ancient technology…") and the paragraph near line 54 ("across all four topics") now have a fifth, unrelated topic beside them — rewrite each so it is true (five topics; four in ancient technology and one on browser automation), nothing more.
- Proof: open `http://localhost:8123/blog/ai/playwright/` at 400 and 1920 headless, screenshot both into this dir, zero console errors, and `http://localhost:8123/blog/` shows the card.

## Fences and budget

Write ONLY `public/blog/ai/playwright/**` except `demo/` (read-only — the pictures are done), `public/blog/posts.js` (one entry), the four generated files `meta.mjs` writes, two sentences in `public/imagine/research/page.js`, and this dir. `:8123` serves the site; no server of your own. Budget ~250k tokens. Report in ≤ 8 plain lines: the url, the takeaway sentence, the read time, which demos became exhibits, what you left and why.

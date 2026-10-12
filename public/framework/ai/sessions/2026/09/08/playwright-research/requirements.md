# playwright-research — what Playwright is for, how people automate with it, what Claude Code + Playwright can do (Sonnet, group `playwright`)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: 25–35 research entries (each ≤ 700 chars, graded); `summary.md` ONE screen for the blog author; your report ten plain lines.

Read first: `../mastermind-playwright/minion-rules.md`; the `research` skill (the credence discipline is the whole job — a log with no `contested` and no `speculation` was not graded); `public/framework/ext/Research/readme.md` and one existing topic under `public/imagine/research/` for the shape. Skills: `new-task` (this dir, group `playwright`), `research`, `finish-task`.

## The questions (the owner's, verbatim: "research what playwright is commonly used for, and how it might be useful … what kinds of things can claude code + playwright do? how do people utilize this for automation?")

1. What Playwright is and what it is commonly used for — end-to-end testing, scraping, screenshots and visual regression, PDF generation, monitoring, accessibility audits, form automation. Who makes it, the browsers it drives, the languages.
2. How people use it for automation — CI (GitHub Actions), scheduled jobs, codegen, the trace viewer, auto-waiting, device emulation, network mocking; the common failure modes (flaky waits, bot detection, CAPTCHAs, terms of service, headless detection).
3. Claude Code + Playwright — the official `@playwright/mcp` server (what tools it exposes: accessibility-snapshot driven, not pixels), Anthropic's computer use and Claude-in-Chrome, how agents drive a browser (snapshot → act → snapshot), what people report works and what does not. Include this repo's own uses as `source` entries with `https://lew42.com/…` urls: the `ui-test` skill (`.claude/skills/ui-test/SKILL.md`), the vision runner (`public/framework/ext/DesignTool/vision/readme.md`), and tonight's `/websites/tools/` (being built beside you — cite the plan in `../mastermind-playwright/requirements.md`).
4. Playwright versus Puppeteer, Selenium, Cypress — one entry each, graded honestly.

Dig in the foreground with your own WebSearch/WebFetch. Every `established` entry has a url. Do the skeptic pass (§4 of the skill) and run `--check`.

## Deliverables

- `public/imagine/research/playwright/log.jsonl` written ONLY through `node public/framework/ext/Research/entry.mjs …` (single quotes around `--title` and `--summary`; absolute urls).
- `public/imagine/research/playwright/page.js` — the three-line `Program.Topic` page from the skill, so `/imagine/research/playwright/` renders. Open `http://localhost:8123/imagine/research/` and confirm the topic appears on the front and its page renders; if the front needs the topic declared, add the one name to `public/imagine/research/page.js` `children:` and log why.
- `public/imagine/research/playwright/summary.md` — ONE screen for the blog author: what Playwright is in two sentences, the five things people use it for, the three ways Claude Code drives it, the three honest limits, each line with its best url.
- Your `task.jsonl` carries the rest.

## Fences and budget

Write ONLY `public/imagine/research/playwright/**`, one name in `public/imagine/research/page.js` if needed, this dir. No server (`:8123` shows you the pages). Budget ~150k tokens. Report in ≤ 10 plain lines: entry count by credence, the three most useful findings with urls, the one thing that surprised you.

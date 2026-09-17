# Playwright, for the blog post

**What it is, in two sentences.** Playwright is a browser automation library built by Microsoft: one API drives three real browser engines (Chromium, Firefox, WebKit) headless or headed. It ships both a full test runner (auto-waiting, assertions, parallel workers) and a plain scripting mode with no test runner at all — the same API, used for tasks instead of assertions.

## Five things people use it for

1. **End-to-end testing** — the main, most-documented use. [playwright.dev/docs/intro](https://playwright.dev/docs/intro)
2. **Web scraping and general scripting** — the "library" mode, no test framework needed. [playwright.dev/docs/library](https://playwright.dev/docs/library)
3. **Screenshots and visual-regression testing** — catches unintended CSS/layout changes automatically. [playwright.dev/docs/test-snapshots](https://playwright.dev/docs/test-snapshots)
4. **PDF generation** — render any page to a real PDF file. [playwright.dev/docs/api/class-page](https://playwright.dev/docs/api/class-page)
5. **Scheduled monitoring** — run the same script every few minutes against a live site to catch a broken login/checkout flow before a user does. [oneuptime.com](https://oneuptime.com/blog/post/2025-10-01-synthetic-monitoring-in-oneuptime-simulating-real-user-journeys-with-playwright/view)

## Three ways Claude Code drives it

1. **The official Playwright MCP server** hands an agent a structured accessibility-tree snapshot of the page (roles, names, text) instead of a picture — click a named element, not a pixel. [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
2. **Anthropic's computer use** is the opposite approach: a screenshot plus mouse/keyboard tools, reasoning over an image and coordinates instead of the DOM. [platform.claude.com](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
3. **This repo already does both** — the `ui-test` skill drives real drag/resize gestures headless and measures the result ([proof run](https://lew42.com/framework/ai/2026-08-19/ui-test-skill/)); the vision runner shoots a page and asks a model to critique it ([vision runner](https://lew42.com/framework/ext/DesignTool/vision/)).

## Three honest limits

1. **Sites fight back.** Headless Chromium carries detectable fingerprints (`navigator.webdriver`, missing plugins); commercial anti-bot services read them and block or CAPTCHA-gate the request. [scrapeops.io](https://scrapeops.io/playwright-web-scraping-playbook/nodejs-playwright-make-playwright-undetectable/)
2. **Auto-waiting is not a flakiness cure.** It waits for the DOM to look ready, not for the data behind it to have actually arrived — real suites still flake on async timing, animations mid-transition and CSS that changes. [mergify.com](https://mergify.com/learn/flaky-tests/playwright)
3. **Scraping a site is not automatically safe, even when it is not a crime.** Courts have found scraping public pages does not violate the U.S. Computer Fraud and Abuse Act — but the company that won that specific fight still lost the larger case and paid $500,000 under a different legal theory (contract/trespass). "Legal on one theory" is not "safe." [hiQ v. LinkedIn](https://law.justia.com/cases/federal/appellate-courts/ca9/17-16783/17-16783-2022-04-18.html)

Full log, every claim graded established/contested/fringe/speculation: [`log.jsonl`](/imagine/research/playwright/log.jsonl) — 32 entries.

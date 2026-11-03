# site-scout — find sixty websites worth cataloguing, and prove each one loads headless (Sonnet, group `websites`)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: `candidates.json` is the deliverable and may be as long as sixty entries need; `candidates.md` is ONE screen; your report is ten plain lines.

Read first: `../mastermind-playwright/minion-rules.md` (every rule applies), then `../mastermind-playwright/requirements.md` §"The ask" (the owner's own words — this list is what the whole night captures, so pick sites that show layout, not decoration).

## What you are looking for

Websites whose **layout** teaches something — navigation bars, sidebars, headers, menus, card walls, reading columns, dashboards, holy-grail bodies, mega-footers — and that are known for doing it well. Sixty sites, at least six per category, no two from the same company:

- documentation / reference (MDN, Wikipedia, a Stripe or Tailwind or React docs page, the Rust book, Python docs)
- product marketing (Stripe, Linear, Vercel, Notion, Figma, Apple, Slack)
- news / magazine (BBC, NYT, The Guardian, The Verge, Bloomberg, Le Monde)
- blogs / writing (Josh Comeau, CSS-Tricks, Smashing Magazine, A List Apart, a Substack, Paul Graham)
- app-like / dashboards that are public (GitHub repo page, Hacker News, Product Hunt, a public Grafana demo, Wikipedia's mobile view)
- shops (Apple store, IKEA, Shopify's demo, Amazon product page, Etsy)
- design systems / government (gov.uk, USWDS, Material 3, Carbon, Polaris)
- galleries that showcase layout (awwwards, siteinspire, land-book, godly.website, cssdesignawards) — include 6 sites you FIND through those galleries, not the galleries themselves (WebFetch a gallery page, follow links, pick sites whose screenshot shows a distinct layout)

Use WebSearch/WebFetch in the foreground to find and confirm; never a background agent.

## Prove each one loads

Copy `mm-external-probe.mjs` from the scratchpad (path in the rules) to `site-scout-probe.mjs`, make it take a list, and record per site: `status`, `ms`, `title`, and the two headers that decide whether the site can be shown in an iframe — `x-frame-options` and the `frame-ancestors` directive of `content-security-policy` → `embed: "allowed" | "blocked" | "unknown"` (`blocked` when XFO is DENY/SAMEORIGIN or frame-ancestors excludes `*`/our origin; `allowed` when neither header forbids it; `unknown` on error). Headless, `waitUntil: "load"`, 45 s timeout, one load per site, sequential (a polite crawl, not a burst). A site that fails twice is kept in the list with its error and `status: 0` — the mastermind decides. Do NOT screenshot here; wave 2 does that.

## Deliverables

- `candidates.json` in this dir: an array of `{ "name": "<kebab slug, unique, becomes websites/site/<name>.json>", "url": "https://…/", "title": "…", "category": "docs|marketing|news|blog|app|shop|system|gallery-find", "why": "<one plain sentence: the layout a reader will see, e.g. 'a sidebar of docs navigation beside a centred reading column, with a right-hand table of contents'>", "expect": "<the layout id you expect at 1920, from the seed words in the rules, e.g. '3-holy-grail'>", "status": 200, "ms": 1234, "embed": "blocked" }` — sixty entries, sorted by category then name.
- `candidates.md` — one screen: a table of the sixty (name · category · expected layout · embed), and three sentences above it saying how many loaded, how many allow iframes, and which category was hardest to fill.
- Your `task.jsonl` carries the rest as `log` lines (which galleries you used, which sites you rejected and why).

## Fences and budget

Write ONLY this dir and your probe script in the scratchpad. No server. No repo edits. Budget ~150k tokens. Report in ≤ 10 plain lines: how many loaded, how many embed, the three most interesting layouts you found, anything that surprised you.

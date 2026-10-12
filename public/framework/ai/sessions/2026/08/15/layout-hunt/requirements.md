# layout-hunt — requirements

## The ask (Mike, verbatim)

> we created a LayoutTool in order to analyze layouts and detect broken layout.
>
> it basically failed... i asked claude to analyze every page at all major breakpoints (400, 1920, 3440), and create a layout audit with proposed fixes.  it found a ton of layout problems, but the audit wasn't really clear...
>
> the idea here, was to use JS to calculate layout math, and try to create some simple rules to red flag bad layouts.  you are fable, so conserve your token usage.
>
> I want you to orchestrate one or more opus agents to look into the layout tool.  Integrate the layout tool into the devbar, so that we can run it on any page.
>
> Also, have an opus minion run playwright, navigate to all pages, run the tool, and write the results to a jsonl log.
>
> Use opus image vision with screenshots, if you need to.  I want you to hunt down every "bad layout" on the site.  More importantly, I want you to measure how bad it is, so the worst appear first.  I want you to propose changes to fix the bad layouts.  I believe there is (if not create it) a layout knowledge base in the layouttool, also the /layout-design skill.  between these two, we should be able to create robust layouts that never break.
>
> look at all the layout example pages on the site (core/Page demos, styles/layouts, sections, etc) and try to build a comprehensive layout library (do this in the LayoutTool).
>
> for each layout, run the layout tool to show how good/bad it is, how to improve it.
>
> also, explore "bad layouts".  this is to document all the "don'ts", so we avoid creating fragile layouts in the first place.
>
> make sure to consider responsiveness and content size, because many layouts look fine at certain resolutions, and then break at others.

## Read first (every agent)

1. `public/framework/ext/LayoutTool/readme.md` — the tool, its files, its traps, its open items.
2. `.claude/skills/layout-design/` + `.claude/skills/code-architecture/` + `.claude/skills/css-strategy/` — load the skills before writing JS/CSS.
3. `ext/LayoutTool/knowledge/*.md` — thresholds, false positives, responsiveness lessons.
4. CLAUDE.md traps: sync capture (no factories after `await`), full `@layer` restatement, every rule in a layer, `import.meta` resolution, css`` backtick death.

Known prior-audit weaknesses (from the readme's Open list): `audit/pages.js` is hand-typed and drifted; `sweep()` isn't wired into the audit; the report ranked but didn't *explain*. **A mass finding usually means the RULE is wrong** — when one rule fires 40×, suspect the rule, not the site (see `knowledge/false-positives.md`).

Crawl scope: `/framework/` and `/notes/` (+ `/` root and `/web/` if present). Personal sandbox dirs (`/alex/`, `/arya/`, `/castin/`, `/edric/`, `/michael/`) error by design — skip. `mini_app`/`marking` demo hrefs 404 by design.

Dev server: reuse the one on port 80 if up; never `pkill node` (Windows trap — capture PID, `Stop-Process -Id`).

## Agents & file-ownership fences

Scratch work (scripts, screenshots, node helpers) goes in the session scratchpad, never the repo. Nobody writes `task.jsonl` except the orchestrator. Keep the site loadable at all times — stage new files first, wire them in with one small edit.

### A — devbar-run (`dev/DevBar` integration)
**Owns:** `public/framework/dev/DevBar/**`; may add new file(s) under `ext/LayoutTool/` named `devbar*.js` only. Touches no other LayoutTool file.
Goal: a DevBar section that runs `analyze()` on the current page and shows score, grade, and leading issues — so Mike can score *any page he is looking at* with one click. Follow DevBar's own idiom: a section is a function plus one array entry in `tools.js` (deliberately not a registry). Consider `live.js` (score follows resize) as an opt-in toggle, and a link into the full report view for the current page. Respect `analyze()`-after-settle and the root's-own-window trap. Findings should exclude the DevBar itself (it's dev chrome, not the page). Update DevBar readme + doc per the documentation skill.

### B — crawler (measure the whole site)
**Owns:** `public/framework/ai/2026-08-15/layout-hunt/scan.jsonl` (the deliverable log), `ext/LayoutTool/audit/pages.js`, `ext/LayoutTool/audit/findings.json`. Scripts + screenshots in scratchpad.
Goal: Playwright (globally installed) over every page at **400 / 1920 / 3440**, running `analyze()` in-page (pattern in the LayoutTool readme), one JSONL line per page×width: url, width, score, grade, node count, top issues with proposed declarations. Derive the page list (directory.json or nav crawl) instead of the hand-typed list — fix the drift, note the method.
**Isolation:** other agents are editing the tree concurrently. Preferred: snapshot `public/` to the scratchpad once at start and serve that copy on another port (a ~20-line express static+SPA-fallback script using `Server/node_modules` is fine, in scratchpad); at minimum block the dev-socket websocket in the crawl browser so live-reload can't reload pages mid-measure, and re-measure the worst 20 at the end to confirm stability.
Also: run `sweep()` on the 20 worst pages to find the widths where each breaks (an edge nobody chose is the finding). Screenshot every page×width scoring < 70 into the scratchpad (`screens/<slug>-<width>.png`), path noted in the JSONL line. Regenerate `audit/findings.json` in its existing shape so the audit page stays truthful.

### C — library (the layout library + the don'ts)
**Owns:** `ext/LayoutTool/library/**` (new), `ext/LayoutTool/page.js` (declare the child), new files under `ext/LayoutTool/knowledge/`, and additions to `.claude/skills/layout-design/`.
Goal: a browsable layout library **inside LayoutTool** — the comprehensive catalog of layouts the site actually uses (core/Page demos, `styles/layouts/*`, sections, walls, rails, galleries…), each entry live-measured by the tool on render: what it is, when to use it, its score, and how it behaves 400→3440 (sweep signature). Use the one-demo-system five blocks (Page, preview(), ext/demo stage, ext/layout panel, utility vocabulary) — no new preview helper.
Second wing: **bad-layouts** — the don'ts, each a deliberately fragile pattern (fixed px widths, unbounded measure, overflow traps, stacked-forever mobile layouts, gutter-wasting 3440…), live-measured so the tool *demonstrates* the failure, with the robust alternative linked. Feed the generalizable lessons back into `knowledge/` and the layout-design skill so the two stay one body of doctrine. Every new page linked from a parent `children:` — nothing crawls the filesystem.

### D — audit (wave 2, after B lands)
**Owns:** `ai/2026-08-15/layout-hunt/audit.md` (+ optional `page.js`), and may update `ext/LayoutTool/audit/` prose. Reads `scan.jsonl` + scratchpad screenshots (Opus vision) — worst first.
Goal: the audit Mike actually asked for, *clear this time*: ranked worst-first by measured score; for each of the worst ~20, the screenshot-verified story (what a human sees), the measured cause, and a **concrete proposed fix** (file + declaration), severity-honest. Findings that indict a rule rather than a page go in a separate "the rule is wrong" section. Do not apply fixes to site CSS — proposals only (accept-queue decision in the readme stands). Cross-link: audit linked from the day page and from `ext/LayoutTool/audit/`.

### E — rule-fix (wave 2, added after B's evidence — see crawl-report.md)
**Owns:** every *existing* LayoutTool js file (`rules.js`, `ratios.js`, `polish.js`, `score.js`, `probe.js`, `LayoutTool.js`, `live.js`, `sweep.js`), `tests/**`, existing `knowledge/*.md`, `readme.md`, `doc/**`. Not: `library/` (C), `page.js` (C), `audit/` data (B/D), DevBar (A). Keep `analyze()`/`report()` API stable — DevBar and styles/rules/demos.js import them.
Work items: (1) `zero-size` gets the `boxed()`/`display:contents` guard; (2) `cramped` exempts table structural elements; (3) `measure`'s ladder branch exempts cells; (4) `hit-size` collapses identical repeats to one finding; (5) alignment roll-up collapses repeated rows, not just siblings; (6) `clipped` exempts `-webkit-line-clamp` crops; (7) unreachable content (scrollHeight ≫ clientHeight, overflow hidden, no scroll path) must rank at the very top — the `/web/` case scoring 82/B is the tool's central failure; (8) surface an "empty page" signal so a 404 can't read as an A; (9) fix `live.js` observer release (holds documentElement forever); (10) sweep timeout + signature robustness (cut count/scroll flag over discrete rule presence), at minimum documented; (11) extend `tests/cases.js` with ground truth for every new guard + the unreachable-content case; (12) check the four never-firing rules are actually reachable; (13) knowledge + readme + doc updates; (14) time-boxed look at the editor-panel-review non-determinism.

### F — re-crawl (wave 2, after E)
**Owns:** `scan.jsonl` (rewrite), `audit/findings.json` + `audit/pages.js` (regenerate). Re-run B's scratchpad pipeline against a fresh snapshot with the fixed rules; complete the dead-url census of all ~481 link-only urls; screenshot the new worst set; keep B's v1 conclusions in crawl-report.md as the record.

## Success criteria

- DevBar scores any page on demand.
- `scan.jsonl` covers every page × 3 widths; worst-first ranking is derivable from it.
- Library + don'ts browsable from `/framework/ext/LayoutTool/`, every entry measured live.
- Audit is short, ranked, screenshot-verified at the top, each entry fix-ready.
- Knowledge base + layout-design skill agree with each other.

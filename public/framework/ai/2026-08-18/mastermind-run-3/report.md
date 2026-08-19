# The evening run — 2026-08-18, 16:45 → 18:00

**The Panel can now say flex and grid, and record what you do to it.** Fourteen minions, fifteen tasks landed, zero left running. Weekly 72% → 77%; the two stuck Active tasks are closed.

![the words on a panel — grid cols 3 beside flex wrap justify between, the rail showing every word](/framework/ai/2026-08-18/panel-words/words-1280.png)

## Landed — open it

| | what | see |
|---|---|---|
| Panel | the nine alignment arrows are hidden (`TOOLS.align: false`; the toolbar pop still sets the word) | [Panel](/framework/ext/Panel/) |
| Panel | **flex/grid words** — `dir gap wrap justify items` · `cols gap dense` — one `WORDS` table read by bar and rail; a `cells` template with real children; `structure(text)` + the nine `space` presets as starting arrangements | [words demo](/framework/ext/Panel/) · [doc/words.md](/framework/ext/Panel/doc/words/) · [task](/framework/ai/2026-08-18/panel-words/) |
| Panel | **panel-flow** — every gesture a step, ⏮ ◀ n/N ▶ ⏭ under the workspace, replay proven bit-identical (sha256 equal); `demo.stage(() => panel(seed))` is the responsive half | [flow on /full/](/framework/ext/Panel/full/) · [doc/flow.md](/framework/ext/Panel/doc/flow/) · [task](/framework/ai/2026-08-18/panel-flow/) |
| Panel | test-drives: 8 flex + 8 grid scenarios at 4 widths, 27 pngs, step lists — split/resize/nest/drag/close all work; grid was one hardcoded shape (now fixed above) | [flex](/framework/ai/2026-08-18/panel-flex/) · [grid](/framework/ai/2026-08-18/panel-grid/) |
| Guides | flex guide +5 steps (grow weights · `min-width:0` · align vs justify · wrap vs squeeze · nested); grid guide +10 (track · fr · gap · areas · `minmax(0,1fr)` · dense · nested …) | [Flex](/framework/styles/layouts/flex/) · [Grid](/framework/styles/layouts/grid/) |
| DevBar AI | **the turn is bound to the tab that asked** — tabs have ids, MCP tools take `tab:`, an ambiguous `path` is an error, the server claims the tab, the selection rides along. ⚠ server half awaits your restart | [task + proof](/framework/ai/2026-08-18/ask-tab-binding/) · [Ask decisions](/framework/ext/Ask/doc/decisions/) |
| Drawer | select anything → the drawer ends in a **css group**: every applied rule tagged with its *part* (framework · lew42 · module), inline styles first, a lock + link on shared parts; both panes of the two-up selectable; `layout.selected()` feeds the AI | [proposal + slice](/framework/ai/2026-08-18/element-provenance/) · [follow-ups](/framework/ai/2026-08-18/provenance-followups/) |
| Drawer | **resizes** — `ext/grip` extracted from the DevBar, shared; `--drawer-w` persists; nothing lingers when shut | [ext/grip](/framework/ext/grip/) · [drawer](/framework/ext/drawer/) · [task](/framework/ai/2026-08-18/drawer-resize/) |
| Reports | what each driver can TEST (eval · Playwright · CDP), tried on Panel | [report](/framework/ai/2026-08-18/browser-driving/report.md) |
| Reports | lew42.com static: what breaks, what not to push, other devs | [audit](/framework/ai/2026-08-18/launch-audit/audit.md) |
| Reports | CSS audit — 905 inline calls classified, 16 duplications with file:line, the interaction map, 5 ranked proposals | [audit](/framework/ai/2026-08-18/css-audit/audit.md) |
| Reports | Panel complexity → strategy (accepted; steps 1, 4, 5, 6 built above) | [proposal](/framework/ai/2026-08-18/panel-complexity/proposal.md) |
| Ops | 6 skill improvements applied (code · layout ×4 · new-page); ledger hook no longer mis-attributes a subagent's out-of-dir edits; `vision-measure` + `mastermind-night` closed | [run log](/framework/ai/2026-08-18/mastermind-run-3/) |

## Your call — nothing below was done

1. **Restart the dev server**, then `node public/framework/ai/2026-08-18/ask-tab-binding/proof.mjs --turn` (~$0.03) — proves the two-tab binding end to end.
2. **Panel, park + delete (~950 lines)** — park `text.js`/`persist.js`/`repeat.js` and four decorative scenes behind their existing flags; delete the align overlay, `insert.js` (six gestures already add a panel; its `+` also eats a nested seam drag), `zoom_scrub`, `scatter` as the default seed. Reverses two 08-16 decisions, so it is yours: [proposal §2](/framework/ai/2026-08-18/panel-complexity/proposal.md).
3. **CSS, five proposals** — first: promote `scroll` `stick` `fluid` to `framework.css` util and convert 62 call sites in the same pass; then band tones as classes · one word for the app shell (`.fill` or `.solo`, byte-identical today) · declare `--page-pad` on `.page` · `--column` on seven walls: [audit §Proposal](/framework/ai/2026-08-18/css-audit/audit.md).
4. **Before `git push`** — `public/framework/ai/**` is 671 tracked files / 25 MB (your prompts, served as static JSON in prod; 136 pngs); widen `.gitignore` (dated `usage.json` leaked); `git rm --cached` 15 `shots/` pngs; `check-claude-usage` needs its script in the repo for other devs; figma is not in `.mcp.json`: [audit §Verdicts](/framework/ai/2026-08-18/launch-audit/audit.md).

## Parked

The bar's dice cannot offer a preset yet (one line in `workspace.js`; the rail's `sow` row does) · `gen()` emits no `grid` word, so a rolled seed arrives block · 15 section adapters are still one-child bodies · flow has no disk save and no `reset()` · the guides are not flows yet (words first was the strategy's order) · grip has no grab offset · the mini-app `T` entry (three lines) waits on mini-app trees · the `vision-measure` brief is reusable if vision resumes.

## Spend

14 minions (7 Opus, 7 Sonnet), ~2.4M output tokens, ~5 weekly points; session 4% → 26%. Every task dir under [`/framework/ai/2026-08-18/`](/framework/ai/2026-08-18/) has its brief, log, pngs and landing line.

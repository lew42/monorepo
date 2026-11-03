# browser-driving — what can each browser driver actually test on ext/Panel?

Laws: less is more · clarity · prioritize. **Deliverable: `report.md` in this dir — one screen (≤ 60 lines): a table + a verdict — plus the evidence files behind it. Final message ≤ 20 lines.**

The owner (2026-08-18): *"See what [minions] are able to test, from a UI/UX standpoint, by driving the browser (mcp or playwright or both). Btw, this confuses me... Write a report about what MCP can do via eval, what it can't do, what Chrome Dev Protocol could do, what Playwright can do, what each can't do, etc."*

## Start here

- [`../mcp-tab-awareness/comparison.md`](../mcp-tab-awareness/comparison.md) — a first cut of exactly this comparison, written earlier today. **Extend it; do not restate it.** Its verdict was "keep `site`, borrow one idea"; yours must answer the owner's sharper question: *what can each one TEST on the Panel system?*
- The `site` MCP tools: `mcp__site__pages`, `mcp__site__eval`, `mcp__site__shot`, `mcp__site__claim`, `mcp__site__release` — load their schemas with `ToolSearch` (`select:mcp__site__eval,mcp__site__pages,mcp__site__shot`). Server side: `Server/plugins/MCP.js`. ⚠ **Never drive the owner's live tabs** for anything that mutates — `eval` on an owner tab is read-only reconnaissance here. A hidden tab evaluates but does not lay out (no rAF, no ResizeObserver, frozen geometry) — the eval answer's trailing state line tells you.
- Playwright: installed globally (`npm root -g` → `playwright`, chromium present). Write probe scripts to the session scratchpad, never the repo: `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/a14ec0db-4e8c-4ce1-a14c-378e52ac01a0/scratchpad/`. `import { chromium } from "C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"` (verify the path). Dev server is up on `http://localhost/`.
- ⚠ Panel trap (readme): a headless probe that clicks a picker rewrites `/data/panels.json` over the dev socket — block with `page.routeWebSocket` (or block `/socket*`) before touching the workspace at `http://localhost/framework/ext/Panel/`.
- CDP: `chromium.connectOverCDP` needs Chrome launched with `--remote-debugging-port`; the owner has not done that. You may launch your OWN headless Chromium and use `page.context().newCDPSession(page)` to try `Emulation.setDeviceMetricsOverride`, `CSS.getMatchedStylesForNode`, `Input.dispatchMouseEvent`. That is what "CDP could do" means here — measured on your own browser, not claimed.

## Do

1. **Try each driver on three Panel gestures** at `http://localhost/framework/ext/Panel/`: (a) split a panel by clicking its edge then committing (`split.js`: edge click → ghost → left click commits); (b) drag a seam to resize (`grip.js`); (c) change a panel's `display` word to grid via the toolbar pop (`toolbar.js`) and read the overlay it draws (`display.js`). For each × {site `eval`, Playwright real input, CDP `Input.*`}: did it work? what did you observe? one screenshot each where it did (`png` saved in this dir, ≤ 12 total).
2. **The table** — rows: read DOM/computed geometry · real click · real drag (pointer sequence) · hover state · keyboard · viewport resize without window resize · matched CSS rules with origin · screenshot · sees the owner's live tab state · works when the tab is hidden · needs the owner to change anything. Columns: site `eval` · Playwright · CDP. Cells: ✓ / ✗ / partial, one clause of evidence.
3. **Verdict**, ≤ 8 lines: for a Panel UI/UX test-drive, which driver, and which one is wasted effort. Name the one capability that would change what the Panel minions can test.

## Rules

- Read-only on `public/` — you write ONLY inside this task dir and the scratchpad. Findings as `log` lines in this dir's `task.jsonl` as you find them, not saved up.
- Run the `new-task` skill first (this dir and brief already exist — write `task.jsonl` line 1 and the `day.jsonl` line; group `panels`); `finish-task` at the end with `"tokens": null`. If a skill misleads you, one line in that skill's `improvements.md` (`skill-improvement`).
- Timestamps from the clock (`date -Iseconds`), never typed. Windows paths with forward slashes.
- Wait in the foreground (`while (-not (Test-Path …)) { Start-Sleep 5 }` style) — never end a turn on a background monitor.
- Budget: this is a Sonnet task; aim for under 25 tool calls of driving. Stop at the point of diminishing returns and say what you skipped.

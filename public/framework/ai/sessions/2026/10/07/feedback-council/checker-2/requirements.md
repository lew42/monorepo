# Checker checker-2 — feedback council (run 2026-10-07/feedback-council)

You are checker **checker-2**, one of 5 checkers verifying open owner asks against the live site.

## Read first
- Card dir (raw words): `public/framework/ai/council/`
- Full ask history: `public/framework/ai/council/asks.jsonl` (latest line per id wins)
- This run: `public/framework/ai/sessions/2026/10/07/feedback-council/`
- No new words landed today (`words.jsonl` is empty) — check only the asks below, nothing to extract.

## Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer)
- **B16**: Live chat/text uses a comfortable reading width; no independently scrolling narrow areas. (last verdict: partly; last evidence: Fast assistant chat is a narrow box ~360px inside a 1.4k column; Working-on text at right is wide-ish and cut off at page bottom (right column overflows the viewport).)
- **B3**: Clicking a Live agent opens a top-aligned column, not a tab with white space. (last verdict: partly; last evidence: Clicking Live card lands on /ai2/live/, a full page with two columns at 1920 and 3440; the click-an-agent-opens-a-column path was not exercised)
- **B5**: The list is time-based, newest card on top, timestamps back. (last verdict: partly; last evidence: Rail ordering newest-first for Live and days; timestamps present on Live (4:18 PM) but not on grouped cards)
- **B6**: Any agent can add a card to the top of the list at once (last verdict: partly; last evidence: New-card composer exists in rail ('say anything - it starts a new card'); agent-side create_card MCP tool exists. Instant top insertion not exercised.)
- **B8**: Cards update programmatically (last verdict: partly; last evidence: Live page shows running agents that change (8 working, 6 working at two loads), so it updates; the flashing-card behaviour not observed)
- **B9**: Segmented progress bar: N equal segments turn green as steps finish; owner can tell what the bars mean. (last verdict: partly; last evidence: Rail cards show segmented bars (Live card has 2 segments, orange), group cards a solid bar; not the N-segment green shape everywhere.)
- **C3**: Page MCP: change layouts, add content, create pages and sub-pages; in the dev-server MCP or Servex MCP. (last verdict: partly; last evidence: mcp__servex__create_page, list_pages, read_page, set_layout, place tools exist in this session, so a page MCP exists. Not tried.)
- **C4**: Page system upgrade: simpler, live JSONL pages documented, core pages page less wordy. (last verdict: partly; last evidence: Commit 15291daa shortened core/Page docs; live JSONL pages appear used (ai/2026/09/24/ai-dashboard/page.jsonl))
- **C5**: Ready agent per module (short readme as the way in, no old bloated agents). (last verdict: partly; last evidence: mcp__servex__readme_modules tool exists (spawn a mastermind across named modules' readmes) and sub-mastermind SKILL.md references it, but there is still no single short per-module 'ready agent' skill replacing old bloated agents.)
- **C6**: CSS audit by directory with a tree view of CSS amounts, proposals to reduce; tokens + container queries on columns. (last verdict: partly; last evidence: ai/sessions/2026/09/25/css-audit/css-audit exists, 'landed: explorer, ranked plan and padding curves; up to 8,599 of 35,769 lines can go' per Live note)

## Job
For EVERY ask above, LOOK at the real result and give one verdict:
`done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line),
and for anything not `done` the smallest fix.
**Prove before you call something missing.** Search the repo (`git log`, grep, `.claude/skills/`, CLAUDE.md) before writing "not done".
The live site: http://monorepo.localhost (never http://localhost/). Visual asks: headless Playwright at 1920 and 3440
(Playwright, never the owner's tabs — no `mcp__site__eval` on tabs the owner has open). Time the Live card load.
Check scroll on named URLs with real overflow measures. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
Do NOT edit any repo file. Scratch goes in your scratchpad; screenshots to
`public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-2-<ask>.png` only for evidence shots (keep <=12 total).

## Return
Write ONE json file `public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-2.json`:
`{"name":"checker-2","votes":{"<id>":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}}`
Cover every id listed above. Then reply "done" in one line. Budget about $2: be quick, do not over-explore.
Never write the owner's name anywhere.

# Checker checker-1 — feedback council (run 2026-10-07/feedback-council)

You are checker **checker-1**, one of 5 checkers verifying open owner asks against the live site.

## Read first
- Card dir (raw words): `public/framework/ai/council/`
- Full ask history: `public/framework/ai/council/asks.jsonl` (latest line per id wins)
- This run: `public/framework/ai/sessions/2026/10/07/feedback-council/`
- No new words landed today (`words.jsonl` is empty) — check only the asks below, nothing to extract.

## Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer)
- **A1**: Live card loads fast, or is removed (last verdict: partly; last evidence: Headless cold load of /framework/ai2/ lands on /live/ and renders in ~2.7s at 1920 and 3440 (includes app boot); the in-app click was not timed because my selector missed the button. Shot shots/council-3-A3-ai2-3440.png. Card claims ~0.5s.)
- **A2**: Show, don't tell; words after the picture (last verdict: partly; last evidence: CLAUDE.md 'Show it with the widget' plus content skill; AI 2 cards still show long text blocks, e.g. right column of Live at 3440 is a long bulleted assistant reply (shots/council-4-livecard-3440.png))
- **A3**: Layouts work at 3440, not a mobile layout stretched (last verdict: partly; last evidence: Card page at 3440 has rail + wide main + right chat column, no big empty area (shots/council-5-A3-card-3440.png). Files overview page at 3440 has a nearly empty left column with a tall empty card and text stuck in a 400px column (shots/council-5-C1-files-3440.png))
- **A4**: Page padding is right (last verdict: partly; last evidence: Both shots show content inset from the rail; main element padding measured 0px because padding sits on inner columns. ai-dashboard route rendered only 64 chars (title 'lew42') so its padding is unverified.)
- **A5**: Detail pages scroll (last verdict: partly; last evidence: At 1920x700, /framework/core/Panel/md/doc/decisions/ and /framework/ai/ai-dashboard/ both returned 200 with NO element taller than its box, so they neither overflow nor scroll in my probe: either the content fits, or it is clipped. /framework/ai2/live/ has a working inner scroller.)
- **A6**: Card content is clear at a glance (last verdict: partly; last evidence: Landed card 'Live' shows '[object Object],[object Object]...' as its preview line (council-3-A1-live-3440.png); other cards show headline + link.)
- **B11**: Rounded corners: a gap between cards, or rounding only on the whole stack. (last verdict: partly; last evidence: Task rows on the card page are separate boxes with gaps between them; the rail rows are flush with no gap)
- **B12**: AI 2 works without Servex (last verdict: partly; last evidence: Live page needs Servex by design (agents are Servex's); static behaviour not tested)
- **B13**: Finished cards need not stay in the list (last verdict: partly; last evidence: Rail hides archived cards (archived (16) link at the bottom); finished cards still listed under Cards (327))
- **B15**: Back-button icon on the about page is aligned. (last verdict: partly; last evidence: About page back-button icon not looked at)

## Job
For EVERY ask above, LOOK at the real result and give one verdict:
`done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line),
and for anything not `done` the smallest fix.
**Prove before you call something missing.** Search the repo (`git log`, grep, `.claude/skills/`, CLAUDE.md) before writing "not done".
The live site: http://monorepo.localhost (never http://localhost/). Visual asks: headless Playwright at 1920 and 3440
(Playwright, never the owner's tabs — no `mcp__site__eval` on tabs the owner has open). Time the Live card load.
Check scroll on named URLs with real overflow measures. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
Do NOT edit any repo file. Scratch goes in your scratchpad; screenshots to
`public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-1-<ask>.png` only for evidence shots (keep <=12 total).

## Return
Write ONE json file `public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-1.json`:
`{"name":"checker-1","votes":{"<id>":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}}`
Cover every id listed above. Then reply "done" in one line. Budget about $2: be quick, do not over-explore.
Never write the owner's name anywhere.

# Checker checker-3 — feedback council (run 2026-10-07/feedback-council)

You are checker **checker-3**, one of 5 checkers verifying open owner asks against the live site.

## Read first
- Card dir (raw words): `public/framework/ai/council/`
- Full ask history: `public/framework/ai/council/asks.jsonl` (latest line per id wins)
- This run: `public/framework/ai/sessions/2026/10/07/feedback-council/`
- No new words landed today (`words.jsonl` is empty) — check only the asks below, nothing to extract.

## Your asks (verify each; prior verdict/evidence shown is NOT truth, just a pointer)
- **C8**: Audit of the week's tasks: a minion per prompt, finds unfinished and half-finished work. (last verdict: partly; last evidence: Landed: 176 of 184 tasks audited, one Sonnet minion each (6:05 PM).)
- **D4**: Skills are instructive, not restrictive ("could/should", not "have to" unless a law). (last verdict: partly; last evidence: Skills still contain 'must' or 'have to' (mastermind 8, fork-claude-session 6, code 4, ui-test 3, sub-mastermind 3).)
- **D7**: Monitor: watcher of console errors per worktree, layout check with screenshots before committing. (last verdict: partly; last evidence: health-supervisor.mjs exists and is named in servex-mastermind SKILL.md:31 and sub-mastermind SKILL.md:207, but sub-mastermind SKILL.md itself says the per-worktree watcher does not actually start while the main one runs (one global lock) — documented as a known gap, not fixed.)
- **E1**: Padding should be opt-in, not default: add a .pad class you add where you need it (e.g. each tab's content area), rather than fighting off a default page padding. (last verdict: not checked; last evidence: (none))
- **E10**: Give the fast and smart assistants each a chosen icon that doubles as their avatar and username inline next to each message (e.g. two arrows for Fast, a brain for Smart), instead of separate labeled blocks. (last verdict: not checked; last evidence: (none))
- **E11**: Add lightweight reactions to chat: the fast assistant can send a quick emoji (thumbs up, check mark) instead of a sentence when a simple acknowledgment is enough, falling back to one if the smart assistant hasn't replied in time. (last verdict: not checked; last evidence: (none))
- **E12**: When the owner references a specific thing in chat, keep it visible as a context card (the page's icon and name at the top, the related content inside) instead of only describing it in prose. (last verdict: not checked; last evidence: (none))
- **E13**: Build a standing, browsable catalog of the layout and navigation patterns actually used across every page on the site (not a one-off audit), so the systems can be browsed by usage. (last verdict: not checked; last evidence: (none))
- **E14**: Make sure tasks never get lost when many agents are working: every task/card should visibly nest under its parent card with a recognizable icon, so the owner can always see what belongs to what. (last verdict: not checked; last evidence: (none))
- **E15**: Fix the ask-by-voice sheet's header: it's misaligned with too much vertical space, drop the redundant back button (keep the X), make the header compact, and merge the settings gear and the overflow "more" button into one menu so the chat gets the remaining space. (last verdict: not checked; last evidence: (none))

## Job
For EVERY ask above, LOOK at the real result and give one verdict:
`done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line),
and for anything not `done` the smallest fix.
**Prove before you call something missing.** Search the repo (`git log`, grep, `.claude/skills/`, CLAUDE.md) before writing "not done".
The live site: http://monorepo.localhost (never http://localhost/). Visual asks: headless Playwright at 1920 and 3440
(Playwright, never the owner's tabs — no `mcp__site__eval` on tabs the owner has open). Time the Live card load.
Check scroll on named URLs with real overflow measures. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
Do NOT edit any repo file. Scratch goes in your scratchpad; screenshots to
`public/framework/ai/sessions/2026/10/07/feedback-council/shots/checker-3-<ask>.png` only for evidence shots (keep <=12 total).

## Return
Write ONE json file `public/framework/ai/sessions/2026/10/07/feedback-council/votes/checker-3.json`:
`{"name":"checker-3","votes":{"<id>":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...}}`
Cover every id listed above. Then reply "done" in one line. Budget about $2: be quick, do not over-explore.
Never write the owner's name anywhere.

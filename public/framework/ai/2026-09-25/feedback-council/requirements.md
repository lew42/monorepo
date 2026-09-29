# Feedback council — brief for each of the five checkers

Card dir (read the raw words there): `public/framework/ai/2026/09/25/feedback-council/`
Words: `public/framework/ai/2026-09-25/feedback-council/owner-words.md` and `ai2-prompts.md`.
Asks to check: `public/framework/ai/2026-09-25/feedback-council/asks.md` (A1–D14, plus extras you find).

## Your job
For EVERY ask, LOOK at the real result and give one verdict:
`done` / `partly` / `not done` / `done-but-wrong`, one line of evidence (URL, screenshot path, file:line), and for anything not `done` the smallest fix.
**Prove before you call something missing.** A false "not done" is the common failure: search the repo (`git log`, grep, the skills in `.claude/skills/`, CLAUDE.md) before writing it.
The live site: http://monorepo.localhost (never http://localhost/). Visual asks: headless Playwright at 1920 and 3440 (Playwright, never the owner's tabs, no `mcp__site__eval` on tabs the owner has open). Time the Live card load. Check scroll on the named URLs with real overflow measures. No window may pop up: `windowsHide: true`, `-WindowStyle Hidden`.
Do NOT edit any repo file. Scratch goes in your scratchpad; screenshots to `public/framework/ai/2026-09-25/feedback-council/shots/<your-name>-<ask>.png` only for the ones that are evidence (keep <=12).
Also scan `ai2-prompts.md` and add up to 8 **extra asks** the owner made there that A–D miss, with the same verdict.

## Return
Write ONE json file `public/framework/ai/2026-09-25/feedback-council/votes/<your-name>.json`:
`{"name":"...","votes":{"A1":{"v":"done|partly|not done|done-but-wrong","e":"evidence","f":"smallest fix or empty"},...},"extra":[{"ask":"...","v":"...","e":"...","f":"..."}]}`
Then reply "done" in one line. Never write the owner's name anywhere. Budget about $2 each: be quick, do not over-explore.
Load the `minion` skill first only if it does not conflict: you edit nothing but your votes file and shots.

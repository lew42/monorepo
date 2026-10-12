# Night audit: are tonight's "done" and "already built" claims true?

**Why:** the owner wasn't sure how accurately past audits judged what was done. Tonight about 25 tasks under `ai/2026-10-12/` landed, several saying "already built, no code changed". Check them before the owner relies on them.

## Done when
- [ ] A node script lists every `ai/2026-10-12/*/task.jsonl` landing (title, outcome, ticked points, commits) into `claims.json`.
- [ ] For each ticked point, check the proof it cites (file:line exists and does what it says, the commit is on michael/dev, the page loads headless at 1200 and 400). Haiku for the mechanical checks (file:line, commit exists), Sonnet for the "does it do what the ask meant" judgement on the page, AI and voice tasks.
- [ ] `report.md`, one screen: claims checked, how many held, each one that didn't (one line + what is actually true + the fix), and the measured accuracy of the "already built" verdicts. Fix the small false ones directly (commit); the rest become lines in the right `asks.md`.
- [ ] One `owner_note` (kind `decision`) linking `report.md`.

Sonnet 5.5, medium; Haiku under 60k per call. Commit each step; merge. `STATE.md`; land with `finish-task`.

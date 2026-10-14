# Landing check: a landing line is only true if the work is on michael/dev

1. `Server/LandingCheck.mjs` (`LandingCheck.verify(branch|taskDir)`) decides by **file content**, never commit count: `merge.mjs` sometimes lands a branch by applying its diff, so a landed branch can still show commits ahead.
2. Every file the branch changed since its merge base must be identical to michael/dev's current file, or have been that exact content somewhere in michael/dev's history for that path (a later edit is fine). A `.merge-landed.json` entry for the branch head counts as landed.
3. The result is `{landed, ahead, changed, checked, missing}`; `changed` and `checked` must be equal.
4. Two callers, one check: `Agent.landing_check()` in `Servex/agents/Agents.js` (task has a landing line but files are missing: a `log` line on the task, a `card_reply`, a wake of the parent; the landing line is never deleted) and the "unmerged" flag in `Server/FollowUp.mjs`.
5. Test: `node Server/LandingCheck.test.mjs` (stub repo). Audit every unmerged branch: `node Server/landing-audit.mjs <out.md>`.

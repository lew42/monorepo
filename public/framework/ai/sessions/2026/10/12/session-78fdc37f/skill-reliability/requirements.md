# Skills: why 80-95% and not 100%, and why six are never called (mastermind brief)

**Owner (2026-10-12):** "more than 80% and less than 95% is like, why isn't it 100%? If it's able to do it most of the time, why can't it do it all the time?" And skills never called at all "seems strange, like something's not happening properly." Node should do the bookkeeping, not rely on the model.

**The numbers come from** `ai/sessions/2026/10/12/session-b5cae4be/skill-usage-audit/` (`SkillUsage.mjs` over 8,067 sessions: about 95% loaded when Servex injects the skill, 66-80% when self-chosen, about 0% when nothing mentions it; never called: `assistant`, `log-assistant`, `master-assistant`, `fork-claude-session`, `performance`, `prompt-refine`). @mastermind-skill-prune is applying the safe half of its recommendation; coordinate with it, don't redo it.

## Done when (tick each with proof)
- [ ] **Check the measurement first:** read `SkillUsage.mjs`: is a "miss" real (the skill was needed and not loaded) or a counting artefact (the role ended before it needed it, the skill text was already in the prompt, a resumed session, a renamed skill)? Sample 10 misses by hand; give the corrected rate.
- [ ] **The never-called six:** for each, why (no role injects it, its description never matches, the role it was for is retired, its name changed). One line each.
- [ ] **Make it 100% where it must be:** for every skill a role must follow, Servex puts the skill text into the agent's first turn itself (node, deterministic) instead of asking the model to call Skill, and logs that it did. Measure before and after on a few spawns.
- [ ] Short `Servex/doc/skills.md` (what is injected, by whom, measured rates), linked from the Servex readme. Commit each step; one batched Servex restart proven on a private port; merge.

Sonnet 5.5 (you). One-sentence chat replies; `STATE.md` here; land with `finish-task`.

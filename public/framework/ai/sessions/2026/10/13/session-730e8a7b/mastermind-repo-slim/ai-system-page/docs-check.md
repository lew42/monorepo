# docs-check: doc/architecture.md

Note: `load_module` failed twice ("path" undefined, whatever argument I passed), so I read the readme chain's target doc directly.

## Newcomer read: mostly yes
- The opening paragraph says what the AI system is in plain words. Every section repeats the same Decided / Why / Instead / Detail shape, which is easy to scan.
- Unclear: the opening uses "cards", "rail", "Servex", "mastermind" and "minion" with no definition. The three-tier section defines the tiers in a clause each, but "mastermind" first appears in the step-runner section's neighbours without a gloss. One sentence of glossary near the top would fix it.
- Unclear: "the Claude wall" (OpenRouter section) is jargon. Say "when the Claude usage limit is hit".
- Unclear: "Open" says "27-task known-answer suite" and "Confidence weights" (0.5 vs 1.0) with no context, so a newcomer can't tell what is being weighted.

## Claims checked against code
1. **fast = Haiku — TRUE.** `Servex/agents/tiers.js` line 6: `fast: claude-haiku-5-5`. `scan` is Haiku too. The doc says "smart = Sonnet" and I didn't open that line.
2. **session-backend.txt switch — TRUE, but understated and one detail is missing.**
   - `tiers.js` makes EVERY Anthropic tier resolve to OpenRouter when the file says `openrouter`, including spawned masterminds and minions. The doc says only "voice assistants and refine".
   - `tiers.js` reads the file once at load, so the owner must restart Servex after changing it. The doc says "one file moves them" and doesn't mention the restart.
   - The auto-switch on a Claude refusal is real (`Sessions.js` ~line 296 and ~156).
3. **Step runner nudge — TRUE.**
   - `Server/Steps.mjs` finds the current step past twice its estimate that hasn't been nudged. `Servex/TaskLoop.js` `nudge_step` sends one nudge per step and logs it. A test and a proof script cover it.
   - The doc names only `Server/Steps.mjs`. The sender is `TaskLoop.js`, and the Detail link should mention it.

## Links
- All checked links resolve (design map, requirements-5, models, readmes, task-folders, autonomy, tokens, `Servex/ext/openrouter`).
- Nits: `[Servex roles](/framework/servex/doc/roles/)` points at a folder-style route for a `roles.md`. By the CLAUDE.md rule it should be the plain `.md` path.
- No stale content found.

## Suggested fixes (not applied)
- Add the glossary sentence and replace "Claude wall".
- OpenRouter section: say it covers all Anthropic tiers, and that Servex needs a restart.
- Step runner Detail: add `Servex/TaskLoop.js`.

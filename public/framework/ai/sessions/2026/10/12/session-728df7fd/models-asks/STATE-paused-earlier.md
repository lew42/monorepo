# models-asks: state (paused, not landed)

**Why paused:** after a session restart the shell here asks for approval on `node`, `git -C`, `git add` and `git commit`, and nothing can approve it. File edits still work. Nothing below is merged or committed except the first worktree commit.

## Done
- ✅ **Test suite:** `Servex/ext/openrouter/evals/quick.mjs` now has 27 known-answer tasks in 9 job shapes (code edit with a test, readme check, card classification, transcript clean, refine step, summary, extraction, reasoning) and 5 default models (luna, deepseek-v4.1-flash, gemini-3.8-flash, claude-haiku-5.5, claude-sonnet-5.5) at low and high thinking. The table now shows `$ per task` and passes by job shape, and the models page (`AIOverview.render_quick`, worktree) shows both columns. Uncommitted in the main tree.
- ✅ **Partial results (142 of 270 calls, about $0.05):** `gpt-6-luna` 27/27 and `deepseek-v4.1-flash` at both thinking levels were clean so far; luna costs about $0.00003 a task. Gemini, Haiku 5.5 and Sonnet 5.5 are not finished: the background run died with the old session.
- ✅ **Voice switch, written (branch `michael/models-asks`, worktree `.claude/worktrees/models-asks`, one commit):** `Sessions.js` runs session-fast/session-smart on `VOICE_MODELS` (luna) when OpenRouter is ready (key and spend guard), and on Claude, with a chat notice, when it is not or the spawn is refused; `session-backend.txt` = `claude` forces Claude. `Agents.js` exempts those two roles from the OpenRouter pause (the spend guard still applies). `Sessions.test.mjs`: 14 checks pass.
- ⬜ **Written after that commit, not committed:** `RefineCall.js` runs any `provider/model` slug as one plain chat-completion (cost from OpenRouter, falls back to Claude Haiku), `run.js`, `ClarityScorer.js`, `Annotator.js`, `RefineSystem.js` default to luna, `Prompt.js` no longer links a run that has no session, and `Servex/agents/voice-models-proof.mjs` (private Servex on 8390: A with a key = all openai, B without = all Claude).

## To finish (in order)
1. `node Servex/ext/openrouter/evals/quick.mjs --models google/gemini-3.8-flash,anthropic/claude-haiku-5.5,anthropic/claude-sonnet-5.5 --budget 3` then `--table` (publishes to the models page).
2. In the worktree: `node Servex/agents/voice-models-proof.mjs` (expect PASS), commit, review diff, `merge.mjs`, then `node Servex/sustain.mjs --restart`.
3. Re-run the voice walk: `node public/framework/ai/2026-10-12/voice-verify/walk.mjs desktop` and `phone`. Baseline: Structure/Refined/Cards 6.6 s after Refine, one prompt, no overflow. Luna should be faster; if the walk breaks, put `claude` in `session-backend.txt` and set `RefineSystem.model` back.
4. Write the one-line-per-job-shape recommendation in `ai/doc/models.md` from the table, and update the two asks entries (`ai/doc/asks.md` #1 and `ux/Dictate/doc/asks.md` voice-model-policy, per-sentence-model-clean: per-sentence clean on luna should cost about $0.00003, not $0.07, so it can be switched on).

## Not done
The voice walk was **not** re-run, since nothing is live yet. The live voice roles are unchanged and still on Claude.

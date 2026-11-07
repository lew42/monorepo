verdict: fix
1. [fix] Task t14 is never closed: `session.jsonl:435` adds `t14-calibration`, but no later line closes it with an outcome and evidence, and `requirements.md` still shows `- [ ] **t14, calibration:**` even though its own text says "Done". After the reader lands, close t14 with its proof (the merge, `calibration/results.md`, `/live/calibration/`) and tick the box.
2. [note] All three fixes from the last review are in (commit 2a3d59f33). `RefineQueue.owner_text` now just calls `ClaudeCodeTranscript.owner_text` (`Server/RefineQueue.mjs:58`), so there is one filter. `Server/doc/transcripts.md` explains how it relates to RefineQueue and how the two number turns. `calibration/` now has a readme and results.md, and both are in git. In the worktree, `node Server/ClaudeCodeTranscript.test.mjs` passes 5 checks and `node Server/PromptAudit-stream.test.mjs` prints ok.
3. [note] The shared filter now also drops `[Request interrupted…` lines (`Server/ClaudeCodeTranscript.mjs:25`). This changes RefineQueue and PromptAudit too, which will no longer file "[Request interrupted by user]" as an owner prompt. It's a good change, but the commit message doesn't mention it.
4. [note] There is still a third owner-prompt filter: `Server/AskTally.mjs:45` has its own regex, with a slightly different list (`<`, `Base directory for this skill`). Law 6 says to point it at `ClaudeCodeTranscript.owner_text` in a later small step. That code isn't in this diff, so this is a note and not a fix.
5. [note] Both t14 commits (2b0ff8539, 2a3d59f33) are still on `worktree/shell-commits`, the t13 branch that was already merged. The landing log will show this as "shell-commits" again.
6. [note] `Server/readme.md:54` indexes the new tool and its test. `Server/doc/transcripts.md` documents it. `calibration/readme.md` links back to it. Nothing new is left unindexed, and a fresh agent could pick up t14 from `calibration/readme.md` alone.

## Requirements
- t14 "a transcript reader named for Claude Code transcripts" — yes — `Server/ClaudeCodeTranscript.mjs`, test passes
- t14 "3–5 of the owner's prompts … Haiku then Sonnet … judged by Opus" — yes — `calibration/inputs/` has 4 prompts and `outputs/` has both models; `results.md` has the verdict
- t14 "suggestions go on a /live/ sub-page" — yes — `public/live/calibration/page.jsonl`, linked from `public/live/page.jsonl:215`
- t14 "Write no tasks into that record" — yes — the diff doesn't touch the voice-app record
- t14 closed with evidence — no — no close line for `t14-calibration` (finding 1)
- New class: can you open a page that shows its live instances? — n/a — it's a read-only CLI reader and holds no state
## Words
- Comments and doc are plain, full sentences — yes — `Server/doc/transcripts.md` new section; `Server/ClaudeCodeTranscript.mjs:1-6`
- The doc says what the tool is, how to run it, and what it writes — yes — "Nothing is written", with the usage block

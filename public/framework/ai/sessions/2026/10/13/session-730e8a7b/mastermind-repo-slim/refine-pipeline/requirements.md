# Refine pipeline: a node queue has Haiku refine owner prompts, and the session page shows coverage

Budget: $30. Load the `sub-mastermind` skill first; you are an Opus task mastermind because you review Haiku's refinement products and judge the design. The owner's raw words: `../requirements-6.md`, asks 1, 2 and 4 (the whole dictation is about this). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; one of everything; classes not function bags; Haiku under 100k with a lean system prompt; the AI never has to remember a loop, node reprompts.

## What exists (extend, never a second system)

- **Refiner:** `ext/Refine` (`RefineSystem`, `Prompt`, `Scorer`, `stages/`, `doc/voice-to-page.md`), `Server/refine.mjs` (dictation → `brief.md` + `coverage.md`), `Server/doc/refine.md`, the 10-08 prompt audit.
- **Sibling tasks running now:** `prompt-outcomes` (Opus; tallies every ask since 09-15 with two confidences; don't redo its gathering, read its `asks-outcomes.jsonl` when it lands) and `refine-confidence` (the 0.5 scale; `Server/refine-days.mjs` runs the refiner day by day).
- **Where prompts live:** each task dir's `task.jsonl` `chat` lines (`from: "owner"`) and `requirements*.md`. Raw SDK sessions are served at `/ai-logs/<id>` (no duplicate transcripts) and rendered by `ai/AISession/AISessionConversation.js`; `SessionIndex` gives every task row its raw-log path.
- **Agent cap:** `Layers.js queued()`, and `working_cap` in `Agents.js` (env `SERVEX_WORKING_CAP`, 5).

## Deliverable

1. **`Server/RefineQueue.mjs` (`class RefineQueue`)**:
   - Input: prompt references (session id + prompt index, or task dir + chat line).
   - Runs ONE Haiku minion per prompt, at most N at once (working cap or `--parallel`, default 2). Node starts the next one, never a mastermind's context.
   - Brief: refine essentials under 3k tokens plus the prompt, nothing else.
   - Output: page deltas through the page tools, as a `refined` card (structured prompt → refined prompt → asks as rows). Each row has `cites` to the raw prompt and a link `/ai-logs/<id>#<line>`.
   - Dry run prints the queue and estimated cost; `--limit` caps the run.
   - Log real cost per prompt and tokens per minion (under 100k; report the max).
2. **Opus review of Haiku's products**: you read 10 products against their raw prompts and score coverage (asks in the raw prompt that the refined prompt dropped or distorted; 0.5-scale confidence per the sibling's `ext/Refine/doc/confidence.md`); if Haiku drops details, change the brief (shorter, one-at-a-time, an explicit "list every specific suggestion before condensing") and rerun those 10; record both scores. The product that reaches ≥ 0.9 coverage on your review is the shape the queue keeps.
3. **Coverage on the session page**: `AISessionDetail` gets a "Coverage" tab (or a block in the Conversation tab if a tab is too much): per session, every ask found (from the refined cards), its status (done / partly / not done / open, from `asks-outcomes.jsonl` where it exists, else "unreviewed"), a click-through to the raw prompt line, and the session's coverage score (asks with a verdict ÷ asks found). Reuse the existing tabs and card components; nothing new where something exists. Prove it on three sessions from 10-12 and 10-13 with screenshots.
4. **Run it on the last 7 days** of owner prompts (newest first) within budget; stop when the budget is reached and say where you stopped.
5. **Promotion rule** (ask 4): a line in the `documentation` skill (one sentence) and `ext/Refine/doc/refine.md`: an ask that appears in three or more sessions is promoted to the module's `doc/architecture.md` or, if it is site-wide, proposed for the root readme as a decision line; `RefineQueue --repeats` lists today's candidates.
6. Report on your card: prompts refined, cost per prompt, max tokens per minion, the before/after coverage scores, the three session screenshots, the repeats list.

Fence: `Server/RefineQueue.mjs`, `ext/Refine/**` except `Scorer.js` and `doc/confidence.md` (refine-confidence's), `ai/AISession/AISessionDetail.js` + a new `AISessionCoverage.js`, `.claude/skills/documentation/SKILL.md` (one sentence), `.claude/skills/refine*/` if one exists, this task dir. Worktree, four widths on the session page, `merge.mjs`. Never read the gitignored transcripts into a committed file beyond one-line cites; never spawn more than N minions at once.

# The 230 proposed tasks: sort them under the three priorities, accept what plainly serves one, park the rest

Budget: $10 (about $3 of it is the Haiku batches). Model: Sonnet, medium effort (the design is decided below; you build and test it). Parent: `mastermind-deputy`, who reviews and merges. Don't merge or restart Servex yourself.

## The owner's words

`../../../prompts.jsonl`, the `"stage":"raw"` line at 2026-10-23T23:51:53Z: "230 task proposals. Figure out what we could do about that ... Don't wait for me for approval." And: "I don't want 1,000 irrelevant sessions showing up in my inbox ... I basically want to click a button and approve all, you know, entire chunks."

## What exists

On 2026-10-17 and 2026-10-23, old owner asks were sorted and the ones still wanted became **proposed tasks** (state `waiting`, `waiting_on: "owner"`) in each module's `tasks/` folder: about 230 of them. They are listed in `public/framework/ai/asks/undone-to-tasks.jsonl` (the `task` url of each line). How they were made: [undone-asks-2026-10-17.md](/framework/ai/doc/undone-asks-2026-10-17.md), last section. The tools: `Server/UndoneVerify.mjs` (Haiku batches with one question each: `--batches`, `--run`, `--merge`) and `Server/UndoneToTasks.mjs` (`--plan`, `--apply`). The priorities are the three big things in [priority.md](/framework/ai/priority.md).

## Decided (the alternative is recorded beside each)

1. **Count first, by code:** list every proposal still in state `waiting` with `waiting_on: "owner"` (replay its record with the Task class or the item tool, never by reading text). Some may have been handled since.
2. **One Haiku question per proposal:** which of the three big things in priority.md does it *plainly* serve: 1, 2, 3, or none? Answer `none` when in doubt. Reuse UndoneVerify's batch machinery with a new `--question priority` (25 per batch, the three big things' text in the brief), so cost lands in `runs.jsonl` as before. Don't build a second batch runner. Run the batches for real: they only write answers and change no task. Keep each batch's brief small (no repo search needed), so a batch costs cents.
3. **Accept what plainly serves a priority:** `approve` it (the Task verdict verb, `waiting → idle`) with `by: "mastermind-deputy"` and the note `"serves priority N: <name>. The owner, 2026-10-23: don't wait for approval; accept what serves a top priority"`, and set `priority: N` on it. Then it is queued work in that priority.
4. **Park the rest in a backlog:** it stays `waiting` (still a proposal, still recorded), but `waiting_on` becomes `"backlog"`. The inbox counts only `waiting_on: "owner"` (`ai/rail/DashRow.js`, `Server/AIIndex.mjs`), so the backlog leaves the inbox without a new state. *Alternative not taken:* a new `backlog` state in `core/Task/Task.js` STATES; rejected for now because it changes a core list with many readers.
5. **Write every change through the item tool's own function** (as `UndoneToTasks` does: `Servex/agents/page_tools.js` `run_item`), never by hand. A `--dry-run` prints every change first; the run writes a manifest, `public/framework/ai/asks/triage.jsonl`, one line per proposal `{task, module, priority|null, action: "approve"|"backlog", at}`, so the pass can be undone.
6. **One summary for the owner:** a small view class, `ProposalTriage` in `public/framework/ai/asks/ProposalTriage.js`, reading `triage.jsonl` plus each task's live state. It shows one card: how many were accepted into each priority (each count a link to the list), how many are in the backlog, and an **Approve all** button that approves every backlog proposal in one press (each one an `approve` line through the same writer the session page uses, `FsFile.append`, as in `core/Session/SessionTasks.js`). Put the card at the top of [the undone asks page](/framework/ai/asks/undone/) for now. The review page (being built on `/framework/ai/` by `minion-review-page`) will mount the same class; don't edit `ai/AIDashboard/` yourself.

## How

- Own worktree (`take_worktree`), commit each working step. Read `past-work.md` first and the `code` skill before writing JS.
- Test: the dry run's numbers add up (accepted + backlog = the count from step 1), and the summary card at 400 and 1200 px, shot headless. Test Approve all against a scratch copy of two task records, never a real one, before running it for real (and don't run it for real: that is the owner's press).
- Document: one paragraph in `public/framework/ai/asks/readme.md` (what the triage is, the files, which writer, which class reads it) and a dated section at the end of `undone-asks-2026-10-17.md` with the numbers.
- Log to `session.jsonl` here at least every 10 minutes. When it works: `node Server/review.mjs <this dir> <your worktree>`, answer each finding, then end with `{"log":{"at":"NOW","msg":"ready: <branch> <sha> — <one line>"}}`. Do **not** run the real approve/backlog pass yourself: the deputy runs it after the merge, from the merged script.

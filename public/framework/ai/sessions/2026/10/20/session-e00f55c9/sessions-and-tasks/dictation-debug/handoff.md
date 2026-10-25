# Chat: handoff from mastermind-dictation-2

The owner's rule (2026-10-25): no more work under revived old agents. mastermind-dictation-2 stops here; a fresh child of voice session v-sq8y7db continues from this file. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). The full plan of record is [proposal.md](proposal.md).

## The mode the owner set

- **Safe fixes land without asking:** review (`Server/review.mjs`), answer findings, merge (`Server/merge.mjs`), tell the voice session when each lands.
- **Shape changes get a plan shown to the owner first:** one reader for V1 and V2, a server Session object, any Servex restart.
- **Priority:** the prompt pipeline (raw text live, the refined prompt looks right, three clear states). The Tasks tab is on hold.
- Servex restarts only through `node Servex/sustain.mjs --restart`, never while agents work or during a voice call.

## Landed today (on michael/dev)

- ✅ **Completed tasks show checked in Chat v2** ([fix-v2-checkbox](fix-v2-checkbox/)).
- ✅ **Drawer split:** back on the AI tab the chat takes full height; Chat v2 prompts are cards with room below ([drawer-split](drawer-split/), merge of `worktree/qf-3`).
- ✅ **Pipeline doc:** [ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md), first in the Docs tab ([pipeline-doc](pipeline-doc/), merge of `worktree/qf-5`). It found `core/Session/Session.js` already extends Task, so proposal.md's ⬜ on Session is wrong (fix it there).

## In flight

- **Round 1, [chat-sent](chat-sent/)** (minion-chat-sent, Sonnet). Branch `worktree/dictation-chat-sent`, worktree `C:/Code/lew42/worktrees/dictation-chat-sent`, head `0d3727c74`, merges clean. First review said fix; the follow-up fixed all five asks. **Next:** read the re-review (`chat-sent/review.md`, latest `review` line in `chat-sent/session.jsonl`), answer each finding (findings about raw-live, the long pause and refresh loss: "declined: moved to ../chat-live/"; readme goal lines: "done by pipeline-doc"), then
  `MSYS_NO_PATHCONV=1 node Server/merge.mjs C:/Code/lew42/worktrees/dictation-chat-sent /framework/ux/Dictate/ /framework/ext/Chat/v2/ --review-dir <this folder>/chat-sent`
  inside `node Server/hold.mjs on|off <your id>`. ⚠ It changes `Servex/agents/Sessions.js` (`mark_sent`): server-side sent marks show only after a Servex restart, at a time the owner picks.
- Its process, [chat-see-your-words-live-and-know-when-t](chat-see-your-words-live-and-know-when-t/), waits at the build step: complete it after the merge, then review-step and land.

## Queued, in order

1. **Round 2, [chat-live](chat-live/requirements.md)** ($5, Sonnet): raw text live in Chat v2, no flash on send, three states with separate cues that never revert (the black → gray → black flicker), periods, one steady send cue, the long pause that did not send, refresh loss, two verdicts on feeding fast. Start after round 1 merges; minion-chat-sent may continue it if its context is small, else a fresh minion.
2. **[v2-speed](v2-speed/requirements.md)** (polish; process [chat-polish](chat-polish/) waits at its okay step). Item 7 (spacing) is done by drawer-split; one leftover: "show raw" still has a little more space above than below.
3. **[one-chat-view](one-chat-view/requirements.md)**: plan first, shown to the owner (process [chat-one-session-one-view](chat-one-session-one-view/) waits at okay). The pipeline doc has landed, so its okay can be completed now; the plan step then runs and stops at the plan.

## Open questions to answer

- **Routing (the owner, relayed by session-smart, not yet investigated):**
  1. Is the chat on a session's own page (`/framework/ai/sessions/...`) the same component as the drawer's chat? It should be one component in both.
  2. Cards (prompts, tasks, questions) are previews; a click shows the full detail in place of the chat, with a way back. On a session's page that is a normal subpath through the existing router.
  3. The global voice sheet must not take the URL. Options: (a) UI-only state, (b) a query-string variable that also keeps the sheet open on reload and can carry an item path, (c) other. No new routing system; reload must not lose the spot.
  Report which option reuses what exists and the cost of each, short, with a recommendation. Check first whether the sheet already persists its open state (`ext/drawer/Sheet.js`, `ext/drawer/readme.md`).
- **From mastermind-tasks-completion** (its [Prompt record proposal](/framework/core/Task/doc/prompt-record.md), branch `worktree/prompt-record`): link it from one-chat-view's brief and from pipeline.md once merged. Its asks on our files, for round 2 or the one-view build:
  - `ext/Chat/v2/ChatV2Model.js:87` `sentences()` should import `core/Task/sentences.js` (its own regex splits "session.json").
  - `edit()` should handle `paragraphs.replace` ({id, text}), string or array `raw` pushes, and dedupe `paragraphs.add` by id (V2 shows two where core keeps one).
  - Facts for pipeline.md: smart's {title, text} refine the Prompt and the cleaned paragraphs stay; core `Prompt.text` returns the refined text, else the cleaned.
  - The fast seat's `{place}` never becomes a Prompt paragraph (0 of 56 prompts in v-sq8y7db have a second one); the Servex writer fix is theirs, proposed to mastermind-ai.

## Known defects

- **Merge gate tests against the live site:** MergeTests runs the branch's new tests against the main site, which still serves old code, so a new test fails before the merge. Prove it on the worktree url, then `--skip-tests`. Worth filing as an improvement on the merge tooling.
- **merge.mjs refuses adjacent-line conflicts** even when both sides are compatible; when the worktree is dirty with `files.jsonl` churn, `git merge michael/dev` in it aborts. What worked: make the worktree's file match dev, merge, re-apply the small change on dev.
- **Git-ignored shots:** `public/framework/ai/**/*.png` is ignored; `git add -f` each shot a review must see.

## Agents

- minion-chat-sent: working on round 1, idle after it; may take round 2.
- minion-drawer-split, minion-pipeline-doc: done; stop them.
- Old worktree `fix-v2-nested-state`: merged, only `files.jsonl` churn; close it with `node Server/worktree-down.mjs`.

Pace at handoff: week about 49% used, 54% gone.

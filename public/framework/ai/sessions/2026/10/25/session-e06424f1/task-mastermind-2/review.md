verdict: fix
1. [fix] The diff builds an ask that isn't in this task's records. It groups spoken lines into one bubble: the owner's "So it seems like we're not grouping. My chat logs are coming in very quickly…", in `/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl` around line 4055. It also sets the smart wake to `every: 1`. Neither `requirements.md` nor `plan.md` lists either change, so a fresh agent reading this folder can't tell what the `worktree/grouping` commit f18f25351 is for or whether it's done. Add both as numbered asks, with the owner's words linked and a status.
2. [fix] The two changes work against each other. `every: 1` (`Servex/agents/WakePolicy.js:12`) wakes the smart seat after every finished sentence, and each smart reply closes the open Prompt through `reply_closes_prompt()` (`Sessions.js` `voice_say` smart branch, about line 1449, and the refine path, about line 930). Example: the owner dictates, smart answers sentence 1, and sentence 2 lands in a new bubble. That is the "a new line for lots of little parts" problem the owner reported. Either close on a reply only once the floor is `done`, or keep the Prompt open while the owner is still speaking. Then show grouping working in a recorded dictation: a test or a shot of Chat v2 with smart replies coming in.
3. [fix] `public/framework/ux/Dictate/doc/wake-policy.md:41` has a broken link, ``[`WakePolicy.js`]((../../…/WakePolicy.js))``. The doubled `((` makes the link target wrong.
4. [fix] None of the touched modules' docs mention the new grouping rule. `prompt_close_ms` (8 s), `prompt_close_on_reply` and their env vars `SERVEX_SESSION_PROMPT_CLOSE_MS` / `_ON_REPLY` appear only in a code comment. `ext/Session/doc/sessions.md` and `ux/Dictate/readme.md` describe the other session timers (`answer_quiet_ms`, 2.5 s) but not when a bubble closes. Add one sentence where the 2.5 s hand-off is explained (`ux/Dictate/readme.md`, the "How messages travel" paragraph).
5. [note] A typed line doesn't close at once the way the comment says. If a spoken Prompt is still inside its 8 s window, `say()` → `assign_prompt()` (`Sessions.js:977`) adds the typed line to that spoken bubble, and only then does `release_thought` close it. The comment above it, `Sessions.js:974-976` ("clears `s.prompt` once that happens"), is now stale too.
6. [note] Changing the default to `every: 1` leaves existing sessions on `every: 6`. A session with a saved `wake` in `sessions.json` keeps it, and so does a browser with a `wake_every` saved in `localStorage` (`ext/Chat/Mic.js` SETTINGS). Also, with `every: 1` each sentence is a paid smart-seat turn. The owner accepted the token cost in the voice session, so say so in `wake-policy.md`'s cost line.
7. [note] `wake-policy.md:9` still gives the `gap_ms` default as 6 s and the cue as `(paused 6 s)`, while `WAKE_DEFAULTS` is 12000. That was stale before this diff, but the diff edited the next row. Row 11's cue reads `(1 sentences)`.
8. [note] I couldn't run the new test in the worktree. `node Servex/agents/Sessions.test.mjs` in `C:/Code/lew42/worktrees/grouping` fails with `ERR_MODULE_NOT_FOUND @anthropic-ai/claude-agent-sdk` because that worktree has no `node_modules`, and nothing in the task folder records a passing run. The test also covers only the timer and the toggle. It doesn't cover a smart reply arriving mid-dictation (finding 2).
9. [note] Seven of the 15 files are `files.jsonl` churn: `failures.jsonl` gone/back toggles, plus `errors/files.jsonl` marking `2026-10-26.jsonl` gone. The same note was made in the last review round (`review.jsonl` n:6). `ux/Dictate/doc/files.jsonl` indexes `whisper-timeline.md`; that file exists and is fine.
10. [note] Is there a simpler way? The 8 s close timer is a second "quiet" clock next to the floor's `answer_quiet_ms` and WakePolicy's `gap_ms`. A Prompt that closes only when a new thought begins (the fast seat's `(new paragraph)` placement, or a typed line) would need no timer. `ext/Chat/doc/architecture.md:21` already decides that bubbles in the V1 chat merge within `MERGE_GAP_MS`, 10 s. Reuse or align with that number rather than adding a separate 8 s value.

## Requirements
- 1 "One shared reader" — no — not in this diff (requirements.md says Open)
- 2 "Live raw whisper text in V2" — no — not in this diff; the live draft is still unbuilt
- 3 "Cards converge" — no — not in this diff
- 4 "Routing design" — yes — routing/report.md
- 5 "Offscreen-completion cue" — no — not in this diff
- 6 "Smart working indicator" — yes — recorded done in chat-live/result.md; untouched here
- 7 "Fast seat places… smart seat titles" — n/a — this diff doesn't touch the roles
- 8 "Windowed chat list" — no — not in this diff
- 9 "Ids clickable" — yes — done earlier
- 10 "Close out predecessor's records" — yes — done earlier
- Unlisted: grouping ("we're not grouping… coming in very quickly") — partly — built, but undone by smart replies when `every: 1` (finding 2) and not recorded (finding 1)
- Class live-instances page — n/a — no class added; `Sessions` gains methods only
## Words
- Words — no — the `wake-policy.md:41` link is broken (finding 3); the `(1 sentences)` cue and the stale 6 s default (finding 7)

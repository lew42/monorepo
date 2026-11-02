# Voice session mixup: what happened (2026-11-02, about 15:20 to 15:25 local)

## Short version
Nothing from another session leaked. The drawer's "Pick up where you left off?" offer and the place the sentence went disagreed about which session was "the last one". The "green checkmark" message was an older line of the session your sentence did go to, replayed as history.

## The evidence (`%LOCALAPPDATA%/lew42/servex/sessions.json`, session files)
- Sessions of project `monorepo`: `v-qfzrnhh` (started 13:06, last spoke 15:38) and `v-u48msei` (started 11-01 17:05, last spoke 11-02 13:05).
- "22 hours ago" is `v-u48msei` measured from its START (11-01 17:05), not from when it last spoke (13:05 today).
- Why that one: the offer (`maybe_offer`, `ux/Dictate/chat.js`) asked `Session.recent(target.path, {limit: 1})`, the sessions that touched THIS page's folder. `v-u48msei` had visited `.../voice-bridge/`; `v-qfzrnhh` had not. It also showed `row.at` (start) as its age.
- Your first sentence then called `ensure()`, which uses a different rule: the project-wide newest voice session spoken within 30 min, `recent_project`. That is `v-qfzrnhh`. Line `15:23:58` "Can you hear me?" is in `v-qfzrnhh/session.jsonl`, with the smart seat's answer 4 s later.
- The "green checkmark" line: `v-qfzrnhh/session.jsonl` lines 652-663, 15:17:09, written by the owner's own sentence and the smart seat in that same session. When the drawer attached to `v-qfzrnhh` after the sentence, `attach()` redrew the session's whole file (`on_history`), so a 7-minute-old exchange appeared as if from nowhere.
- Server side had the same split: `Sessions.create()` resumed `recent({page: home})`, the page's list, so a Servex-side "resume" could also pick a different session than the browser's join.

## Fixes (this branch)
1. `maybe_offer` uses `recent_project`, the newest `v-` session by `last_at`, and the age shown is time since it last spoke. Shared helper `latest_voice` also drives `ensure()`, so offer and join name the same session. The offer shows only when the join would not (idle over 30 min), which also removes the 30-60 min gap where neither fired.
2. `Sessions.create()` with no card resumes the project's newest voice session, not the page's. A card session still resumes per card.
3. `draw()` drops a chat line stamped with another session than the one watched (a late event from the session just left).
4. Switching: `deliver` reads `ctl.session` at send time, so a sentence follows the switch with no pause. Test 6 in `ux/Dictate/test/active-session.mjs` proves A, B, A with no wait between a switch and the next sentence.

## A reply goes to the session its question came from
It already did: each session has its own smart and fast agent, told only that session's lines, and they write into that session's own file (`v-qfzrnhh`: the smart seat's answer 4 s after "can you hear me"). The browser guard above is the second wall. No leak found, no code change.

## Two copies of the resume rule
Merged as branch `worktree/voice-resume-one-rule`: `Layers.session_for()` (page and card prompts) now calls `Sessions.create()`, so the drawer, the browser join and Layers share one rule. Behaviour change: a card prompt now continues a session only if it spoke in the last 30 min (was 60), and a new one starts from the page's folder, not the card's. Needs a Servex restart (vscode-mastermind's), like the Sessions.js change.

## Tests
`node Servex/agents/Sessions.test.mjs` (29 checks, new one for the project-wide resume); `node public/framework/ux/Dictate/test/active-session.mjs <worktree url> <worktree>` ALL PASS (new 5 and 6).

## Not covered
Servex-side change needs a Servex restart (vscode-mastermind's). The browser-side fixes need only a reload.

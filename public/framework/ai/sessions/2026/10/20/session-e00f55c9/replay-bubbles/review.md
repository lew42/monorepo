verdict: fix
Findings 1, 2, 4 and 8 of the first pass are fixed: the shots are tracked, the contradicting clause is gone, and the merge is 8a4158816.
3. [note] The brief asked for shots through `monorepo.lew42.com` with the phone's UA. `phone-shots/readme.md` says they were taken on the branch's own dev server, because the main site couldn't show the code before the merge. That reason holds, but retake one shot on `monorepo.lew42.com` after the merge to prove the deployed path.
5. [note] `audio/Recite/files.jsonl:23-24` gained two lines for a temp file (`Recite.js.tmp.49108…`, added then gone). This is noise from an atomic write, so drop the lines or stop whatever writes temp files into the index.
6. [note] The second review's note 5 still holds. `Recite.queue()` sets `focus_el = null` on any non-replay queue, so a reply that arrives during a replay can make the highlight light an older bubble with the same opening words.
7. [note] `ReciteBubble` has only static members, so its class page has no live instances to show. That's low stakes, because the state lives in `Recite.places` and in localStorage `lew42.recite.places`.

## Requirements
- 1 "one small control per assistant reply bubble, shared by V1, V2 and V3" — yes — `ReciteBubble.mount` is called from `ChatV3.reply()` (V2 inherits it) and from `Widget.Thread.replay_ctl`. A tap on the text goes through `ReciteTap.root_of`, which skips links, chips and buttons.
- 2 "play a finished bubble from where it stopped, else the start; ↺10; through Recite; stops whatever else plays" — yes — `Recite.replay()`, `step_back()` and `stop()` are in `Recite.js`, and the queue rules are unchanged for non-replay calls.
- 3 "remember each bubble's last read word, in memory plus per-browser storage" — yes — `set_place()` and `clear_place()` write `lew42.recite.places`.
- 4 "a headless test per view plus a unit test for resume-from-word" — yes — `ReciteBubble.test.mjs` covers V1, V2 and V3, using a `/speak` stub and `FENCE_SERVEX`. `Recite.test.mjs` adds the replay, `step_back` and place tests, and the headless test is on `browser-scripts.mjs`.
- 5 "shots at 360×740 of V1, V2 and V3 through monorepo.lew42.com with the phone UA" — partly — the shots exist in the worktree, but they are gitignored (finding 1) and weren't taken on that host (finding 3).
- 6 "Docs: Recite readme (resumable bubbles to built) and ReciteTap.js header" — yes, with one stale clause — the readme and the `ReciteTap.js` header are current, but `architecture.md:41` contradicts itself (finding 2).
- Class with live instances — no — finding 7 (a note).
## Words
- The readme, `architecture.md` and `phone-shots/readme.md` use plain sentences and the owner's terms (▶/⏸, ↺10, "replay any reply"). The one wording defect is the contradiction in finding 2.

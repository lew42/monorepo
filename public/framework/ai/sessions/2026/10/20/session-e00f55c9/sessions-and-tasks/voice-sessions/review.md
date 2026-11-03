verdict: fix
1. [fix] A voice session's cost and child count drop back to $0 / 0 every time its own record grows. `schedule_record` (`AISessionIndex.mjs:117`) rebuilds the voice snapshot with `record_snap`, which always returns `children: 0, tree_usd: usd`. `set()` (`AISessionIndex.mjs:301-310`) then stores that, and `roll_voice` runs only when the *changed* snapshot's parent is a voice session, never for the voice session itself. The last write of a session is usually a chat line, so the list can end up showing $0 and no children. Fix: in `set()`, also call `this.roll_voice(snap.id)` when `snap.kind === "voice"`, and add a test that re-sets the voice snapshot after its children are in.
2. [fix] The ~01:55 ask is not written: `Servex/agents/session-smart.md` never names `mastermind-dictation-2`. The ask was that a dictation ask goes straight to `mastermind-dictation-2` with `send_to_agent`, and its "it's live, try it" comes back into the voice session. Add that bullet beside the `item` bullets (lines 3-9).
3. [fix] There is still a stale doc. `ext/Session/doc/sessions.md:90` ("Card sessions") says a card session's file is `/framework/ai/<card>/ai/<session>.jsonl`, beside the card's `page.jsonl`. The code now puts every voice session in the dated store (`Sessions.js:695`, `715`), and the backfill moves the 8 card records too (`session.jsonl`, decision 01:29). Reword it: `home` is the card folder, and the file is in the dated store.
4. [note] Requirement 3's proof (a 1920 shot of `/framework/ai/sessions/` showing a dictated voice session, its cost and its children) is not in the task folder yet. `backfill-manifest.json` is still a dry run (`applied: false`, 61 rows, all `move`). Both come after the merge, and the order is recorded ("REMAINING STEPS", `session.jsonl` 01:29). This is in order, not a gap, but item 1 above will show up in that shot.
5. [note] `Sessions.relocate` (`Sessions.js:417`) and `voice-backfill.mjs` `plan()` work out the day separately: one from `sessions.json`'s `s.at`, the other from line 1's `at` in the record. Both use local time, so they agree as long as those two `at` values match. If they ever differ near midnight, `relocate` finds no file and silently leaves `s.file` pointing at the old path. Spot-check one row of the manifest after `--apply`.

Widths given: none (no shots; the diff changes no page layout), so this review answers Requirements and Words only.

## Requirements
- 1 "Voice sessions from the dictate widget get filed properly" — yes — `Sessions.session_path` (`Sessions.js:587`) writes to the dated store; line 1 carries `kind`, `id` and `home`; the `Sessions.test.mjs` check matches the path.
- 1 "added to the per-level index files … with its cost" — no — the total is reset on every record write (finding 1).
- 1 "fast and smart agents are its child sessions … don't build a second linking system" — yes — the existing registry field `parent_session` is set on all three specs (`Sessions.js` spawn); the agreement with session-entries-2 is logged (`session.jsonl` 01:29).
- 1 "Backfill … by a script with a manifest" — yes, not yet applied — `voice-backfill.mjs` and its test pass; `backfill-manifest.json` is a dry run of 61 rows (finding 4).
- 2 "Opus 5.5, medium effort, mastermind permissions" — yes — merged in part 1; the test asserts `claude-opus-5-5`, `medium`, `bypassPermissions` and the preset; `architecture.md:22` gives the one-line meaning.
- 2b "Ship this part first, on its own" — yes — part 1 merged and Servex restarted (`session.jsonl` 01:15).
- 3 "Proof … shot at 1920" — no, not yet — it comes after the merge (finding 4).
- ~01:30 "item tool on its own session's record, path resolved for it" — yes — `Sessions.js` spawn adds "Your session's page"; `session-smart.md` lines 3-9; the `session_tasks.test.mjs` check of refine-in-place passes.
- ~01:55 "voice mastermind talks to mastermind-dictation-2" — no — not in `session-smart.md` (finding 2).
- Class with live instances — n/a.

## Words
- Plain sentences, the owner's words kept — yes — `session-smart.md` lines 3-9 and `sessions.md:5` read clearly.
- No stale or contradicting text — no — `sessions.md:90` (finding 3). The earlier contradictions (the gitignore bullet, "not yet summed", the card comment at `Sessions.js:695`) are fixed.
- Every new file indexed — yes — `voice-backfill.mjs` is named in `ai/sessions/readme.md` and `ext/Session/doc/sessions.md`; the branch diff is down to 13 files, with no `files.jsonl` noise.
- A fresh agent could continue from the folder — yes — `session.jsonl` 01:29 lists the remaining steps in order.

verdict: fix
1. [fix] Fix-brief "Done when" 2 is not met: the task log has no line from minion-forms-signin-fix. `task.jsonl` ends at line 18, the cloud-chat log, so a fresh agent can't tell from this folder which fixes landed, or whether `shoot.mjs` passed and the 400/1920 shots were read. Log one line per fix (commit 2230803afe on worktree/qf-1) plus the shoot result.
2. [fix] `public/join/files.jsonl` lists `JoinState.js` and `JoinState.test.mjs` only as an uncommitted change in worktree/qf-1. The diff's copy (diff.patch line 768) lacks both. Commit it with the fix so the new class is indexed.
3. [fix] Fix brief item 2 also asks to "check that `/join/` works as the Home Screen app's start URL". Nothing records that check. `manifest.webmanifest` has `start_url` and `scope` both set to `/join/`, which looks right, but no log line or shot proves it. Log the check, or say in readme "Not proven here" that it needs a real iPhone.
4. [note] There is no folder-top `requirements.md` (the brief is `brief.md`, and the fix brief is `fix/requirements.md`), so this review's prompt pointed at a file that doesn't exist. A one-line `requirements.md` linking both would stop the next reviewer from guessing.
5. [note] On a stage with an API but no client id, the page shows `copy.not_set_up` (Join.js `signed_in`, item 3, as asked). GoogleButton's own note may still say "Mock sign-in as …: no Google client id is set" (GoogleButton.js `signed_in`), so two lines can contradict each other under the button. Check with a shot.
6. [note] `this.sw` (Join.js `start`, worktree line 80) is assigned and never read. It is dead code that item 5 missed.
7. [note] The previous review's items 2, 4 and 5 are answered in task.jsonl line 16 (auth/proposal.md, the worker comment, plan.md decision 1). Real push on a real browser is still unproven, as that line says. The card's closing outcome should state this plainly when the task closes.

## Requirements (fix/requirements.md)
- 1 Test key out of shared links — yes — `JoinState.share_url` drops `test` and `debug`; `inapp_card` uses it for Copy link, Share and `intent_url`; JoinState.test.mjs checks it (PASS, 7 checks)
- 2 iPhone last step says sign in again — yes — copy.js `ios_steps[2]` "It does not share Safari's sign-in, so sign in again."; start URL check not recorded (finding 3)
- 3 API with no client id — yes — chose the visible line, `not_set_up`: "Sign-in isn't set up here yet."; readme Modes says which
- 4 Reset clears only `join-*` — yes — Join.js `reset()` removes only keys starting with `join-`, which covers `join-mock`
- 5 Dead code gone — mostly — `$sound_slot`, `copy_err`, unused `copy` and the empty `<h2>` are gone (`sheet(null, …)`, `title &&`); `this.sw` is left (finding 6)
- 6 Share beside Copy link when `navigator.share` exists — yes — `navigator.share && btn(… share_link …)`, unchanged
- 7 Refused origin: "Not working?" and Test sign-in visible — yes — `act_google` always renders the link, and the test pill in test mode; not shot
- 8 One lean test — yes — `JoinState.test.mjs`; `Join.js` needs a DOM, so the readme says shoot.mjs covers it
- Check: shoot.mjs passes, shots read — not shown — no log or shot path recorded (finding 1)
- Check: readme updated — yes — the Modes, Files, Re-run (shots gitignored) and Not proven here sections are current
- Done when: commits on worktree/qf-1 — yes — 2230803afe; log lines — no (finding 1); 5-line message — not visible from this folder
- Class with live instances — n/a (JoinState is pure functions)
## Words
- Copy is plain and in one place (copy.js) — yes
- Readme reads as a quick scan for a new coder — yes — public/join/readme.md, its states table and Modes list

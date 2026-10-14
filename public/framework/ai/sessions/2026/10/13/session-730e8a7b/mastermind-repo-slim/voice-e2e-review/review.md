verdict: fix (four fixed and merged; three left for Servex, in [next.md](/framework/ux/Dictate/doc/next.md))

# The dictation flow, walked end to end on the phone (400) and the desktop drawer (1200)

The walk ran headless through real Whisper. A spoken WAV played as the microphone ([make-wav.ps1](make-wav.ps1)): four sentences, two of them questions for the smart assistant. The script is [walk.mjs](walk.mjs); it takes a shot after every tap and after every new bubble. Each surface was walked twice: once on `michael/dev` (before) and once with the fix (after).

---

### ⚠️ What was broken, and is fixed now

- **New session brought the old conversation straight back.** On both surfaces, the first sentence after the press went into the old session: Servex's "resume the last hour on this page" rule won. The desktop drawer even reopened the phone's conversation ([before](shots/before-desk-05-bubble.png)). ✅ Now the press always starts a new session: v-s6za79d and v-vnsnak7 in the after runs ([after](shots/after-phone-04-new-session.png)).
- **The first sentence after New session vanished from the phone sheet.** It was in the session file, but not on screen. ✅ It now shows on screen.
- **The phone sheet's title was the class name `DrawerRailSheetChat`.** ✅ It now says **AI**. New session moved into the sheet's head, so it is one tap, the same as on the desktop. When the sheet is full, the links row that repeated the tab row is gone ([full](shots/after-phone-20-before-mic-off.png)).
- **A refused-mic message ran 330 px off the right edge at 400** ([before](shots/before-phone-mic-refused.png)). ✅ It now wraps ([after](shots/after-phone-mic-refused.png)).

---

### Each step, by the numbers

| Step | Phone 400 | Desktop 1200 |
|---|---|---|
| Open the surface | ✅ the mic starts on ✦ | ✅ |
| New session | ✅ fresh (was ⚠️ resumed) | ✅ fresh (was ⚠️ resumed) |
| Bubbles in session-file order | ✅ all 11 lines (was: 1 of 11 missing) | ✅ all 10 lines (19 of 19 before) |
| Time to the first reply (cold) | fast 8.4 s, smart 11.0 s (before: smart 23.6 s to the first question) | fast 4.8 s, smart 6.2 s (before: smart 11.4 s) |
| Smart, warm (the last question) | 4.3 s (before 4.7 s) | 5.8 s |
| Expand to full | ✅ 800 px; the AI, Dictation and Settings tabs mount; the mic keeps running | n/a: the drawer is already the full sidebar |
| Indicator while the mic is open | ✅ 2 shown; hidden once the mic is off | ✅ 2 shown; hidden once the mic is off |
| Refine page | ✅ shows the same five sentences, cleaned | ✅ same |
| Phone and desktop show the same text | ✅ the same words for the same session ([cross-out.txt](cross-out.txt)) | |

Times are from the session file: the owner line's `at` to the reply's `at`. Before the fix, the cold smart answer on the phone took **23.6 s**. The fast reply came in 2.7 s, but it was a guess. The fix did not touch Servex, so the timing differences between runs are the agents' own variance.

---

### ⬜ Left for Servex (outside this task's fence; edits in [task.jsonl](task.jsonl) and [next.md](/framework/ux/Dictate/doc/next.md))

- The fast assistant answers sentences addressed to the smart one: 4 of the 8 smart-addressed sentences, 2.3–2.7 s after each. Your rule is "silent unless addressed". The exact edit to `session-fast.md` is a `decision` line in the task log.
- A cold smart assistant starts with about 60,000 tokens and takes 6–24 s for its first answer. A four-sentence session costs $0.38–0.48.
- A smart assistant took a test sentence as a task and started a `task-mastermind`. It was stopped at 0 turns, so it cost $0.

---

Fresh-eyes review of the fix: [review/fresh-eyes.md](review/fresh-eyes.md). Surfaces page: [/framework/ux/Dictate/surfaces/](/framework/ux/Dictate/surfaces/).

The shots are in [shots/](shots/) on this machine; pictures under `ai/` are not committed (`.gitignore` line 173), and the step logs beside them are the numbers. After the merge, the live phone sheet: [live-phone-after-merge.png](shots/live-phone-after-merge.png).

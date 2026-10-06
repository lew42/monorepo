verdict: fix (resolved during landing)

1. [fixed] Deliverable 3's feedback didn't show the owner's exact states (raw text, "cleaning…", then "sent, waiting" at ~2s) — only an instant send plus a generic 15s fade. Fixed before merge: Chat.js's `live()` now shows those two marks, proven headless (cleaning… at 50ms, sent-waiting at 2.1s).

2. [note] Deliverable 2 stops the symptom (a silent fallback to the browser's recognizer) but never traces which of requirements.md's listed causes (double mic grab, double auto-start, a stale stream) triggered the original abort. Left as a follow-up.

3. [note] Deliverable 1's fix is a 4-second same-words de-dupe, not a traced root cause for the quadruple post. Trade-off: a genuine fast repeat of the same short sentence within 4s now silently drops, with only a console warning.

4. [note] Deliverable 4 adds a second "is this landed" check (tasks.json) beside the existing one (day.landings) instead of replacing it. The two checks could drift apart later; pointing at one real source is a follow-up.

No feature broke: each fix is additive, reuses an existing mechanism, and stays inside the ux/Dictate + ext/Chat + ai2 rail fence.

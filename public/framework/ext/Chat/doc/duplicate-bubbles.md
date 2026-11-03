# Duplicate text in one chat bubble

**Symptom (owner, 2026-10-09):** one bubble, one icon, the same line twice (up to four times): the first copy ends in a green ✓, the next ones carry only the 🎤.
A real case: session `v-0kfikyu`, "What is minion-kaq?" shown four times. The session file holds only two owner lines for it, so the rest was made in the browser.

## Causes (three, all fixed)

1. **Whisper re-hears a sent guess (`Mic.js` `strip_words`).** Send includes the live guess; Whisper's final then differs by a word ("country"/"county"), so the exact-prefix strip failed and the whole final went out as a second message. Fix: `strip_words` lines words up with an edit distance (fuzzy, 65% alike).
2. **Near-identical resend and a doubled phrase (`Mic.js` `post_held`).** `raw` was "What is minion-kak? What is minion-kak?" and 300 ms later "What is minion-kaq?" went out again. Fix: `ComposerMic.collapse_repeat` folds a whole-text repeat; `same_as_last_send` uses the same fuzzy match inside the 4 s window.
3. **The echo race (`ux/Dictate/chat.js`).** The typed/spoken line is drawn at once under a local `at`. The poll or stream copy of the same line can arrive before `Session.say` answers, so `own_ats` did not know its `at` yet and it was drawn again, merging into the same bubble as a second piece. Fix: texts being sent wait in `sending`; the first owner line matching one whose optimistic bubble is still on screen is that echo and is adopted (`retag`), not drawn.

Earlier attempts fixed the assistant-reply copies (`seen_chat`, 2026-10-01) and the Dictate tickets (4963c7c6f). This is the owner-line side.

## Proof (headless, `doc/proof/`)

- `prove-dup-send.mjs` drives a real `ComposerMic` and counts what reaches `deliver()` (6 scenarios).
- `prove-dup-bubble.mjs` mounts the real shared `chat()`, mocks only Servex, and counts how often the text shows in the DOM, typed and voice, at 400 and 1920, plus a page-change remount. Before the fix: 2x. After: 1x. Shots in `doc/proof/shots/`.

## Known side effects

- `collapse_repeat` also folds a repeat the owner meant ("I said stop, I said stop" becomes "I said stop"); accepted.
- The near-duplicate resend check needs both texts to match each other, so "Okay." then "Okay, now delete it." still sends twice.
- The `navigate` scenario passed before the fix too: a remount draws history once. It guards against regressions only.
- The same ask also asked for the mobile sheet's title (now its class name, `DrawerRailSheetChat`) and tighter bubble spacing in the sheet (`ext/drawer/rail.css`).

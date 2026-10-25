verdict: fix
1. [fix] The new proof `ext/Chat/doc/proof/prove-scroll.mjs` is linked from nowhere: not `ext/Chat/doc/scroll.md`, not `ext/Chat/readme.md`, and `requirements.md` says only "Probe" for asks 1–4 and 6 without naming the file. Name it in scroll.md (it is the proof for every bullet there) and in requirements.md (law 10; a fresh agent can't rerun a proof it can't find).
2. [fix] `ux/Dictate/test/chat-sent.mjs:4,69` still checks that the owner line "shows both fast ✓ and smart ✓", and `ux/Dictate/readme.md:30` still lists it as the "sent marks" proof. Ask 5 hid those marks (`ext/Chat/Chat.css:604`, `display: none`). The check still passes because it reads `textContent`, so it now proves a mark nobody can see. Update the test and the readme line to say the marks are hidden.
3. [note] There is a simpler way to do ask 5: `Chat.css:604` hides the badge, but `sent_badge()` still builds it and `Chat.css:605-607` still style it, which is dead CSS. Not drawing the badge would remove both.
4. [note] `ext/Chat/Chat.js` `bottom()`: `const ov = make_room();` is now unused, because only the side effect matters. Call `make_room();` on its own. The comment above it ("or just above an overlay bar") is still true, since the padding is part of `scrollHeight` now.
5. [note] `at_bottom()` runs on every `scroll` event and calls `make_room()`, which does an `elementsFromPoint` walk plus a `getComputedStyle` for each element under the point. Nobody has measured what this costs while the reader scrolls a long log; `ux/Dictate/doc/voice-assistant.md`'s Cost paragraph only covers `anchor()`.
6. [note] Now that `test/anchor.mjs` is deleted, the only committed proof is `prove-scroll.mjs`, and it tests a bare `sticky_scroll(box)` with `observe: true`. The path the owner named in ask 1 (`Widget.Thread`, `observe: false` plus its own MutationObserver in `anchor()`, live whisper line) has no committed proof, and neither does Chat V2. Rerunning the proof on the real sheet would make asks 1–4 checkable later.
7. [note] The "Known, not caused" `earlier.mjs` failure is queued at `public/framework/ai/todo.md:263` in the main tree, not on `worktree/qf-7`. Make sure that line is committed on `michael/dev`.

## Requirements
- 1 "Locked by default, pinned to the bottom on every update" — yes — `Chat.js` `sticky_scroll` starts `locked = true`; `Widget.js` Thread adds a MutationObserver (subtree, characterData) that calls `anchor()` → `pin()` once per frame; prove-scroll.mjs `gap_after_grow`
- 2 "Unlocks only on a deliberate scroll-up; re-locks within ~40px or on the newest button" — yes — `Chat.js` gesture gate (wheel/touchmove/keydown/pointerdown within 1 s), `at_bottom` < 40, button click sets `locked = true`; prove-scroll.mjs `unlocked_after_wheel_up`, `moved_while_unlocked`, `relocked_by_button`
- 3 "Newest lands the last bubble just above the bottom toolbar and keeps re-pinning" — yes — `overlap()`/`make_room()` pad the tail; `bottom()` now uses plain `scrollHeight`, which includes that padding; prove-scroll.mjs gaps at fill, grow, shrink and button
- 4 "No jumps on re-render or refinement" — yes — no scroll write unless locked (`pin()`), one rAF per batch in both observers; proof only for the bare box (note 6)
- 5 "fast / smart marks removed" — yes — `Chat.css:604`; its old test is now stale (fix 2)
- 6 "No horizontal scroll" — yes — prove-scroll.mjs `hscroll` check (on a synthetic box only)
- Class page — n/a (no new class; `sticky_scroll` is a function)
- Docs current — partly — `scroll.md` and `voice-assistant.md#nothing-jumps` are rewritten and consistent, and the "Rejected: pinning to the bottom" sentence is gone; `ux/Dictate/readme.md` dropped `anchor.mjs`; no references left to `HEADROOM`, `PIN_BOTTOM`, `place_anchor` or `data-turns`; `prove-scroll.mjs` is unindexed (fix 1) and `chat-sent.mjs` is stale (fix 2)
- Fresh agent can continue — yes, once fix 1 is done — requirements.md names the worktree, branch, files, docs, the deleted test and the known failure

## Words
- content 1 (plain, full sentences) — yes — `scroll.md` bullets and the new "Nothing jumps" paragraph say what happens and why
- content 2 (one takeaway) — yes — "pinned to the bottom while locked; only a deliberate scroll-up unlocks it"
- content 3 (length) — yes — "Nothing jumps" got shorter: it dropped the old design's detail and says where to find it (git history)

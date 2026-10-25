verdict: fix

## Findings
- [fix] 1. `ext/Chat/doc/proof/prove-scroll.mjs` is linked from nowhere. Name it in `ext/Chat/doc/scroll.md` and in `requirements.md` (law 10).
- [fix] 2. `ux/Dictate/test/chat-sent.mjs:4,69` and `ux/Dictate/readme.md:30` still say the owner line shows both marks. Ask 5 hid them (`ext/Chat/Chat.css:604`); the check passes only because it reads `textContent`. Say "hidden" in both.
- [note] 3. Simpler for ask 5: stop building the badge in `sent_badge()`, which also removes the dead CSS at `Chat.css:605-607`.
- [note] 4. `ext/Chat/Chat.js` `bottom()`: `const ov = make_room();` is unused. Call `make_room();` bare.
- [note] 5. `at_bottom()` runs `make_room()` on every scroll event (an `elementsFromPoint` walk plus `getComputedStyle` per element). The cost is unmeasured; `voice-assistant.md` covers only `anchor()`.
- [note] 6. With `test/anchor.mjs` deleted, the only proof is `prove-scroll.mjs` on a bare `sticky_scroll(box)`. `Widget.Thread` (ask 1's path) and Chat V2 have no committed proof.
- [note] 7. The `earlier.mjs` failure is queued at `public/framework/ai/todo.md:263` in the main tree; commit it on `michael/dev`.

## Requirements
- [x] 1 Locked and pinned: `sticky_scroll` starts `locked = true`; `Widget.js` Thread observer calls `anchor()`. Proof `gap_after_grow`.
- [x] 2 Deliberate unlock, re-lock within 40px or by button: gesture gate in `Chat.js`. Proofs `unlocked_after_wheel_up`, `moved_while_unlocked`, `relocked_by_button`.
- [x] 3 Newest lands above the toolbar: `overlap()`/`make_room()` pad the tail. Proof: gaps at fill, grow, shrink, button.
- [x] 4 No jumps: no scroll write unless locked; one rAF per batch. Proof on the bare box only (note 6).
- [x] 5 Marks removed: `Chat.css:604`; old test stale (fix 2).
- [x] 6 No horizontal scroll: `hscroll` check, synthetic box only.
- [ ] Docs current: `scroll.md` and `voice-assistant.md#nothing-jumps` are consistent; `prove-scroll.mjs` unindexed (fix 1), `chat-sent.mjs` stale (fix 2).
- [x] Fresh agent can continue, once fix 1 is done.

## Words
- [x] Plain full sentences in `scroll.md`.
- [x] One takeaway: pinned while locked; only a deliberate scroll-up unlocks.
- [x] "Nothing jumps" got shorter and points to git history for the old design.

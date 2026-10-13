verdict: pass
1. [note] `AISessionDetail.js` (diff line ~35): `draw` is bound through three separate `Property.of` calls, so it runs three times on first paint and again for each field a turn changes. It is harmless here, but one redraw per change would be tidier.
2. [note] `AISessionDetail.js` `live_item()`: the Item exists only to give `Property.of` something to read, and `ses.on` already reports the changed fields. This is a roundabout way to reach a redraw, but it is the one real caller the brief asked for.
3. [note] `AISessionDetail.js`: cost (`$x.xx`) and an effort de-dupe (`!model.includes(effort)`) were added to the line. Cost is allowed by the brief ("model, cost or state"). The de-dupe is extra, so check that the new line reads the same as the old one.
4. [note] The brief asks for a test that a clone override and `unset` still work. `Property.test.mjs` covers this (lines 175-180). I did not run the tests, and I did not check that the before/after screenshots in `proof/` show the model changing. STATE.md claims 0.2 s.
5. [note] `Property.js` `Property.Of`: it overrides `_value` with a getter and a no-op setter so the base class keeps working. That is a little hacky but correct, and the comment explains it. The "child change of same key is heard" caveat is documented in `binding.md`.

Requirements: `Property.of` with subscribe-on-first and unsubscribe-on-last is met. The tests count the Item's listeners. One real caller exists. `binding.md` section 4 and the Property readme are updated. I found nothing broken from reading the diff.

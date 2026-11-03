verdict: pass
1. [note] The live proof skips the chat tail: `ux/Dictate/test/swallow.mjs:42-55` calls `w.say({summary})` on a bare Widget, so the `chat.js:170` routing line (the "existing live tail" in ask 3) is never exercised. The line is a one-liner that matches its `place` neighbour, so the risk is low, but a fixture line appended to a session file would prove ask 3 as it was worded.
2. [note] The fake-mic step in the proof is weak. Every shot (`shots/swallow-folded-1200.png`, `swallow-open-400.png`) shows "nothing loud enough to transcribe was heard" under the mic, and the three card sentences are injected, not dictated. Ask 3 asked for three dictated sentences placed into one card.
3. [note] `fold()` (`Widget.js`, the `n < 2` check) counts every line in the card, not only the raw ones, while ask 2 says "two or more raw lines". The behaviour is reasonable, because placed lines are never raw by then, but the doc should name the difference.
4. [note] `draw_refined()` settles only `entry.re` (`Widget.js`, `this.settled.add(entry.re)`). A `{refined}` line covers every sentence in its `of` list, so the other sentences in that bubble keep the raw look.
5. [note] `Widget.css:251`: `.ux-dictate-swallowed > [data-re]` gives every line in an unfolded card the raw look, placed lines included (`shots/swallow-open-400.png`). That fits "a click shows the raw words", but it reuses the raw style for lines that are not raw.
6. [note] As the doc already says, a raw line that arrives after a summary is hidden in the fold until the next summary arrives. The "N raw lines" count does go up, so nothing is lost silently.

## Requirements
- 1 "Raw looks raw" — yes — `refresh()` toggles `ux-dictate-raw` on spoken lines that are not in `settled`; a `place` line removes it (shots/swallow-folded-1200.png: line 1 is placed and drawn in the sans font, line 2 is raw monospace). There is one CSS rule in the widget's layer.
- 2 "The summary swallows" — yes — `summarise()` / `fold()` show the summary text with a "3 raw lines ▸" toggle, and a click unfolds the lines in place (swallow-open-400.png). Nothing is deleted: it is a CSS fold over the same `[data-re]` nodes. The skill and `placement.md` each gained exactly one line.
- 3 "Live, fake mic, within a second, shots at 400 and 1200" — partly — the fold goes through `Thread.draw()` with no timer, and there are four shots at 400 and 1200. But the summary and the card lines are injected rather than coming through the tail or the mic (findings 1 and 2).
- 4 "Docs: Raw and refined section, summary verb, rejected alternative" — yes — `doc/voice-assistant.md` now has that section, including the rejected second-copy alternative.
- Fence — yes — the diff touches only `ux/Dictate/**`, the skill (one line) and `placement.md` (one line). `Sessions.js` is untouched.

## Words
- content — yes — the doc section is short and plain, in What you see / How it is built / Proof / Rejected / Not done yet order. The toggle reads "3 raw lines ▸", as asked.

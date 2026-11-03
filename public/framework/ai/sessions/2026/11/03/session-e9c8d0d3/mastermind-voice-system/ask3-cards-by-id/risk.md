# Risk: adding three lines to `single-voice-assistant.md` about cards

The brief asks for at most 3 lines added to the seat's own brief, only if the brief already covers
messages ("A new task or topic starts a card" — it does), and to weigh the risk of adding them
against the risk of leaving them out, before touching the brief.

## Risk of adding

- **The brief is already long and the owner's own rule is "very small, one item at a time."**
  Every extra sentence is something the seat reads on EVERY sentence it tidies. Three lines that
  just point at `item({delta:{messages:{add:{icon,title}}}}})` and the upgrade-by-setting-title
  path cost little (they are a reference, not a new behavior the seat must enact mid-dictation),
  but they are still three more lines competing with the ones that already failed once (the
  pause-cue repeat the owner just asked to be cut, per `owner-feedback-2026-11-03b.md`'s "A
  correction first"). Low risk, not zero.
- **A wrong example in the brief is worse than no example** — the seat would copy it verbatim into
  a real session. Checked against `card-messages.test.mjs` (10 checks, passing) before writing it.

## Risk of leaving it out

- **The seat already starts a card for "a new task or topic"** (its own brief, the line this task
  was told already covers messages) but with no worked example for icon/title, it is left to guess
  the shape — which is exactly how the owner got a card back titled the literal word "undefined"
  this morning (`type: "Card"` is a reasonable guess that, before this fix, fell through to a
  generic Item with neither `.text` nor `.said`). Not adding the three lines risks that recurring
  the next time a different seat or a fresh session guesses a shape instead of being shown it.
- This risk is larger than the added-length risk above: the owner named this exact failure in the
  ask, so a seat that cannot find the right call again is the failure repeating, not a new one.

## Decision

Add the three lines (below "A new task or topic starts a card" in `single-voice-assistant.md`):
one example call, one line on upgrading an existing message, one line saying `type` is never
needed (plain Message fields, not a separate shape). Tested against the replayed real session
`v-z0jonhy` in `card-messages.test.mjs` before writing them, per the brief.

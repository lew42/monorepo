# words.js

The word set **as data**, and the one measuring helper both pages use.

`WORDS` is the proposal, `TODAY` is the same six intents said with the vocabulary that
exists — the indictment and the deliverable from one array each, so the matrix page can
render them side by side with no second code path.

Every track carries the ratio it CLAIMS (`w`), and `measure()` prints that beside what it
got. Two things it does that are worth stealing:

- **lines, not "did it stack"** — three tracks on two lines is neither three columns nor
  one, and only a line count catches it.
- **a cap is detected structurally** — a track narrower than its own share of the room,
  *and* carrying a `max-width`. `getComputedStyle(el).maxWidth` cannot be used on its own:
  the value is `max(26rem, calc(...))` and Chrome hands it back unresolved.

It also loads `cols.css` — both pages import this module and either can be routed first.

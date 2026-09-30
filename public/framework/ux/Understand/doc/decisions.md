# Understand — decisions

## Decision over Question

The brief asked for whichever of `ux/Content/Decision` or `ux/Content/Question` could
show "two options with nothing pre-chosen." `Question` is a free-text box with one
answer — there is no second option to weigh, so it can't ask "did you mean A or B?" at
all. `Decision` already draws exactly that shape: an ask, a row of options side by
side, and nothing marked "chosen" until a `chose` line exists or a record sets
`recommended`/`status: "decided"` — neither of which this demo ever sets. So `Decision`
was the only one of the two that fit, not a close call.

## Keeping the log in memory without forking Decision

`Decision` (via `ContentModule`) reads its history with `history()` and writes with
`write()` — those are the ONLY two methods that ever touch a real log (a file, or the
dev socket). A three-line subclass (`ClarifyCard` in `Understand.js`) overrides just
those two to use a plain array instead, so every other line of `Decision` — the
"chosen" / "your choice" marks, the scroll-guard that ignores a tap mid-scroll on a
phone — keeps working unchanged, and there is no real log for a demo to accidentally
write into.

## Why the ? scrolls and flashes instead of jumping straight to editable

The owner's own words were "first it kind of selects that card" — naming a highlight
step, not an edit. `spotlight()` in `Understand.js` scrolls the card into view and
outlines it for under a second; it does not open, expand, or change anything, because
selecting and clarifying are two different taps and conflating them would make a
single accidental tap on a phone both pick a card AND start answering it.

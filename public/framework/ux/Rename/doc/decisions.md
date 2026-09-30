# Rename — decisions

## A plain array, not `ux/Content`

`ux/Content` (`Question`, `Decision`) is built for a card that remembers ONE thing
against a real log file — reading it once with `history()`, writing through
`ContentModule.write()`. A rename here needed neither: the brief asks for "the basic
function working for now," several cards sharing one visible log in the demo, and — like
`Understand` next door — never a real write. Reusing `ContentModule` would have meant
overriding both its read and its write to stay in memory anyway, for no benefit over a
plain array with a `.filter(...).pop()` for "latest wins." Kept it plain.

**Why `Understand` (built the same week, for the same brief) made the opposite call:**
its clarification card already needed the exact shape `ux/Content/Decision` draws —
an ask, two options side by side, nothing pre-chosen, a "your choice" mark once one is
picked. Reusing it there meant overriding two methods; building the same thing by hand
would have been more code, not less. A rename's dropdown is a different shape — one
value picked from a flat list, no options to lay out — so there was nothing of
`Decision` worth reusing here. Same reasoning both times ("does the existing thing fit
without a rewrite?"), different answer, because the two widgets ask different questions.

## Select, then Rename — two taps, not one

The owner's words named two separate moments: "first it kind of selects that card"
(from the neighboring ask, same shape here) and only then "can we rename this?" A
single tap that jumped straight to the dropdown would make a stray tap on a phone start
an edit nobody asked for; `selected` and `editing` are kept as two different booleans
for exactly that reason, the same way `Understand`'s spotlight is separate from its
clarification card.

## "Keep current" is a real option in the list, not a Cancel button in disguise

The dropdown's first entry is "Keep current — <title>", not a separate button, so
choosing to leave the title alone writes the same kind of decision as any other pick
(nothing is written to the log for it — `choose("")` is a no-op — but it closes the
dropdown the same way). `Cancel`, beside it, is the one true escape hatch: it drops back
to the plain title with no `rename_options()` call ever made, for someone who opened
the dropdown by mistake.

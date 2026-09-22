Builds the **Decisions** tab — one row per choice this task made, opening in
place to the options it was made over, with Approve and Improve under them. The
work is in `decisions.js` (its notes are on the
[Files tab](/framework/ext/AITask/files/)); the option cards themselves are
[`ui/decision`](/framework/ui/decision/).

Called only when the manifest carries `decisions` (the `decision` verb,
[`ext/JSONL`](/framework/ext/JSONL/)) — otherwise the tab does not exist. It
sits after Requirements and before Report, and it never opens by default: the
answer and the asks outrank it.

What this method owns is the **state**, not the drawing. The open row and the
half-typed Improve note live here (`this.decision_state`), not in the module, so
a verdict arriving over the socket can redraw the whole tab through
`state.redraw` without closing what the reader had open.

Design record: [decisions tab](/framework/ext/AITask/doc/decisions-tab/).

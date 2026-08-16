`leaf()` is `!this.items.length` — a `Panel` is a leaf exactly when it holds
no child items. There is no separate flag; a container that loses its last
child *becomes* a leaf the instant it does, with no transition to track.

This is the predicate the recursive view (`workspace.js`'s `view()`) branches
on to decide whether to draw a `.panel-body` (a leaf, rendering its
template) or a `.panel-items` row (a split, rendering its children) — and
the same one `Panel.close()` uses to decide whether a parent that just lost
a child needs `absorb()`.

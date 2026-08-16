`divide(dir, made = new Panel(), before = false)` is the one verb that both
splits a leaf and adds a sibling to an existing split — which branch runs
depends entirely on whether `this.parent` already runs `dir`.

**If it does:** `made` becomes a new sibling, inserted after `this` (or
before it, when `before` is true) among the parent's existing children. This
is what a *second* click on the same split icon does — no separate "add a
column" verb exists, because the second click's parent already agrees with
the direction.

**If it doesn't (or there is no parent):** `this` becomes the split. A fresh
`Panel` (`mine`) receives a copy of this panel's `data` and its `draw`
property, and every existing child moves down onto `mine`. `this.data`
becomes `{ dir, grow: this.get("grow") }` and `this.draw` is deleted. Finally
`made` is added beside `mine`.

⚠ **`draw` moves by hand.** It's an instance property (set by `panel(fn)`,
never part of `data`), so the constructor's `{ ...this.data, grow: 1 }` copy
does not carry it — the line right after does that explicitly.

Drag-to-edge (`PanelDrag.release()`) calls this exact function with `made`
and `before` supplied from where the pointer landed — there is no second
code path for a drag-initiated split.

The verb-not-mode decision, and the alternative considered:
[Decisions](/framework/ext/Panel/docs/decisions/).

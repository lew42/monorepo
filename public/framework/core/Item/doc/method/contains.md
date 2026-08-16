`for (let up = item?.parent; up; up = up.parent) if (up === this) return true;` —
is `item` a **descendant** of `this`?

**⚠ Excludes self: `x.contains(x)` is `false`.** A drop check needs both
guards — `target !== this && !this.contains(target)` — because this method
alone does not cover the target-equals-source case. `ext/Draggable`'s
`drop_check` is the real call site and carries both.

Walks up from `item`, not down from `this`, so the cost is the target's depth
rather than the source's subtree size — cheaper for the common case of
dropping a leaf onto something shallow.

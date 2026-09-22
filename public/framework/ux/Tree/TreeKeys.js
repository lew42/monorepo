import Tree from "./Tree.js";

/**
 * class TreeKeys extends Tree — **the keyboard is in `Tree` itself now** (2026-09-17).
 *
 * This file is what is left of the subclass: a name that still works, so code and docs
 * written against `new TreeKeys({ nodes })` keep running. **New code takes `Tree`.**
 *
 * Why it stopped being a subclass: `TreeKeys` and `TreeDrag` were SIBLINGS, both
 * extending `Tree`, so no tree could have arrows *and* drag — and the page CMS, which
 * wanted both, wrote its own tree instead. That is the whole case for the merge; the
 * record is [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/).
 */
export default class TreeKeys extends Tree {}

TreeKeys.prototype.classes = "ui-tree ux-tree-keys";

export { TreeKeys };

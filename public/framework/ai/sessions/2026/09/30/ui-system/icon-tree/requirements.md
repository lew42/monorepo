# E: the dev bar's Structure tree, drawn with the library's icon tree

Read first: [../common.md](../common.md), [../requirements.md](../requirements.md) (ask 8).

**The owner:** "So I just pull up the dev bar. This looks pretty cool. We should have a tree UI, with icon items. Not sure where that's at."

The library already has one: `ui/tree` (the `.ui-tree-*` CSS) and `ux/Tree` (the class, used by the site nav). The dev bar's Structure section (`dev/DevBar/structure.js`, 60 lines) draws its own text tree instead, with `↳` and non-breaking spaces.

## Deliverables
1. `structure.js` draws its tree with `ux/Tree`: one node per nested `.page`, then the active page's children. Each node gets an icon for what it is (a page, a grid, a flex row, a block, text: pick Material icons that read at a glance), its tag and classes as the label, and the layout tally kept. Keep the "drawn twice" timing comment and behaviour.
2. Keep v1 reachable: the old text tree stays as a function, behind a small toggle or `?v1`.
3. `ui/tree`'s page names the dev bar as a user, in one line. Its readme gets the same line under Use.
4. Proof: a headless shot of the dev bar open on /framework/ui/ in the worktree (open it the way `dev/DevBar` does; read `dev/DevBar/readme.md`), at 1920 and 400, before and after.

## Fence
`dev/DevBar/structure.js`, `dev/DevBar/doc/structure.md`, `ui/tree/page.js` and `ui/tree/readme.md` (one line each). Nothing else.

Model: Sonnet. This is small: one turn.

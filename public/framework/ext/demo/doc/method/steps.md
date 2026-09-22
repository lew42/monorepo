`demo.steps({ steps, stage, side })` is a demo beside the minimal steps that make
it make sense — the two-column shape for a page that used to lead with a title
and an intro paragraph and said too little (the owner, 2026-09-18: "an image or a
demo on the left or the right, then minimal but explanatory text, maybe steps —
do this one, two, three — and you do it in the demo and boom, you experience
exactly what the demo does").

```js
demo.steps({
	steps: [
		{ say: "Expand a branch", when: "expand" },
		{ say: "Drag Jackets into Shoes", when: "move" },
		{ say: "Turn on Adapt", when: "adapt" },
	],
	stage: () => demo.stage(tree),
});
```

## There was no stepwise system to revive

The brief remembered one and asked to find it before building anything new. What
exists: `ux/Wizard` (a generic multi-step engine — a step REPLACES the view, the
shape a signup form wants, never a demo beside its own instructions);
`ux/Course` (chapters of lessons — a rail, a reading column, a next-up card, no
pairing with a live demo at all); `core/new/1/site/patterns/docs/tutorials/`
(prior art, read-only — a bare numbered list of strings beside a recipe, no demo,
no events, no done-marking). None of the three is this. `demo.steps()` is new,
built as a leaf door beside `demo()`/`demo.stage()` in `ext/demo` — not a
`children:` page shape like `demo.page()`/`demo.tree()`/`demo.layout()`, because
a caller drops it into an existing page's `content()` rather than handing it a
whole page.

## The two-column collapse is the `.rail` word's, not a new one

`steps.css` sets exactly four rules — the list's own numbering and gap, the
current step's weight, the done step's strike-through. Nothing about widths or
breakpoints, because the framework already has the shape: `.rail` (Page.css,
[layout-system.md](/framework/styles/doc/layout-system/)) is a side region that
stacks to a full-width top strip and reorders itself first
(`order: -1`) below 38em, and the steps column wears it. `side: "left"` (demo on
the left, the default) or `"right"` only changes which element is built FIRST in
the row — `.rail`'s own container query still wins at a narrow width regardless,
which is why the steps read first at 400 either way with nothing extra written
for it. The outer row needs `wide` (the page grid's "all the leftover" track,
same doc) to escape the 40em prose measure — baked in, always on — which is also
why `demo.steps()` belongs directly inside a page's `content()`, the same one
level deep every other demo door already requires.

## Done is a real DOM event, not a new pub/sub

A step with a `when` finishes itself the moment the demo it sits beside
dispatches a bubbling `CustomEvent` of that name from anywhere inside whatever
`stage()` built — `$tree.el.dispatchEvent(new CustomEvent("move", { bubbles:
true }))` inside the consumer's own existing handler is the entire wiring on
that side (`ux/Tree/page.js`'s `move()`, `adapt()`, and a `MutationObserver` for
`expand()`, since Tree's own caret click calls `stopPropagation()` before any
ancestor ever sees it, and Tree.js was out of that task's fence). A step with no
`when`, or one the reader reaches by reading ahead rather than performing the
gesture, is finished the same way either path: a click on the step itself. Both
are equally valid; `demo.steps()` does not know or care which one happened.

## Current is ONE cue, never two

`.demo-step-current { font-weight: 700 }` and nothing else — no colour change
alongside it. A step that is both bold AND a different colour tells a reader who
cannot see colour two different facts about the same step, when one plain signal
says everything "look here" needs to say. Done steps get their OWN, separate
two-part treatment (muted colour AND a strike-through) because that pairing
answers a different question — "this is past, not current" — and reads correctly
from either property alone or both together.

## Watch out

- `stage` is called ONCE, synchronously, inside `demo.steps()`'s own captor — the
  same rule every capture function on this site follows (`code` skill §1): build
  the box now, fill it in a callback, never after an `await`.
- A `when` name is just a string an `addEventListener` call listens for. It is
  NOT reserved, validated, or namespaced against the demo's own event names — a
  typo is a step that silently never finishes, the exact failure mode this
  repo's skills warn hardest against. There is no guard for it yet.
- `demo.steps` is patched by importing `ext/demo/steps.js` as a side effect
  (`layout.js` imports `exhibit.js` the same way). It is NOT yet wired into
  `app.js`'s central door list the way `exhibit.js`/`layout.js`/`app.js` are —
  every page that wants it has to import `steps.js` itself, which both of this
  task's consumer pages do. A follow-up should add one line to `app.js` so a
  future page does not have to remember.
- A page with a fully custom `render()` — one that does not go through the
  ordinary `content()` flow and owns its own fixed-height layout math — is NOT a
  safe home for `demo.steps()` wrapping that page's OWN live regions as its
  `stage:`. Measured on `/layouts/shell/`, 2026-09-18: wrapping the real
  rail-plus-viewport (a `height: 100%` flex row with a documented "never
  scrolls, exactly the region" contract) inside `demo.steps()`'s own stage box
  broke that contract — the stage box `demo.steps()` builds has no height of its
  own, so a `height: 100%` rule two levels down resolved against nothing (CSS:
  a percentage height needs a definite ancestor height) and the whole shell grew
  to its full un-clipped CONTENT height, 9,671px, instead of filling the ~900px
  region. `layouts/shell/page.js` was reverted; the working consumer is
  `layouts/shell/doc/page.js`, driving a small self-built stand-in of the same
  three gestures instead — ordinary page flow, nothing to fight. If a future
  task can touch `shell.css`, wrapping the real thing directly is worth another
  try with that fixed.

## The alternative — a rail beside a full-width stage — and when it wins

The shape built here keeps the STEPS narrow (the `.rail` word's own
`clamp(14em, 26%, 22em)`) and lets the demo take the rest. The mirror
arrangement — a full-width stage on top, a short rail of steps UNDER it rather
than beside it — wins when the demo itself needs the room a `.rail`-width column
would starve it of: a wide table, a three-column layout demo, anything that
reads badly narrower than the page's own `wide` track. Nothing here builds that
second shape yet; a caller who needs it composes a plain `div.c("flex v gap",
() => { stage(); steps_list(); })` by hand today, and if that shows up twice it
is the next `demo.steps()` option (`stacked: true`, most likely) rather than a
second door.

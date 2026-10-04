# Drawer: a header that hugs, a chat that scrolls, a footer at the bottom

## The ask (owner, 2026-10-03, dictated at 3440 with the drawer open on the Now card)
> My drawer is broken. There's a scrollable area that says "say something or press the mic, your words show up here", but that scroll area must have a broken height, because it's offset and there's a bunch of weird overlap. There's too much space between the AI / Dictation / Settings / Files tabs at the top: some weird unknown padding underneath, so when the chat area scrolls, "a new conversation" goes underneath the heading. The heading's too tall; all this white space wastes space.
> The "talk into this card" controls at the bottom should be a sticky footer. With flex grow we might not need position sticky: the centre area grows, the whole thing fills, and the footer is pushed to the bottom naturally. The scrollable area is just the centre.
> The "talk into this card" box has its own background, but it looks inset, with not enough padding, and it would be double padded. Don't double pad: the footer goes full width with no white border round it, its light-gray background area gets the DEFAULT padding. We don't want a unique padding value for everything. Put default padding on everything unless otherwise asked.

Before: [before-3440-drawer.png](./before-3440-drawer.png) (3440x1440, `?drawer=ai` on `/framework/ai/2026/10/03/now/`). The composer is cut off at the bottom and overlaps the list above it.

## Do
1. Drawer = one flex column that fills its height: **header** (the tabs, hugging their content, no extra band), **body** (`flex: 1; min-height: 0; overflow-y: auto`, the ONLY scroll box), **footer** (the composer).
2. **Footer:** full width, flush to the drawer's edges, light-gray background (`--wash`/`--tint`), padding `var(--pad)` (or `.pad`) once. No inner box with a second padding and border inside it.
3. Kill the unknown space under the tabs; measure it before and after.
4. Screenshots after at 400, 1200, 1920, 3440, with the chat scrolled to the bottom and to the top. Nothing overlaps; the header never covers content.

Owner of the drawer UI is @task-mastermind-one-dictation's area (ext/drawer, ext/Chat or Dictate composer). Read its task log first; don't redo its work.

## Fence
Write: ext/drawer/**, the composer CSS, this task dir. Hold reloads.
Model: Sonnet. Budget $8. Over pace: no reviewer spawn.

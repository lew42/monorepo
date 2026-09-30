# Design 2: every page can have its own shell

A shell is a nine-grid. The middle cell is the **paper**: the white page or card itself. The eight cells around it are the **well**, in light gray. A header, sidebar or footer sits in the well, lined up with the paper's edges, so you can tell it belongs to that paper.

```
 window ────────────────────────────────────────────────────────────────┐
 │ site header                                                    [☰]  │ ─ SITE level: at the window's edge,
 │ ┌ page well (gray) ─────────────────────────────────────────┐ ┌───┐ │   full height (the ☰ drawer)
 │ │        AI 2 · Board  Needs you  Done       (page header)  │ │ ☰ │ │
 │ │ ┌──────┐ ┌──────────── paper (white) ───────┐ ┌─────────┐ │ │   │ │
 │ │ │ left │ │                                  │ │ right:  │ │ │   │ │ ─ PAGE level: in the page's own
 │ │ │ rail │ │   the card you are reading       │ │ chat +  │ │ │   │ │   well, top edge = the paper's
 │ │ │      │ │                                  │ │ + new   │ │ │   │ │   top edge
 │ │ │      │ │                                  │ │ session │ │ │   │ │
 │ │ └──────┘ └──────────────────────────────────┘ └─────────┘ │ │   │ │
 │ │                     page footer                            │ │   │ │
 │ └────────────────────────────────────────────────────────────┘ └───┘ │
 └───────────────────────────────────────────────────────────────────────┘
```

Three things show which level a sidebar belongs to:

1. **Nearness.** A page's sidebar sits one small gap from its paper. The site's ☰ drawer sits outside the whole page well, at the window's edge.
2. **Edges line up.** The page header starts at the paper's left edge, and a page's sidebars start at the paper's top edge. Nothing of the site's cuts into a page's tab row.
3. **Nesting.** A section's shell sits inside a page's paper, with the same nine-grid one size smaller.

| Part | What it is | Where it comes from |
|---|---|---|
| paper | the middle cell, white (`--surface`) | a new `paper: true` option on [core/Shell](/framework/core/Shell/) |
| well | the eight cells around it, light gray (`--tint`) | Shell.css, from the site's own tokens |
| ☰ drawer | stays site level: full height at the window edge; it pushes the page well aside and never covers it | [ext/drawer](/framework/ext/drawer/), unchanged apart from where it sits |
| AI 2's right sidebar | a small chat, plus a "new session" button | the ONE chat widget ([ux/Dictate Widget](/framework/ux/Dictate/)), mounted with `chat(el, { path, card })` from `/framework/ux/Dictate/chat.js`. No chat of my own. |
| dev bar's chat mode | folds into that same widget | the dictation task does this; I don't touch DevBar.js |

**Build order, in small merges:**

1. The `paper` option on Shell, with one new demo: a nine-grid with a header, both sidebars and a footer around a white card.
2. Move the ☰ drawer to the site level (full height, outside the page well). Screenshots of AI 2 at 400, 1920 and 3440, before and after, show that the tab row is no longer cut.
3. AI 2 gets its own shell, with the chat widget on the right, once the dictation task names its module.

**What stays the same:** pages that don't ask for a shell look exactly as they do today.

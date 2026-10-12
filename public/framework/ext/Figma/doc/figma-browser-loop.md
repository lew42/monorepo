# The Figma ↔ browser loop: the design is the spec, tools check the code against it

Recorded from the owner's dictation, 2026-10-12 (session f155ecbd). The problem: layouts keep breaking — grounds with no padding, wasted space, the Sessions grid — because "our design system is just me explaining what I think should happen, then the AI doing a bunch of changes and hoping we didn't regress."

## The decision

1. **Figma is where a layout is decided.** Draw it with the file's tokens and kit components ([use-figma.md](./use-figma.md)), click through it, approve it. The approved frame is the spec and the thing to revert to.
2. **Code is built from the approved frame**, not from a description.
3. **Tools check the code against the frame; they do not invent the layout.** The earlier attempt to have tools compute the optimal padding (`ext/DesignTool`, the layout tool) was, in the owner's words, "a huge mistake — that's not really what I want." Measuring stays useful as a check, never as the designer.

## The pieces (one of each; none new)

| Piece | What it does in the loop | Where |
|---|---|---|
| Figma frame | the spec | Sept-2026 file, indexed on `Claude · Overview` |
| Figma screenshot | the spec as pixels, at the frame's own size | `get_screenshot` / `track.mjs` keep them in `data/<key>/shots/` |
| Built page screenshot | the code as pixels, same width | Shots (`ext/Shots`, mastermind-screenshot-system; branch `worktree/screenshot-build-a`, not merged yet) |
| Diff + overlay | where the two differ, moved vs changed; catches the subtle differences a model misses when it eyeballs two images | Shots' `Diff.compare` |
| Side-by-side view | the owner's look | `FigmaComparePage` (`.../compare/<frame>/`) |
| Numbers | empty space, overflow, ink at 0 px padding, per width | `Server/layout-check.mjs`, `padding-check.mjs` |

## What is missing

Shots compares a page with its own previous round. The loop needs one more mode: **a Figma frame vs its built page** (same width, both cropped to the content), feeding the same overlay and the same Better / Not better verdict. Asked of mastermind-screenshot-system on 2026-10-12. Until then, compare by eye with `FigmaComparePage`.

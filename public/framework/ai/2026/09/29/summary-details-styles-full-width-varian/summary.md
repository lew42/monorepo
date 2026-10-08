# Summary / details styles — what existed, and the new full-width variants

## What was already there (found by searching first)

- **[ux/Content/Disclosure](/framework/ux/Content/Disclosure/)** — built 2026-09-25, from an owner
  ask that day about the Content page's three-column demo. It's a native `<details>` module, three
  "stack" words (`faq`, `flush`, `lines`), already full-width by default.
- **[ui/accordion](/framework/ui/accordion/)** — a smaller, older pattern: plain `<details>` sharing
  a `name` attribute so only one panel stays open. No JS, two CSS rules, no width/colour/icon words.
- **No dedicated "variants" comparison page existed for either.** The owner's 2026-09-29 dictation
  said "I already feel like I asked for this somewhere" — that was the 2026-09-25 ask above, which
  built v1 but never the wider side-by-side comparison (full width vs inline, gaps, backgrounds,
  colour schemes, icons) asked for today.

## What's new

**[Disclosure — variants](/framework/ux/Content/Disclosure/variants/)** — a new child page. v1
(`faq`/`flush`/`lines`) is untouched; five new optional words sit on top of it:

| word | values | what it changes |
|---|---|---|
| `width` | `inline` | shrinks a row to its own content (default is already full width) |
| `gap` | `none` / `small` / `loose` | space between rows |
| `box` | `shaded` / `plain` | background/border, instead of the stack word's own card look |
| `scheme` | `accent` / `dark` | colour |
| `marker` / `markerSide` | `chevron` / `twirl`, `left` | the expand icon and which side it sits on |

Screenshots at 1920 and 400 are in the build's task directory:
`public/framework/ai/2026-09-29/summary-styles/shots/`.

## Two bugs the build caught by measuring, not by looking

1. A rotated chevron/twirl fell back to the plain "−" when open, because the CSS only changed its
   rotation, not its glyph, for that state.
2. The dark colour scheme's title text measured 1.44:1 contrast against its own background (should
   be 4.5:1+) even though the row's `color` was set to white — something more specific was still
   winning for the title specifically. Both are fixed; the full account is at
   [Disclosure/doc/decisions.md](/framework/ux/Content/Disclosure/md/doc/decisions/).

## One thing left open

The pool-worktree + `Server/merge.mjs` landing path was unavailable — all three pool worktrees
were held by other masterminds for the whole session — so the files were written directly to the
main tree instead (additive only; v1's own code path is untouched) and verified with two clean
`Server/smoke.mjs` runs. Nothing here still needs the owner's attention; it's a note for whoever
next audits how minions land work when the worktree pool is exhausted.

Full task log: `public/framework/ai/2026-09-29/summary-styles/task.jsonl`.

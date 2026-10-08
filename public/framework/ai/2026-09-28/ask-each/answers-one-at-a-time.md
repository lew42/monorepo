<!-- ask-each: 3 questions, one at a time, one session (caa05720-985d-4427-8208-c7d5a55eaaa3). Total cost: $1.9795 -->

## 1. On a 3440px screen, should this page use columns? If yes, exactly how many, what goes in each one, and why that split?

**No — not page-level columns.** This page is one linear read (demo → what it is → API → examples → traps), each part depending on the one before it. Splitting it into simultaneous side-by-side columns would put things the reader hasn't gotten to yet next to things they have, and there's no second independent topic to browse in parallel — which is what a real "columns" page (`core/Page` Miller-columns, sibling topics side by side) is for. Using it here would be the exact trap the layout skill names: forcing a page into a columns host it doesn't need just because the screen is wide.

**The 3440 answer is per-section width, not a page split** — this is already in the plan you have, it's just worth naming as the deliberate substitute for columns:

| Section | Track | Why |
|---|---|---|
| 1. Live demo | `wide` | needs the room to show three panels being dragged, not squeezed to 40em |
| 2. Explainer paragraph | `main` (~40em) | prose — a wide paragraph is unreadable, this is the one place narrow is correct |
| 3. Config-word table | `wide` (via `ui.table()`) | rows of words/types/defaults read better wide; table already self-scrolls at phone width, no split needed |
| 4. Three examples | `wide`, `.grid.auto` with `--column: 22em` | this is where 3440 actually pays off: 3 columns side by side (form / chart / chat), each code+result together |
| 5. Gotchas | `main` | five short traps, read top to bottom in order — multi-column text flow would scramble that order for no gain |

So the page has exactly **one** place that's visually "3 columns" — section 4, and only because there are naturally three independent worked examples that belong side by side. Everything else stays single-track, just switching between `main` (narrow, for reading) and `wide` (full, for showing). That's the "several columns *or* a centred main column" default satisfied without inventing a multi-pane page for content that doesn't have parallel siblings.

One thing to verify once it's built, not decide now: if the five sections end up tall enough that jumping between them matters, a persistent in-page nav (not a Miller column — just anchor links) is worth adding later. At five short sections it's probably unnecessary — that's a call to make after looking at the real height, not before.

## 2. The demo (item 1) and the gotchas list (item 5) are very different heights. How do you keep the page from looking lopsided — do you vertically center anything, and which piece?

**No vertical centering, on either piece.** Vertical centering only means something when two boxes share a row and need to line up against a common height — a card row, a flex row with `align-items: center`. The demo and the gotchas list aren't siblings in a row; they're the first and last section in one vertical stack, three sections apart. There's no shared height for either one to center *against* — centering the gotchas list would just center it inside a box you invented to hold the "missing" height, which is padding with no purpose, floating text in dead space for no reason.

So the height difference itself isn't the lopsided risk. **The real risk is left-edge drift, not height** — this framework has already broken this exact way once: a capped/centered section sitting between full-width siblings reads as two misaligned columns, not one page, even when every other check passes. Concretely, for this page:

- The demo is `wide` — it starts at the page's left gutter.
- The gotchas list is `main` — if `main` gets centered in the viewport (the usual way to cap prose), its left edge drifts rightward relative to the wide demo above it. Scroll from a big flush-left demo down to a short list that starts ~15% further right, and *that's* the lopsided feeling — not the height gap.

**The fix:** `main` and `wide` share the same left edge in this framework — `main` is narrower, not independently centered. So don't add `margin-inline: auto` to the gotchas block; let it sit at the same left gutter as everything else and simply stop short on the right. A short block at the same left edge as a tall block above it reads as normal pacing (heavy → light), which is exactly what a "gotchas" closer should feel like — a page winding down, not a page going wrong.

Two things I would still do, neither of them centering:
1. Give the "Gotchas" heading the same visual weight as the other section headings (same `h2` treatment) so the short section doesn't read as an afterthought just because it's brief.
2. If the demo stage itself has empty space (three panels not filling their sandbox), *that* box's own content can be centered inside the box — that's balancing content within one region, a different decision from balancing the page.

Before landing, this is a one-line check, not a guess: screenshot the full scroll at 3440 and confirm the demo's left edge and the gotchas list's left edge land on the same vertical line.

## 3. Where exactly does the config-word table go relative to the three worked examples, and should the table be full width or share a row with something else?

**Directly between the paragraph and the examples — order 1‑2‑**3**‑4‑5, unchanged.** That placement isn't arbitrary: the table is the vocabulary, and the examples are that vocabulary in use. Put it right before the examples and a reader hits the words once, then immediately watches them get used — flip the order and either the examples reference words the reader hasn't seen yet, or the table sits as a dead reference the reader has to scroll back to.

**Full width (`wide`), on its own — nothing shares its row.** Two reasons:

1. There's no peer for it to share a row *with*. Sharing a row implies two comparable things sitting side by side (like the three examples do with each other); the table isn't a peer of the paragraph above it (prose vs. data) or the examples below it (reference vs. demonstration), so pairing it with either would visually claim a relationship that isn't there.
2. It's column data (word / type / default / what it does) — a `main`-width (40em) table forces four columns into a narrow strip and either truncates or wraps them into an unreadable mess. `wide` is what lets `word`/`type`/`default`/`does` each keep a real column. This framework's tables already self-scroll horizontally at phone width instead of compressing, so `wide` costs nothing at 400px either.

**Same left edge as the demo above and the example grid below** — this is the thing to actually watch, following from the last answer: since the table sits at `wide` and the paragraph before it sits at `main`, the page's left edge shifts right (narrow) then back out (wide) then stays wide for the examples. That's fine — pacing, not lopsided — *as long as* every `wide` section (demo, table, examples) lines up on the identical left edge, so it reads as "one wide track interrupted by one narrow paragraph," not as three independently-positioned boxes.

One content-order note, not layout: since the table sits right above the examples, each example's caption can just say which words it uses ("uses `resize`, `snap`") instead of re-explaining them — the table already did that job once.


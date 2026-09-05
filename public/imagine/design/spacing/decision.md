# Spacing — the decision (2026-09-05, the spacing judge)

**Decision.** Three spacing ramps that hold their 1280 floor to the pixel and reach about double by 3440; three visible levels (`spacing-tight` · regular · `spacing-airy`, 1 : 1.67 : 2.67); one control rule — a control hugs, a row spans, inline text is not a control. Applied in `framework.css` and `core/Page/Page.css`; the numbers it beat stay on [ceilings](/imagine/design/spacing/ceilings/).

**Problem.** Spacing grew 1.2× while the screen grew 2.69× — 76 of 84 measured pages, four auditors, the owner's "ALL TOO CRAMPED". Raising a clamp's cap alone did nothing: at 3440 the middle branch already sat under it.

## The scale

| token | at 1280 | at 3440 | was at 3440 | × |
|---|---|---|---|---|
| `--pad-ramp` · `clamp(1em, 2.6% - 1.1em, 4em)` · a full-width box | 16.5px | 70px | 36px | 1.9 |
| `--gap-ramp` · `clamp(1em, 1.5vw - 0.3em, 2.6em)` | 15px | 46px | 24px | 1.9 |
| `--flow-ramp` · `clamp(2em, 1.4vw + 0.8em, 3em)` · per child em | 30px | 54px | 36px | 1.5 |
| `--page-column-pad-x` · confirmed as is | 16px | 50px | 50px | — |
| `--page-column-pad-y` · confirmed as is | 10.5px | 25px | 25px | — |
| column prose `--flow` · `clamp(0.8em, 0.8cqi, 1.6em)` | 10.8px | 25px | 13px | 1.9 |
| the section gap · 1.5 × `--flow` before h3/h4, the heading's own em before h2 | a ratio, so it rides the ramp | | | |

A card in a track stays at the floor (`--pad-ramp` is a % of its container); a band, a stage, a wall and every paragraph grow. The flow caps at 3em because a paragraph gap past two lines reads as a section break.

## The levels

| word | `--spacing` | where it is used |
|---|---|---|
| `spacing-tight` | 0.6 | a rail, a toolbar, a table, a dense list |
| (regular) | 1 | a page — the default, no class |
| `spacing-airy` | 1.6 | a cover, a hero, a landing band |

One class, one number: every element re-derives `--pad-default` / `--gap-default` / `--flow-default` as ramp × level. They sit **beside** the paging realm's type ramp (`compact / regular / display`, 0.88 : 1 : 1.06) — that one moves type and stays type-only; these move space. [The three, side by side](/framework/ai/2026-09-05/spacing-judge/levels-3440.jpg).

## The control rule

A chip, a button, a link-card or a `<summary>` **hugs its content** — `width: fit-content`, 0.6–1em of side padding — and never stretches into a strip; a strip of controls is a `flex wrap gap` row, never a grid of full-width cells. **Not a control:** an inline text link (an `a` inside p / li / td / th / dd / blockquote / .md) is text and carries no padding — that alone retires 4,419 of the 9,177 findings (U2). **What may touch or span:** the rows of one list — `li`, `tr`, `thead`/`tbody`, a sidebar or column row, a tab in a tab bar, a sticky head over its body — because the list is the control and the row is its part (U3).

## Every discrepancy

- **D1** no growth → the scale. **D2** `summary` strips → hugs, padded, hover fill (`framework.css`). **D3** preview cards → the card is the control; its title row hugs (`Page.css`).
- **D4** `decks-chip` hugs on paper; `codrops-link`, `codrops-demo-title`, `research-card-name` hug; `page-link` is inline text (U2); `sidebar-link` is a rail row (U3); `yt-start` is a poster's play overlay — the whole picture is the hit area, kept.
- **D5** inversions → a slide, cover or screen fills an unpadded region, so it carries the inset itself; the ramped column gutter is 50px at 3440, level with them. The paging stage reads the token and grows with it (36 + 18px → 58 + 18px of inset on `/imagine/paging/`).
- **D6** head/body → they touch by design (a sticky head, a hairline seam); a rail's first row now sits one pad-y under the line, as prose already did.
- **D7** flush titles → `/imagine/paging/toolbars/*` is another agent's rebuild, in flight; today's version measures a 36px stage inset, not 0.
- **U1** → the levels. **U2, U3** → the rule. **U4, U5, U6, U9** → the measure, not the site: measure `.active-page`, trust B's ratio count, and read the ink formula as a pattern; the 1.2× headline survives all four. **U8** → confirmed: A's toolbars set was an after.
- **U7**, the blank 55–65% of a 3440 reading page → a separate ruling, on purpose: it is the `measure` question (2026-08-17), not a spacing token — a 40–46em reading column is right, and what fills the rest is a layout (a rail, a second column, a wall), which is the paging realm's work this week.

**Options considered.** 1× / 1.5× / 2× of the whole clamp (ceilings — each moved 1280 too) · cap-only raises (a no-op at 3440) · one `vw` ramp for everything (a card's padding would follow the screen, not the card).
**Why this.** The floors hold 1280 to the pixel; the % pad stays container-aware; the level ladder is visible at a glance.
**Advantages.** Every `var(--pad, …)` / `.gap` / `.flow` on the site grows for free; a level is one word.
**Disadvantages.** A theme can no longer override `--pad-default` directly — it retunes the ramp; column prose keeps two rhythms (its own 10.8px, an inner `.md`'s 27px) at 1280.
**Cost.** Three tokens, one `*` rule, three classes, twelve one-line control fixes. **Complexity.** One new idea: ramp × level.
**Migration / reversibility.** Nothing renamed; put the two 2026-09-01 clamps back and delete the `:where(*)` rule to revert in one edit.
**Deliberately NOT doing yet.** Closing the column-prose vs inner-`.md` rhythm gap at 1280 (it would tighten prose); wearing `spacing-tight` on the sidebar (changes 1280); a live levels demo page (outside this task's fence); U7.

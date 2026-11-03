# Padding: percentage padding, and wrappers for grid items: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

**Queued for the 10 PM weekly reset (2026-09-30).** Foundational, so no cap. Plan first, with screenshots, on a card.

## The owner's model
- **Responsive padding = percentage padding, not container queries.** A `%` padding resolves against the PARENT's width, so an element can't size its padding from its own container query without an extra wrapper. The owner prefers percentages.
- **The rule:** % padding is right when the parent and the padded element are roughly the same width (a page, a single column, a card that fills its parent). Then the padding tracks the element's own size.
- **Grids and flex columns (2+ columns):** a % on a card resolves against the WHOLE grid, so every card gets huge padding at 3440. So each grid item gets a **wrapper** (a column or section wrapper, one per item), and the card inside it takes % padding against the wrapper. Accept the cost to drag and drop. A single full-width section needs no wrapper.
- Use a wrapper container (cqi) only if a sub-item truly needs to listen to it. The owner sees no strong need for that.

## Today
`framework.css`: `--pad: calc(clamp(1em, 2.6% - 1.1em, 4em) * var(--size))`, already a % of the containing block, plus `--pad-card`, a different band. Memory also mentions "columns cqi pads". Reconcile these with the model above.

## Asks
1. **Write the padding rule as a named sub-system of layout,** in [/framework/design/layout/](/framework/design/layout/): when % padding is right, when a wrapper is needed, and the name of the wrapper class. Show it, don't tell it: screenshots at 400, 1200, 1920 and 3440.
2. **Add the wrapper class** (for example a column or section wrapper; check the naming list and css-scopes first). Use it in the grids that need it.
3. **Fix the case the owner saw:** an AI 2 card page ("Dictation: one configurable widget everywhere") whose padding is far too small. Find why it doesn't get the scaling default.
4. **A review question** for the review skill: "does each padded element resolve its % against a parent of about its own width?"

## Owner
The layout owner: the design system (task-mastermind-design-code's successor), with the architect approving the skill line.


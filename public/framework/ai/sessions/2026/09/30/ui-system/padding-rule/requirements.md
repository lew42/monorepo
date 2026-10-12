# G: the padding rule, a wrapper for grid items, and the thin AI 2 card

Read first: [../common.md](../common.md), [../../padding/requirements.md](../../padding/requirements.md) (the whole brief is yours), [../../padding/owner-words.md](../../padding/owner-words.md), [../plan.md](../plan.md). Then read `framework.css`, lines 250 to 310 (`--pad`, `--pad-card`, and the notes on the rejected cqi form) and lines 855 to 870 and 1000 to 1010 (`.pad`, `.grid.auto`), and `design/layout/` (its readme, `doc/rules.md` and `questions.md`).

**The owner:** "if we were forced to use wrappers anyway, we might want to just lean into using percentages rather than using containers ... If the rough width ... is the same for the parent and the child, the child being the element getting the padding, then that's okay to use the percentage padding ... then you might need wrappers around each grid item, in a flex type grid or a grid grid ... put a card inside of it with percentage padding that then looks at its wrapper to get the size of the actual grid item rather than the size of the full parent."

## Measure first (an `experiment` line each)

The CSS spec says a % padding on a **grid item** resolves against its own **grid area**, so it may need no wrapper. On a **flex item** it resolves against the **whole flex container**. Measure it in a headless browser at 3440: a `.card` in a `.grid.auto` and a `.card` in a `.flex` row and in a `.cols` row. Record the computed `padding-left` against the item width and the row width. The result decides where the wrapper is truly needed, so the rule rests on a measurement rather than a guess.

## Deliverables

1. **The padding rule, as a named part of layout:** `design/layout/doc/padding.md`, plus a section on `/framework/design/layout/` that shows it rather than telling it: three live boxes at the same %, one correct, one too big (a flex item measured against a 3440 row) and one fixed by the wrapper. Add screenshots at 400, 1200, 1920 and 3440. Say when % padding is right, when a wrapper is needed, and the wrapper class's name. Add the name to the layout naming list (`doc/rules.md`).
2. **The wrapper class:** run `new-css-class` and `naming` first, and check `styles/css-scopes.txt`. The owner's words were "column wrapper" or "section wrapper". It is one rule in `framework.css`, in the right layer, beside the padding tokens. Use it where the measurement says a grid needs it, but only on pages inside this fence plus `framework.css`'s own rules. List every other page that needs it in `padding-rule/uses.md`, to be applied in a later merge.
3. **Reconcile `--pad` and `--pad-card`** with the rule. They are two bands; say in the doc why both exist, or merge them if one is wrong. The memory mentions "columns cqi pads" (`styles/layouts/cols/`): say whether those are still right under the rule. Change nothing outside the fence; log it in `uses.md`.
4. **The case the owner saw:** an AI 2 card page, "Dictation: one configurable widget everywhere" (its ask is in `ai/asks.jsonl`, and its card is probably `/framework/ai2/2026/09/29/audio-a-library-of-audio-parts-transcrip/` or a sub-card). Its padding is far too small. Find out why it doesn't get the scaling default, and fix the cause with the smallest change. If the cause is in `ai2/ai2.css`, you may edit that one rule (another mastermind owns AI 2, so keep the diff to the rule and log it).
5. **The review question:** add to `design/layout/questions.md`: "Does each padded element resolve its % against a parent of about its own width? (padding rule)".

## Fence
`framework.css` (the padding tokens and the new wrapper rule only, with nothing else reformatted), `design/layout/`, one rule in `ai2/ai2.css` if item 4 needs it.

## Proof
Before and after shots of the AI 2 card, `/framework/design/layout/`, and three pages that use `.pad` and `.card` that you did not build (for example `/framework/core/`, `/framework/ui/stats/` and `/framework/styles/`) at the four widths. A change to `framework.css` needs those three pages, because shared CSS reaches everything.

Model: Sonnet.


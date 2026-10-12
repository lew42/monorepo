# Pass 6b: ready to run (not started)

It is waiting for spend room. Run it as one Sonnet minion in a pool worktree, then one review. Estimate: about $3 plus $0.65.

Same rules as `requirements.md` beside this file. The items come from `../proposal.md` (the rewrite order) and the 6a review (`../review.md`, findings 4–12).

## Build

1. **Floating page:** replace the stub at `/framework/core/Page/layout/floating/` with the real demo. Lift `public/framework/ai2/floating.js`, the AI 2 lead's `floating(box, {nav, content})`, and show it beside core/Page's own inner left tabs. The owner's spec is in `../owner-words.md` under "Continued (about 1:40 PM)".
2. **Top-down shape:** one page under Layout that gathers background, padding and bleed from `doc/words.md`, `styles/doc/layout-system.md` and `doc/columns.md`. Point the Layout icon at it, since it links to `doc/words/` today.
3. **`doc/columns.md`:** move the tuning history to `doc/columns-history.md`, and keep the six width words, the default column and even mode.

## Polish (6a review notes)

- Choosing a layout: keep either the icons or the table, not both (finding 4).
- Make a page, demos 1–2: stage the real page, or reword "the real thing running" (5).
- The years tree: one shared export (6).
- `/doc/labels/` route, not `.md` (7).
- `jsonl/full/`: a clean, hand-written example (8).
- `doc/decisions.md`: one line on the `initialize()` nav-order override (9).
- Readme "Read next": one link per line under the three headings (11).
- `doc/layout.md`: one open-question line, not two (12).

## Then

- **Weights:** once Cards.js accepts `{"weight": 1|2|3}` (the decision in `../task.jsonl`), write weight lines on the cards the organization card names.
- **Object card as a template per class:** add a Doc-level `api_intro()` seam, and read the properties and methods lists off the Doc (6a/5 review notes).

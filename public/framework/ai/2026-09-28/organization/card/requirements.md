# Step 2: build the organization card (Sonnet)

Load the `minion` skill first, then the `page` skill (it brings in `content`). The owner's words, verbatim: `../owner-words.md`. They are the acceptance test. The whole brief is `../requirements.md` (asks 2, 3, 4 and 7).

## The owner's sentence

"at the top, you know, the biggest, most important things, and then underneath that, maybe some secondary things, and then maybe towards the bottom, just one-off tasks that don't organize well... this structured content view with navigation... all the things on that card might actually navigate away."

## The job

Make the card `2026/09/28/organization-what-matters-most-paging-fi` show structured content in three tiers:

1. **Most important.** Paging comes first: the core/Page docs rewrite, the page skill, and the paging items from the list.
2. **Secondary.** Groups of related open work, such as layout, CSS, the feedback-council fixes and Servex.
3. **One-offs.** Single tasks that don't group well.

Then add a fourth section, **Earlier audits**: every audit from the list, one icon item each.

- Every item is a LINK that navigates to its real page (a task dir `/framework/ai/<date>/<slug>/`, a card `/framework/ai2/<yyyy>/<mm>/<dd>/<slug>/`, a doc page). It is never a sub-card.
- Within each tier, order the items by weight: quick fixes that carry a lot of weight come first (ask 4).
- Each item is a title plus at most one short clause. There are no paragraphs.

Source: `../scan/list.md`, which was built for you. Don't re-scan the repo. Open a linked item only when you need to know its weight.

## How, using the existing vocabulary only (ask 7)

- Structured content: `public/framework/ux/Content/structure/` (readme, doc, Structure.js). Also read the in-progress card `2026/09/28/structured-content-icon-cards-outlines-b` (`public/framework/ai/2026/09/28/structured-content-icon-cards-outlines-b/page.jsonl`). Use its words (icon items, sections, and so on). Don't invent a second vocabulary.
- Card standard: `public/framework/ai2/doc/card-standard.md` and `cards.md`. Find out how a card shows structured content: an attached `.md`, a line type, or a page in the card dir. Use the documented route. If none exists, write `organization.md` beside this brief in the structured-content format, and attach it to the card via `POST http://127.0.0.1:8090/card/append?id=<id>` using node fetch (see `Servex/cards/readme.md` for the line types).
- Never edit the card's `page.jsonl` by hand. Only append through the endpoint.

## Proof

Screenshot the card at 1920, reached from the AI 2 dashboard rail (headless Playwright, as described in the `ui-test` skill; never the owner's tabs). Save it as `card/card-1920.png`, then look at it. Every item must be a clickable link. Click two of them in the headless browser and confirm that each lands on a real page, not a 404.

## Fence

- Write only inside `public/framework/ai/2026-09-28/organization/card/`, plus appends to the card through the endpoint.
- Edit no framework code. If the vocabulary lacks something the card needs, say so in your reply instead of building it.
- Every process you start sets `windowsHide: true`. Never restart any server.
- Log in your own `card/task.jsonl` as the minion skill says.

## Reply

Reply with one line: the card's URL, how many items are in each tier, and the screenshot path.

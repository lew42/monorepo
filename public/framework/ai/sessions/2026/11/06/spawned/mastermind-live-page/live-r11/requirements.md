# /live/: cards show a preview, not their whole body

The asks were relayed by voice-app on 2026-11-06; the owner's own words are in voice-app's session log. This is part 2 of [live-r10](../live-r10/requirements.md). Branch: `worktree/live-r11`.

## Asks

- [x] Every page or item has a `preview` List, separate from `content`, written by deltas: `{"preview":{"add":…}}`. Proof: LivePage.test #12 covers a card, a link card and the page itself.
- [x] The card on the parent shows title + preview. An empty preview falls back to `description`, then to nothing. Proof: [plan-400](shots/plan-400.png).
- [x] The detail page shows the title, then the preview, then the full content. Proof: [card-page-400](shots/card-page-400.png).
- [x] The link-card chevron sits in the bottom-right corner, absolutely positioned, with no width of its own and no padding row. Proof: [live-1200](shots/live-1200.png).
- [x] Code in cards scrolls sideways, because it sits above the card's link layer. On a phone it runs edge to edge, so there is no double padding. Proof: [card-page-400](shots/card-page-400.png).
- [x] The decision-log table is readable at 400px: each row stacks, with every cell under its column name. Proof: [decision-table-400](shots/decision-table-400.png).
- [x] A card's preview lines up with its title, not with its icon. Proof: [plan-400](shots/plan-400.png) (the line starts under the title's first letter).

## Decisions

- **Name:** the List is named `preview`, as the owner said. On a LivePage it hides core Page's `preview(nav)` method, so `{"preview": …}` reaches the list. The alternative is a different name (`summary`), which keeps the method but drops the owner's word. If core wants a preview list on every Page, page-design generalizes it.
- **Card text:** a card no longer shows its `text`; only its own page does. Its buttons still show on the card.
- **Not built:** a link card does not yet show the sub-page's own `preview` list. It shows the link's preview, else its description, else the page's `description`. This is marked ⬜ in the readme.

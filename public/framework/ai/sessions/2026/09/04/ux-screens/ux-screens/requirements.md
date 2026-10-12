# Requirements — verbatim

From `public/framework/ai/2026-09-05/ux-rethink/reviewer-brief.md`, realm = **screens**.

> i want you to spawn ux minions to explore the imagine pages, and think again about what is
> this page? how do i use it? what is the goal of the page? how hard is it to understand? how
> could it be simpler, more visual, more intuitive, more explanatory, easier, better, etc..
>
> consider alternative layouts. if an alternative layout feels like it would work/look better,
> use it. try to improve these design systems (ui, ux, layout, etc)

Realm card from yesterday (`/imagine/review/`, slug "screens"):
- stranger: jargon paragraph ("columns host", "width word", "crumb strip") above eight tiny
  thumbnail cards whose captions repeat the same undefined words.
- meant: eight small experiments in what a click does to the rest of the screen — it either
  replaces what you were looking at, or joins it and splits the space evenly.
- did: rewrote opening paragraphs, moved vocabulary behind the readme link, replaced jargon
  with plain words and real numbers.

## Scope
- Write only in `public/imagine/screens/` and `public/framework/ai/2026-09-05/ux-screens/`,
  plus one line in `public/framework/ai/2026-09-05/day.jsonl`.
- Five sentences (before/after) about `/imagine/screens/`.
- Build and measure ONE real alternative layout on the landing page; keep it if it wins on
  page height + the three invariants + the five sentences, else revert with the reason.
- Make more visual wherever a paragraph could be a picture.
- Persistence check (`store()`/`localStorage`) — add the amber/green mark if missing.
- ui-test the primary interaction, zero console errors at 1280/3440, finish-task to land.

## Steps
1. Five sentences before
2. Before shots (1280, 3440)
3. Build + measure alternative layout; keep or revert
4. Make more visual
5. Persistence check
6. ui-test + console check
7. After shots + five sentences after
8. finish-task

# mag-game-round-2

## The ask, verbatim

> TASK — the two remaining S items from the 08-31 improvers' roadmaps (their task.jsonl
> context: `ai/2026-08-31/` dirs for mag and game):
>
> 1. **Mag read-state** (`public/imagine/mag/**`) — the magazine now has prev/next hops;
>    add read-state via core's `page.store()` (in core since this morning — `this.store()`
>    on any Page; get/patch/clear; see `core/Page/Page.class.js` Page.Store). An article
>    marks itself read when visited; the contents page shows a quiet read mark per entry
>    and a "N of 6 read" line; a reset control clears it. Match the mag's existing
>    restraint — a mark, never a badge wall.
> 2. **Game add-a-task + keyboard travel** (`public/imagine/game/**`) — read the game
>    first (it gained a journal + second ending yesterday). Add: (a) the player can add
>    their own task/goal at runtime (one input, lands in the same list mechanic the game
>    already uses; persists via `page.store()` if the game already persists, else
>    in-memory is honest); (b) keyboard travel between locations/panels (arrows or letter
>    keys — match whatever navigation metaphor the game already has; never steal keys
>    from a focused input).
>
> FENCE — `public/imagine/mag/**`, `public/imagine/game/**`. Nothing else.
>
> VERIFY: headless round-trips (visit 2 articles → contents shows 2 read + survives
> reload → reset clears; add a task → it appears → reload behaves as documented;
> keyboard travel drives real navigation with a focused-input guard proven), zero
> console errors, 400/1920/3440 on changed pages. Docs: one readme line each module.
> Keepers + `links`. Report: 2 lines + proofs, cuts.

## Fence

- Write: `public/imagine/mag/**`, `public/imagine/game/**`. Nothing else.
- Never kill/restart the :80 dev server. Private server on 8099, torn down after.
- Never drive owner tabs, never stash, never commit. Never write the owner's name.

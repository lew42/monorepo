# improve-game-team

## The ask, verbatim

> TASK — improve the game and team experiences: look, brainstorm, build. First: run `new-task`
> (slug `improve-game-team`, group `pages`). The owner's standing directive: "create some
> additional features... make everything better. ask minions to look at each thing and brainstorm
> improvements."
>
> LOOK first (drive both live, all widths): `/imagine/game/` (3 realms, 9 rooms, trade, finale,
> map — read `game/readme.md` + its doc) and `/imagine/team/` (roster, topic board, density/sort).
> BRAINSTORM: 8-12 ranked improvements each as log lines (`#rank - idea - value - S/M/L`).
> BUILD the top 2-3 PER experience that are S/M — candidates to weigh (yours to judge against what
> the look reveals): game — a second ending or a secret found only by re-visiting (rewards the map),
> room ambiance (one accent/tone word per realm using the vary tone verdicts), a "journal" column
> recounting your run so far (the store knows); team — a person's workload sparkline or capacity
> bar, drag a task between lanes (ui-test the gesture), a simple filter chip row on the board, an
> "add task" affordance persisting via the store. Keep every addition in the existing voice —
> controls over files, columns as navigation, theme tokens only, no accidental scrollbars.
>
> FENCE — `/imagine/game/**`, `/imagine/team/**`, `imagine.css` (their shared sheet — additive
> only). NOT store.js, NOT /imagine/page.js.
>
> VERIFY: every built feature proven headless (gesture screenshots where interactive; persistence
> round-trips where saved), 400/1920/3440 clean, zero console errors, existing proofs unregressed
> (trade still moves two rows; finale numbers still exact; board still follows the topic).
> Keepers + `links`. Report: built (each in one line with its proof number), the ranked roadmap
> left, cuts.

## Fence

- **Mine:** `public/imagine/game/**`, `public/imagine/team/**`, `public/imagine/imagine.css`
  (additive only — never rewrite an existing rule another page reads).
- **Not mine:** `public/imagine/store.js`, `public/imagine/page.js` — a sibling session is
  migrating `store.js` to a core `page.store()` right now. Write against the current
  `store(page)` import and note the seam.
- Dev server: never touch :80. A private probe server runs on 8095 and is torn down.
- Scratch (probes, screenshots taken mid-run) goes in the session scratchpad; keepers land in
  this dir under `shots/`.

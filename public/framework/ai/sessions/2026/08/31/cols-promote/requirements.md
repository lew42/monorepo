# cols-promote

Verbatim ask:

> Promote the two earned column words into framework.css, per the cols lab's own
> adoption plan.
>
> THE SPEC: `public/framework/styles/layouts/cols/doc/adoption.md` (the lab's
> promotion list: `.cols.half` and `.cols.main-aside` ONLY, with a migration list of
> 6 call sites) + the lab's css for the exact rules (percentage basis, grow-by-weight,
> rem floor, the `max(share, (floor − 100%) × 999)` stack trick). Read
> `framework/framework.css`'s flex/grid section first to place the words in the house
> pattern (definitions beside their family, the documented-comment style). Run the
> `css` skill.
>
> THE WORK: (1) define `.cols.half` + `.cols.main-aside` in framework.css beside the
> flex words, with the lab's exact mechanics and a one-comment pointer to the lab's
> doc; the lab's own css then CONSUMES the framework definitions for those two
> (delete its local copies of just those two — the other four words stay lab-local).
> (2) Migrate the 6 call sites the adoption doc lists — each must render identically
> or better (before/after screenshot per site at 1920 + 3440). (3) One line in the
> layout skill? NO — skills are the mastermind's; instead note in adoption.md that
> promotion happened.
>
> VERIFY: the 6 sites pixel-compared before/after (ratios hold at 3440, stack at
> 400), the cols matrix page still measures its ratios within 0.1%, zero console
> errors on a 10-url sweep. Keepers + `links`. Report: the two rules as shipped
> (paste them), sites migrated (6/6?), any site that resisted.

Scope: framework.css, the cols lab's own files, and the 6 named call sites only.
No skill edits. No new npm deps, no server changes.

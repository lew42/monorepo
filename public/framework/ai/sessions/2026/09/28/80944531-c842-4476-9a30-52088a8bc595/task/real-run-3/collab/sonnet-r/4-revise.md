# Revised answer: shared-CSS screenshots and skipping the review gate

This repo isn't public, so nothing on the web actually describes it — the rule lives in
`Server/doc/review.md` and `Server/merge.mjs` alone. Three of us (independently, plus general
industry framing from two peers) landed on the same reading, so I'm now confident in it rather
than just guessing.

## Screenshots: gated by size tier, never by "shared CSS" as such

`review.md` defines three review sizes, and only one carries a screenshot requirement:

- **none** — CSS/docs only, ≤20 lines, no new file → no review, no screenshot.
- **light** — code changed, no new page/module/Servex part → fresh Sonnet reads the diff, no screenshot.
- **full** — a new page, module, tool, or Servex change → fresh Opus + screenshots at
  1280/1920/3440 + four UX questions.

So a shared-CSS edit gets a screenshot only if it happens to land in the "full" bucket — i.e. it
comes bundled with a new page/module/tool, not because the CSS itself is "shared." A 15-line
shared-CSS tweak with no new file is `none` by the letter of the rule: no review, no screenshot,
full stop. There is no clause anywhere that says "shared CSS → always screenshot," regardless of
size. That's a hard absence, not an open question — I checked both files and neither peer found
one either.

**Where judgment enters:** raising a computed size needs no justification at all, and doing so is
the task mastermind's call — a shared-CSS change that looks risky (cascades across many
components, touches layout/responsive behavior, hits customer-facing pages, or its blast radius
isn't obvious from the diff alone) is the kind of thing a mastermind would reasonably bump up to
`light` or even `full` to get a screenshot, but nothing in the repo forces that bump. It's a
discretionary safety margin, not a rule.

## Can an agent skip the merge gate on its own confidence?

No — this is the one truly hard, mechanical rule in the whole system. `Server/merge.mjs` always
refuses to merge a `light` or `full` branch that lacks a review newer than its last commit, or
that carries any unanswered `[fix]` finding. That check runs in code every time; it isn't
persuadable by an agent asserting "I'm confident this is safe."

There is exactly one way past it: `--no-review "why"`, a real flag in `merge.mjs` that skips the
gate but prints a loud `!!!` warning and logs the reason. It exists, but nothing in `review.md` or
the `sub-mastermind` skill frames it as an agent's routine judgment call — the skill's own "Never"
list treats similarly risky unilateral moves (killing the server, driving the owner's tabs) as
off-limits for exactly this reason: a loud, logged, exceptional escape hatch is not the same thing
as ordinary discretion. Reaching for it "because I'm confident" is not how it's meant to be used.

The mastermind's real, sanctioned lever is different: it may *lower* a computed size before
review even runs, via `--why "self-evident: <one line>"`, logged as a decision. That changes what
tier the change is reviewed at — it does not let an already-`light`-or-`full` change through
unreviewed.

## Bottom line

| | Hard rule | Judgment call |
|---|---|---|
| Screenshots | Only `full` size gets them, by definition | Whether to raise a shared-CSS change's size (and thus earn a screenshot) beyond what its line count implies — mastermind only |
| Review gate | `merge.mjs` always refuses unreviewed light/full — no agent exception for confidence | Whether to lower a size with a logged "self-evident" reason, or (rare, loud, logged) invoke `--no-review` — mastermind only, never a plain agent's unilateral call |

## Sources

- `Server/doc/review.md` (this repo) — size table and merge-gate section.
- `Server/merge.mjs` (this repo) — verified the `--no-review` flag and its warning text directly in the source.
- Peers haiku-p and haiku-q reached the same repo-based conclusion independently; their added
  industry sources (GitButler, Percy, BrowserStack, etc.) informed the "why a mastermind might
  raise size" reasoning above but describe general practice, not this repo's actual rule.
